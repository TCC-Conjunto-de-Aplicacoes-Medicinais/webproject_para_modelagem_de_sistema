'use client';

import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { api } from '@/app/services/api';
import { PageRoute, type LoginCredentials } from '@/app/types';

const INITIAL_CREDENTIALS: LoginCredentials = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const { navigateTo } = useNavigation();
  const { login, setUserEmail } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [credentials, setCredentials] = useState<LoginCredentials>(INITIAL_CREDENTIALS);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Estados do Modal "Esqueceu a senha"
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleOpenForgot = () => {
    setForgotEmail(credentials.email || '');
    setForgotEmailError('');
    setForgotSuccess('');
    setForgotError('');
    setForgotDialogOpen(true);
  };

  const handleCloseForgot = () => {
    if (isForgotLoading) return;
    setForgotDialogOpen(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotEmailError('Email é obrigatório');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotEmailError('Email inválido');
      return;
    }
    setForgotEmailError('');

    try {
      setIsForgotLoading(true);
      await api.forgotPassword(forgotEmail);
      setUserEmail(forgotEmail);
      setForgotDialogOpen(false);
      navigateTo(PageRoute.RESET_PASSWORD);
    } catch (err: any) {
      setForgotError(err.message || 'Erro ao solicitar recuperação de senha.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!credentials.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login(credentials);
      navigateTo(PageRoute.SYSTEM_CREATION);
    } catch (err: any) {
      if (err.message === 'unverified_account') {
        navigateTo(PageRoute.VERIFY);
        return;
      }
      let msg = err.message || 'Erro ao realizar login. Verifique suas credenciais.';
      const msgLower = msg.toLowerCase();
      if (
        msgLower.includes('invalid credentials') ||
        msgLower.includes('invalid_grant') ||
        msgLower.includes('credenciais inválidas') ||
        msgLower.includes('record not found')
      ) {
        msg = 'E-mail ou senha incorretos.';
      }
      setGlobalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LoginCredentials) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
          maxWidth: 440,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
        }}
        className="animate-fade-in-up"
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
              <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 0.5 }}>
              Bem-vindo de volta
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Entre na sua conta para continuar
            </Typography>
          </Box>

          {globalError && (
            <Box
              sx={{
                mb: 3,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid',
                borderColor: 'error.main',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="error">
                {globalError}
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              fullWidth
              label="Email"
              type="email"
              value={credentials.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
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
              id="login-password"
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              helperText={errors.password}
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
              sx={{ mb: 1 }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                onClick={handleOpenForgot}
                sx={{ color: 'secondary.main', fontWeight: 500, cursor: 'pointer' }}
              >
                Esqueceu a senha?
              </Link>
            </Box>

            <Button
              id="login-submit"
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.5, fontSize: '1rem', mb: 3 }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                ou
              </Typography>
            </Divider>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: 'text.secondary' }}
            >
              Não tem uma conta?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                onClick={() => navigateTo(PageRoute.REGISTER)}
                sx={{ color: 'secondary.main', fontWeight: 600, cursor: 'pointer' }}
              >
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Modal / Dialog de Recuperação de Senha */}
      <Dialog
        open={forgotDialogOpen}
        onClose={handleCloseForgot}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              backgroundColor: isDark ? 'background.paper' : '#ffffff',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Recuperação de Senha
        </DialogTitle>
        <Box component="form" onSubmit={handleForgotSubmit} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Informe o e-mail cadastrado na plataforma. Se ele for encontrado, enviaremos as orientações para redefinir sua senha.
            </Typography>

            {forgotSuccess ? (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {forgotSuccess}
              </Alert>
            ) : null}

            {forgotError ? (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {forgotError}
              </Alert>
            ) : null}

            {!forgotSuccess && (
              <TextField
                id="forgot-email"
                fullWidth
                label="Seu e-mail"
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  if (forgotEmailError) setForgotEmailError('');
                }}
                error={Boolean(forgotEmailError)}
                helperText={forgotEmailError}
                autoFocus
                disabled={isForgotLoading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                  setUserEmail(forgotEmail || credentials.email);
                  setForgotDialogOpen(false);
                  navigateTo(PageRoute.RESET_PASSWORD);
                }}
                sx={{ color: 'secondary.main', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Já tem um código de verificação? Clique aqui para redefinir.
              </Link>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={handleCloseForgot}
              disabled={isForgotLoading}
              color="inherit"
              sx={{ fontWeight: 500 }}
            >
              {forgotSuccess ? 'Fechar' : 'Cancelar'}
            </Button>
            {!forgotSuccess && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isForgotLoading}
                sx={{ minWidth: 110 }}
              >
                {isForgotLoading ? <CircularProgress size={20} color="inherit" /> : 'Enviar'}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
