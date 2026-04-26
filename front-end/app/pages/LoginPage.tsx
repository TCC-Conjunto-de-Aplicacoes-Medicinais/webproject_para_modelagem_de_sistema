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
import { useTheme } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { PageRoute, type LoginCredentials } from '@/app/types';

const INITIAL_CREDENTIALS: LoginCredentials = {
  email: '',
  password: '',
};

export default function LoginPage() {
  const { navigateTo } = useNavigation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [credentials, setCredentials] = useState<LoginCredentials>(INITIAL_CREDENTIALS);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // TODO: integrar com backend real
    console.log('Login mock:', credentials);
    navigateTo(PageRoute.SYSTEM_CREATION);
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
              sx={{ py: 1.5, fontSize: '1rem', mb: 3 }}
            >
              Entrar
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
    </Box>
  );
}
