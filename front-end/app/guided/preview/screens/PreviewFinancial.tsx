'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';
import type { PreviewRole } from '../SystemPreview';

interface PreviewFinancialProps {
  activeRole?: PreviewRole;
}

export default function PreviewFinancial({ activeRole = 'assistant' }: PreviewFinancialProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const { assistant, management } = state.modules;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const isManagement = activeRole === 'management';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
        Faturamento
      </Typography>

      {/* ─── Assistente View: Por Convênio ─── */}
      {!isManagement && (
        <>
          {/* Summary Cards by Insurance */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[
              { label: 'Unimed', value: 'R$ 5.200', count: '12 atend.' },
              { label: 'SulAmérica', value: 'R$ 3.800', count: '8 atend.' },
              { label: 'Particular', value: 'R$ 3.450', count: '14 atend.' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{ flex: 1, p: 0.8, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 500 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mt: 0.2 }}>
                  {item.value}
                </Typography>
                <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  {item.count}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Recent Transactions with Check */}
          <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
            <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
              Atendimentos para Faturar
            </Typography>
            {[
              { desc: 'Consulta — Maria S.', value: 'R$ 250', convênio: 'Unimed', faturado: true },
              { desc: 'Exame — João P.', value: 'R$ 180', convênio: 'Particular', faturado: false },
              { desc: 'Retorno — Ana L.', value: 'R$ 150', convênio: 'SulAmérica', faturado: true },
              { desc: 'Consulta — Carlos O.', value: 'R$ 250', convênio: 'Unimed', faturado: false },
            ].map((tx, i) => (
              <Box
                key={tx.desc}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.35,
                  borderBottom: i < 3 ? `1px solid ${cardBorder}` : 'none',
                }}
              >
                {/* Check control */}
                {assistant.features.billingCheckControl && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 0.3,
                      border: `1.5px solid ${tx.faturado ? colors.accent : (isDark ? '#475569' : '#D1D5DB')}`,
                      backgroundColor: tx.faturado ? `${colors.accent}20` : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mr: 0.4,
                    }}
                  >
                    {tx.faturado && (
                      <Typography sx={{ fontSize: '0.28rem', color: colors.accent, lineHeight: 1 }}>✓</Typography>
                    )}
                  </Box>
                )}
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
                    {tx.desc}
                  </Typography>
                  <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                    {tx.convênio}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.4rem', fontWeight: 600, color: colors.accent, flexShrink: 0 }}>
                  {tx.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* ─── Gerencial View: Por Médico + Custo do Sistema ─── */}
      {isManagement && (
        <>
          {/* Billing by Doctor */}
          {management.features.billingByDoctor && (
            <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
              <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
                Faturamento por Médico
              </Typography>
              {[
                { name: 'Dr. Silva', value: 'R$ 6.200', atend: '18 atend.', pct: '42%' },
                { name: 'Dra. Lima', value: 'R$ 4.800', atend: '14 atend.', pct: '33%' },
                { name: 'Dr. Santos', value: 'R$ 3.650', atend: '10 atend.', pct: '25%' },
              ].map((doc, i) => (
                <Box
                  key={doc.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.4,
                    borderBottom: i < 2 ? `1px solid ${cardBorder}` : 'none',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.38rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                      {doc.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      {doc.atend}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.42rem', fontWeight: 700, color: colors.accent }}>
                      {doc.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.26rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      {doc.pct}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {/* Total bar */}
              <Box sx={{ mt: 0.4, pt: 0.4, borderTop: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.38rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                  Total
                </Typography>
                <Typography sx={{ fontSize: '0.42rem', fontWeight: 800, color: colors.accent }}>
                  R$ 14.650
                </Typography>
              </Box>
            </Box>
          )}

          {/* System Cost */}
          {management.features.systemCost && (
            <Box
              sx={{
                p: 0.8,
                borderRadius: 1,
                border: `1px solid ${isDark ? '#F59E0B30' : '#FDE68A'}`,
                backgroundColor: isDark ? '#F59E0B08' : '#FFFBEB',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                <Typography sx={{ fontSize: '0.42rem', fontWeight: 700, color: isDark ? '#FCD34D' : '#D97706' }}>
                  💰 Custo do Sistema
                </Typography>
                <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  este mês
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: isDark ? '#FCD34D' : '#D97706' }}>
                R$ {state.technical.estimatedPrice.monthly.toLocaleString('pt-BR')}
              </Typography>
              <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF', mt: 0.2 }}>
                Valor mensal do sistema (estimativa)
              </Typography>
            </Box>
          )}

          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[
              { label: 'Receita Total', value: 'R$ 14.650', trend: '+12%' },
              { label: 'Pendente', value: 'R$ 4.200', trend: '' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{ flex: 1, p: 0.8, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <Typography sx={{ fontSize: '0.38rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                  {item.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3, mt: 0.2 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                    {item.value}
                  </Typography>
                  {item.trend && (
                    <Typography sx={{ fontSize: '0.32rem', color: colors.accent, fontWeight: 600 }}>
                      {item.trend}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
