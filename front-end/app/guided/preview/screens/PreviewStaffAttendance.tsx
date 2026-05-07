'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

/**
 * Preview unificado de Equipe & Presença para a Gerência.
 * Cadastro de funcionários + controle de presença mensal.
 */

const MOCK_STAFF = [
  { name: 'Dr. Silva', role: 'Médico', status: 'ativo' as const, dias: 20, faltas: 1, presenca: 95 },
  { name: 'Dra. Lima', role: 'Médica', status: 'ativo' as const, dias: 19, faltas: 2, presenca: 90 },
  { name: 'Dr. Santos', role: 'Médico', status: 'ativo' as const, dias: 21, faltas: 0, presenca: 100 },
  { name: 'Carla M.', role: 'Assistente', status: 'ativo' as const, dias: 22, faltas: 1, presenca: 96 },
  { name: 'Juliana R.', role: 'Assistente', status: 'ativo' as const, dias: 22, faltas: 0, presenca: 100 },
  { name: 'Roberto S.', role: 'Assistente', status: 'inativo' as const, dias: 0, faltas: 0, presenca: 0 },
];

export default function PreviewStaffAttendance() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const activeStaff = MOCK_STAFF.filter((s) => s.status === 'ativo');
  const inactiveStaff = MOCK_STAFF.filter((s) => s.status === 'inativo');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
            Equipe & Presença
          </Typography>
          <Typography sx={{ fontSize: '0.38rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
            Abril 2026 — Controle de funcionários
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, backgroundColor: `${colors.accent}18`, cursor: 'pointer' }}>
            <Typography sx={{ fontSize: '0.32rem', fontWeight: 600, color: colors.accent }}>
              + Cadastrar
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[
          { label: 'Ativos', value: activeStaff.length, color: colors.accent },
          { label: 'Médicos', value: MOCK_STAFF.filter((s) => s.role.includes('Médic')).length, color: colors.primary.main },
          { label: 'Assistentes', value: MOCK_STAFF.filter((s) => s.role === 'Assistente').length, color: '#3B82F6' },
          { label: 'Inativos', value: inactiveStaff.length, color: '#EF4444' },
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
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#94A3B8' : '#6B7280', mt: 0.15 }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Staff table with attendance */}
      <Box
        sx={{
          borderRadius: 1,
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: 'flex',
            px: 0.7,
            py: 0.4,
            borderBottom: `1px solid ${cardBorder}`,
            backgroundColor: isDark ? '#0F172A' : '#f8faf9',
          }}
        >
          <Typography sx={{ flex: 1.5, fontSize: '0.3rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Funcionário
          </Typography>
          <Typography sx={{ flex: 0.8, fontSize: '0.3rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center' }}>
            Cargo
          </Typography>
          <Typography sx={{ flex: 0.5, fontSize: '0.3rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center' }}>
            Dias
          </Typography>
          <Typography sx={{ flex: 0.5, fontSize: '0.3rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center' }}>
            Faltas
          </Typography>
          <Typography sx={{ flex: 0.7, fontSize: '0.3rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'center' }}>
            Presença
          </Typography>
        </Box>

        {/* Rows */}
        {MOCK_STAFF.map((member, i) => {
          const presencaColor = member.presenca >= 95 ? colors.accent : member.presenca >= 85 ? '#F59E0B' : '#EF4444';
          return (
            <Box
              key={member.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 0.7,
                py: 0.45,
                borderBottom: i < MOCK_STAFF.length - 1 ? `1px solid ${cardBorder}` : 'none',
                opacity: member.status === 'inativo' ? 0.5 : 1,
                '&:hover': { backgroundColor: isDark ? '#334155' : '#f8faf9' },
                transition: 'background 0.15s ease',
              }}
            >
              {/* Name + status */}
              <Box sx={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: `${colors.accent}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>
                    {member.name.charAt(0)}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.35rem', fontWeight: 500, color: isDark ? '#E2E8F0' : '#1A2E1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 0.3,
                      py: 0.03,
                      borderRadius: 0.3,
                      backgroundColor: member.status === 'ativo' ? `${colors.accent}15` : '#EF444415',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.22rem', fontWeight: 600, color: member.status === 'ativo' ? colors.accent : '#EF4444' }}>
                      {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Role */}
              <Box sx={{ flex: 0.8, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                  {member.role}
                </Typography>
              </Box>

              {/* Days */}
              <Box sx={{ flex: 0.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.35rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                  {member.dias}
                </Typography>
              </Box>

              {/* Absences */}
              <Box sx={{ flex: 0.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.35rem', fontWeight: 600, color: member.faltas > 0 ? '#EF4444' : (isDark ? '#E2E8F0' : '#1A2E1F') }}>
                  {member.faltas}
                </Typography>
              </Box>

              {/* Presence % with mini bar */}
              <Box sx={{ flex: 0.7, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.15 }}>
                <Typography sx={{ fontSize: '0.32rem', fontWeight: 700, color: member.status === 'ativo' ? presencaColor : '#94A3B8' }}>
                  {member.presenca}%
                </Typography>
                {member.status === 'ativo' && (
                  <Box sx={{ width: '80%', height: 2, borderRadius: 1, backgroundColor: isDark ? '#334155' : '#E5E7EB', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${member.presenca}%`,
                        height: '100%',
                        borderRadius: 1,
                        backgroundColor: presencaColor,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 0.4 }}>
        <Box
          sx={{
            flex: 1,
            p: 0.5,
            borderRadius: 1,
            border: `1px dashed ${cardBorder}`,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: colors.accent, backgroundColor: `${colors.accent}05` },
          }}
        >
          <Typography sx={{ fontSize: '0.32rem', fontWeight: 600, color: colors.accent }}>
            + Cadastrar Funcionário
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            p: 0.5,
            borderRadius: 1,
            border: `1px dashed ${cardBorder}`,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#EF4444', backgroundColor: '#EF444405' },
          }}
        >
          <Typography sx={{ fontSize: '0.32rem', fontWeight: 600, color: '#EF4444' }}>
            Desligar Funcionário
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
