package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	httpHandlers "openhealth/internal/adapters/handlers/http"
	"openhealth/internal/adapters/repositories/mariadb"
	"openhealth/internal/adapters/repositories/minio"
	"openhealth/internal/adapters/services/email"
	"openhealth/internal/core/services"
	"openhealth/pkg/config"
	"openhealth/pkg/database"
	"openhealth/pkg/logger"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load config
	cfg := config.LoadConfig()

	// 2. Connect DB
	db := database.ConnectMariaDB(cfg)

	// 3. Initialize Shared Services
	appLogger := logger.NewLogger()

	// 4. Initialize Keycloak (valida conexão na inicialização)
	kcClient := gocloak.NewClient(cfg.KeycloakURL)

	ctx := context.Background()
	_, err := kcClient.LoginClient(ctx, cfg.KeycloakClientID, cfg.KeycloakClientSecret, cfg.KeycloakRealm)
	if err != nil {
		log.Fatalf("❌ Erro ao conectar no Keycloak: %v", err)
	}
	log.Println("✅ Conexão com Keycloak estabelecida com sucesso!")

	kcAuth := &services.KeycloakAuth{
		Client:       kcClient,
		ClientID:     cfg.KeycloakClientID,
		ClientSecret: cfg.KeycloakClientSecret,
		Realm:        cfg.KeycloakRealm,
	}

	// 5. Initialize Repositories and External Services
	clinicRepo := mariadb.NewClinicRepository(db)
	minioService := minio.NewMinioStorageService(cfg.MinioEndpoint, cfg.MinioAccessKey, cfg.MinioSecretKey, cfg.MinioBucketName, cfg.MinioUseSSL)
	emailService := email.NewSMTPEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPassword)

	// 6. Initialize Core Services (Use Cases)
	authService := services.NewAuthService(
		clinicRepo,
		emailService,
		cfg.JWTSecret,
		cfg.JWTExpirationHours,
		kcAuth,
		appLogger,
	)
	projectService := services.NewProjectService(minioService, clinicRepo, cfg.ObjectVaultKey)

	// 7. Initialize HTTP Handlers
	authHandler := httpHandlers.NewAuthHandler(authService, appLogger)
	projectHandler := httpHandlers.NewProjectHandler(projectService)

	// 8. Setup Gin Router
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Adjust in production
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 9. Setup API Routes
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
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/verify", authHandler.Verify)
		}

		// Protected Project Routes
		projects := api.Group("/projects")
		projects.Use(httpHandlers.AuthMiddleware(authService, clinicRepo))
		{
			projects.POST("", projectHandler.CreateProject)
			projects.GET("", projectHandler.ListProjects)
			projects.DELETE("/:id", projectHandler.DeleteProject)
		}
	}

	// 10. Servir Arquivos Estáticos do Next.js (front-end)
	staticDir := "./static"

	// Serve a pasta _next diretamente com alta performance (sem passar pelo fallback)
	r.Static("/_next", filepath.Join(staticDir, "_next"))

	// Serve arquivos estáticos da raiz (como favicon, robos.txt, imagens)
	// r.Static("/assets", filepath.Join(staticDir, "assets")) // caso tenha

	r.NoRoute(func(c *gin.Context) {
		requestPath := c.Request.URL.Path

		// Se a requisição começa com /api, retorna 404 de API
		if strings.HasPrefix(requestPath, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
			return
		}

		// Remove barras duplas e limpa o path
		cleanPath := filepath.Clean(requestPath)
		filePath := filepath.Join(staticDir, cleanPath)

		// Se o arquivo existe, serve diretamente (JS, CSS, imagens na raiz)
		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			c.File(filePath)
			return
		}

		// Para rotas do SPA, tenta servir o arquivo .html correspondente
		htmlPath := filePath + ".html"
		if _, err := os.Stat(htmlPath); err == nil {
			c.File(htmlPath)
			return
		}

		// Fallback final: serve o index.html (SPA routing)
		indexPath := filepath.Join(staticDir, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			c.File(indexPath)
			return
		}

		// Se chegou aqui, não achou nem a rota nem arquivo
		log.Printf("[404] Arquivo ou Rota não encontrada: %s (buscado em: %s)", requestPath, filePath)
		c.JSON(http.StatusNotFound, gin.H{"error": "Page or file not found"})
	})

	// 11. Start Server
	log.Printf("Starting Open Health on port %s...", cfg.Port)
	log.Printf("API routes:    /api/v1/*")
	log.Printf("Static files:  %s", staticDir)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
