package http

import (
	"net/http"
	"openhealth/internal/core/services"

	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	projectService *services.ProjectService
	localEnabled   bool
}

func NewProjectHandler(projectService *services.ProjectService, localEnabled bool) *ProjectHandler {
	return &ProjectHandler{
		projectService: projectService,
		localEnabled:   localEnabled,
	}
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Modo de geração: "aws" (padrão) ou "local". O local só vale onde o servidor liberou (notebook).
	mode := "aws"
	if c.Query("mode") == "local" {
		if !h.localEnabled {
			c.JSON(http.StatusForbidden, gin.H{"error": "geração local desabilitada neste servidor"})
			return
		}
		mode = "local"
	}

	var req interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	projectID, err := h.projectService.CreateProject(c.Request.Context(), tenantID.(string), req, mode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Project created and uploaded successfully",
		"project_id": projectID,
	})
}

func (h *ProjectHandler) ListProjects(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	projects, err := h.projectService.ListProjects(c.Request.Context(), tenantID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"projects": projects})
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	projectID := c.Param("id")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	if err := h.projectService.DeleteProject(c.Request.Context(), tenantID.(string), projectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

func (h *ProjectHandler) GetProjectStatus(c *gin.Context) {
	tenantID, exists := c.Get("tenant_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	projectID := c.Param("id")
	if projectID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
		return
	}

	status, err := h.projectService.GetProjectStatus(c.Request.Context(), tenantID.(string), projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, status)
}

