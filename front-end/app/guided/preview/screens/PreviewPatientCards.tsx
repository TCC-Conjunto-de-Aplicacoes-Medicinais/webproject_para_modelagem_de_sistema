'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

/**
 * Preview de Pacientes simplificada para a Assistente.
 * Grid de cards com briefing (convênio, telefone, gênero) — sem navegar ao prontuário.
 */

const MOCK_PATIENTS = [
  { name: 'Maria Santos', gender: 'F', age: 45, phone: '(11) 99123-4567', insurance: 'SulAmérica', lastVisit: '10/04' },
  { name: 'João Pereira', gender: 'M', age: 62, phone: '(11) 98765-4321', insurance: 'Bradesco', lastVisit: '08/04' },
  { name: 'Ana Lima', gender: 'F', age: 33, phone: '(11) 97654-3210', insurance: 'Unimed', lastVisit: '05/04' },
  { name: 'Carlos Oliveira', gender: 'M', age: 58, phone: '(11) 96543-2109', insurance: 'Particular', lastVisit: '01/04' },
  { name: 'Fernanda Costa', gender: 'F', age: 27, phone: '(11) 95432-1098', insurance: 'SulAmérica', lastVisit: '28/03' },
  { name: 'Ricardo Alves', gender: 'M', age: 41, phone: '(11) 94321-0987', insurance: 'Bradesco', lastVisit: '25/03' },
];

export default function PreviewPatientCards() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const insuranceColors: Record<string, string> = {
    'SulAmérica': '#3B82F6',
    'Bradesco': '#EF4444',
    'Unimed': '#10B981',
    'Particular': '#F59E0B',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
          Pacientes
        </Typography>
        <Box sx={{ px: 0.6, py: 0.2, borderRadius: 0.5, backgroundColor: `${colors.accent}18` }}>
          <Typography sx={{ fontSize: '0.38rem', fontWeight: 600, color: colors.accent }}>
            + Novo
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ p: 0.5, borderRadius: 0.8, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
        <Typography sx={{ fontSize: '0.4rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
          🔍 Buscar paciente...
        </Typography>
      </Box>

      {/* Patient Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 0.5,
        }}
      >
        {MOCK_PATIENTS.map((patient) => {
          const insColor = insuranceColors[patient.insurance] || colors.accent;
          return (
            <Box
              key={patient.name}
              sx={{
                p: 0.7,
                borderRadius: 1,
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: `${colors.accent}40`,
                  boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                },
              }}
            >
              {/* Top: Avatar + Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 0.4 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: `${colors.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: '0.35rem', fontWeight: 600, color: colors.accent }}>
                    {patient.name.charAt(0)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.38rem',
                      fontWeight: 600,
                      color: isDark ? '#E2E8F0' : '#1A2E1F',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {patient.name}
                  </Typography>
                </Box>
              </Box>

              {/* Info rows */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                {/* Gender + Age */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Box
                    sx={{
                      px: 0.3,
                      py: 0.05,
                      borderRadius: 0.3,
                      backgroundColor: patient.gender === 'F' ? '#EC489920' : '#3B82F620',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.26rem', fontWeight: 600, color: patient.gender === 'F' ? '#EC4899' : '#3B82F6' }}>
                      {patient.gender === 'F' ? '♀ Fem' : '♂ Masc'}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                    {patient.age} anos
                  </Typography>
                </Box>

                {/* Phone */}
                <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                  📞 {patient.phone}
                </Typography>

                {/* Insurance */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: insColor,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.28rem', fontWeight: 500, color: insColor }}>
                    {patient.insurance}
                  </Typography>
                </Box>

                {/* Last visit */}
                <Typography sx={{ fontSize: '0.26rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  Último atend.: {patient.lastVisit}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
