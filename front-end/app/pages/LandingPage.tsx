'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import SpeedIcon from '@mui/icons-material/Speed';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TuneIcon from '@mui/icons-material/Tune';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { PageRoute } from '@/app/types';

const BENEFITS = [
  {
    icon: <TouchAppIcon sx={{ fontSize: 40 }} />,
    title: 'Simples',
    description: 'Interface intuitiva que qualquer pessoa consegue usar, sem necessidade de conhecimento técnico.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Rápido',
    description: 'Crie seu sistema em poucos minutos. Sem esperar semanas por um desenvolvedor.',
  },
  {
    icon: <TuneIcon sx={{ fontSize: 40 }} />,
    title: 'Personalizado',
    description: 'Adapte o sistema exatamente às necessidades da sua clínica médica.',
  },
] as const;

const STEPS = [
  {
    icon: <SettingsIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
    title: 'Crie sua conta',
    description: 'Cadastre sua clínica em menos de 2 minutos.',
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
    title: 'Configure seu sistema',
    description: 'Siga o processo guiado e personalize tudo.',
  },
  {
    icon: <DesktopWindowsIcon sx={{ fontSize: 36, color: 'secondary.main' }} />,
    title: 'Seu sistema pronto',
    description: 'Receba seu sistema sob medida para usar.',
  },
] as const;

export default function LandingPage() {
  const { navigateTo } = useNavigation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(160deg, #0A0F0C 0%, #0D1A12 40%, #0F2318 100%)'
            : 'linear-gradient(160deg, #F8FAF9 0%, #EEF5F0 40%, #E0F2E7 100%)',
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0, 200, 83, ${isDark ? '0.06' : '0.08'}) 0%, transparent 70%)`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(27, 94, 59, ${isDark ? '0.08' : '0.06'}) 0%, transparent 70%)`,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              maxWidth: 680,
              mx: { xs: 'auto', md: 0 },
              textAlign: { xs: 'center', md: 'left' },
            }}
            className="animate-fade-in-up"
          >
            <Typography
              variant="body2"
              sx={{
                display: 'inline-block',
                mb: 2,
                px: 2.5,
                py: 0.75,
                borderRadius: 5,
                backgroundColor: isDark ? 'rgba(0, 200, 83, 0.12)' : 'rgba(0, 200, 83, 0.1)',
                color: 'secondary.main',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              ✦ Tecnologia para clínicas médicas
            </Typography>

            <Typography
              variant="h1"
              sx={{
                color: 'text.primary',
                mb: 3,
                fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' },
              }}
            >
              Um jeito{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #00C853, #4A9B6E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                fácil e simples
              </Box>{' '}
              de ter um sistema para sua clínica
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 5,
                fontSize: { xs: '1rem', md: '1.15rem' },
                maxWidth: 540,
                mx: { xs: 'auto', md: 0 },
                color: 'text.secondary',
              }}
              className="animate-fade-in-up animate-delay-100"
            >
              Crie seu sistema de gestão personalizado sem precisar de conhecimento técnico.
              Gerencie pacientes, agendamentos e muito mais.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: { xs: 'center', md: 'flex-start' },
                flexWrap: 'wrap',
              }}
              className="animate-fade-in-up animate-delay-200"
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigateTo(PageRoute.REGISTER)}
                sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
              >
                Comece agora
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  borderColor: isDark ? 'grey.700' : 'grey.300',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: isDark ? 'rgba(27, 94, 59, 0.08)' : 'rgba(27, 94, 59, 0.04)',
                  },
                }}
              >
                Saiba mais
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ color: 'text.primary', mb: 2 }}>
            Por que escolher a ClinicaGen?
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 520, mx: 'auto', fontSize: '1.1rem', color: 'text.secondary' }}>
            Criamos ferramentas que simplificam a gestão da sua clínica médica.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {BENEFITS.map((benefit) => (
            <Grid size={{ xs: 12, md: 4 }} key={benefit.title}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  cursor: 'default',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: 3,
                      mb: 3,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(27, 94, 59, 0.12))'
                        : 'linear-gradient(135deg, rgba(0, 200, 83, 0.1), rgba(27, 94, 59, 0.08))',
                      color: 'secondary.main',
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1.5, color: 'text.primary' }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {benefit.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ backgroundColor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ color: 'text.primary', mb: 2 }}>
              Como funciona?
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 480, mx: 'auto', fontSize: '1.1rem', color: 'text.secondary' }}>
              Apenas 3 passos para ter seu sistema pronto.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {STEPS.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={step.title}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      mb: 3,
                      backgroundColor: 'background.paper',
                      boxShadow: `0 4px 20px rgba(0, 200, 83, ${isDark ? '0.2' : '0.15'})`,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h4" sx={{ mb: 1.5, color: 'text.primary' }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {step.description}
                  </Typography>
                  {index < STEPS.length - 1 && (
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'absolute',
                        top: 60,
                        right: -40,
                        color: 'grey.300',
                        fontSize: 28,
                      }}
                    >
                      →
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigateTo(PageRoute.REGISTER)}
              sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
            >
              Criar minha conta
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
