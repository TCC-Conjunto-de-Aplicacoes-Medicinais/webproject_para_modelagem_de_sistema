package domain

import (
	"time"
)

type Clinic struct {
	ID               string    `json:"id"`
	CNPJ             string    `json:"cnpj"`
	Email            string    `json:"email"`
	ResponsibleName  string    `json:"nome_responsavel"`
	Senha            string    `json:"-"`
	ClinicName       string    `json:"nome_clinica"`
	Location         string    `json:"localizacao"`
	Specialty        string    `json:"especialidade"`
	Phone            string    `json:"telefone"`
	BucketObj        string    `json:"bucket_obj"`
	Verify           bool      `json:"verify"`
	VerificationCode string    `json:"-"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	DeletedAt        time.Time `json:"deleted_at"`
	KeycloakID       *string   `json:"keycloak_id,omitempty"`
}
