'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

/**
 * Preview de Check-In para a Assistente.
 * Controle de presença dos pacientes agendados no dia.
 */

const MOCK_CHECKIN = [
  { time: '08:30', patient: 'Maria Santos', doctor: 'Dr. Silva', status: 'presente' as const },
  { time: '09:00', patient: 'João Pereira', doctor: 'Dr. Silva', status: 'presente' as const },
  { time: '09:30', patient: 'Ana Lima', doctor: 'Dra. Lima', status: 'aguardando' as const },
  { time: '10:00', patient: 'Carlos Oliveira', doctor: 'Dr. Silva', status: 'ausente' as const },
  { time: '10:30', patient: 'Fernanda Costa', doctor: 'Dra. Lima', status: 'aguardando' as const },
  { time: '11:00', patient: 'Pedro Martins', doctor: 'Dr. Santos', status: 'nao_chegou' as const },
  { time: '14:00', patient: 'Ricardo Alves', doctor: 'Dr. Santos', status: 'nao_chegou' as const },
];

const STATUS_CONFIG = {
  presente: { emoji: '✅', label: 'Presente', color: '#10B981', bg: '#10B98115' },
  aguardando: { emoji: '⏳', label: 'Aguardando', color: '#F59E0B', bg: '#F59E0B15' },
  ausente: { emoji: '❌', label: 'Ausente', color: '#EF4444', bg: '#EF444415' },
  nao_chegou: { emoji: '🔜', label: 'Não chegou', color: '#94A3B8', bg: '#94A3B815' },
};

export default function PreviewCheckIn() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  // Counters
  const total = MOCK_CHECKIN.length;
  const presentes = MOCK_CHECKIN.filter((p) => p.status === 'presente').length;
  const ausentes = MOCK_CHECKIN.filter((p) => p.status === 'ausente').length;
  const aguardando = MOCK_CHECKIN.filter((p) => p.status === 'aguardando' || p.status === 'nao_chegou').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {/* Header */}
      <Box>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
          Check-In — Hoje
        </Typography>
        <Typography sx={{ fontSize: '0.38rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
          Terça-feira, 15 de Abril • Controle de presença
        </Typography>
      </Box>

      {/* Stats counters */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[
          { label: 'Total', value: total, color: colors.accent },
          { label: 'Presentes', value: presentes, color: '#10B981' },
          { label: 'Ausentes', value: ausentes, color: '#EF4444' },
          { label: 'Aguardando', value: aguardando, color: '#F59E0B' },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              p: 0.6,
              borderRadius: 1,
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#94A3B8' : '#6B7280', mt: 0.15 }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Check-in list */}
      <Box
        sx={{
          borderRadius: 1,
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        {MOCK_CHECKIN.map((entry, i) => {
          const sc = STATUS_CONFIG[entry.status];
          return (
            <Box
              key={`${entry.time}-${entry.patient}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.7,
                py: 0.5,
                borderBottom: i < MOCK_CHECKIN.length - 1 ? `1px solid ${cardBorder}` : 'none',
                transition: 'background 0.15s ease',
                '&:hover': { backgroundColor: isDark ? '#334155' : '#f8faf9' },
              }}
            >
              {/* Time */}
              <Typography
                sx={{
                  fontSize: '0.38rem',
                  fontWeight: 600,
                  color: colors.accent,
                  minWidth: 20,
                  flexShrink: 0,
                }}
              >
                {entry.time}
              </Typography>

              {/* Patient + Doctor */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.38rem',
                    fontWeight: 500,
                    color: isDark ? '#E2E8F0' : '#1A2E1F',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.patient}
                </Typography>
                <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  {entry.doctor}
                </Typography>
              </Box>

              {/* Status badge */}
              <Box
                sx={{
                  px: 0.5,
                  py: 0.15,
                  borderRadius: 0.5,
                  backgroundColor: sc.bg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.2,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <Typography sx={{ fontSize: '0.28rem', lineHeight: 1 }}>
                  {sc.emoji}
                </Typography>
                <Typography sx={{ fontSize: '0.28rem', fontWeight: 600, color: sc.color }}>
                  {sc.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
