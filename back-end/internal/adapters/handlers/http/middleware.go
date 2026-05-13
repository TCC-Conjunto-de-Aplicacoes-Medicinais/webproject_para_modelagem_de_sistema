package http

import (
	"net/http"
	"openhealth/internal/core/ports"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(clinicRepo ports.ClinicRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Parse token without verification (Keycloak tokens are signed with RS256)
		// Signature validation should be added for production security
		token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Could not parse token claims"})
			c.Abort()
			return
		}

		keycloakID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token missing 'sub' claim"})
			c.Abort()
			return
		}

		// Find clinic in local DB to get internal ID (tenant_id)
		clinic, err := clinicRepo.FindByKeycloakID(c.Request.Context(), keycloakID)
		if err != nil || clinic == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Clinic not found or not registered locally"})
			c.Abort()
			return
		}

		c.Set("tenant_id", clinic.ID)
		c.Set("keycloak_id", keycloakID)
		c.Next()
	}
}
