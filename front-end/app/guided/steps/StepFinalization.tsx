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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaletteIcon from '@mui/icons-material/Palette';
import ExtensionIcon from '@mui/icons-material/Extension';
import DnsIcon from '@mui/icons-material/Dns';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';

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
  const map: Record<string, string> = { aws: 'Amazon AWS', azure: 'Microsoft Azure', local: 'Servidor Local' };
  return map[env] || env;
}

// ─── Success Animation ──────────────────────────────────

function SuccessAnimation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const accentColor = '#00C853';
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  useEffect(() => {
    if (open) {
      setPhase('loading');
      const t = setTimeout(() => setPhase('done'), 2800);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={phase === 'done' ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          textAlign: 'center',
          py: 6,
          px: 4,
        },
      }}
    >
      {phase === 'loading' ? (
        <Fade in timeout={400}>
          <Box>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                margin: '0 auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `conic-gradient(${accentColor} 0deg, transparent 0deg)`,
                animation: 'spin 1.2s linear infinite',
                position: 'relative',
                '@keyframes spin': {
                  '0%': { background: `conic-gradient(${accentColor} 0deg, transparent 0deg)` },
                  '50%': { background: `conic-gradient(${accentColor} 180deg, transparent 180deg)` },
                  '100%': { background: `conic-gradient(${accentColor} 360deg, transparent 360deg)` },
                },
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RocketLaunchIcon sx={{ fontSize: 32, color: accentColor }} />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Gerando seu Sistema...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Processando configurações e preparando o ambiente
            </Typography>
            <LinearProgress
              sx={{
                mx: 'auto',
                width: '60%',
                borderRadius: 2,
                height: 6,
                backgroundColor: `${accentColor}18`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: accentColor,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Fade>
      ) : (
        <Grow in timeout={500}>
          <Box>
            <Box
              sx={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                margin: '0 auto',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${accentColor}12`,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: `0 0 0 0 ${accentColor}30` },
                  '50%': { boxShadow: `0 0 0 15px ${accentColor}00` },
                },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 56, color: accentColor }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              Sistema Gerado!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.7 }}>
              Seu projeto foi configurado com sucesso e está sendo
              processado pela nossa equipe.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
              Você receberá um email com os próximos passos e o
              acompanhamento da implementação. Fique tranquilo — cuidamos
              de tudo para você!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={onClose}
              sx={{
                px: 5,
                py: 1.2,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              Entendido!
            </Button>
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
  const { state, saveProject } = useSystemConfig();
  const { identity, modules, technical } = state;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#00C853';

  const [showSuccess, setShowSuccess] = useState(false);
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
      await saveProject();
      setShowSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao gerar o sistema. Verifique a conexão.');
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
            Finalização
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Revise todas as suas escolhas e finalize a geração do seu sistema.
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
          title="Módulos"
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
          title="Técnico"
          isDark={isDark}
        >
          <SummaryRow label="Acesso" value={getDeploymentLabel(technical.deploymentType)} isDark={isDark} />
          <SummaryRow label="Ambiente" value={getEnvLabel(technical.environment)} isDark={isDark} />
          <SummaryRow label="Alta disponibilidade" value={technical.hasDisasterRecovery ? `Sim (${getEnvLabel(technical.drSecondaryEnv || '')})` : 'Não'} isDark={isDark} />
          <SummaryRow label="Pacientes" value={`${technical.sizing.minPatients} — ${technical.sizing.maxPatients} (expectativa)`} isDark={isDark} />
          <SummaryRow label="Médicos" value={String(technical.sizing.avgDoctors)} isDark={isDark} />
          <SummaryRow label="Assistentes" value={String(technical.sizing.avgAssistants)} isDark={isDark} />
        </SummaryCard>

        {/* Implementation */}
        <SummaryCard
          icon={<SupportAgentIcon sx={{ fontSize: 20, color: accentColor }} />}
          title="Implementação"
          isDark={isDark}
        >
          <SummaryRow label="Tipo" value="Instalação por Nós" isDark={isDark} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {['Instalação', 'Configuração', 'Testes', 'Treinamento', 'Suporte 30d'].map((item) => (
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

      {/* Finalize Button */}
      <Box sx={{ textAlign: 'center' }}>
        {saveError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {saveError}
          </Typography>
        )}
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
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, fontSize: '0.82rem' }}>
          Ao finalizar, o sistema será gerado e você receberá as instruções por email.
        </Typography>
      </Box>

      {/* Success Dialog */}
      <SuccessAnimation open={showSuccess} onClose={() => {
        setShowSuccess(false);
        onComplete?.();
      }} />
    </Box>
  );
}
