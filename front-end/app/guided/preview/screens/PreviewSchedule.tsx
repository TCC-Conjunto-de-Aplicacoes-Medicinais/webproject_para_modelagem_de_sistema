'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const DATES = [14, 15, 16, 17, 18];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

interface ScheduleEvent {
  day: number;   // 0-4 (Seg-Sex)
  start: number; // hour index in HOURS
  span: number;  // how many slots
  patient: string;
  type: string;
  color: 'accent' | 'primary' | 'warning';
}

const MOCK_EVENTS: ScheduleEvent[] = [
  { day: 0, start: 0, span: 1, patient: 'Maria S.', type: 'Consulta', color: 'accent' },
  { day: 0, start: 3, span: 1, patient: 'João P.', type: 'Retorno', color: 'primary' },
  { day: 1, start: 1, span: 2, patient: 'Ana L.', type: 'Exame', color: 'warning' },
  { day: 1, start: 6, span: 1, patient: 'Carlos O.', type: 'Consulta', color: 'accent' },
  { day: 2, start: 0, span: 1, patient: 'Fernanda C.', type: 'Retorno', color: 'primary' },
  { day: 2, start: 4, span: 2, patient: 'Pedro M.', type: 'Exame', color: 'warning' },
  { day: 3, start: 2, span: 1, patient: 'Lucia R.', type: 'Consulta', color: 'accent' },
  { day: 4, start: 0, span: 1, patient: 'Ricardo B.', type: 'Consulta', color: 'accent' },
  { day: 4, start: 3, span: 1, patient: 'Camila A.', type: 'Retorno', color: 'primary' },
];

const TODAY_EVENTS = MOCK_EVENTS.filter((e) => e.day === 1); // Terça

export default function PreviewSchedule() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';
  const hoverBg = isDark ? '#334155' : '#f8faf9';
  const activeDay = 1; // Tuesday

  const eventColorMap = {
    accent: { bg: `${colors.accent}18`, border: colors.accent, text: colors.accent },
    primary: { bg: `${colors.primary.main}18`, border: colors.primary.main, text: colors.primary.main },
    warning: { bg: '#F59E0B18', border: '#F59E0B', text: '#F59E0B' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {/* ─── Header Bar ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
            Agenda
          </Typography>
          <Typography sx={{ fontSize: '0.38rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
            Abril 2026
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.2 }}>
          {(['week', 'day'] as const).map((mode) => (
            <Box
              key={mode}
              onClick={() => setViewMode(mode)}
              sx={{
                px: 0.6,
                py: 0.2,
                borderRadius: 0.5,
                cursor: 'pointer',
                backgroundColor: viewMode === mode ? `${colors.accent}18` : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.35rem',
                  fontWeight: viewMode === mode ? 600 : 400,
                  color: viewMode === mode ? colors.accent : (isDark ? '#94A3B8' : '#6B7280'),
                }}
              >
                {mode === 'week' ? 'Semana' : 'Dia'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Week View ─── */}
      {viewMode === 'week' && (
        <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, overflow: 'hidden' }}>
          {/* Day Headers */}
          <Box sx={{ display: 'flex', borderBottom: `1px solid ${cardBorder}` }}>
            {/* Time column spacer */}
            <Box sx={{ width: 22, flexShrink: 0, borderRight: `1px solid ${cardBorder}` }} />
            {DAYS.map((day, i) => (
              <Box
                key={day}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: 0.4,
                  borderRight: i < 4 ? `1px solid ${cardBorder}` : 'none',
                  backgroundColor: i === activeDay ? `${colors.accent}08` : 'transparent',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.32rem',
                    fontWeight: 500,
                    color: i === activeDay ? colors.accent : (isDark ? '#94A3B8' : '#6B7280'),
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                  }}
                >
                  {day}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.45rem',
                    fontWeight: i === activeDay ? 700 : 500,
                    color: i === activeDay ? colors.accent : (isDark ? '#E2E8F0' : '#1A2E1F'),
                    lineHeight: 1.2,
                  }}
                >
                  {DATES[i]}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Time Grid */}
          {HOURS.map((hour, hourIdx) => (
            <Box
              key={hour}
              sx={{
                display: 'flex',
                minHeight: 16,
                borderBottom: hourIdx < HOURS.length - 1 ? `1px solid ${cardBorder}` : 'none',
              }}
            >
              {/* Hour Label */}
              <Box
                sx={{
                  width: 22,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  pt: 0.15,
                  borderRight: `1px solid ${cardBorder}`,
                }}
              >
                <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  {hour}
                </Typography>
              </Box>

              {/* Day Columns */}
              {DAYS.map((_, dayIdx) => {
                const event = MOCK_EVENTS.find((e) => e.day === dayIdx && e.start === hourIdx);
                const isOccupied = MOCK_EVENTS.some(
                  (e) => e.day === dayIdx && hourIdx >= e.start && hourIdx < e.start + e.span && e.start !== hourIdx,
                );

                const ec = event ? eventColorMap[event.color] : null;

                return (
                  <Box
                    key={dayIdx}
                    sx={{
                      flex: 1,
                      borderRight: dayIdx < 4 ? `1px solid ${cardBorder}` : 'none',
                      backgroundColor: dayIdx === activeDay ? `${colors.accent}04` : 'transparent',
                      p: '1px',
                      position: 'relative',
                    }}
                  >
                    {event && ec && (
                      <Box
                        sx={{
                          height: `calc(${event.span * 100}% + ${(event.span - 1) * 1}px)`,
                          backgroundColor: ec.bg,
                          borderLeft: `2px solid ${ec.border}`,
                          borderRadius: '0 2px 2px 0',
                          px: 0.3,
                          py: 0.15,
                          overflow: 'hidden',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.32rem',
                            fontWeight: 600,
                            color: ec.text,
                            lineHeight: 1.1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {event.patient}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.25rem',
                            color: isDark ? '#94A3B8' : '#6B7280',
                            lineHeight: 1,
                          }}
                        >
                          {event.type}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}

      {/* ─── Day View ─── */}
      {viewMode === 'day' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          {/* Day Header */}
          <Box
            sx={{
              textAlign: 'center',
              py: 0.5,
              borderRadius: 1,
              backgroundColor: `${colors.accent}08`,
              border: `1px solid ${colors.accent}20`,
            }}
          >
            <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#94A3B8' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Terça-feira
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.accent }}>
              15
            </Typography>
            <Typography sx={{ fontSize: '0.32rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
              Abril • 4 atendimentos
            </Typography>
          </Box>

          {/* Day Timeline */}
          <Box sx={{ borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, overflow: 'hidden' }}>
            {HOURS.map((hour, hourIdx) => {
              const event = TODAY_EVENTS.find((e) => e.start === hourIdx);
              const isOccupiedCont = TODAY_EVENTS.some(
                (e) => hourIdx > e.start && hourIdx < e.start + e.span,
              );
              const ec = event ? eventColorMap[event.color] : null;

              return (
                <Box
                  key={hour}
                  sx={{
                    display: 'flex',
                    minHeight: event ? (event.span > 1 ? 28 : 20) : 14,
                    borderBottom: hourIdx < HOURS.length - 1 ? `1px solid ${cardBorder}` : 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      pt: 0.2,
                      borderRight: `1px solid ${cardBorder}`,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#64748B' : '#9CA3AF', fontWeight: 500 }}>
                      {hour}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, p: '2px', display: 'flex' }}>
                    {event && ec && (
                      <Box
                        sx={{
                          flex: 1,
                          backgroundColor: ec.bg,
                          borderLeft: `3px solid ${ec.border}`,
                          borderRadius: '0 4px 4px 0',
                          px: 0.6,
                          py: 0.3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        {/* Avatar */}
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: `${ec.border}25`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Typography sx={{ fontSize: '0.3rem', fontWeight: 700, color: ec.text }}>
                            {event.patient.charAt(0)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.38rem', fontWeight: 600, color: ec.text, lineHeight: 1.2 }}>
                            {event.patient}
                          </Typography>
                          <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                            {event.type} • {event.span * 60}min
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {isOccupiedCont && (
                      <Box sx={{ flex: 1, opacity: 0 }} />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ─── Legend ─── */}
      <Box sx={{ display: 'flex', gap: 0.8, px: 0.2 }}>
        {[
          { label: 'Consulta', color: colors.accent },
          { label: 'Retorno', color: colors.primary.main },
          { label: 'Exame', color: '#F59E0B' },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: 0.5, backgroundColor: item.color }} />
            <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
