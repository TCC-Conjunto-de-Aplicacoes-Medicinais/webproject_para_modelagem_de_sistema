package mariadb

import (
	"context"
	"errors"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/ports"

	"gorm.io/gorm"
)

type clinicRepository struct {
	db *gorm.DB
}

func NewClinicRepository(db *gorm.DB) ports.ClinicRepository {
	return &clinicRepository{db: db}
}

func (r *clinicRepository) Save(ctx context.Context, clinic *domain.Clinic) error {
	query := `
		INSERT INTO clinics (
			id, cnpj, email, responsible_name, clinic_name, location, specialty, phone, 
			bucket_obj, verify, verification_code, created_at, updated_at, deleted_at, keycloak_id
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			cnpj = VALUES(cnpj),
			email = VALUES(email),
			responsible_name = VALUES(responsible_name),
			clinic_name = VALUES(clinic_name),
			location = VALUES(location),
			specialty = VALUES(specialty),
			phone = VALUES(phone),
			bucket_obj = VALUES(bucket_obj),
			verify = VALUES(verify),
			verification_code = VALUES(verification_code),
			updated_at = VALUES(updated_at),
			deleted_at = VALUES(deleted_at),
			keycloak_id = VALUES(keycloak_id)
	`
	return r.db.WithContext(ctx).Exec(query,
		clinic.ID,
		clinic.CNPJ,
		clinic.Email,
		clinic.ResponsibleName,
		clinic.ClinicName,
		clinic.Location,
		clinic.Specialty,
		clinic.Phone,
		clinic.BucketObj,
		clinic.Verify,
		clinic.VerificationCode,
		clinic.CreatedAt,
		clinic.UpdatedAt,
		clinic.DeletedAt,
		clinic.KeycloakID,
	).Error
}

func (r *clinicRepository) FindByEmail(ctx context.Context, email string) (*domain.Clinic, error) {
	var clinic domain.Clinic
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&clinic).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &clinic, nil
}

func (r *clinicRepository) FindByCNPJ(ctx context.Context, cnpj string) (*domain.Clinic, error) {
	var clinic domain.Clinic
	err := r.db.WithContext(ctx).Where("cnpj = ?", cnpj).First(&clinic).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &clinic, nil
}

func (r *clinicRepository) FindByID(ctx context.Context, id string) (*domain.Clinic, error) {
	var clinic domain.Clinic
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&clinic).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &clinic, nil
}

func (r *clinicRepository) UpdateBucketRef(ctx context.Context, id string, bucketRef string) error {
	return r.db.WithContext(ctx).Model(&domain.Clinic{}).Where("id = ?", id).Update("bucket_obj", bucketRef).Error
}
