package http

import (
	"net/http"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/services"
	"openhealth/pkg/logger"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
	Logger      *logger.Logger
}

func NewAuthHandler(authService *services.AuthService, l *logger.Logger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		Logger:      l,
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
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "register",
			Description:   "payload inválido: " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	clinic := &domain.Clinic{
		CNPJ:            req.CNPJ,
		Email:           req.Email,
		ResponsibleName: req.NomeResponsavel,
		Senha:           req.Senha,
		ClinicName:      req.NomeClinica,
		Location:        req.Localizacao,
		Specialty:       req.Especialidade,
		Phone:           req.Telefone,
	}

	if err := h.authService.Register(c.Request.Context(), clinic); err != nil {
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "register",
			Description:   "falha ao cadastrar clínica: " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.Logger.Log(logger.LogEntry{
		OriginService: "auth",
		ActionType:    "register",
		Description:   "clínica cadastrada com sucesso: " + req.Email,
		OriginIP:      c.ClientIP(),
		ResultStatus:  "success",
	})
	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful. Please check your email for verification."})
}

type LoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	if h.authService == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "serviço indisponível"})
		return
	}

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "login",
			Description:   "payload inválido: " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), req.Email, req.Senha)
	if err != nil {
		msg := err.Error()
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "login",
			Description:   "falha no login (" + req.Email + "): " + msg,
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		if msg == "unverified_account" {
			c.JSON(http.StatusForbidden, gin.H{"error": "unverified_account"})
			return
		}
		if strings.Contains(msg, "credenciais") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": msg})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		return
	}

	// Extrai ID do Keycloak do token para logar o sucesso
	claims, _ := ExtractClinicClaims("Bearer " + resp.AccessToken)
	userID := ""
	if claims != nil {
		userID = claims.KeycloakID
	}

	h.Logger.Log(logger.LogEntry{
		OriginService: "auth",
		ActionType:    "login",
		Description:   "login realizado com sucesso: " + req.Email,
		OriginIP:      c.ClientIP(),
		ResultStatus:  "success",
		UserID:        userID,
	})
	c.JSON(http.StatusOK, resp)
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	if h.authService == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "serviço indisponível"})
		return
	}

	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "refresh",
			Description:   "payload inválido: " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Refresh(c.Request.Context(), req.RefreshToken)
	if err != nil {
		msg := err.Error()
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "refresh",
			Description:   "falha ao renovar token: " + msg,
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		if strings.Contains(msg, "inválidas") || strings.Contains(msg, "sessão") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": msg})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		return
	}

	h.Logger.Log(logger.LogEntry{
		OriginService: "auth",
		ActionType:    "refresh",
		Description:   "token renovado com sucesso",
		OriginIP:      c.ClientIP(),
		ResultStatus:  "success",
	})
	c.JSON(http.StatusOK, resp)
}

type VerifyRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required,len=6"`
}

func (h *AuthHandler) Verify(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "verify",
			Description:   "payload inválido: " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.authService.VerifyCode(c.Request.Context(), req.Email, req.Code); err != nil {
		h.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "verify",
			Description:   "falha ao verificar código para " + req.Email + ": " + err.Error(),
			OriginIP:      c.ClientIP(),
			ResultStatus:  "error",
		})
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.Logger.Log(logger.LogEntry{
		OriginService: "auth",
		ActionType:    "verify",
		Description:   "conta verificada com sucesso: " + req.Email,
		OriginIP:      c.ClientIP(),
		ResultStatus:  "success",
	})
	c.JSON(http.StatusOK, gin.H{"message": "Conta verificada com sucesso!"})
}
