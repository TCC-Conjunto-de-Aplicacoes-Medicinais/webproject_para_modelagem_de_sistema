package config

import (
	"log"
	"os"
	"strconv"

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
		MinioEndpoint:      getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:     getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey:     getEnv("MINIO_SECRET_KEY", ""),
		MinioBucketName:    getEnv("MINIO_BUCKET_NAME", ""),
		MinioUseSSL:        getEnv("MINIO_USE_SSL", "false") == "true",
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
