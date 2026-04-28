'use client';

import { useState, useMemo, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { PageRoute, type RegisterData, type AddressData } from '@/app/types';

// ─── Constants ──────────────────────────────────────────

const STEPS = ['Dados pessoais', 'Dados da clínica', 'Endereço'] as const;

const INITIAL_ADDRESS: AddressData = {
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

const INITIAL_DATA: RegisterData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  clinic: {
    clinicName: '',
    cnpj: '',
    specialty: '',
    phone: '',
    address: INITIAL_ADDRESS,
  },
};

type FieldErrors = Partial<Record<string, string>>;

// ─── Password Validation Rules ──────────────────────────

interface PasswordRule {
  label: string;
  test: (pwd: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Pelo menos 1 letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Pelo menos 1 letra minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Pelo menos 1 número', test: (p) => /[0-9]/.test(p) },
  { label: 'Pelo menos 1 caractere especial', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p) },
];

// ─── ViaCEP Fetch ───────────────────────────────────────

async function fetchCepData(cep: string): Promise<Partial<AddressData> | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    };
  } catch {
    return null;
  }
}

// ─── Main Component ─────────────────────────────────────

export default function RegisterPage() {
  const { navigateTo } = useNavigation();
  const { register } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<RegisterData>(INITIAL_DATA);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Password rules status (real-time)
  const passwordStatus = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, pass: rule.test(formData.password) })),
    [formData.password],
  );

  const allPasswordRulesPass = passwordStatus.every((r) => r.pass);

  // ─── Validation ─────────────────────────────────────
  // Pure function: returns errors without setting state
  const getStepErrors = (step: number): FieldErrors => {
    const newErrors: FieldErrors = {};

    if (step === 0) {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!formData.email) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (!allPasswordRulesPass) {
        newErrors.password = 'A senha não atende todos os requisitos';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirme sua senha';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    }

    if (step === 1) {
      if (!formData.clinic.clinicName.trim()) newErrors.clinicName = 'Nome da clínica é obrigatório';
      if (!formData.clinic.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
      if (!formData.clinic.specialty.trim()) newErrors.specialty = 'Especialidade é obrigatória';
      if (!formData.clinic.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    }

    if (step === 2) {
      const addr = formData.clinic.address;
      if (!addr.cep.trim()) newErrors.cep = 'CEP é obrigatório';
      if (!addr.street.trim()) newErrors.street = 'Rua é obrigatória';
      if (!addr.number.trim()) newErrors.number = 'Número é obrigatório';
      if (!addr.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!addr.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!addr.state.trim()) newErrors.state = 'Estado é obrigatório';
    }

    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    // Only advance — errors stay clean
    setErrors({});
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError('');
    const stepErrors = getStepErrors(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      // O formato esperado pela API no backend
      const payload = {
        nome_responsavel: formData.name,
        email: formData.email,
        senha: formData.password,
        nome_clinica: formData.clinic.clinicName,
        cnpj: formData.clinic.cnpj,
        especialidade: formData.clinic.specialty,
        telefone: formData.clinic.phone,
        localizacao: `${formData.clinic.address.street}, ${formData.clinic.address.number} - ${formData.clinic.address.city}/${formData.clinic.address.state}`
      };

      await register(payload);
      // Mostrar mensagem de sucesso ou redirecionar para verificação
      navigateTo(PageRoute.VERIFY);
    } catch (err: any) {
      setGlobalError(err.message || 'Erro ao realizar o cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonalChange =
    (field: keyof Omit<RegisterData, 'clinic'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleClinicChange =
    (field: keyof Omit<RegisterData['clinic'], 'address'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        clinic: { ...prev.clinic, [field]: event.target.value },
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleAddressChange =
    (field: keyof AddressData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        clinic: {
          ...prev.clinic,
          address: { ...prev.clinic.address, [field]: event.target.value },
        },
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  // ─── CEP Lookup ─────────────────────────────────────
  const handleCepSearch = async () => {
    const cep = formData.clinic.address.cep;
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrors((prev) => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }));
      return;
    }

    setCepLoading(true);
    const data = await fetchCepData(cep);
    setCepLoading(false);

    if (data) {
      setFormData((prev) => ({
        ...prev,
        clinic: {
          ...prev.clinic,
          address: { ...prev.clinic.address, ...data },
        },
      }));
      setErrors((prev) => ({
        ...prev,
        cep: undefined,
        street: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
      }));
    } else {
      setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }));
    }
  };

  // ─── Step Renderers ─────────────────────────────────

  const renderPersonalStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <TextField
        id="register-name"
        fullWidth
        label="Nome completo"
        value={formData.name}
        onChange={handlePersonalChange('name')}
        error={Boolean(errors.name)}
        helperText={errors.name}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: 'grey.400', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        id="register-email"
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handlePersonalChange('email')}
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
      />

      <Box>
        <TextField
          id="register-password"
          fullWidth
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handlePersonalChange('password')}
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
        />

        {/* Password Requirements Checklist */}
        {formData.password.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            {passwordStatus.map((rule) => (
              <Box
                key={rule.label}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}
              >
                {rule.pass ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#00C853' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: rule.pass ? '#00C853' : 'error.main',
                    fontWeight: 500,
                  }}
                >
                  {rule.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <TextField
        id="register-confirm-password"
        fullWidth
        label="Confirmar senha"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handlePersonalChange('confirmPassword')}
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword}
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
      />
    </Box>
  );

  const renderClinicStep = () => (
    <Grid container spacing={2.5}>
      <Grid size={12}>
        <TextField
          id="register-clinic-name"
          fullWidth
          label="Nome da clínica"
          value={formData.clinic.clinicName}
          onChange={handleClinicChange('clinicName')}
          error={Boolean(errors.clinicName)}
          helperText={errors.clinicName}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          id="register-cnpj"
          fullWidth
          label="CNPJ"
          value={formData.clinic.cnpj}
          onChange={handleClinicChange('cnpj')}
          error={Boolean(errors.cnpj)}
          helperText={errors.cnpj}
          placeholder="00.000.000/0000-00"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          id="register-specialty"
          fullWidth
          label="Especialidade"
          value={formData.clinic.specialty}
          onChange={handleClinicChange('specialty')}
          error={Boolean(errors.specialty)}
          helperText={errors.specialty}
          placeholder="Ex: Cardiologia"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocalHospitalIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          id="register-phone"
          fullWidth
          label="Telefone"
          value={formData.clinic.phone}
          onChange={handleClinicChange('phone')}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
          placeholder="(00) 00000-0000"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
    </Grid>
  );

  const renderAddressStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* CEP with search */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          id="register-cep"
          label="CEP"
          value={formData.clinic.address.cep}
          onChange={handleAddressChange('cep')}
          error={Boolean(errors.cep)}
          helperText={errors.cep}
          placeholder="00000-000"
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          onClick={handleCepSearch}
          disabled={cepLoading}
          sx={{
            minWidth: 48,
            height: 56,
            borderColor: isDark ? 'grey.700' : 'grey.300',
            color: 'text.primary',
            '&:hover': { borderColor: 'secondary.main' },
          }}
        >
          {cepLoading ? <CircularProgress size={20} color="secondary" /> : <SearchIcon />}
        </Button>
      </Box>

      {/* Street + Number */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            id="register-street"
            fullWidth
            label="Rua / Avenida"
            value={formData.clinic.address.street}
            onChange={handleAddressChange('street')}
            error={Boolean(errors.street)}
            helperText={errors.street}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            id="register-number"
            fullWidth
            label="Número"
            value={formData.clinic.address.number}
            onChange={handleAddressChange('number')}
            error={Boolean(errors.number)}
            helperText={errors.number}
          />
        </Grid>
      </Grid>

      {/* Complement + Neighborhood */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="register-complement"
            fullWidth
            label="Complemento"
            value={formData.clinic.address.complement}
            onChange={handleAddressChange('complement')}
            placeholder="Sala, andar, bloco..."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="register-neighborhood"
            fullWidth
            label="Bairro"
            value={formData.clinic.address.neighborhood}
            onChange={handleAddressChange('neighborhood')}
            error={Boolean(errors.neighborhood)}
            helperText={errors.neighborhood}
          />
        </Grid>
      </Grid>

      {/* City + State */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            id="register-city"
            fullWidth
            label="Cidade"
            value={formData.clinic.address.city}
            onChange={handleAddressChange('city')}
            error={Boolean(errors.city)}
            helperText={errors.city}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            id="register-state"
            fullWidth
            label="Estado (UF)"
            value={formData.clinic.address.state}
            onChange={handleAddressChange('state')}
            error={Boolean(errors.state)}
            helperText={errors.state}
            placeholder="SP"
            inputProps={{ maxLength: 2 }}
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
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
          maxWidth: activeStep === 2 ? 620 : 540,
          p: { xs: 2, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
          transition: 'max-width 0.3s ease',
        }}
        className="animate-fade-in-up"
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
              <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="h3" sx={{ color: 'text.primary', mb: 0.5 }}>
              Crie sua conta
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Registre sua clínica e comece a usar
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

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              mb: 4,
              '& .MuiStepLabel-label': { fontSize: '0.85rem' },
              '& .MuiStepIcon-root.Mui-active': { color: 'secondary.main' },
              '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
            }}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {activeStep === 0 && renderPersonalStep()}
            {activeStep === 1 && renderClinicStep()}
            {activeStep === 2 && renderAddressStep()}

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
              {activeStep > 0 ? (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderColor: isDark ? 'grey.700' : 'grey.300',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  Voltar
                </Button>
              ) : (
                <Box />
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 4 }}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  id="register-submit"
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ px: 4, py: 1.2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Login Link */}
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: 'text.secondary' }}
          >
            Já tem uma conta?{' '}
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              onClick={() => navigateTo(PageRoute.LOGIN)}
              sx={{ color: 'secondary.main', fontWeight: 600, cursor: 'pointer' }}
            >
              Faça login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
