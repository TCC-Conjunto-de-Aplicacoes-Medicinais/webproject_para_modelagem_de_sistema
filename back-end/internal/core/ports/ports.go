package ports

import (
	"context"
	"openhealth/internal/core/domain"
)

// ClinicRepository defines the methods for database interactions
type ClinicRepository interface {
	Save(ctx context.Context, clinic *domain.Clinic) error
	FindByEmail(ctx context.Context, email string) (*domain.Clinic, error)
	FindByCNPJ(ctx context.Context, cnpj string) (*domain.Clinic, error)
	FindByID(ctx context.Context, id string) (*domain.Clinic, error)
	FindByKeycloakID(ctx context.Context, keycloakID string) (*domain.Clinic, error)
	UpdateBucketRef(ctx context.Context, id string, bucketRef string) error
}

// TokenValidator define métodos para validação de tokens via Keycloak.
type TokenValidator interface {
	// ValidateToken realiza introspecção do access token via Keycloak
	// e retorna as claims se o token estiver ativo.
	ValidateToken(ctx context.Context, accessToken string) (*TokenClaims, error)
}

// TokenClaims contém informações extraídas e validadas do token.
type TokenClaims struct {
	KeycloakID    string
	Email         string
	Name          string
	EmailVerified bool
	Active        bool
}

// StorageService defines methods for S3 interactions
type StorageService interface {
	UploadJSON(ctx context.Context, tenantID, projectID string, data []byte) error
	ListObjects(ctx context.Context, tenantID string) ([]string, error)
	DeleteObject(ctx context.Context, tenantID, projectID string) error
	DownloadJSON(ctx context.Context, key string) ([]byte, error)
}

// EmailService defines methods for sending emails
type EmailService interface {
	SendVerificationCode(ctx context.Context, toEmail, code string) error
}
