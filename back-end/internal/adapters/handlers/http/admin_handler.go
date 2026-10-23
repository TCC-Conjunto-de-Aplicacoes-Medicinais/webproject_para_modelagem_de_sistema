package http

import (
	"encoding/json"
	"io"
	"net/http"
	"runtime"
	"openhealth/internal/core/ports"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// AdminHandler expõe ao painel de administração o estado das clínicas no motor e o desligamento manual.
// Só entra quem tem token válido e e-mail na lista ADMIN_EMAILS. O MOTOR_TOKEN fica no servidor.
type AdminHandler struct {
	validator  ports.TokenValidator
	adminSet   map[string]bool
	motorURL   string
	motorToken string
	client     *http.Client
}

func NewAdminHandler(validator ports.TokenValidator, adminEmails []string, motorURL, motorToken string) *AdminHandler {
	set := map[string]bool{}
	for _, e := range adminEmails {
		if e = strings.ToLower(strings.TrimSpace(e)); e != "" {
			set[e] = true
		}
	}
	return &AdminHandler{
		validator:  validator,
		adminSet:   set,
		motorURL:   strings.TrimRight(motorURL, "/"),
		motorToken: motorToken,
		client:     &http.Client{Timeout: 30 * time.Second},
	}
}

// Middleware valida o Bearer token via Keycloak e confere se o e-mail é de administrador.
func (h *AdminHandler) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		parts := strings.Split(c.GetHeader("Authorization"), " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token ausente"})
			c.Abort()
			return
		}
		claims, err := h.validator.ValidateToken(c.Request.Context(), parts[1])
		if err != nil || claims == nil || !claims.Active {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token inválido ou expirado"})
			c.Abort()
			return
		}
		if !h.adminSet[strings.ToLower(claims.Email)] {
			c.JSON(http.StatusForbidden, gin.H{"error": "acesso restrito a administradores"})
			c.Abort()
			return
		}
		c.Next()
	}
}

var startedAt = time.Now()

// Status GET /api/v1/admin/status — números para o painel: estado do motor, clínicas por status e do próprio serviço.
func (h *AdminHandler) Status(c *gin.Context) {
	motorOK := false
	counts := map[string]int{}
	total := 0
	if h.motorURL != "" {
		req, _ := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, h.motorURL+"/clinics", nil)
		req.Header.Set("X-Motor-Token", h.motorToken)
		if resp, err := h.client.Do(req); err == nil {
			defer resp.Body.Close()
			var list []struct {
				Status string `json:"status"`
			}
			if resp.StatusCode == http.StatusOK && json.NewDecoder(resp.Body).Decode(&list) == nil {
				motorOK = true
				for _, cl := range list {
					counts[cl.Status]++
					total++
				}
			}
		}
	}
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)
	c.JSON(http.StatusOK, gin.H{
		"motor_online":      motorOK,
		"clinics_total":     total,
		"clinics_by_status": counts,
		"wizard_uptime_s":   int(time.Since(startedAt).Seconds()),
		"wizard_heap_mb":    mem.HeapAlloc / 1024 / 1024,
		"wizard_goroutines": runtime.NumGoroutine(),
		"generated_at":      time.Now().Format(time.RFC3339),
	})
}

// ListClinics GET /api/v1/admin/clinics
func (h *AdminHandler) ListClinics(c *gin.Context) {
	h.forward(c, http.MethodGet, "/clinics", nil)
}

// DestroyClinic POST /api/v1/admin/clinics/:id/destroy
func (h *AdminHandler) DestroyClinic(c *gin.Context) {
	body := `{"clinic_id":"` + c.Param("id") + `","environment":"aws"}`
	h.forward(c, http.MethodPost, "/destroy", strings.NewReader(body))
}

func (h *AdminHandler) forward(c *gin.Context, method, path string, body io.Reader) {
	if h.motorURL == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "MOTOR_URL não configurado"})
		return
	}
	req, err := http.NewRequestWithContext(c.Request.Context(), method, h.motorURL+path, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao montar requisição ao motor"})
		return
	}
	req.Header.Set("X-Motor-Token", h.motorToken)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := h.client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "motor indisponível: verifique o túnel"})
		return
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), data)
}
