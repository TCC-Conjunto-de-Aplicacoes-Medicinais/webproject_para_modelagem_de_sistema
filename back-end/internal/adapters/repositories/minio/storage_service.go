package minio

import (
	"bytes"
	"context"
	"fmt"
	"log"

	"openhealth/internal/core/ports"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type minioStorageService struct {
	client     *minio.Client
	bucketName string
}

func NewMinioStorageService(endpoint, accessKey, secretKey, bucketName string, useSSL bool) ports.StorageService {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("unable to initialize minio client: %v", err)
	}

	return &minioStorageService{
		client:     client,
		bucketName: bucketName,
	}
}

func (s *minioStorageService) UploadJSON(ctx context.Context, tenantID, projectID string, data []byte) error {
	key := fmt.Sprintf("%s/%s.json", tenantID, projectID)
	reader := bytes.NewReader(data)

	_, err := s.client.PutObject(ctx, s.bucketName, key, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType: "application/json",
	})

	return err
}

func (s *minioStorageService) ListObjects(ctx context.Context, tenantID string) ([]string, error) {
	prefix := fmt.Sprintf("%s/", tenantID)
	var keys []string

	opts := minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	}

	for object := range s.client.ListObjects(ctx, s.bucketName, opts) {
		if object.Err != nil {
			return nil, object.Err
		}
		keys = append(keys, object.Key)
	}

	return keys, nil
}

func (s *minioStorageService) DeleteObject(ctx context.Context, tenantID, projectID string) error {
	key := fmt.Sprintf("%s/%s.json", tenantID, projectID)

	err := s.client.RemoveObject(ctx, s.bucketName, key, minio.RemoveObjectOptions{})
	return err
}

func (s *minioStorageService) DownloadJSON(ctx context.Context, key string) ([]byte, error) {
	object, err := s.client.GetObject(ctx, s.bucketName, key, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	defer object.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(object)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
