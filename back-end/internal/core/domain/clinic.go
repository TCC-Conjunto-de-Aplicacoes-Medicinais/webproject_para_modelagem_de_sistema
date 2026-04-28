package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Clinic struct {
	ID              string         `gorm:"column:id;type:char(36);primaryKey" json:"id"`
	CNPJ            string         `gorm:"column:cnpj;type:varchar(20);uniqueIndex;not null" json:"cnpj"`
	Email           string         `gorm:"column:email;type:varchar(100);uniqueIndex;not null" json:"email"`
	NomeResponsavel string         `gorm:"column:responsible_name;type:varchar(100);not null" json:"nome_responsavel"`
	Senha           string         `gorm:"column:password;type:varchar(255);not null" json:"-"`
	NomeClinica     string         `gorm:"column:clinic_name;type:varchar(100);not null" json:"nome_clinica"`
	Localizacao     string         `gorm:"column:location;type:varchar(255)" json:"localizacao"`
	Especialidade   string         `gorm:"column:specialty;type:varchar(100)" json:"especialidade"`
	Telefone        string         `gorm:"column:phone;type:varchar(20)" json:"telefone"`
	BucketObj        string         `gorm:"column:bucket_obj;type:varchar(255)" json:"bucket_obj"`
	Verify           bool           `gorm:"column:verify;default:0" json:"verify"`
	VerificationCode string         `gorm:"column:verification_code;type:varchar(10)" json:"-"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Clinic) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return
}
