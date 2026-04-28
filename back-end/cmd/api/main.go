package main

import (
	"log"
	"openhealth/internal/adapters/handlers/http"
	"openhealth/internal/adapters/repositories/mariadb"
	"openhealth/internal/adapters/repositories/s3"
	"openhealth/internal/adapters/services/email"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/services"
	"openhealth/pkg/config"
	"openhealth/pkg/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load config
	cfg := config.LoadConfig()

	// 2. Connect DB & Run Migrations
	db := database.ConnectMariaDB(cfg)

	// Clean up previously created Portuguese columns (from old AutoMigrate) to avoid schema conflicts
	oldColumns := []string{"nome_responsavel", "senha", "nome_clinica", "localizacao", "especialidade", "telefone", "bucket_obj"}
	for _, col := range oldColumns {
		db.Exec("ALTER TABLE clinics DROP COLUMN " + col)
	}

	if err := db.AutoMigrate(&domain.Clinic{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 3. Initialize Repositories and External Services
	clinicRepo := mariadb.NewClinicRepository(db)
	s3Service := s3.NewS3StorageService(cfg.AWSRegion, cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, cfg.AWSBucketName)
	emailService := email.NewSMTPEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)

	// 4. Initialize Core Services (Use Cases)
	authService := services.NewAuthService(clinicRepo, emailService, cfg.JWTSecret, cfg.JWTExpirationHours)
	projectService := services.NewProjectService(s3Service, clinicRepo)

	// 5. Initialize HTTP Handlers
	authHandler := http.NewAuthHandler(authService)
	projectHandler := http.NewProjectHandler(projectService)

	// 6. Setup Gin Router
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Adjust in production
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 7. Setup Routes
	api := r.Group("/api/v1")
	{
		// Public Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Protected Project Routes
		projects := api.Group("/projects")
		projects.Use(http.AuthMiddleware(cfg.JWTSecret))
		{
			projects.POST("", projectHandler.CreateProject)
			projects.GET("", projectHandler.ListProjects)
			projects.DELETE("/:id", projectHandler.DeleteProject)
		}
	}

	// 8. Start Server
	log.Printf("Starting Open Health API on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
