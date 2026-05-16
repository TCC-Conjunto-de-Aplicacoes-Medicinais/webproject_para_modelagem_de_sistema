package http

import (
	"errors"
	"net/http"
	"openhealth/internal/core/ports"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ClinicClaims contém informações básicas extraídas do Access Token.
type ClinicClaims struct {
	KeycloakID    string `json:"sub"`
	Name          string `json:"name"`
	EmailVerified bool   `json:"email_verified"`
	Email         string `json:"email"`
}

// ExtractClinicClaims extrai claims úteis do JWT sem validar a assinatura.
// A validação deve ser feita previamente por um middleware de segurança (ex: API Gateway).
func ExtractClinicClaims(authHeader string) (*ClinicClaims, error) {
	if authHeader == "" {
		return nil, errors.New("header Authorization ausente")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return nil, errors.New("formato de token inválido")
	}

	tokenString := parts[1]

	token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("não foi possível ler as claims do token")
	}

	clinicClaims := &ClinicClaims{}

	if sub, ok := claims["sub"].(string); ok {
		clinicClaims.KeycloakID = sub
	} else {
		keys := []string{}
		for k := range claims {
			keys = append(keys, k)
		}
		return nil, errors.New("campo 'sub' não encontrado. Campos presentes: " + strings.Join(keys, ", "))
	}

	if name, ok := claims["name"].(string); ok {
		clinicClaims.Name = name
	}

	if verified, ok := claims["email_verified"].(bool); ok {
		clinicClaims.EmailVerified = verified
	}

	if email, ok := claims["email"].(string); ok {
		clinicClaims.Email = email
	}

	return clinicClaims, nil
}

// AuthMiddleware extrai a identidade da clínica do JWT e injeta no contexto.
// Também busca os dados atualizados da clínica no MariaDB.
func AuthMiddleware(clinicRepo ports.ClinicRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		claims, err := ExtractClinicClaims(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido ou ausente: " + err.Error()})
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
