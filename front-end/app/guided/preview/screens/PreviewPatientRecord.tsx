'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';

interface PreviewPatientRecordProps {
  onBack: () => void;
}

export default function PreviewPatientRecord({ onBack }: PreviewPatientRecordProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const { patientRecord } = state.modules.doctor.features;

  const cardBg = isDark ? '#1E293B' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e8ece9';
  const sectionTitle = {
    fontSize: '0.45rem',
    fontWeight: 700,
    color: isDark ? '#E2E8F0' : '#1A2E1F',
    mb: 0.4,
  };
  const labelStyle = { fontSize: '0.36rem', color: isDark ? '#94A3B8' : '#6B7280' };
  const valueStyle = { fontSize: '0.36rem', fontWeight: 500, color: isDark ? '#E2E8F0' : '#1A2E1F' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {/* ─── Back + Patient Header ─── */}
      <Box>
        <Typography
          onClick={onBack}
          sx={{
            fontSize: '0.35rem',
            color: colors.accent,
            cursor: 'pointer',
            mb: 0.4,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          ← Voltar para pacientes
        </Typography>

        {/* Patient Card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            p: 0.8,
            borderRadius: 1,
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accent}30, ${colors.primary.main}30)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: colors.accent }}>M</Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
              Maria Santos
            </Typography>
            <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
              45 anos • Feminino • Cardiologia
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0 }}>
            <Box sx={{ px: 0.5, py: 0.15, borderRadius: 0.5, backgroundColor: `${colors.accent}15` }}>
              <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>Ativo</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── Two-column layout ─── */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Contact Info */}
          <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <Typography sx={sectionTitle}>📋 Informações</Typography>
            {[
              { label: 'Telefone', value: '(11) 99999-0000' },
              { label: 'Email', value: 'maria.s@email.com' },
              { label: 'Convênio', value: 'Unimed' },
              { label: 'Última consulta', value: '10/04/2026' },
            ].map((field) => (
              <Box key={field.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.2 }}>
                <Typography sx={labelStyle}>{field.label}</Typography>
                <Typography sx={valueStyle}>{field.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Allergies */}
          {patientRecord.allergies && (
            <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              <Typography sx={sectionTitle}>⚠️ Alergias</Typography>
              <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                {['Dipirona', 'Penicilina', 'Ibuprofeno'].map((allergy) => (
                  <Box
                    key={allergy}
                    sx={{
                      px: 0.5,
                      py: 0.15,
                      borderRadius: 0.5,
                      backgroundColor: isDark ? '#EF444418' : '#FEE2E2',
                      border: '1px solid',
                      borderColor: isDark ? '#EF444440' : '#FECACA',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.33rem', fontWeight: 600, color: '#EF4444' }}>
                      {allergy}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Consultation History */}
          <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <Typography sx={sectionTitle}>🕐 Últimas Consultas</Typography>
            {[
              { date: '10/04', summary: 'Retorno — Avaliação de exames cardíacos', doctor: 'Dr. Silva' },
              { date: '15/03', summary: 'Consulta — Dor torácica, solicitado ECG', doctor: 'Dr. Silva' },
              { date: '20/02', summary: 'Check-up anual — Sem alterações', doctor: 'Dra. Lima' },
            ].map((c, i) => (
              <Box
                key={c.date}
                sx={{
                  display: 'flex',
                  gap: 0.4,
                  py: 0.3,
                  borderBottom: i < 2 ? `1px solid ${cardBorder}` : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 3,
                    borderRadius: 0.5,
                    backgroundColor: colors.accent,
                    flexShrink: 0,
                    alignSelf: 'stretch',
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.1 }}>
                    <Typography sx={{ fontSize: '0.35rem', fontWeight: 600, color: colors.accent }}>
                      {c.date}
                    </Typography>
                    <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      {c.doctor}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.33rem', color: isDark ? '#E2E8F0' : '#374151' }}>
                    {c.summary}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Patient Notes */}
          <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
              <Typography sx={sectionTitle} style={{ marginBottom: 0 }}>📝 Anotações</Typography>
              <Box sx={{ px: 0.4, py: 0.1, borderRadius: 0.5, backgroundColor: `${colors.accent}15`, cursor: 'default' }}>
                <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>+ Nova</Typography>
              </Box>
            </Box>

            {[
              { date: '10/04', text: 'Paciente relatou melhora com medicação atual. Manter acompanhamento mensal.' },
              { date: '15/03', text: 'Solicitado ECG de urgência — dor torácica recorrente nas últimas 2 semanas.' },
              { date: '20/02', text: 'Check-up sem alterações. Reforçar importância de atividade física.' },
            ].map((note, i) => (
              <Box
                key={note.date + i}
                sx={{
                  py: 0.3,
                  borderBottom: i < 2 ? `1px solid ${cardBorder}` : 'none',
                }}
              >
                <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent, mb: 0.1 }}>
                  {note.date}
                </Typography>
                <Typography sx={{ fontSize: '0.33rem', color: isDark ? '#CBD5E1' : '#374151', lineHeight: 1.4 }}>
                  {note.text}
                </Typography>
              </Box>
            ))}

            {/* Write area */}
            <Box
              sx={{
                mt: 0.4,
                p: 0.4,
                borderRadius: 0.5,
                border: `1px solid ${cardBorder}`,
                backgroundColor: isDark ? '#0F172A' : '#f8faf9',
              }}
            >
              <Typography sx={{ fontSize: '0.3rem', color: isDark ? '#475569' : '#9CA3AF' }}>
                Escreva uma anotação...
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Files & Documents */}
          {(patientRecord.files || patientRecord.fileUpload) && (
            <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              <Typography sx={sectionTitle}>📁 Arquivos e Exames</Typography>
              {patientRecord.files && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {[
                    { name: 'Hemograma_2026.pdf', date: '10/04', size: '245 KB' },
                    { name: 'ECG_marco.pdf', date: '15/03', size: '1.2 MB' },
                    { name: 'RaioX_torax.jpg', date: '20/02', size: '3.8 MB' },
                  ].map((file) => (
                    <Box
                      key={file.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        p: 0.3,
                        borderRadius: 0.5,
                        '&:hover': { backgroundColor: hoverColor(isDark) },
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 0.5,
                          backgroundColor: `${colors.accent}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.35rem' }}>
                          {file.name.endsWith('.pdf') ? '📄' : '🖼️'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.35rem',
                            fontWeight: 500,
                            color: isDark ? '#E2E8F0' : '#1A2E1F',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                          {file.date} • {file.size}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {patientRecord.fileUpload && (
                <Box
                  sx={{
                    mt: 0.4,
                    p: 0.5,
                    borderRadius: 0.5,
                    border: `1px dashed ${isDark ? '#475569' : '#D1D5DB'}`,
                    textAlign: 'center',
                    cursor: 'default',
                  }}
                >
                  <Typography sx={{ fontSize: '0.33rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                    📎 Arraste ou clique para enviar
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Prescriptions */}
          {patientRecord.prescriptions && (
            <Box sx={{ p: 0.7, borderRadius: 1, backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                <Typography sx={{ ...sectionTitle, mb: 0 }}>📝 Prescrições e Laudos</Typography>
                <Box sx={{ px: 0.4, py: 0.1, borderRadius: 0.5, backgroundColor: `${colors.accent}15`, cursor: 'default' }}>
                  <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>+ Novo</Typography>
                </Box>
              </Box>

              {[
                { type: 'Laudo Cardiológico', date: '10/04', status: 'Emitido' },
                { type: 'Solicitação de Exame', date: '10/04', status: 'Pendente' },
                { type: 'Receituário', date: '15/03', status: 'Emitido' },
              ].map((doc, i) => (
                <Box
                  key={doc.type + doc.date}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.25,
                    borderBottom: i < 2 ? `1px solid ${cardBorder}` : 'none',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '0.36rem', fontWeight: 500, color: isDark ? '#E2E8F0' : '#1A2E1F' }}>
                      {doc.type}
                    </Typography>
                    <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      {doc.date}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.3rem',
                      fontWeight: 600,
                      px: 0.4,
                      py: 0.1,
                      borderRadius: 0.5,
                      backgroundColor:
                        doc.status === 'Emitido'
                          ? `${colors.accent}15`
                          : '#F59E0B15',
                      color: doc.status === 'Emitido' ? colors.accent : '#F59E0B',
                    }}
                  >
                    {doc.status}
                  </Typography>
                </Box>
              ))}

              {patientRecord.prescriptionTemplate && (
                <Box
                  sx={{
                    mt: 0.4,
                    p: 0.4,
                    borderRadius: 0.5,
                    backgroundColor: isDark ? '#33415540' : '#f0f2f1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                  }}
                >
                  <Typography sx={{ fontSize: '0.3rem' }}>📋</Typography>
                  <Box>
                    <Typography sx={{ fontSize: '0.3rem', fontWeight: 500, color: isDark ? '#E2E8F0' : '#374151' }}>
                      Template base da clínica
                    </Typography>
                    <Typography sx={{ fontSize: '0.25rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                      modelo_prescricao.docx
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* AI ECG */}
          {patientRecord.aiEcg && (
            <Box
              sx={{
                p: 0.7,
                borderRadius: 1,
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
              }}
            >
              <Typography sx={sectionTitle}>🫀 Análise de IA — ECG</Typography>
              <Box
                sx={{
                  p: 0.6,
                  borderRadius: 0.5,
                  border: `1px dashed ${isDark ? '#475569' : '#D1D5DB'}`,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.55rem', mb: 0.2 }}>📊</Typography>
                <Typography sx={{ fontSize: '0.35rem', fontWeight: 500, color: isDark ? '#E2E8F0' : '#374151', mb: 0.1 }}>
                  Selecione um eletrocardiograma
                </Typography>
                <Typography sx={{ fontSize: '0.28rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                  A IA irá analisar e gerar um relatório
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function hoverColor(isDark: boolean): string {
  return isDark ? '#33415540' : '#f8faf9';
}
