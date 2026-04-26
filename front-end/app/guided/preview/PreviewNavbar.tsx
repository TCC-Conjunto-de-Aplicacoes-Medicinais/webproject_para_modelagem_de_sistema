'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

export default function PreviewNavbar() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const clinicName = state.identity.clinicName || 'Minha Clínica';
  const hasCustomLogo = state.identity.logoType === 'custom' && state.identity.logoFile;

  return (
    <Box
      sx={{
        height: 36,
        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        gap: 1,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      {hasCustomLogo ? (
        <Box
          component="img"
          src={state.identity.logoFile!}
          alt="Logo"
          sx={{
            width: 18,
            height: 18,
            borderRadius: 0.5,
            objectFit: 'contain',
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        />
      ) : (
        <AutoAwesomeIcon
          sx={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.9)',
          }}
        />
      )}

      {/* Clinic Name */}
      <Typography
        sx={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.95)',
          letterSpacing: '-0.01em',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: 120,
        }}
      >
        {clinicName}
      </Typography>

      <Box sx={{ flex: 1 }} />

      {/* Right icons */}
      <DarkModeIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PersonIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} />
      </Box>
    </Box>
  );
}
