package mariadb

import (
	"context"
	"database/sql"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/ports"

	"github.com/google/uuid"
)

type clinicRepository struct {
	db *sql.DB
}

func NewClinicRepository(db *sql.DB) ports.ClinicRepository {
	return &clinicRepository{db: db}
}

func (r *clinicRepository) Save(ctx context.Context, clinic *domain.Clinic) error {
	if clinic.ID == "" {
		clinic.ID = uuid.New().String()
	}
	query := `
		INSERT INTO clinic (
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
	_, err := r.db.ExecContext(ctx, query,
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
	)
	return err
}

func (r *clinicRepository) FindByEmail(ctx context.Context, email string) (*domain.Clinic, error) {
	query := "SELECT id, cnpj, email, responsible_name, clinic_name, location, specialty, phone, bucket_obj, verify, verification_code, created_at, updated_at, deleted_at, keycloak_id FROM clinic WHERE email = ? LIMIT 1"
	row := r.db.QueryRowContext(ctx, query, email)
	return r.scanClinic(row)
}

func (r *clinicRepository) FindByCNPJ(ctx context.Context, cnpj string) (*domain.Clinic, error) {
	query := "SELECT id, cnpj, email, responsible_name, clinic_name, location, specialty, phone, bucket_obj, verify, verification_code, created_at, updated_at, deleted_at, keycloak_id FROM clinic WHERE cnpj = ? LIMIT 1"
	row := r.db.QueryRowContext(ctx, query, cnpj)
	return r.scanClinic(row)
}

func (r *clinicRepository) FindByID(ctx context.Context, id string) (*domain.Clinic, error) {
	query := "SELECT id, cnpj, email, responsible_name, clinic_name, location, specialty, phone, bucket_obj, verify, verification_code, created_at, updated_at, deleted_at, keycloak_id FROM clinic WHERE id = ? LIMIT 1"
	row := r.db.QueryRowContext(ctx, query, id)
	return r.scanClinic(row)
}

func (r *clinicRepository) FindByKeycloakID(ctx context.Context, keycloakID string) (*domain.Clinic, error) {
	query := "SELECT id, cnpj, email, responsible_name, clinic_name, location, specialty, phone, bucket_obj, verify, verification_code, created_at, updated_at, deleted_at, keycloak_id FROM clinic WHERE keycloak_id = ? LIMIT 1"
	row := r.db.QueryRowContext(ctx, query, keycloakID)
	return r.scanClinic(row)
}

func (r *clinicRepository) UpdateBucketRef(ctx context.Context, id string, bucketRef string) error {
	query := "UPDATE clinic SET bucket_obj = ? WHERE id = ?"
	_, err := r.db.ExecContext(ctx, query, bucketRef, id)
	return err
}

func (r *clinicRepository) scanClinic(row *sql.Row) (*domain.Clinic, error) {
	var clinic domain.Clinic
	err := row.Scan(
		&clinic.ID,
		&clinic.CNPJ,
		&clinic.Email,
		&clinic.ResponsibleName,
		&clinic.ClinicName,
		&clinic.Location,
		&clinic.Specialty,
		&clinic.Phone,
		&clinic.BucketObj,
		&clinic.Verify,
		&clinic.VerificationCode,
		&clinic.CreatedAt,
		&clinic.UpdatedAt,
		&clinic.DeletedAt,
		&clinic.KeycloakID,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &clinic, nil
}

