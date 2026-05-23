package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBCharset          string
	JWTSecret          string
	JWTExpirationHours int
	SMTPHost           string
	SMTPPort           int
	SMTPUser           string
	SMTPPassword       string
	MinioEndpoint      string
	MinioAccessKey     string
	MinioSecretKey     string
	MinioBucketName    string
	MinioUseSSL        bool
	ObjectVaultKey     string
	KeycloakURL        string
	KeycloakRealm      string
	KeycloakClientID   string
	KeycloakClientSecret string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found. Loading from environment variables.")
	}

	jwtExp, _ := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "168"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	// Fallback mapping for user-defined MinIO/Bucket variables
	urlBucket := getEnv("URL_BUCKET", "")
	minioEndpoint := getEnv("MINIO_ENDPOINT", "")
	minioUseSSL := getEnv("MINIO_USE_SSL", "false") == "true"
	if minioEndpoint == "" && urlBucket != "" {
		minioEndpoint = urlBucket
		if strings.HasPrefix(minioEndpoint, "https://") {
			minioUseSSL = true
			minioEndpoint = strings.TrimPrefix(minioEndpoint, "https://")
		} else if strings.HasPrefix(minioEndpoint, "http://") {
			minioUseSSL = false
			minioEndpoint = strings.TrimPrefix(minioEndpoint, "http://")
		}
		minioEndpoint = strings.TrimSuffix(minioEndpoint, "/")
	} else if minioEndpoint == "" {
		minioEndpoint = "localhost:9000"
	}

	minioAccessKey := getEnv("MINIO_ACCESS_KEY", "")
	if minioAccessKey == "" {
		minioAccessKey = getEnv("BUCKET_USER", "")
	}
	if minioAccessKey == "" {
		minioAccessKey = getEnv("BUCKET_USET", "")
	}

	minioSecretKey := getEnv("MINIO_SECRET_KEY", "")
	if minioSecretKey == "" {
		minioSecretKey = getEnv("BUCKET_PASSWORD", "")
	}

	minioBucketName := getEnv("MINIO_BUCKET_NAME", "")
	if minioBucketName == "" {
		minioBucketName = getEnv("BUCKET_NAME", "")
	}

	return &Config{
		Port:               getEnv("PORT", "8080"),
		DBHost:             getEnv("DB_HOST", "127.0.0.1"),
		DBPort:             getEnv("DB_PORT", "3306"),
		DBUser:             getEnv("DB_USER", "root"),
		DBPassword:         getEnv("DB_PASSWORD", ""),
		DBName:             getEnv("DB_NAME", "openhealth"),
		DBCharset:          getEnv("DB_CHARSET", "utf8mb4"),
		JWTSecret:          getEnv("JWT_SECRET", "super_secret_key_change_me_in_production"),
		JWTExpirationHours: jwtExp,
		SMTPHost:           getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:           smtpPort,
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPassword:       getEnv("SMTP_PASSWORD", ""),
		MinioEndpoint:      minioEndpoint,
		MinioAccessKey:     minioAccessKey,
		MinioSecretKey:     minioSecretKey,
		MinioBucketName:    minioBucketName,
		MinioUseSSL:        minioUseSSL,
		ObjectVaultKey:     getEnv("OBJ_KEY", ""),
		KeycloakURL:        getEnv("KEYCLOAK_URL", "http://localhost:8080"),
		KeycloakRealm:      getEnv("KEYCLOAK_REALM", "openhealth"),
		KeycloakClientID:   getEnv("KEYCLOAK_CLIENT_ID", "openhealth-api"),
		KeycloakClientSecret: getEnv("KEYCLOAK_CLIENT_SECRET", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
