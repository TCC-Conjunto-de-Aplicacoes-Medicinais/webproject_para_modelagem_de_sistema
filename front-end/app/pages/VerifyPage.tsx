'use client';

import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { PageRoute } from '@/app/types';
import { api } from '@/app/services/api';

export default function VerifyPage() {
  const { navigateTo } = useNavigation();
  const { userEmail, setIsVerified } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('O código deve ter exatamente 6 dígitos.');
      return;
    }

    if (!userEmail) {
      setError('E-mail não encontrado. Faça login novamente.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.verifyCode(userEmail, code);
      setIsVerified(true);
      navigateTo(PageRoute.SYSTEM_CREATION);
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
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
              <VerifiedUserIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ color: 'text.primary', mb: 1, fontWeight: 700 }}>
              Verifique sua Conta
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Enviamos um código de 6 dígitos para o seu e-mail: <b>{userEmail || 'Desconhecido'}</b>
            </Typography>
          </Box>

          {error && (
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
                {error}
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="verify-code"
              fullWidth
              label="Código de Verificação"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={Boolean(error)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { fontSize: '1.5rem', letterSpacing: '8px', textAlign: 'center' }
                },
                htmlInput: {
                    style: { textAlign: 'center' }
                }
              }}
              sx={{ mb: 4 }}
            />

            <Button
              id="verify-submit"
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting || code.length !== 6}
              sx={{ py: 1.5, fontSize: '1rem', mb: 3 }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
            </Button>
            
            <Button
              variant="text"
              color="inherit"
              fullWidth
              onClick={() => navigateTo(PageRoute.LOGIN)}
            >
              Voltar para o Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
