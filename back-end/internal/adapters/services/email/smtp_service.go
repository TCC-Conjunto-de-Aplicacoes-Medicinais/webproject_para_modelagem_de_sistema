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

	subject := "Open Health - Seu Código de Verificação"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	
	htmlBody := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<style>
			body { font-family: 'Inter', Arial, sans-serif; background-color: #F8FAF9; margin: 0; padding: 40px 0; }
			.container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
			.header { background: linear-gradient(135deg, #00C853, #1B5E3B); padding: 30px; text-align: center; color: white; }
			.content { padding: 40px 30px; text-align: center; color: #333; }
			.code-box { background: #E0F2E7; padding: 20px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00C853; border-radius: 8px; margin: 30px 0; display: inline-block; }
			.footer { padding: 20px; text-align: center; font-size: 12px; color: #888; background: #f9f9f9; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1 style="margin: 0; font-size: 24px;">Bem-vindo à Open Health!</h1>
			</div>
			<div class="content">
				<p style="font-size: 16px; margin-bottom: 10px;">Falta pouco para você criar o sistema da sua clínica.</p>
				<p style="font-size: 16px;">Copie o código abaixo e cole na tela de verificação:</p>
				
				<div class="code-box">%s</div>
				
				<p style="font-size: 14px; color: #666;">Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
			</div>
			<div class="footer">
				&copy; 2026 Open Health. Todos os direitos reservados.
			</div>
		</div>
	</body>
	</html>
	`, code)

	msg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n%s%s", toEmail, subject, mime, htmlBody))

	addr := fmt.Sprintf("%s:%d", s.host, s.port)
	return smtp.SendMail(addr, auth, s.user, []string{toEmail}, msg)
}
