package s3

import (
	"bytes"
	"context"
	"fmt"
	"log"

	"openhealth/internal/core/ports"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type s3StorageService struct {
	client     *s3.Client
	bucketName string
}

func NewS3StorageService(region, accessKey, secretKey, sessionToken, bucketName string) ports.StorageService {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, sessionToken)),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	client := s3.NewFromConfig(cfg)

	return &s3StorageService{
		client:     client,
		bucketName: bucketName,
	}
}

func (s *s3StorageService) UploadJSON(ctx context.Context, tenantID, projectID string, data []byte) error {
	key := fmt.Sprintf("%s/%s.json", tenantID, projectID)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String("application/json"),
	})

	return err
}

func (s *s3StorageService) ListObjects(ctx context.Context, tenantID string) ([]string, error) {
	prefix := fmt.Sprintf("%s/", tenantID)
	var keys []string

	paginator := s3.NewListObjectsV2Paginator(s.client, &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucketName),
		Prefix: aws.String(prefix),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, err
		}
		for _, obj := range page.Contents {
			keys = append(keys, *obj.Key)
		}
	}

	return keys, nil
}

func (s *s3StorageService) DeleteObject(ctx context.Context, tenantID, projectID string) error {
	key := fmt.Sprintf("%s/%s.json", tenantID, projectID)

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	return err
}

func (s *s3StorageService) DownloadJSON(ctx context.Context, key string) ([]byte, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer out.Body.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(out.Body)
	return buf.Bytes(), nil
}
