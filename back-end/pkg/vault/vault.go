package vault

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"

	"golang.org/x/crypto/pbkdf2"
)

/*
   Object Vault — Custom encryption for system blueprint objects.

   Uses AES-256-GCM with a composite key derived from three independent
   sources via PBKDF2. The composition ensures that:
     - Without all 3 components, the object cannot be decrypted
     - Each object is uniquely encrypted per-tenant
     - Even with S3 bucket access, data remains unintelligible

   The three key components use codenames to avoid exposing their nature
   in source code, logs, or stack traces:
     - nodeRef    (component 1)
     - branchId   (component 2)
     - seedToken  (component 3 — from environment)
*/

// SealedObject represents an encrypted payload stored in S3
type SealedObject struct {
	Nonce   string `json:"n"`
	Payload string `json:"p"`
	Tag     string `json:"t"`
	Version int    `json:"v"`
}

// deriveCompositeKey builds a 256-bit AES key from three independent sources
func deriveCompositeKey(nodeRef, branchId, seedToken string) []byte {
	// Combine the three components into a single derivation input
	// Order matters: nodeRef + branchId + seedToken
	composite := fmt.Sprintf("%s|%s|%s", nodeRef, branchId, seedToken)

	// Use the seedToken as part of the salt for additional entropy
	salt := sha256.Sum256([]byte(fmt.Sprintf("oh_%s_%s", branchId, seedToken[:8])))

	// PBKDF2 with 100k iterations, SHA-256, 32 bytes = AES-256
	return pbkdf2.Key([]byte(composite), salt[:], 100000, 32, sha256.New)
}

// Seal encrypts a raw JSON byte slice and returns the sealed object as JSON bytes.
//
// Parameters use codenames:
//   - nodeRef:   first key component (caller knows what it represents)
//   - branchId:  second key component
//   - seedToken: third key component (from environment)
func Seal(plaintext []byte, nodeRef, branchId, seedToken string) ([]byte, error) {
	if nodeRef == "" || branchId == "" || seedToken == "" {
		return nil, errors.New("vault: all key components are required")
	}

	key := deriveCompositeKey(nodeRef, branchId, seedToken)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("vault: cipher init failed: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("vault: gcm init failed: %w", err)
	}

	// Generate random nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("vault: nonce generation failed: %w", err)
	}

	// Encrypt (GCM appends auth tag to ciphertext)
	ciphertext := aesGCM.Seal(nil, nonce, plaintext, nil)

	sealed := SealedObject{
		Nonce:   base64.StdEncoding.EncodeToString(nonce),
		Payload: base64.StdEncoding.EncodeToString(ciphertext),
		Tag:     "", // GCM tag is included in ciphertext
		Version: 1,
	}

	return json.Marshal(sealed)
}

// Unseal decrypts a sealed object back to plaintext JSON bytes.
//
// The same three key components used for Seal must be provided.
func Unseal(sealedData []byte, nodeRef, branchId, seedToken string) ([]byte, error) {
	if nodeRef == "" || branchId == "" || seedToken == "" {
		return nil, errors.New("vault: all key components are required")
	}

	var sealed SealedObject
	if err := json.Unmarshal(sealedData, &sealed); err != nil {
		return nil, fmt.Errorf("vault: invalid sealed object: %w", err)
	}

	if sealed.Version != 1 {
		return nil, fmt.Errorf("vault: unsupported version %d", sealed.Version)
	}

	nonce, err := base64.StdEncoding.DecodeString(sealed.Nonce)
	if err != nil {
		return nil, fmt.Errorf("vault: nonce decode failed: %w", err)
	}

	ciphertext, err := base64.StdEncoding.DecodeString(sealed.Payload)
	if err != nil {
		return nil, fmt.Errorf("vault: payload decode failed: %w", err)
	}

	key := deriveCompositeKey(nodeRef, branchId, seedToken)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("vault: cipher init failed: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("vault: gcm init failed: %w", err)
	}

	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("vault: decryption failed (wrong keys?): %w", err)
	}

	return plaintext, nil
}
