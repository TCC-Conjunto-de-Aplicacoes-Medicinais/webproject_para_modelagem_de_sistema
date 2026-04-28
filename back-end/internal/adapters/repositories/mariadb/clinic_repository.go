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
	return r.db.WithContext(ctx).Create(clinic).Error
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
