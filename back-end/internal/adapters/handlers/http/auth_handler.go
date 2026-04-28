package http

import (
	"net/http"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

type RegisterRequest struct {
	CNPJ            string `json:"cnpj" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	NomeResponsavel string `json:"nome_responsavel" binding:"required"`
	Senha           string `json:"senha" binding:"required,min=6"`
	NomeClinica     string `json:"nome_clinica" binding:"required"`
	Localizacao     string `json:"localizacao"`
	Especialidade   string `json:"especialidade"`
	Telefone        string `json:"telefone"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clinic := &domain.Clinic{
		CNPJ:            req.CNPJ,
		Email:           req.Email,
		NomeResponsavel: req.NomeResponsavel,
		Senha:           req.Senha,
		NomeClinica:     req.NomeClinica,
		Localizacao:     req.Localizacao,
		Especialidade:   req.Especialidade,
		Telefone:        req.Telefone,
	}

	if err := h.authService.Register(c.Request.Context(), clinic); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful. Please check your email for verification."})
}

type LoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.authService.Login(c.Request.Context(), req.Email, req.Senha)
	if err != nil {
		if err.Error() == "unverified_account" {
			c.JSON(http.StatusForbidden, gin.H{"error": "unverified_account", "token": token})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

type VerifyRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}

func (h *AuthHandler) Verify(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.authService.VerifyCode(c.Request.Context(), req.Email, req.Code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conta verificada com sucesso!"})
}
