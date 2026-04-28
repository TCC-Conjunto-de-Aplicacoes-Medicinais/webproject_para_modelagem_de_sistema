package services

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"openhealth/internal/core/domain"
	"openhealth/internal/core/ports"
	"openhealth/pkg/utils"
	"time"
)

type AuthService struct {
	clinicRepo      ports.ClinicRepository
	emailService    ports.EmailService
	jwtSecret       string
	jwtExpHours     int
}

func NewAuthService(clinicRepo ports.ClinicRepository, emailService ports.EmailService, jwtSecret string, jwtExpHours int) *AuthService {
	return &AuthService{
		clinicRepo:      clinicRepo,
		emailService:    emailService,
		jwtSecret:       jwtSecret,
		jwtExpHours:     jwtExpHours,
	}
}

func (s *AuthService) Register(ctx context.Context, clinic *domain.Clinic) error {
	// Check if email exists
	existingEmail, err := s.clinicRepo.FindByEmail(ctx, clinic.Email)
	if err != nil {
		return err
	}
	if existingEmail != nil {
		return errors.New("email already in use")
	}

	// Check if CNPJ exists
	existingCNPJ, err := s.clinicRepo.FindByCNPJ(ctx, clinic.CNPJ)
	if err != nil {
		return err
	}
	if existingCNPJ != nil {
		return errors.New("CNPJ already in use")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(clinic.Senha)
	if err != nil {
		return fmt.Errorf("failed to hash password: %v", err)
	}
	clinic.Senha = hashedPassword

	// Save to DB
	if err := s.clinicRepo.Save(ctx, clinic); err != nil {
		return err
	}

	// Generate and send verification code (async or sync depending on requirements, here sync for simplicity)
	go func() {
		code := fmt.Sprintf("%06d", rand.New(rand.NewSource(time.Now().UnixNano())).Intn(1000000))
		_ = s.emailService.SendVerificationCode(context.Background(), clinic.Email, code)
	}()

	return nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	clinic, err := s.clinicRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if clinic == nil {
		return "", errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(password, clinic.Senha) {
		return "", errors.New("invalid credentials")
	}

	token, err := utils.GenerateJWT(clinic.ID, s.jwtSecret, s.jwtExpHours)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %v", err)
	}

	return token, nil
}
