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

// ─── Insurance billing data ─────────────────────────
const INSURANCE_BILLING = [
  {
    name: 'SulAmérica',
    color: '#3B82F6',
    items: [
      { type: 'Consultas', qty: 8, value: 2000 },
      { type: 'Exames', qty: 4, value: 1200 },
      { type: 'Retornos', qty: 3, value: 600 },
    ],
  },
  {
    name: 'Bradesco',
    color: '#EF4444',
    items: [
      { type: 'Consultas', qty: 5, value: 1250 },
      { type: 'Exames', qty: 2, value: 600 },
      { type: 'Retornos', qty: 2, value: 400 },
    ],
  },
  {
    name: 'Unimed',
    color: '#10B981',
    items: [
      { type: 'Consultas', qty: 6, value: 1500 },
      { type: 'Exames', qty: 3, value: 900 },
      { type: 'Retornos', qty: 1, value: 200 },
    ],
  },
  {
    name: 'Particular',
    color: '#F59E0B',
    items: [
      { type: 'Consultas', qty: 10, value: 3500 },
      { type: 'Exames', qty: 4, value: 1200 },
    ],
  },
];

export default function PreviewFinancial({ activeRole = 'assistant' }: PreviewFinancialProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const { management } = state.modules;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';

  const isManagement = activeRole === 'management';

  // Total geral
  const totalGeral = INSURANCE_BILLING.reduce(
    (sum, ins) => sum + ins.items.reduce((s, it) => s + it.value, 0),
    0,
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
        Faturamento
      </Typography>

      {/* ─── Insurance billing breakdown (both assistant and management) ─── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {INSURANCE_BILLING.map((insurance) => {
          const insTotal = insurance.items.reduce((s, it) => s + it.value, 0);
          return (
            <Box
              key={insurance.name}
              sx={{
                borderRadius: 1,
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                overflow: 'hidden',
              }}
            >
              {/* Insurance header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 0.7,
                  py: 0.4,
                  borderBottom: `1px solid ${cardBorder}`,
                  backgroundColor: `${insurance.color}08`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: insurance.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.4rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                    {insurance.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.38rem', fontWeight: 700, color: insurance.color }}>
                  R$ {insTotal.toLocaleString('pt-BR')}
                </Typography>
              </Box>

              {/* Breakdown items */}
              {insurance.items.map((item, i) => (
                <Box
                  key={item.type}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 0.7,
                    py: 0.3,
                    borderBottom: i < insurance.items.length - 1 ? `1px solid ${cardBorder}` : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                      {item.type}
                    </Typography>
                    <Box
                      sx={{
                        px: 0.25,
                        py: 0.03,
                        borderRadius: 0.3,
                        backgroundColor: isDark ? '#334155' : '#f0f2f1',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.24rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#6B7280' }}>
                        {item.qty}x
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.32rem', fontWeight: 600, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                    R$ {item.value.toLocaleString('pt-BR')}
                  </Typography>
                </Box>
              ))}
            </Box>
          );
        })}

        {/* Total geral */}
        <Box
          sx={{
            p: 0.7,
            borderRadius: 1,
            backgroundColor: `${colors.accent}08`,
            border: `1px solid ${colors.accent}30`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.42rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
            Total Geral
          </Typography>
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: colors.accent }}>
            R$ {totalGeral.toLocaleString('pt-BR')}
          </Typography>
        </Box>
      </Box>

      {/* ─── Management-only: per-doctor billing + costs ─── */}
      {isManagement && (
        <>
          {/* Billing by Doctor with 20% cost */}
          {management.features.billingByDoctor && (
            <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, p: 0.8 }}>
              <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.5 }}>
                Faturamento por Médico
              </Typography>
              {[
                { name: 'Dr. Silva', value: 6200, atend: '18 atend.' },
                { name: 'Dra. Lima', value: 4800, atend: '14 atend.' },
                { name: 'Dr. Santos', value: 3650, atend: '10 atend.' },
              ].map((doc, i) => {
                const cost = Math.round(doc.value * 0.20);
                const pct = ((doc.value / totalGeral) * 100).toFixed(0);
                return (
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
                        {doc.atend} • {pct}%
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: '0.42rem', fontWeight: 700, color: colors.accent }}>
                        R$ {doc.value.toLocaleString('pt-BR')}
                      </Typography>
                      <Typography sx={{ fontSize: '0.26rem', color: '#F59E0B', fontWeight: 600 }}>
                        Custo: R$ {cost.toLocaleString('pt-BR')} (20%)
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              {/* Total bar */}
              <Box sx={{ mt: 0.4, pt: 0.4, borderTop: `1px solid ${cardBorder}`, display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.38rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                  Total
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.42rem', fontWeight: 800, color: colors.accent }}>
                    R$ {(6200 + 4800 + 3650).toLocaleString('pt-BR')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.26rem', color: '#F59E0B', fontWeight: 600 }}>
                    Custo médicos: R$ {Math.round((6200 + 4800 + 3650) * 0.20).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
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

          {/* Summary: Revenue - Costs = Estimated Profit */}
          <Box
            sx={{
              p: 0.8,
              borderRadius: 1,
              backgroundColor: `${colors.accent}06`,
              border: `1px solid ${colors.accent}25`,
            }}
          >
            <Typography sx={{ fontSize: '0.4rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F', mb: 0.4 }}>
              📊 Resumo Geral
            </Typography>
            {(() => {
              const totalDocs = Math.round((6200 + 4800 + 3650) * 0.20);
              const sysCost = state.technical.estimatedPrice.monthly;
              const profit = totalGeral - totalDocs - sysCost;
              return (
                <>
                  {[
                    { label: 'Receita Total', value: totalGeral, color: colors.accent },
                    { label: 'Custo Médicos (20%)', value: -totalDocs, color: '#F59E0B' },
                    { label: 'Custo Sistema', value: -sysCost, color: isDark ? '#FCD34D' : '#D97706' },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.2,
                        borderBottom: `1px solid ${cardBorder}`,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.32rem', fontWeight: 600, color: item.color }}>
                        {item.value < 0 ? '-' : ''} R$ {Math.abs(item.value).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.3 }}>
                    <Typography sx={{ fontSize: '0.38rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                      Lucro Estimado
                    </Typography>
                    <Typography sx={{ fontSize: '0.42rem', fontWeight: 800, color: profit >= 0 ? colors.accent : '#EF4444' }}>
                      R$ {profit.toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                </>
              );
            })()}
          </Box>
        </>
      )}
    </Box>
  );
}
