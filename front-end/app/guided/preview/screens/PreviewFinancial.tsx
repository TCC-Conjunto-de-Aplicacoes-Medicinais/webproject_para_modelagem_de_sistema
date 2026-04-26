'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

export default function PreviewFinancial() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
        Financeiro
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[
          { label: 'Receita', value: 'R$ 12.450', trend: '+8%' },
          { label: 'Pendente', value: 'R$ 3.200', trend: '' },
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

      {/* Recent Transactions */}
      <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
        <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
          Últimas Movimentações
        </Typography>
        {[
          { desc: 'Consulta — Maria S.', value: 'R$ 250', convênio: 'Unimed' },
          { desc: 'Exame — João P.', value: 'R$ 180', convênio: 'Particular' },
          { desc: 'Retorno — Ana L.', value: 'R$ 150', convênio: 'SulAmérica' },
          { desc: 'Consulta — Carlos O.', value: 'R$ 250', convênio: 'Unimed' },
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
    </Box>
  );
}
