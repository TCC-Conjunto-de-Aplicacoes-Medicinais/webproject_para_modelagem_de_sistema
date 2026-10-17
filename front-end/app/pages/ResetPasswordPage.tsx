'use client';

import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { PageRoute } from '@/app/types';
import { api } from '@/app/services/api';

export default function ResetPasswordPage() {
  const { navigateTo } = useNavigation();
  const { userEmail } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState(userEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, informe o seu e-mail.');
      return;
    }

    if (code.length !== 6) {
      setError('O código de verificação deve ter exatamente 6 dígitos.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação de senha não confere com a nova senha.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.resetPassword({
        email,
        code,
        new_password: newPassword,
      });
      setSuccess(res?.message || 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.');
    } catch (err: any) {
      setError(err.message || 'Código inválido ou erro ao redefinir senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Informe o e-mail para reenviar o código.');
      return;
    }
    setError('');
    setResendMessage('');

    try {
      setIsResending(true);
      await api.forgotPassword(email);
      setResendMessage('Novo código enviado para o seu e-mail!');
    } catch (err: any) {
      setError(err.message || 'Falha ao reenviar código de recuperação.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 8 },
        px: 2,
        background: isDark
          ? 'linear-gradient(160deg, #0A0F0C 0%, #0D1A12 40%, #0F2318 100%)'
          : 'linear-gradient(160deg, #F8FAF9 0%, #EEF5F0 40%, #E0F2E7 100%)',
        minHeight: '80vh',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.5,
                borderRadius: 3,
                mb: 2,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(27, 94, 59, 0.12))'
                  : 'linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(27, 94, 59, 0.08))',
              }}
            >
              <LockResetIcon sx={{ color: 'secondary.main', fontSize: 36 }} />
            </Box>
            <Typography variant="h4" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
              Redefinir Senha
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Digite o código de 6 dígitos enviado para seu e-mail e cadastre uma nova senha.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {resendMessage && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              {resendMessage}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Senha Alterada!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {success}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => navigateTo(PageRoute.LOGIN)}
                sx={{ py: 1.5 }}
              >
                Ir para o Login
              </Button>
            </Box>
          ) : (
            /* Formulário */
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                id="reset-email"
                fullWidth
                label="E-mail da Clínica"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={Boolean(userEmail)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                id="reset-code"
                fullWidth
                label="Código de 6 dígitos"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '1.25rem', letterSpacing: '6px', fontWeight: 600 },
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                id="reset-new-password"
                fullWidth
                label="Nova Senha"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Mínimo de 6 caracteres"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'ocultar senha' : 'mostrar senha'}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                id="reset-confirm-password"
                fullWidth
                label="Confirmar Nova Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          aria-label={showConfirmPassword ? 'ocultar senha' : 'mostrar senha'}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />

              <Button
                id="reset-submit"
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting || code.length !== 6 || !newPassword}
                sx={{ py: 1.5, fontSize: '1rem', mb: 2 }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Redefinir Senha'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  disabled={isResending}
                  onClick={handleResendCode}
                  sx={{ textTransform: 'none', color: 'text.secondary' }}
                >
                  {isResending ? 'Reenviando...' : 'Reenviar código'}
                </Button>

                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={() => navigateTo(PageRoute.LOGIN)}
                  sx={{ textTransform: 'none' }}
                >
                  Voltar ao Login
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
