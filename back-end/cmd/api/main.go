package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	httpHandlers "openhealth/internal/adapters/handlers/http"
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

	if err := db.AutoMigrate(&domain.Clinic{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 3. Initialize Repositories and External Services
	clinicRepo := mariadb.NewClinicRepository(db)
	s3Service := s3.NewS3StorageService(cfg.AWSRegion, cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, cfg.AWSSessionToken, cfg.AWSBucketName)
	emailService := email.NewSMTPEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)

	// 4. Initialize Core Services (Use Cases)
	authService := services.NewAuthService(clinicRepo, emailService, cfg.JWTSecret, cfg.JWTExpirationHours)
	projectService := services.NewProjectService(s3Service, clinicRepo, cfg.ObjectVaultKey)

	// 5. Initialize HTTP Handlers
	authHandler := httpHandlers.NewAuthHandler(authService)
	projectHandler := httpHandlers.NewProjectHandler(projectService)

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

	// 7. Setup API Routes
	api := r.Group("/api/v1")
	{
		// Health Check (usado pelo Docker HEALTHCHECK)
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})

		// Public Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/verify", authHandler.Verify)
		}

		// Protected Project Routes
		projects := api.Group("/projects")
		projects.Use(httpHandlers.AuthMiddleware(cfg.JWTSecret))
		{
			projects.POST("", projectHandler.CreateProject)
			projects.GET("", projectHandler.ListProjects)
			projects.DELETE("/:id", projectHandler.DeleteProject)
		}
	}

	// 8. Servir Arquivos Estáticos do Next.js (front-end)
	// O diretório ./static contém o output do `next build` (export)
	staticDir := "./static"
	r.NoRoute(func(c *gin.Context) {
		requestPath := c.Request.URL.Path

		// Se a requisição começa com /api, retorna 404 de API
		if strings.HasPrefix(requestPath, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
			return
		}

		// Tenta servir o arquivo estático diretamente
		filePath := filepath.Join(staticDir, requestPath)

		// Se o arquivo existe, serve diretamente (JS, CSS, imagens, etc.)
		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			c.File(filePath)
			return
		}

		// Para rotas do SPA, tenta servir o arquivo .html correspondente
		// Ex: /about → /about.html
		htmlPath := filePath + ".html"
		if _, err := os.Stat(htmlPath); err == nil {
			c.File(htmlPath)
			return
		}

		// Fallback: serve o index.html (SPA routing)
		indexPath := filepath.Join(staticDir, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			c.File(indexPath)
			return
		}

		c.JSON(http.StatusNotFound, gin.H{"error": "Page not found"})
	})

	// 9. Start Server
	log.Printf("Starting Open Health on port %s...", cfg.Port)
	log.Printf("API routes:    /api/v1/*")
	log.Printf("Static files:  %s", staticDir)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

