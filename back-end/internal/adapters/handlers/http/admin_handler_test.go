package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"openhealth/internal/core/ports"
	"testing"

	"github.com/gin-gonic/gin"
)

type fakeValidator struct {
	claims *ports.TokenClaims
	err    error
}

func (f fakeValidator) ValidateToken(_ context.Context, _ string) (*ports.TokenClaims, error) {
	return f.claims, f.err
}

func adminRouter(v ports.TokenValidator) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := NewAdminHandler(v, []string{"isaiaspohinc@gmail.com"}, "", "")
	r.GET("/admin/clinics", h.Middleware(), func(c *gin.Context) { c.Status(http.StatusOK) })
	return r
}

func serve(r *gin.Engine) int {
	req := httptest.NewRequest(http.MethodGet, "/admin/clinics", nil)
	req.Header.Set("Authorization", "Bearer token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w.Code
}

func TestAdminMiddleware_AllowsListedAdmin(t *testing.T) {
	v := fakeValidator{claims: &ports.TokenClaims{Email: "ISAIASPOHINC@gmail.com", Active: true}}
	if code := serve(adminRouter(v)); code != http.StatusOK {
		t.Fatalf("admin listado deveria passar, veio %d", code)
	}
}

func TestAdminMiddleware_RejectsOtherUsers(t *testing.T) {
	v := fakeValidator{claims: &ports.TokenClaims{Email: "clinica@example.com", Active: true}}
	if code := serve(adminRouter(v)); code != http.StatusForbidden {
		t.Fatalf("usuário comum deveria ser recusado com 403, veio %d", code)
	}
}

func TestAdminMiddleware_RejectsInactiveToken(t *testing.T) {
	v := fakeValidator{claims: &ports.TokenClaims{Email: "isaiaspohinc@gmail.com", Active: false}}
	if code := serve(adminRouter(v)); code != http.StatusUnauthorized {
		t.Fatalf("token inativo deveria ser recusado com 401, veio %d", code)
	}
}
