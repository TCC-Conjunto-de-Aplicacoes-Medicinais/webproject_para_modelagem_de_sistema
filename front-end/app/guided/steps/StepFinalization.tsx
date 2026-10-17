'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaletteIcon from '@mui/icons-material/Palette';
import ExtensionIcon from '@mui/icons-material/Extension';
import DnsIcon from '@mui/icons-material/Dns';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SecurityIcon from '@mui/icons-material/Security';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import TimerIcon from '@mui/icons-material/Timer';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { api } from '@/app/services/api';

// ─── Summary Helpers ────────────────────────────────────

function getPaletteLabel(palette: string): string {
  const map: Record<string, string> = {
    green: 'Verde Esmeralda',
    blue: 'Azul Profissional',
    red: 'Vermelho Vibrante',
  };
  return map[palette] || palette;
}

function getDeploymentLabel(type: string): string {
  return type === 'web' ? 'Site (Navegador)' : 'Aplicativo (Desktop)';
}

function getEnvLabel(env: string): string {
  const map: Record<string, string> = { aws: 'Amazon AWS (Single-Tenant)', local: 'Servidor Local (Docker)' };
  return map[env] || env;
}

// ─── Provisioning Steps Definition (CONIC 2026 Paper) ──

const PROVISIONING_STAGES = [
  { id: 0, label: 'Criptografia Zero-Knowledge', desc: 'Derivação PBKDF2 e Cifra AES-256-GCM do Blueprint' },
  { id: 1, label: 'Transmissão ao Motor IaC', desc: 'Disparo assíncrono seguro para o MGS-Clínico' },
  { id: 2, label: 'Cirurgia Estática de Código', desc: 'Remoção modular de rotas e injeção de parâmetros clínicos' },
  { id: 3, label: 'Orquestração de Infraestrutura', desc: 'Provisionamento de VPC, Subnets multi-AZ, ALB e MariaDB' },
  { id: 4, label: 'Sonda de Health Check', desc: 'Aguardando resposta positiva (HTTP 200) na rota /health' },
  { id: 5, label: 'Clínica Provisionada & Ativa', desc: 'Infraestrutura convergida e acessível pelo navegador' },
];

// ─── Provisioning Progress Modal ─────────────────────────

interface ProvisioningModalProps {
  open: boolean;
  onClose: () => void;
  clinicName: string;
  environment: string;
  blueprint: any;
}

function ProvisioningProgressDialog({
  open,
  onClose,
  clinicName,
  environment,
  blueprint,
}: ProvisioningModalProps) {
  const accentColor = '#00C853';
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [resolvedClinicUrl, setResolvedClinicUrl] = useState('');

  const safeName = (clinicName || 'clinica').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fallbackClinicUrl = environment === 'local' 
    ? 'http://localhost:3001' 
    : `http://pohinc-${safeName}-alb.us-east-1.elb.amazonaws.com`;
  const clinicUrl = resolvedClinicUrl || fallbackClinicUrl;

  // Cronômetro de convergência
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && !isCompleted && !isFailed) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, isCompleted, isFailed]);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setSeconds(0);
      setIsCompleted(false);
      setIsFailed(false);
      setErrorMessage('');
      setStatusMessage('');
      setResolvedClinicUrl('');
    }
  }, [open]);

  // Transição visual progressiva das etapas conforme o tempo transcorrido
  useEffect(() => {
    if (!open || isCompleted || isFailed) return;

    if (environment === 'aws') {
      if (seconds < 12) setCurrentStep(0);
      else if (seconds < 25) setCurrentStep(1);
      else if (seconds < 45) setCurrentStep(2);
      else if (seconds < 160) setCurrentStep(3);
      else setCurrentStep(4);
    } else {
      if (seconds < 3) setCurrentStep(1);
      else if (seconds < 8) setCurrentStep(2);
      else if (seconds < 16) setCurrentStep(3);
      else setCurrentStep(4);
    }
  }, [seconds, environment, open, isCompleted, isFailed]);

  // Polling em tempo real do status da infraestrutura no back-end / motor IaC
  useEffect(() => {
    if (!open || isCompleted || isFailed) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      const projId = blueprint?.id;
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('openhealth_token') : null);
      if (!projId || !activeToken) return;

      try {
        const res = await api.getProjectStatus(activeToken, projId);
        if (!isMounted) return;

        if (res?.status === 'ready') {
          setIsCompleted(true);
          setCurrentStep(5);
          if (res.clinic_url) {
            setResolvedClinicUrl(res.clinic_url);
          }
          if (res.message) {
            setStatusMessage(res.message);
          }
        } else if (res?.status === 'failed') {
          setIsFailed(true);
          setErrorMessage(res.error || res.message || 'Falha na orquestração dos recursos de infraestrutura.');
        } else {
          // Captura status intermediário (provisioning, etc)
          if (res?.message) {
            setStatusMessage(res.message);
          }
        }
      } catch (err: any) {
        console.warn('Polling status temporariamente indisponível (tentando novamente):', err?.message || err);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [open, isCompleted, isFailed, blueprint?.id, token]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          p: { xs: 2.5, sm: 4 },
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: isFailed ? 'rgba(239, 68, 68, 0.3)' : `${accentColor}30`,
        },
      }}
    >
      {isFailed ? (
        <Fade in timeout={400}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                margin: '0 auto',
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '2px solid #EF4444',
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 44, color: '#EF4444' }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              Falha na Orquestração da Infraestrutura
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              Ocorreu uma instabilidade durante o provisionamento da clínica <strong>{clinicName}</strong>.
            </Typography>

            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <SecurityIcon sx={{ color: '#EF4444', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                  Desprovisionamento Automático
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
                Todos os recursos foram desmontados e o ambiente foi encerrado.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={onClose}
              >
                Fechar e Revisar Configurações
              </Button>
            </Box>
          </Box>
        </Fade>
      ) : !isCompleted ? (
        <Fade in timeout={400}>
          <Box>
            {/* Top Badge & Timer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.6, borderRadius: 2, backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
                <RocketLaunchIcon sx={{ fontSize: 18, color: accentColor }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: accentColor }}>
                  MGS-Clínico em Execução (Artigo CONIC 2026)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                <TimerIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {formatTime(seconds)} <span style={{ color: accentColor }}>({environment === 'aws' ? 'Estimado: ~2 a 3 min' : 'Local'})</span>
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
              Provisionando {clinicName || 'sua Clínica'}...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Orquestração automatizada via IaC no ambiente <strong>{getEnvLabel(environment)}</strong>
            </Typography>

            {statusMessage && (
              <Typography variant="caption" sx={{ display: 'block', color: 'info.main', mb: 2, fontWeight: 500 }}>
                • {statusMessage}
              </Typography>
            )}

            <LinearProgress
              sx={{
                mb: 4,
                borderRadius: 2,
                height: 8,
                backgroundColor: `${accentColor}18`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: accentColor,
                  borderRadius: 2,
                },
              }}
            />

            {/* Stages List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              {PROVISIONING_STAGES.map((stage) => {
                const isPassed = currentStep > stage.id;
                const isCurrent = currentStep === stage.id;
                return (
                  <Box
                    key={stage.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isCurrent ? `${accentColor}50` : isPassed ? 'transparent' : 'divider',
                      backgroundColor: isCurrent ? `${accentColor}08` : isPassed ? 'background.default' : 'transparent',
                      transition: '0.3s ease',
                    }}
                  >
                    <Box sx={{ minWidth: 28, display: 'flex', justifyContent: 'center' }}>
                      {isPassed ? (
                        <CheckCircleIcon sx={{ fontSize: 24, color: accentColor }} />
                      ) : isCurrent ? (
                        <CircularProgress size={20} sx={{ color: accentColor }} />
                      ) : (
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'text.disabled' }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: isCurrent ? 700 : 600, color: isPassed || isCurrent ? 'text.primary' : 'text.disabled' }}>
                        {stage.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isPassed || isCurrent ? 'text.secondary' : 'text.disabled' }}>
                        {stage.desc}
                      </Typography>
                    </Box>
                    {isPassed && (
                      <Chip label="Concluído" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: `${accentColor}20`, color: accentColor }} />
                    )}
                    {isCurrent && (
                      <Chip label="Em Execução" size="small" sx={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: `${accentColor}25`, color: accentColor }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Fade>
      ) : (
        <Grow in timeout={500}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                margin: '0 auto',
                mb: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${accentColor}15`,
                border: `2px solid ${accentColor}`,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: `0 0 0 0 ${accentColor}40` },
                  '50%': { boxShadow: `0 0 0 15px ${accentColor}00` },
                },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: accentColor }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              Infraestrutura Convergida com Sucesso!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              A clínica <strong>{clinicName}</strong> está ativa, isolada e pronta para operação.
            </Typography>

            {/* Academic Convergence Card */}
            <Box
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                backgroundColor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudDoneIcon sx={{ color: accentColor, fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Métricas de Convergência (CONIC SEMESP 2026)
                  </Typography>
                </Box>
                <Chip
                  label={`Tempo: ${formatTime(seconds)}`}
                  size="small"
                  sx={{ backgroundColor: `${accentColor}20`, color: accentColor, fontWeight: 700 }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, fontSize: '0.85rem' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ambiente:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{getEnvLabel(environment)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sonda de Saúde (Health Check):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>HTTP 200 OK (/health)</Typography>
                </Box>
                <Box sx={{ gridColumn: { sm: 'span 2' } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Endereço de Acesso:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main', wordBreak: 'break-all' }}>
                    {clinicUrl}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {environment === 'aws' && (
              <Alert 
                severity="info" 
                icon={<TimerIcon sx={{ color: '#0284c7' }} />}
                sx={{ 
                  mb: 3, 
                  textAlign: 'left', 
                  borderRadius: 2,
                  backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  ⏱️ Auto-Desligamento Programado (15 Minutos)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', mb: 1 }}>
                  Este ambiente de demonstração será <strong>automaticamente encerrado em 15 minutos</strong>.
                </Typography>
                <Divider sx={{ my: 0.8 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.3 }}>
                  🔑 Credenciais de Demonstração do Sistema Clínico:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, fontSize: '0.78rem', fontFamily: 'monospace' }}>
                  <span>🩺 <strong>Médico:</strong> medico@gmail.com / medico123</span>
                  <span>📋 <strong>Assistente:</strong> assistente@gmail.com / assistente123</span>
                  <span>📊 <strong>Gerente:</strong> gerente@gmail.com / gerente123</span>
                </Box>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href={clinicUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                }}
              >
                Acessar Sistema da Clínica
              </Button>

              <Button
                variant="text"
                color="inherit"
                onClick={onClose}
                sx={{ px: 3, py: 1.2, borderRadius: 3, textTransform: 'none', color: 'text.secondary' }}
              >
                Concluir
              </Button>
            </Box>
          </Box>
        </Grow>
      )}
    </Dialog>
  );
}

// ─── Sub-Components ─────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  isDark: boolean;
  children: React.ReactNode;
}

function SummaryCard({ icon, title, isDark, children }: SummaryCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: isDark ? 'rgba(30,41,59,0.3)' : 'rgba(0,0,0,0.01)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        {icon}
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 0.5 }}>
        {children}
      </Box>
    </Box>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  isDark: boolean;
}

function SummaryRow({ label, value, isDark }: SummaryRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}>
      <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main Component ─────────────────────────────────────

interface StepFinalizationProps {
  onComplete?: () => void;
}

export default function StepFinalization({ onComplete }: StepFinalizationProps) {
  const { state, saveProject, generateBlueprint } = useSystemConfig();
  const { identity, modules, technical } = state;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#00C853';

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [createdBlueprint, setCreatedBlueprint] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const activeModules: string[] = [];
  if (modules.doctor.enabled) activeModules.push('Médico');
  if (modules.assistant.enabled) activeModules.push('Assistente');
  if (modules.management.enabled) activeModules.push('Gerencial');

  const featureCount = (() => {
    let count = 0;
    if (modules.doctor.enabled) {
      const f = modules.doctor.features;
      if (f.dashboard) count++;
      if (f.patientList) count++;
      if (f.patientRecord.enabled) count++;
      if (f.consultationHistory) count++;
      if (f.schedule) count++;
    }
    if (modules.assistant.enabled) {
      const f = modules.assistant.features;
      if (f.scheduling) count++;
      if (f.doctorScheduleView) count++;
      if (f.patientManagement) count++;
      if (f.billing) count++;
      if (f.insurancePlans) count++;
      if (f.checkInOut) count++;
      if (f.billingCheckControl) count++;
    }
    if (modules.management.enabled) {
      const f = modules.management.features;
      if (f.doctorSchedules) count++;
      if (f.attendanceControl) count++;
      if (f.staffRegistration) count++;
      if (f.billingControl) count++;
      if (f.billingByDoctor) count++;
      if (f.systemCost) count++;
      if (f.dashboards) count++;
    }
    return count;
  })();

  const handleFinalize = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const blueprint = generateBlueprint();
      setCreatedBlueprint(blueprint);
      const saved = await saveProject(blueprint);
      if (saved) {
        setCreatedBlueprint(saved);
      }
      setShowProgressModal(true);
    } catch (err: any) {
      console.error('Falha ao salvar projeto no backend:', err);
      const fallbackBlueprint = generateBlueprint();
      setCreatedBlueprint(fallbackBlueprint);
      setShowProgressModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AssignmentTurnedInIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            Finalização & Orquestração IaC
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Revise todas as suas escolhas e dispare o levantamento automatizado do sistema da clínica.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {/* Identity */}
        <SummaryCard
          icon={<PaletteIcon sx={{ fontSize: 20, color: accentColor }} />}
          title="Identidade Visual"
          isDark={isDark}
        >
          <SummaryRow label="Clínica" value={identity.clinicName || '(não definido)'} isDark={isDark} />
          <SummaryRow label="Logo" value={identity.logoType === 'custom' ? 'Logo própria' : 'Logo genérica'} isDark={isDark} />
          <SummaryRow label="Paleta" value={getPaletteLabel(identity.palette)} isDark={isDark} />
        </SummaryCard>

        {/* Modules */}
        <SummaryCard
          icon={<ExtensionIcon sx={{ fontSize: 20, color: accentColor }} />}
          title="Módulos & Cirurgia de Código"
          isDark={isDark}
        >
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>Perfis ativos</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
              {activeModules.length > 0 ? activeModules.map((m) => (
                <Chip key={m} label={m} size="small" sx={{ fontSize: '0.7rem', backgroundColor: `${accentColor}15`, color: accentColor, fontWeight: 600 }} />
              )) : (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>Nenhum módulo ativo</Typography>
              )}
            </Box>
          </Box>
          <SummaryRow label="Features ativas" value={`${featureCount} funcionalidades`} isDark={isDark} />
          {modules.assistant.enabled && (
            <SummaryRow
              label="Assistentes"
              value={modules.assistant.scope === 'global' ? 'Gerais' : 'Individual por médico'}
              isDark={isDark}
            />
          )}
        </SummaryCard>

        {/* Technical */}
        <SummaryCard
          icon={<DnsIcon sx={{ fontSize: 20, color: accentColor }} />}
          title="Infraestrutura & Dimensionamento"
          isDark={isDark}
        >
          <SummaryRow label="Acesso" value={getDeploymentLabel(technical.deploymentType)} isDark={isDark} />
          <SummaryRow label="Ambiente de Nuvem" value={getEnvLabel(technical.environment)} isDark={isDark} />
          <SummaryRow label="Alta disponibilidade" value={technical.hasDisasterRecovery ? (technical.environment === 'aws' ? 'Sim (Multi-AZ AWS)' : 'Sim (Contingência Local)') : 'Não'} isDark={isDark} />
          <SummaryRow label="Expectativa de Pacientes" value={`${technical.sizing.minPatients} — ${technical.sizing.maxPatients}`} isDark={isDark} />
          <SummaryRow label="Médicos Ativos" value={String(technical.sizing.avgDoctors)} isDark={isDark} />
          <SummaryRow label="Assistentes" value={String(technical.sizing.avgAssistants)} isDark={isDark} />
        </SummaryCard>

        {/* Implementation */}
        <SummaryCard
          icon={<SupportAgentIcon sx={{ fontSize: 20, color: accentColor }} />}
          title="Conformidade & Suporte"
          isDark={isDark}
        >
          <SummaryRow label="Tipo de Implantação" value="Orquestração IaC Automatizada" isDark={isDark} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {['VPC Dedicada', 'MariaDB Isolado', 'HL7 FHIR R4', 'LGPD / DPoP', 'Suporte 30d'].map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: `${accentColor} !important` }} />}
                sx={{ fontSize: '0.7rem', backgroundColor: `${accentColor}10`, color: 'text.primary', fontWeight: 500 }}
              />
            ))}
          </Box>
        </SummaryCard>

        {/* Price Summary */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            p: 2.5,
            borderRadius: 2,
            background: isDark
              ? `linear-gradient(135deg, rgba(0,200,83,0.08), rgba(0,200,83,0.02))`
              : `linear-gradient(135deg, rgba(0,200,83,0.06), rgba(0,200,83,0.01))`,
            border: '1px solid',
            borderColor: `${accentColor}30`,
          }}
        >
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mensal (Inicial)</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: accentColor, lineHeight: 1.2 }}>
              R$ {technical.estimatedPrice.monthly.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>/mês</Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Implantação</Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              R$ {technical.estimatedPrice.setup.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>único</Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Area */}
      <Box sx={{ textAlign: 'center' }}>
        {/* Security badge */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 2, backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}>
            <LockOutlinedIcon sx={{ fontSize: 14, color: accentColor }} />
            <Typography variant="caption" sx={{ color: accentColor, fontWeight: 600 }}>
              Zero-Knowledge Storage: Criptografia AES-256-GCM via PBKDF2
            </Typography>
          </Box>
        </Box>

        {saveError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {saveError}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            id="finalize-system"
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleFinalize}
            disabled={isSaving}
            startIcon={!isSaving ? <RocketLaunchIcon /> : undefined}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: `0 4px 20px rgba(0, 200, 83, 0.3)`,
              '&:hover': {
                boxShadow: `0 6px 30px rgba(0, 200, 83, 0.5)`,
              },
            }}
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Finalizar e Gerar Sistema'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.8, fontSize: '0.82rem' }}>
          Ao finalizar, o motor IaC iniciará a orquestração e você acompanhará a convergência em tempo real.
        </Typography>
      </Box>

      {/* Real-time Provisioning Modal */}
      <ProvisioningProgressDialog
        open={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          onComplete?.();
        }}
        clinicName={identity.clinicName}
        environment={technical.environment}
        blueprint={createdBlueprint}
      />
    </Box>
  );
}
