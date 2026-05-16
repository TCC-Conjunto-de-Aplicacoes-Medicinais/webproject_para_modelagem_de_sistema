package http

import (
	"net/http"
	"openhealth/internal/core/ports"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware valida o token via Keycloak (introspecção) e injeta a identidade da clínica no contexto.
func AuthMiddleware(tokenValidator ports.TokenValidator, clinicRepo ports.ClinicRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "header Authorization ausente"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "formato de token inválido, esperado: Bearer {token}"})
			c.Abort()
			return
		}

		accessToken := parts[1]

		// Validação real do token via Keycloak (introspecção RFC 7662)
		claims, err := tokenValidator.ValidateToken(c.Request.Context(), accessToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido ou expirado: " + err.Error()})
			c.Abort()
			return
		}

		// Busca a clínica no banco local usando o Keycloak ID (sub)
		clinic, err := clinicRepo.FindByKeycloakID(c.Request.Context(), claims.KeycloakID)
		if err != nil || clinic == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "clínica não encontrada ou não registrada localmente"})
			c.Abort()
			return
		}

		// Armazena as informações no contexto do Gin
		c.Set("tenant_id", clinic.ID)
		c.Set("keycloak_id", claims.KeycloakID)
		c.Set("clinic_name", clinic.ClinicName)
		c.Set("clinic_email", claims.Email)
		c.Set("email_verified", claims.EmailVerified)
		c.Next()
	}
}
