package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"openhealth/internal/core/ports"
	"openhealth/pkg/vault"

	"github.com/google/uuid"
)

type ProjectService struct {
	storageService ports.StorageService
	clinicRepo     ports.ClinicRepository
	seedToken      string // vault key component from environment
}

func NewProjectService(storageService ports.StorageService, clinicRepo ports.ClinicRepository, seedToken string) *ProjectService {
	return &ProjectService{
		storageService: storageService,
		clinicRepo:     clinicRepo,
		seedToken:      seedToken,
	}
}

func (s *ProjectService) CreateProject(ctx context.Context, tenantID string, inputData interface{}) (string, error) {
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
