'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { PageRoute } from '@/app/types';

const FOOTER_LINKS = [
  { label: 'Início', route: PageRoute.LANDING },
  { label: 'Criar Sistema', route: PageRoute.SYSTEM_CREATION },
  { label: 'Entrar', route: PageRoute.LOGIN },
  { label: 'Cadastrar', route: PageRoute.REGISTER },
] as const;

export default function Footer() {
  const { navigateTo } = useNavigation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 6,
        pb: 4,
        px: { xs: 3, sm: 6 },
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 4,
        }}
      >
        {/* Logo & Description */}
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 320 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1B5E3B, #00C853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ClinicaGen
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
            A forma mais simples de criar um sistema para sua clínica médica.
          </Typography>
        </Box>

        {/* Links */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FOOTER_LINKS.map(({ label, route }) => (
            <Link
              key={route}
              component="button"
              variant="body2"
              underline="hover"
              onClick={() => navigateTo(route)}
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {label}
            </Link>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="body2"
        align="center"
        sx={{ color: 'text.secondary' }}
      >
        © {currentYear} ClinicaGen. Todos os direitos reservados.
      </Typography>
    </Box>
  );
}
