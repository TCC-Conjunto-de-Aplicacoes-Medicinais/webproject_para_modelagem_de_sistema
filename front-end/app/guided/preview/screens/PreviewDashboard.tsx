'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

/**
 * Preview do Dashboard do Médico.
 * Mostra mini-agenda, lembretes e estatísticas básicas.
 * Componente puramente visual — dados fictícios embutidos.
 */

const MOCK_APPOINTMENTS = [
  { time: '08:30', patient: 'Maria S.', type: 'Retorno' },
  { time: '09:15', patient: 'João P.', type: 'Consulta' },
  { time: '10:00', patient: 'Ana L.', type: 'Exame' },
];

const MOCK_REMINDERS = [
  { text: 'Revisar exames do João P.', done: true },
  { text: 'Ligar para laboratório', done: false },
  { text: 'Atualizar prontuário Maria S.', done: false },
];

export default function PreviewDashboard() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const clinicName = state.identity.clinicName || 'Minha Clínica';

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Greeting */}
      <Box sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: isDark ? '#E2E8F0' : '#1A2E1F',
            lineHeight: 1.3,
          }}
        >
          Bom dia, Dr. Silva
        </Typography>
        <Typography
          sx={{
            fontSize: '0.48rem',
            color: isDark ? '#94A3B8' : '#6B7280',
          }}
        >
          {clinicName} — Terça-feira, 15 de Abril
        </Typography>
      </Box>

      {/* Stats Cards Row */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[
          { label: 'Pacientes Hoje', value: '8', color: colors.accent },
          { label: 'Pendentes', value: '3', color: colors.primary.main },
          { label: 'Concluídos', value: '5', color: colors.secondary.light },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              p: 0.8,
              borderRadius: 1,
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: stat.color,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.4rem',
                color: isDark ? '#94A3B8' : '#6B7280',
                mt: 0.2,
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Two Column Layout: Mini Agenda + Reminders */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {/* Mini Agenda */}
        <Box
          sx={{
            flex: 1.2,
            p: 0.8,
            borderRadius: 1,
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.48rem',
              fontWeight: 700,
              color: isDark ? '#E2E8F0' : '#1A2E1F',
              mb: 0.5,
            }}
          >
            📅 Próximos Atendimentos
          </Typography>

          {MOCK_APPOINTMENTS.map((apt) => (
            <Box
              key={apt.time}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                py: 0.3,
                borderBottom: `1px solid ${cardBorder}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Box
                sx={{
                  width: 3,
                  height: 14,
                  borderRadius: 0.5,
                  backgroundColor: colors.accent,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.42rem',
                  fontWeight: 600,
                  color: colors.accent,
                  minWidth: 18,
                }}
              >
                {apt.time}
              </Typography>
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
                  {apt.patient}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.38rem',
                  color: isDark ? '#64748B' : '#9CA3AF',
                  flexShrink: 0,
                }}
              >
                {apt.type}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Reminders / Checklist */}
        <Box
          sx={{
            flex: 1,
            p: 0.8,
            borderRadius: 1,
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.48rem',
              fontWeight: 700,
              color: isDark ? '#E2E8F0' : '#1A2E1F',
              mb: 0.5,
            }}
          >
            ✅ Lembretes
          </Typography>

          {MOCK_REMINDERS.map((reminder) => (
            <Box
              key={reminder.text}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                py: 0.3,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: 0.5,
                  border: `1.5px solid ${reminder.done ? colors.accent : (isDark ? '#475569' : '#D1D5DB')}`,
                  backgroundColor: reminder.done ? colors.accent : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {reminder.done && (
                  <Typography sx={{ fontSize: '0.35rem', color: '#fff', lineHeight: 1 }}>
                    ✓
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: '0.42rem',
                  color: reminder.done
                    ? (isDark ? '#64748B' : '#9CA3AF')
                    : (isDark ? '#E2E8F0' : '#1A2E1F'),
                  textDecoration: reminder.done ? 'line-through' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {reminder.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
