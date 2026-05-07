'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

/**
 * Preview de Histórico de Consultas do Médico.
 * Timeline com últimos atendimentos, horários e resumo.
 */

const MOCK_HISTORY = [
  {
    date: '15/04',
    time: '09:15',
    patient: 'João Pereira',
    type: 'Consulta',
    duration: '35 min',
    status: 'concluído' as const,
    summary: 'Paciente com queixa de dor lombar crônica. Solicitado ressonância magnética da coluna lombar.',
  },
  {
    date: '15/04',
    time: '10:00',
    patient: 'Ana Lima',
    type: 'Exame',
    duration: '20 min',
    status: 'concluído' as const,
    summary: 'Análise de ECG — resultado normal. Orientação sobre hábitos alimentares.',
  },
  {
    date: '14/04',
    time: '08:30',
    patient: 'Maria Santos',
    type: 'Retorno',
    duration: '25 min',
    status: 'concluído' as const,
    summary: 'Retorno pós-exame. Resultados dentro da normalidade. Alta do acompanhamento.',
  },
  {
    date: '14/04',
    time: '11:00',
    patient: 'Carlos Oliveira',
    type: 'Consulta',
    duration: '40 min',
    status: 'cancelado' as const,
    summary: 'Paciente não compareceu. Reagendado para próxima semana.',
  },
  {
    date: '12/04',
    time: '14:30',
    patient: 'Fernanda Costa',
    type: 'Consulta',
    duration: '30 min',
    status: 'concluído' as const,
    summary: 'Primeira consulta — anamnese completa. Solicitado hemograma e glicemia de jejum.',
  },
];

export default function PreviewHistory() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const statusColors = {
    concluído: { bg: `${colors.accent}15`, text: colors.accent, label: 'Concluído' },
    cancelado: { bg: '#EF444415', text: '#EF4444', label: 'Cancelado' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
            Histórico de Consultas
          </Typography>
          <Typography sx={{ fontSize: '0.38rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
            Últimos atendimentos realizados
          </Typography>
        </Box>
        {/* Filter pills */}
        <Box sx={{ display: 'flex', gap: 0.2 }}>
          {['Todos', 'Consulta', 'Retorno'].map((filter, i) => (
            <Box
              key={filter}
              sx={{
                px: 0.5,
                py: 0.15,
                borderRadius: 0.5,
                backgroundColor: i === 0 ? `${colors.accent}18` : 'transparent',
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.3rem',
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? colors.accent : (isDark ? '#94A3B8' : '#6B7280'),
                }}
              >
                {filter}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[
          { label: 'Esta semana', value: '12', color: colors.accent },
          { label: 'Este mês', value: '47', color: colors.primary.main },
          { label: 'Cancelados', value: '3', color: '#EF4444' },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              p: 0.6,
              borderRadius: 1,
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280', mt: 0.2 }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Timeline */}
      <Box sx={{ position: 'relative' }}>
        {/* Vertical timeline line */}
        <Box
          sx={{
            position: 'absolute',
            left: 4,
            top: 8,
            bottom: 8,
            width: 1.5,
            backgroundColor: `${colors.accent}30`,
            borderRadius: 1,
          }}
        />

        {MOCK_HISTORY.map((entry, i) => {
          const sc = statusColors[entry.status];
          return (
            <Box
              key={`${entry.date}-${entry.time}`}
              sx={{
                display: 'flex',
                gap: 0.6,
                mb: 0.5,
                pl: 1.2,
                position: 'relative',
              }}
            >
              {/* Timeline dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 1,
                  top: 6,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: entry.status === 'concluído' ? colors.accent : '#EF4444',
                  border: '2px solid',
                  borderColor: cardBg,
                  zIndex: 1,
                }}
              />

              {/* Card */}
              <Box
                sx={{
                  flex: 1,
                  p: 0.6,
                  ml: 0.8,
                  borderRadius: 1,
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: `${colors.accent}40` },
                }}
              >
                {/* Top row: date/time + status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <Typography sx={{ fontSize: '0.35rem', fontWeight: 600, color: colors.accent }}>
                      {entry.date}
                    </Typography>
                    <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      {entry.time}
                    </Typography>
                    <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      • {entry.duration}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 0.4,
                      py: 0.1,
                      borderRadius: 0.5,
                      backgroundColor: sc.bg,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.28rem', fontWeight: 600, color: sc.text }}>
                      {sc.label}
                    </Typography>
                  </Box>
                </Box>

                {/* Patient + type */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 0.2 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: `${colors.accent}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>
                      {entry.patient.charAt(0)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.38rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                    {entry.patient}
                  </Typography>
                  <Box
                    sx={{
                      px: 0.3,
                      py: 0.05,
                      borderRadius: 0.3,
                      backgroundColor: isDark ? '#334155' : '#f0f2f1',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.26rem', fontWeight: 500, color: isDark ? '#94A3B8' : '#6B7280' }}>
                      {entry.type}
                    </Typography>
                  </Box>
                </Box>

                {/* Summary */}
                <Typography
                  sx={{
                    fontSize: '0.32rem',
                    color: isDark ? '#94A3B8' : '#6B7280',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {entry.summary}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
