package email

import (
	"context"
	"fmt"
	"net/smtp"
	"openhealth/internal/core/ports"
)

type smtpEmailService struct {
	host     string
	port     int
	user     string
	password string
}

func NewSMTPEmailService(host string, port int, user, password string) ports.EmailService {
	return &smtpEmailService{
		host:     host,
		port:     port,
		user:     user,
		password: password,
	}
}

func (s *smtpEmailService) SendVerificationCode(ctx context.Context, toEmail, code string) error {
	auth := smtp.PlainAuth("", s.user, s.password, s.host)

	subject := "Subject: Open Health - Verification Code\n"
	body := fmt.Sprintf("Your verification code is: %s\n\nWelcome to Open Health!", code)
	msg := []byte(subject + "\n" + body)

	addr := fmt.Sprintf("%s:%d", s.host, s.port)
	return smtp.SendMail(addr, auth, s.user, []string{toEmail}, msg)
}
