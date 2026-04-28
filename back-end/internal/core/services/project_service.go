package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"openhealth/internal/core/ports"
	"time"

	"github.com/google/uuid"
)

type ProjectService struct {
	storageService ports.StorageService
	clinicRepo     ports.ClinicRepository
}

func NewProjectService(storageService ports.StorageService, clinicRepo ports.ClinicRepository) *ProjectService {
	return &ProjectService{
		storageService: storageService,
		clinicRepo:     clinicRepo,
	}
}

// ProjectData represents the structure of the JSON to be saved in S3
type ProjectData struct {
	ID        string      `json:"id"`
	CreatedAt time.Time   `json:"created_at"`
	Data      interface{} `json:"data"` // Flexible structure from frontend wizard
}

func (s *ProjectService) CreateProject(ctx context.Context, tenantID string, inputData interface{}) (string, error) {
	clinic, err := s.clinicRepo.FindByID(ctx, tenantID)
	if err != nil {
		return "", err
	}
	if clinic == nil {
		return "", errors.New("tenant not found")
	}

	projectID := uuid.New().String()
	
	proj := ProjectData{
		ID:        projectID,
		CreatedAt: time.Now(),
		Data:      inputData,
	}

	jsonData, err := json.Marshal(proj)
	if err != nil {
		return "", fmt.Errorf("failed to marshal project data: %v", err)
	}

	// Upload to S3
	if err := s.storageService.UploadJSON(ctx, tenantID, projectID, jsonData); err != nil {
		return "", fmt.Errorf("failed to upload to S3: %v", err)
	}

	// Update bucket reference if it's the first time
	if clinic.BucketObj == "" {
		bucketRef := fmt.Sprintf("%s/", tenantID)
		if err := s.clinicRepo.UpdateBucketRef(ctx, tenantID, bucketRef); err != nil {
			// Non-critical, could log it, but returning error for strictness
			return projectID, fmt.Errorf("project created, but failed to update bucket ref: %v", err)
		}
	}

	return projectID, nil
}

func (s *ProjectService) ListProjects(ctx context.Context, tenantID string) ([]interface{}, error) {
	keys, err := s.storageService.ListObjects(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	var projects []interface{}
	for _, key := range keys {
		data, err := s.storageService.DownloadJSON(ctx, key)
		if err != nil {
			// Skip or log error, but keep listing others
			continue
		}
		var parsed interface{}
		if err := json.Unmarshal(data, &parsed); err == nil {
			projects = append(projects, parsed)
		}
	}

	return projects, nil
}

func (s *ProjectService) DeleteProject(ctx context.Context, tenantID, projectID string) error {
	return s.storageService.DeleteObject(ctx, tenantID, projectID)
}
