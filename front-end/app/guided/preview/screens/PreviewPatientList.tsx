'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

const MOCK_PATIENTS = [
  { name: 'Maria Santos', age: 45, lastVisit: '10/04', status: 'Ativo' },
  { name: 'João Pereira', age: 62, lastVisit: '08/04', status: 'Ativo' },
  { name: 'Ana Lima', age: 33, lastVisit: '05/04', status: 'Ativo' },
  { name: 'Carlos Oliveira', age: 58, lastVisit: '01/04', status: 'Retorno' },
  { name: 'Fernanda Costa', age: 27, lastVisit: '28/03', status: 'Novo' },
];

interface PreviewPatientListProps {
  onViewPatient: () => void;
}

export default function PreviewPatientList({ onViewPatient }: PreviewPatientListProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

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

      {/* Patient List */}
      <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, overflow: 'hidden' }}>
        {MOCK_PATIENTS.map((patient, i) => (
          <Box
            key={patient.name}
            onClick={onViewPatient}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.8,
              py: 0.5,
              cursor: 'pointer',
              borderBottom: i < MOCK_PATIENTS.length - 1 ? `1px solid ${cardBorder}` : 'none',
              '&:hover': { backgroundColor: isDark ? '#334155' : '#f8faf9' },
              transition: 'background 0.15s ease',
            }}
          >
            {/* Avatar */}
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

            {/* Name + Age */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.42rem',
                  fontWeight: 500,
                  color: isDark ? '#E2E8F0' : '#1A2E1F',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {patient.name}
              </Typography>
              <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                {patient.age} anos
              </Typography>
            </Box>

            {/* Status */}
            <Box
              sx={{
                px: 0.4,
                py: 0.1,
                borderRadius: 0.5,
                backgroundColor: patient.status === 'Novo'
                  ? `${colors.accent}18`
                  : patient.status === 'Retorno'
                    ? '#F59E0B18'
                    : (isDark ? '#334155' : '#f0f2f1'),
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.32rem',
                  fontWeight: 600,
                  color: patient.status === 'Novo'
                    ? colors.accent
                    : patient.status === 'Retorno'
                      ? '#F59E0B'
                      : (isDark ? '#94A3B8' : '#6B7280'),
                }}
              >
                {patient.status}
              </Typography>
            </Box>

            {/* Last Visit */}
            <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#64748B' : '#9CA3AF', flexShrink: 0 }}>
              {patient.lastVisit}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
