'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

export default function PreviewSettings() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const toggleTrack = (on: boolean) => ({
    width: 16,
    height: 9,
    borderRadius: 5,
    backgroundColor: on ? colors.accent : (isDark ? '#475569' : '#D1D5DB'),
    position: 'relative' as const,
    flexShrink: 0,
  });

  const toggleThumb = (on: boolean) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute' as const,
    top: 1,
    left: on ? 8 : 1,
    transition: 'left 0.15s ease',
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
        Configurações
      </Typography>

      {/* Profile */}
      <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
        <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
          Perfil
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: `${colors.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: colors.accent }}>DS</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.42rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
              Dr. Silva
            </Typography>
            <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
              silva@clinica.com
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Preferences */}
      <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
        <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
          Preferências
        </Typography>
        {[
          { label: 'Modo escuro', on: true },
          { label: 'Notificações', on: true },
          { label: 'Sons', on: false },
        ].map((pref) => (
          <Box
            key={pref.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 0.35,
            }}
          >
            <Typography sx={{ fontSize: '0.4rem', color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
              {pref.label}
            </Typography>
            <Box sx={toggleTrack(pref.on)}>
              <Box sx={toggleThumb(pref.on)} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
