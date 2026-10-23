package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"openhealth/internal/core/ports"
	"openhealth/pkg/vault"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	storageService ports.StorageService
	clinicRepo     ports.ClinicRepository
	seedToken      string // vault key component from environment
	motorURL       string
	motorToken     string
}

func NewProjectService(storageService ports.StorageService, clinicRepo ports.ClinicRepository, seedToken string, motorURL string, motorToken string) *ProjectService {
	return &ProjectService{
		storageService: storageService,
		clinicRepo:     clinicRepo,
		seedToken:      seedToken,
		motorURL:       motorURL,
		motorToken:     motorToken,
	}
}

func (s *ProjectService) CreateProject(ctx context.Context, tenantID string, inputData interface{}, mode string) (string, error) {
	clinic, err := s.clinicRepo.FindByID(ctx, tenantID)
	if err != nil {
		return "", err
	}
	if clinic == nil {
		return "", errors.New("tenant not found")
	}

	dataMap, ok := inputData.(map[string]interface{})
	if !ok {
		return "", errors.New("invalid input data format")
	}

	projectID, _ := dataMap["id"].(string)
	if projectID == "" {
		projectID = uuid.New().String()
		dataMap["id"] = projectID
	}

	jsonData, err := json.Marshal(dataMap)
	if err != nil {
		return "", fmt.Errorf("failed to marshal project data: %v", err)
	}

	// Seal (encrypt) the object before uploading to S3
	// Key composition: nodeRef=email, branchId=cnpj, seedToken=env
	sealedData, err := vault.Seal(jsonData, clinic.Email, clinic.CNPJ, s.seedToken)
	if err != nil {
		return "", fmt.Errorf("failed to seal project data: %v", err)
	}

	// Upload sealed object to S3
	if err := s.storageService.UploadJSON(ctx, tenantID, projectID, sealedData); err != nil {
		return "", fmt.Errorf("failed to upload to S3: %v", err)
	}

	// Update bucket reference if it's the first time
	if clinic.BucketObj == "" {
		bucketRef := fmt.Sprintf("%s/", tenantID)
		if err := s.clinicRepo.UpdateBucketRef(ctx, tenantID, bucketRef); err != nil {
			return projectID, fmt.Errorf("project created, but failed to update bucket ref: %v", err)
		}
	}

	// Trigger the generator motor asynchronously so we don't block the client/frontend
	var sealed struct {
		Nonce   string `json:"n"`
		Payload string `json:"p"`
	}
	if err := json.Unmarshal(sealedData, &sealed); err == nil {
		go func(email, cnpj, clinicName, motorURL, motorToken, mode string) {
			if motorURL == "" {
				log.Println("[ProjectService] Warning: MOTOR_URL is not configured, skipping generation trigger")
				return
			}
			motorReq := struct {
				Email string `json:"email"`
				CNPJ  string `json:"cnpj"`
				Data  struct {
					Payload string `json:"p"`
					Nonce   string `json:"n"`
				} `json:"data"`
			}{}
			motorReq.Email = email
			motorReq.CNPJ = cnpj
			motorReq.Data.Payload = sealed.Payload
			motorReq.Data.Nonce = sealed.Nonce

			reqBytes, err := json.Marshal(motorReq)
			if err != nil {
				log.Printf("[ProjectService] Error marshaling motor request: %v", err)
				return
			}

			log.Printf("[ProjectService] Triggering system generation via motor at %s...", motorURL)
			endpoint := "/generate"
			if mode == "local" {
				endpoint = "/generate-local"
			}
			req, _ := http.NewRequest(http.MethodPost, motorURL+endpoint, bytes.NewBuffer(reqBytes))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("X-Motor-Token", motorToken)
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				log.Printf("[ProjectService] Error calling motor: %v", err)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				bodyBytes, _ := io.ReadAll(resp.Body)
				log.Printf("[ProjectService] Motor returned non-OK status %s: %s", resp.Status, string(bodyBytes))
				return
			}

			log.Printf("[ProjectService] Successfully triggered motor generation for clinic %s", clinicName)
		}(clinic.Email, clinic.CNPJ, clinic.ClinicName, s.motorURL, s.motorToken, mode)
	} else {
		log.Printf("[ProjectService] Failed to unmarshal sealed object for motor trigger: %v", err)
	}

	return projectID, nil
}

func (s *ProjectService) ListProjects(ctx context.Context, tenantID string) ([]interface{}, error) {
	clinic, err := s.clinicRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if clinic == nil {
		return nil, errors.New("tenant not found")
	}

	keys, err := s.storageService.ListObjects(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var projects []interface{}
	for _, key := range keys {
		data, err := s.storageService.DownloadJSON(ctx, key)
		if err != nil {
			continue
		}

		// Unseal (decrypt) the object
		plaintext, err := vault.Unseal(data, clinic.Email, clinic.CNPJ, s.seedToken)
		if err != nil {
			// If unseal fails, try reading as plain JSON (backward compatibility)
			var parsed interface{}
			if jsonErr := json.Unmarshal(data, &parsed); jsonErr == nil {
				projects = append(projects, parsed)
			}
			continue
		}

		var parsed interface{}
		if err := json.Unmarshal(plaintext, &parsed); err == nil {
			projects = append(projects, parsed)
		}
	}

	return projects, nil
}

func (s *ProjectService) DeleteProject(ctx context.Context, tenantID, projectID string) error {
	return s.storageService.DeleteObject(ctx, tenantID, projectID)
}

func (s *ProjectService) GetProjectStatus(ctx context.Context, tenantID, projectID string) (map[string]interface{}, error) {
	clinic, err := s.clinicRepo.FindByID(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	if clinic == nil {
		return nil, errors.New("tenant not found")
	}

	motorURL := s.motorURL
	if motorURL == "" {
		motorURL = "http://localhost:8082"
	}

	client := &http.Client{Timeout: 3 * time.Second}
	statusReq, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("%s/status?clinic_id=%s", motorURL, projectID), nil)
	statusReq.Header.Set("X-Motor-Token", s.motorToken)
	resp, err := client.Do(statusReq)
	if err != nil {
		return map[string]interface{}{
			"clinic_id": projectID,
			"status":    "provisioning",
			"message":   "Aguardando sincronização com o motor IaC...",
		}, nil
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return map[string]interface{}{
			"clinic_id": projectID,
			"status":    "provisioning",
			"message":   "Processando status da infraestrutura...",
		}, nil
	}

	return result, nil
}

