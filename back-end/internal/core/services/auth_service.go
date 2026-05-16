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
		return errors.New("email já cadastrado")
	}

	// Check if CNPJ exists in local DB
	existingCNPJ, err := s.clinicRepo.FindByCNPJ(ctx, clinic.CNPJ)
	if err != nil {
		return err
	}
	if existingCNPJ != nil {
		return errors.New("CNPJ já cadastrado")
	}

	// 1. Keycloak Integration: Login as client to get admin token
	token, err := s.Keycloak.Client.LoginClient(ctx, s.Keycloak.ClientID, s.Keycloak.ClientSecret, s.Keycloak.Realm)
	if err != nil {
		return fmt.Errorf("erro ao autenticar no Keycloak: %v", err)
	}

	// 2. Prepare Keycloak User
	enabled := true
	keycloakUser := gocloak.User{
		Username:      gocloak.StringP(clinic.Email),
		Email:         gocloak.StringP(clinic.Email),
		FirstName:     gocloak.StringP(clinic.ClinicName),
		LastName:      gocloak.StringP("-"),
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
			ActionType:    "register",
			Description:   fmt.Sprintf("Falha ao criar usuário no Keycloak para %s: %v", clinic.Email, err),
			ResultStatus:  "error",
		})
		return fmt.Errorf("erro ao criar usuário no Keycloak: %v", err)
	}
	clinic.KeycloakID = &keycloakID

	// 4. Set Password in Keycloak
	err = s.Keycloak.Client.SetPassword(ctx, token.AccessToken, keycloakID, s.Keycloak.Realm, clinic.Senha, false)
	if err != nil {
		_ = s.Keycloak.Client.DeleteUser(ctx, token.AccessToken, s.Keycloak.Realm, keycloakID)
		return fmt.Errorf("erro ao definir senha no Keycloak: %v", err)
	}

	// 5. Generate verification code for local logic
	code := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))
	clinic.VerificationCode = code
	clinic.Verify = false
	clinic.CreatedAt = time.Now()
	clinic.UpdatedAt = time.Now()

	// 6. Save to DB
	if err := s.clinicRepo.Save(ctx, clinic); err != nil {
		_ = s.Keycloak.Client.DeleteUser(ctx, token.AccessToken, s.Keycloak.Realm, keycloakID)
		return fmt.Errorf("erro ao salvar clínica no banco: %v", err)
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
		return errors.New("usuário não encontrado")
	}

	if clinic.Verify {
		return errors.New("usuário já verificado")
	}

	if clinic.VerificationCode != code {
		return errors.New("código inválido")
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
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginResponse, error) {
	// 1. Authenticate directly with Keycloak using email (username)
	jwt, err := s.Keycloak.Client.Login(
		ctx,
		s.Keycloak.ClientID,
		s.Keycloak.ClientSecret,
		s.Keycloak.Realm,
		email,
		password,
	)
	if err != nil {
		return nil, fmt.Errorf("credenciais inválidas: %w", err)
	}

	// 2. Check if the clinic is verified locally
	clinic, err := s.clinicRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if clinic != nil && !clinic.Verify {
		return nil, errors.New("unverified_account")
	}

	return &LoginResponse{
		AccessToken:  jwt.AccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    jwt.ExpiresIn,
		RefreshToken: jwt.RefreshToken,
	}, nil
}

type RefreshResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*RefreshResponse, error) {
	jwt, err := s.Keycloak.Client.RefreshToken(
		ctx,
		refreshToken,
		s.Keycloak.ClientID,
		s.Keycloak.ClientSecret,
		s.Keycloak.Realm,
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao revalidar sessão: %w", err)
	}

	return &RefreshResponse{
		AccessToken:  jwt.AccessToken,
		TokenType:    "Bearer",
		ExpiresIn:    jwt.ExpiresIn,
		RefreshToken: jwt.RefreshToken,
	}, nil
}
