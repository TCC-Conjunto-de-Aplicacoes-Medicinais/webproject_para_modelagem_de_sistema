package services

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/ports"
	"openhealth/pkg/logger"
	"time"

	"github.com/Nerzal/gocloak/v13"
)

type KeycloakAuth struct {
	Client       *gocloak.GoCloak
	ClientID     string
	ClientSecret string
	Realm        string
}

type AuthService struct {
	clinicRepo   ports.ClinicRepository
	emailService ports.EmailService
	jwtSecret    string
	jwtExpHours  int
	Keycloak     *KeycloakAuth
	Logger       *logger.Logger
}

func NewAuthService(
	clinicRepo ports.ClinicRepository,
	emailService ports.EmailService,
	jwtSecret string,
	jwtExpHours int,
	keycloak *KeycloakAuth,
	l *logger.Logger,
) *AuthService {
	return &AuthService{
		clinicRepo:   clinicRepo,
		emailService: emailService,
		jwtSecret:    jwtSecret,
		jwtExpHours:  jwtExpHours,
		Keycloak:     keycloak,
		Logger:       l,
	}
}

func (s *AuthService) Register(ctx context.Context, clinic *domain.Clinic) error {
	// Check if email exists in local DB
	existingEmail, err := s.clinicRepo.FindByEmail(ctx, clinic.Email)
	if err != nil {
		return err
	}
	if existingEmail != nil {
		return errors.New("email already in use")
	}

	// Check if CNPJ exists in local DB
	existingCNPJ, err := s.clinicRepo.FindByCNPJ(ctx, clinic.CNPJ)
	if err != nil {
		return err
	}
	if existingCNPJ != nil {
		return errors.New("CNPJ already in use")
	}

	// 1. Keycloak Integration: Login as client to get admin token
	token, err := s.Keycloak.Client.LoginClient(ctx, s.Keycloak.ClientID, s.Keycloak.ClientSecret, s.Keycloak.Realm)
	if err != nil {
		return fmt.Errorf("failed to authenticate with Keycloak: %v", err)
	}

	// 2. Prepare Keycloak User
	enabled := true
	keycloakUser := gocloak.User{
		Username:      gocloak.StringP(clinic.Email),
		Email:         gocloak.StringP(clinic.Email),
		FirstName:     gocloak.StringP(clinic.ClinicName),
		Enabled:       &enabled,
		EmailVerified: gocloak.BoolP(true), // Assuming clinics are verified or handled via code below
		Attributes: &map[string][]string{
			"tipo_usuario": {"clinica"},
		},
	}

	// 3. Create User in Keycloak
	keycloakID, err := s.Keycloak.Client.CreateUser(ctx, token.AccessToken, s.Keycloak.Realm, keycloakUser)
	if err != nil {
		s.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "register_keycloak",
			Description:   fmt.Sprintf("Failed to create user in Keycloak for %s: %v", clinic.Email, err),
			ResultStatus:  "error",
		})
		return fmt.Errorf("failed to create user in Keycloak: %v", err)
	}
	clinic.KeycloakID = &keycloakID

	// 4. Set Password in Keycloak
	err = s.Keycloak.Client.SetPassword(ctx, token.AccessToken, keycloakID, s.Keycloak.Realm, clinic.Senha, false)
	if err != nil {
		s.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "register_keycloak",
			Description:   fmt.Sprintf("Failed to set password in Keycloak for %s: %v", clinic.Email, err),
			ResultStatus:  "error",
		})
		// Rollback Keycloak user creation if password setting fails
		_ = s.Keycloak.Client.DeleteUser(ctx, token.AccessToken, s.Keycloak.Realm, keycloakID)
		return fmt.Errorf("failed to set password in Keycloak: %v", err)
	}

	// 5. Generate verification code for local logic (if still needed)
	code := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))
	clinic.VerificationCode = code
	clinic.Verify = false
	clinic.CreatedAt = time.Now()
	clinic.UpdatedAt = time.Now()

	// 6. Save to DB
	if err := s.clinicRepo.Save(ctx, clinic); err != nil {
		// Rollback: delete user from Keycloak if DB save fails
		_ = s.Keycloak.Client.DeleteUser(ctx, token.AccessToken, s.Keycloak.Realm, keycloakID)
		return fmt.Errorf("failed to save clinic to database: %v", err)
	}

	// Send verification code
	go func() {
		_ = s.emailService.SendVerificationCode(context.Background(), clinic.Email, code)
	}()

	return nil
}

func (s *AuthService) VerifyCode(ctx context.Context, email, code string) error {
	clinic, err := s.clinicRepo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if clinic == nil {
		return errors.New("user not found")
	}

	if clinic.Verify {
		return errors.New("user already verified")
	}

	if clinic.VerificationCode != code {
		return errors.New("invalid verification code")
	}

	clinic.Verify = true
	clinic.VerificationCode = ""
	clinic.UpdatedAt = time.Now()
	return s.clinicRepo.Save(ctx, clinic)
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
	InternalID   string `json:"internal_id"` // This is the clinic.ID (tenant_id)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginResponse, error) {
	// 1. Authenticate with Keycloak
	token, err := s.Keycloak.Client.Login(ctx, s.Keycloak.ClientID, s.Keycloak.ClientSecret, s.Keycloak.Realm, email, password)
	if err != nil {
		s.Logger.Log(logger.LogEntry{
			OriginService: "auth",
			ActionType:    "login_keycloak",
			Description:   fmt.Sprintf("Keycloak login failed for %s: %v", email, err),
			ResultStatus:  "error",
		})
		return nil, errors.New("credenciais inválidas")
	}

	// 2. Fetch clinic info from local DB to check verification status and get ID
	clinic, err := s.clinicRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if clinic == nil {
		return nil, errors.New("clinica não encontrada no banco de dados local")
	}

	if !clinic.Verify {
		return nil, errors.New("unverified_account")
	}

	return &LoginResponse{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		ExpiresIn:    token.ExpiresIn,
		TokenType:    "Bearer",
		InternalID:   clinic.ID,
	}, nil
}

