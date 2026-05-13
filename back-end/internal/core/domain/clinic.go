package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Clinic struct {
	ID               string    `gorm:"column:id;type:char(36);primaryKey" json:"id"`
	CNPJ             string    `gorm:"column:cnpj;type:varchar(20);uniqueIndex;not null" json:"cnpj"`
	Email            string    `gorm:"column:email;type:varchar(100);uniqueIndex;not null" json:"email"`
	ResponsibleName  string    `gorm:"column:responsible_name;type:varchar(100);not null" json:"nome_responsavel"`
	Senha            string    `gorm:"-" json:"-"`
	ClinicName       string    `gorm:"column:clinic_name;type:varchar(100);not null" json:"nome_clinica"`
	Location         string    `gorm:"column:location;type:varchar(255)" json:"localizacao"`
	Specialty        string    `gorm:"column:specialty;type:varchar(100)" json:"especialidade"`
	Phone            string    `gorm:"column:phone;type:varchar(20)" json:"telefone"`
	BucketObj        string    `gorm:"column:bucket_obj;type:varchar(255)" json:"bucket_obj"`
	Verify           bool      `gorm:"column:verify;default:0" json:"verify"`
	VerificationCode string    `gorm:"column:verification_code;type:varchar(10)" json:"-"`
	CreatedAt        time.Time `gorm:"type:timestamp;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"type:timestamp;" json:"updated_at"`
	DeletedAt        time.Time `gorm:"type:timestamp;" json:"deleted_at"`
	KeycloakID       *string   `gorm:"column:keycloak_id;type:varchar(36);uniqueIndex" json:"keycloak_id,omitempty"`
}

func (c *Clinic) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return
}
