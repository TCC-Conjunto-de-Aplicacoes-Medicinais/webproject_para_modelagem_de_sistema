'use client';

import { useEffect, useMemo, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import ShieldIcon from '@mui/icons-material/Shield';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import type { DeploymentType, EnvironmentType } from '@/app/types';

// ─── Pricing Logic ──────────────────────────────────────

interface PriceBreakdown {
  base: number;
  modules: number;
  sizing: number;
  environment: number;
  dr: number;
  monthly: number;
  setup: number;
}

function calculatePrice(
  deployment: DeploymentType,
  environment: EnvironmentType,
  hasDR: boolean,
  avgPatients: number,
  avgDoctors: number,
  avgAssistants: number,
  moduleCount: number,
): PriceBreakdown {
  // Base mensal (SaaS Clínico especializado com conformidade CFM / LGPD / ANVISA)
  const base = deployment === 'web' ? 490 : 380;

  // Módulos ativos (R$ 79 / módulo clínico especializado)
  const modules = moduleCount * 79;

  // Sizing (escala por volume operacional e licenciamento de usuários)
  // R$ 49 a cada 100 pacientes cadastrados
  // R$ 69 por médico com assinatura digital CFM e acesso ao módulo SaMD
  // R$ 29 por assistente / recepcionista
  const sizing = Math.ceil(avgPatients / 100) * 49 + avgDoctors * 69 + avgAssistants * 29;

  // Ambiente Cloud AWS dedicado (EC2 t3.medium + ALB + RDS Multi-AZ + S3 criptografado)
  let environment_cost = 0;
  if (environment === 'aws') environment_cost = 290;
  else environment_cost = 0; // local / on-premise — sem custo de cloud gerenciada

  // Alta Disponibilidade e Recuperação de Desastres (DR Multi-AZ)
  const dr = hasDR ? 250 : 0;

  const monthly = base + modules + sizing + environment_cost + dr;

  // Setup / Implantação e Validação Clínica
  let setup = deployment === 'web' ? 2490 : 1890;
  if (environment === 'local') setup += 600; // Apoio técnico on-premise
  if (hasDR) setup += 900; // Homologação de failover e replicação

  return { base, modules, sizing, environment: environment_cost, dr, monthly, setup };
}

// ─── Option Card ────────────────────────────────────────

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  accentColor: string;
  children?: React.ReactNode;
}

function OptionCard({ selected, onClick, icon, title, description, badge, accentColor, children }: OptionCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        border: '2px solid',
        borderColor: selected ? accentColor : 'divider',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? accentColor : (isDark ? '#94A3B8' : '#9CA3AF'),
          transform: 'none',
          boxShadow: 'none',
        },
      }}
    >
      {badge && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            px: 0.7,
            py: 0.2,
            borderRadius: 1,
            backgroundColor: `${accentColor}18`,
            fontSize: '0.65rem',
            fontWeight: 600,
            color: accentColor,
          }}
        >
          {badge}
        </Box>
      )}
      {selected && (
        <CheckCircleIcon
          sx={{ position: 'absolute', top: 8, left: 8, fontSize: 18, color: accentColor }}
        />
      )}
      <CardContent sx={{ p: 2, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 1.5,
            borderRadius: 3,
            mb: 1.5,
            backgroundColor: selected ? `${accentColor}12` : (isDark ? 'rgba(30,41,59,0.5)' : 'rgba(0,0,0,0.03)'),
            color: selected ? accentColor : 'text.secondary',
            transition: 'all 0.2s ease',
          }}
        >
          {icon}
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {description}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function StepTechnical() {
  const { state, updateTechnical } = useSystemConfig();
  const { technical, modules } = state;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#00C853';

  // Count active modules
  const moduleCount = useMemo(() => {
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
  }, [modules]);

  // Average patients for pricing
  const avgPatients = Math.ceil((technical.sizing.minPatients + technical.sizing.maxPatients) / 2);

  // Calculate price
  const price = useMemo(
    () =>
      calculatePrice(
        technical.deploymentType,
        technical.environment,
        technical.hasDisasterRecovery,
        avgPatients,
        technical.sizing.avgDoctors,
        technical.sizing.avgAssistants,
        moduleCount,
      ),
    [technical, moduleCount, avgPatients],
  );

  // Update price in state
  useEffect(() => {
    updateTechnical({
      estimatedPrice: {
        monthly: price.monthly,
        setup: price.setup,
        currency: 'BRL',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price.monthly, price.setup]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SettingsSuggestIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            Questões Técnicas
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Configure como seu sistema será hospedado e dimensionado. Não se preocupe com
          termos técnicos — explicamos tudo de forma simples!
        </Typography>
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 1: Deployment Type */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
          Como você quer acessar seu sistema?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Escolha se prefere acessar pelo navegador (como um site) ou instalar direto no
          computador.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <OptionCard
              selected={technical.deploymentType === 'web'}
              onClick={() => updateTechnical({ deploymentType: 'web' })}
              icon={<LanguageIcon sx={{ fontSize: 32 }} />}
              title="Site (Navegador)"
              description="Acesse de qualquer lugar pelo navegador. Funciona em celular, tablet e computador."
              badge="Recomendado"
              accentColor={accentColor}
            />
          </Box>
          {/* TODO: Habilitar quando app desktop estiver pronto */}
          {/*
          <Box sx={{ flex: 1 }}>
            <OptionCard
              selected={technical.deploymentType === 'desktop'}
              onClick={() => updateTechnical({ deploymentType: 'desktop' })}
              icon={<DesktopWindowsIcon sx={{ fontSize: 32 }} />}
              title="Aplicativo (Desktop)"
              description="Instale diretamente nos computadores da clínica. Ideal para uso interno exclusivo."
              accentColor={accentColor}
            />
          </Box>
          */}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 2: Environment */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
          Onde o sistema será hospedado?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          O ambiente define onde os dados e o sistema ficam armazenados. Cada opção tem
          suas vantagens.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          {/* AWS */}
          <Box sx={{ flex: 1 }}>
            <OptionCard
              selected={technical.environment === 'aws'}
              onClick={() => updateTechnical({ environment: 'aws' })}
              icon={<CloudIcon sx={{ fontSize: 32 }} />}
              title="Amazon AWS"
              description="Infraestrutura da Amazon, líder mundial em nuvem. Alta disponibilidade e escalabilidade."
              badge="Popular"
              accentColor={accentColor}
            />
          </Box>

          {/* Local */}
          <Box sx={{ flex: 1 }}>
            <OptionCard
              selected={technical.environment === 'local'}
              onClick={() => updateTechnical({ environment: 'local' })}
              icon={<DnsIcon sx={{ fontSize: 32 }} />}
              title="Servidor Local"
              description="O sistema roda em máquinas da própria clínica. Sem custo de nuvem mensal."
              accentColor={accentColor}
            />
          </Box>
        </Box>

        {/* Local Warning */}
        <Collapse in={technical.environment === 'local'}>
          <Alert
            severity="info"
            sx={{ mt: 2, '& .MuiAlert-message': { fontSize: '0.85rem' } }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Requisitos para servidor local
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              Para hospedar localmente, sua clínica precisará de pelo menos um servidor
              dedicado (ou computador robusto) com conexão de internet estável. Recomendamos:{' '}
              <strong>8GB+ RAM</strong>, <strong>4 núcleos de CPU</strong> e{' '}
              <strong>100GB+ de armazenamento</strong>. Nosso time pode ajudar na
              configuração durante a etapa de implementação.
            </Typography>
          </Alert>
        </Collapse>

        {/* AWS FinOps Details */}
        <Collapse in={technical.environment === 'aws'}>
          <Box
            sx={{
              mt: 2,
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: `${accentColor}40`,
              backgroundColor: isDark ? 'rgba(0,200,83,0.04)' : 'rgba(0,200,83,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudIcon sx={{ fontSize: 22, color: accentColor }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Detalhamento de Custos AWS (Região us-east-1)
                </Typography>
              </Box>
              <Chip label="Cotação Oficial da Nuvem" size="small" sx={{ bgcolor: `${accentColor}18`, color: accentColor, fontWeight: 700, fontSize: '0.72rem' }} />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.84rem', lineHeight: 1.6 }}>
              A infraestrutura provisionada pelo motor Terraform consome recursos dedicados e escaláveis:
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>1. Computação (EC2)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>Instância t3.small (2GB RAM)</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>US$ 0,0208 / hora ativa (~R$ 82,00 / mês)</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>2. Balanceador de Carga</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>Application Load Balancer (ALB)</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>US$ 0,0225 / hora ativa (~R$ 89,00 / mês)</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>3. Armazenamento EBS NVMe</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>Disco 20 GB gp3 SSD</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>US$ 1,60 fixo (~R$ 9,00 / mês)</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>4. Vault & FinOps</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: accentColor }}>Auto-Teardown TTL 5m</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>~R$ 0,02 por ciclo de demonstração</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Custo computacional total estimado na AWS:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: accentColor }}>
                US$ 0,046/h (~R$ 0,26/h) | R$ 189,00/mês
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 3: Disaster Recovery (Terraform) */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ mb: 5 }}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: technical.hasDisasterRecovery ? `${accentColor}40` : 'divider',
            backgroundColor: isDark
              ? technical.hasDisasterRecovery ? 'rgba(0,200,83,0.04)' : 'rgba(30,41,59,0.3)'
              : technical.hasDisasterRecovery ? 'rgba(0,200,83,0.03)' : 'rgba(0,0,0,0.01)',
            transition: 'all 0.2s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <ShieldIcon sx={{ fontSize: 28, color: accentColor, mt: 0.3, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" sx={{ color: 'text.primary' }}>
                  Alta Disponibilidade
                </Typography>
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    backgroundColor: `${accentColor}15`,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: accentColor,
                  }}
                >
                  Recomendado
                </Box>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, lineHeight: 1.7 }}>
                Utilizamos <strong>Terraform</strong> para garantir que seu sistema esteja
                sempre no ar. Se o servidor principal cair, um ambiente secundário assume
                automaticamente, sem que você ou seus pacientes percebam a interrupção.
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                Isso envolve manter um segundo ambiente (backup), o que adiciona um custo
                extra ao plano. No entanto, é a forma mais segura de garantir a
                continuidade do seu atendimento.{' '}
                <strong>Não é obrigatório</strong> — mas recomendamos para clínicas que
                não podem ter sistema fora do ar.
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={technical.hasDisasterRecovery}
                    onChange={(_, v) => {
                      updateTechnical({
                        hasDisasterRecovery: v,
                        drSecondaryEnv: v ? (technical.environment === 'aws' ? 'aws' : 'local') : null,
                      });
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Ativar alta disponibilidade & redundância (+R$ 149/mês)
                  </Typography>
                }
              />

              <Collapse in={technical.hasDisasterRecovery}>
                <Box sx={{ mt: 1.5, pl: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {technical.environment === 'aws'
                      ? 'Topologia Multi-AZ na AWS (subnets us-east-1a e us-east-1b) com Application Load Balancer redundante e tolerância automática a falhas.'
                      : 'Política de contingência com rotina automatizada de snapshots e replicação para armazenamento seguro.'}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 4: Sizing */}
      {/* ═══════════════════════════════════════════════ */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <GroupsIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Dimensionamento
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Informe a expectativa de volume da sua clínica para dimensionarmos a infraestrutura
          adequada. São estimativas e podem ser ajustadas futuramente.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Patients — Range */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Pacientes esperados (expectativa mensal)</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Informe o mínimo e o máximo de pacientes que espera atender mensalmente. É uma expectativa — pode ser ajustado futuramente.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <TextField
                label="Mínimo"
                value={technical.sizing.minPatients}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) updateTechnical({ sizing: { ...technical.sizing, minPatients: Math.min(v, technical.sizing.maxPatients) } });
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 700 } }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: `${accentColor}40` },
                    '&:hover fieldset': { borderColor: accentColor },
                    '&.Mui-focused fieldset': { borderColor: accentColor },
                  },
                  '& input': { color: accentColor, py: 0.5 },
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>a</Typography>
              <TextField
                label="Máximo"
                value={technical.sizing.maxPatients}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) updateTechnical({ sizing: { ...technical.sizing, maxPatients: Math.max(v, technical.sizing.minPatients) } });
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 700 } }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: `${accentColor}40` },
                    '&:hover fieldset': { borderColor: accentColor },
                    '&.Mui-focused fieldset': { borderColor: accentColor },
                  },
                  '& input': { color: accentColor, py: 0.5 },
                }}
              />
            </Box>
            <Slider
              id="sizing-patients"
              value={[Math.min(technical.sizing.minPatients, 2000), Math.min(technical.sizing.maxPatients, 2000)]}
              onChange={(_, v) => {
                const [min, max] = v as number[];
                updateTechnical({ sizing: { ...technical.sizing, minPatients: min, maxPatients: max } });
              }}
              min={10}
              max={2000}
              step={10}
              sx={{
                color: accentColor,
                '& .MuiSlider-thumb': { width: 16, height: 16 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>10</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>2.000+</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'center' }}>
              Estimativa de valor baseada em ~{avgPatients} pacientes (média do range)
            </Typography>
          </Box>

          {/* Doctors */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Médicos</Typography>
              <TextField
                value={technical.sizing.avgDoctors}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) updateTechnical({ sizing: { ...technical.sizing, avgDoctors: v } });
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 700 } }}
                sx={{
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: `${accentColor}40` },
                    '&:hover fieldset': { borderColor: accentColor },
                    '&.Mui-focused fieldset': { borderColor: accentColor },
                  },
                  '& input': { color: accentColor, py: 0.5 },
                }}
              />
            </Box>
            <Slider
              id="sizing-doctors"
              value={Math.min(technical.sizing.avgDoctors, 50)}
              onChange={(_, v) =>
                updateTechnical({ sizing: { ...technical.sizing, avgDoctors: v as number } })
              }
              min={1}
              max={50}
              step={1}
              sx={{
                color: accentColor,
                '& .MuiSlider-thumb': { width: 16, height: 16 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>1</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>50+</Typography>
            </Box>
          </Box>

          {/* Assistants */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Assistentes</Typography>
              <TextField
                value={technical.sizing.avgAssistants}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) updateTechnical({ sizing: { ...technical.sizing, avgAssistants: v } });
                }}
                type="number"
                size="small"
                inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 700 } }}
                sx={{
                  width: 80,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: `${accentColor}40` },
                    '&:hover fieldset': { borderColor: accentColor },
                    '&.Mui-focused fieldset': { borderColor: accentColor },
                  },
                  '& input': { color: accentColor, py: 0.5 },
                }}
              />
            </Box>
            <Slider
              id="sizing-assistants"
              value={Math.min(technical.sizing.avgAssistants, 30)}
              onChange={(_, v) =>
                updateTechnical({ sizing: { ...technical.sizing, avgAssistants: v as number } })
              }
              min={0}
              max={30}
              step={1}
              sx={{
                color: accentColor,
                '& .MuiSlider-thumb': { width: 16, height: 16 },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>0</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>30+</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 5: Price Estimate */}
      {/* ═══════════════════════════════════════════════ */}
      <Box>
        <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
          Preço Inicial (Estimativa)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Este é o preço inicial estimado com base nas suas escolhas. O valor final será
          confirmado após análise completa do projeto e pode variar conforme a demanda real.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Monthly */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              background: isDark
                ? `linear-gradient(135deg, rgba(0,200,83,0.08), rgba(0,200,83,0.02))`
                : `linear-gradient(135deg, rgba(0,200,83,0.06), rgba(0,200,83,0.01))`,
              border: '1px solid',
              borderColor: `${accentColor}30`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Mensal (Inicial)
            </Typography>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: accentColor,
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              R$ {price.monthly.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              /mês
            </Typography>
          </Box>

          {/* Setup */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              backgroundColor: isDark ? 'rgba(30,41,59,0.4)' : 'rgba(0,0,0,0.02)',
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              Implantação (único)
            </Typography>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'text.primary',
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              R$ {price.setup.toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              pagamento único
            </Typography>
          </Box>
        </Box>

        {/* Breakdown */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: isDark ? 'rgba(30,41,59,0.3)' : 'rgba(0,0,0,0.02)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
            Composição do valor mensal
          </Typography>

          {[
            { label: 'Plano base', value: price.base, desc: technical.deploymentType === 'web' ? 'SaaS Web Corporativo' : 'SaaS Desktop Local' },
            { label: `Módulos (${moduleCount} ativos)`, value: price.modules, desc: `${moduleCount} × R$ 79/mês` },
            { label: 'Dimensionamento', value: price.sizing, desc: `~${avgPatients} pac. | ${technical.sizing.avgDoctors} méd. | ${technical.sizing.avgAssistants} assist.` },
            ...(price.environment > 0 ? [{ label: 'Ambiente Cloud AWS Dedicado', value: price.environment, desc: 'EC2 t3.medium + ALB + EBS gp3 + S3' }] : []),
            ...(price.dr > 0 ? [{ label: 'Alta Disponibilidade & DR', value: price.dr, desc: 'Multi-AZ + Failover Automatizado' }] : []),
          ].map((item, i) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.8,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.desc}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                R$ {item.value.toLocaleString('pt-BR')}
              </Typography>
            </Box>
          ))}

          {/* Total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 1.5,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Total mensal
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: accentColor }}>
              R$ {price.monthly.toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Preço Inicial</Typography>
          Este é o preço inicial estimado. O valor final será confirmado após análise completa
          do projeto e pode variar conforme a demanda real.
        </Alert>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ═══════════════════════════════════════════════ */}
      {/* Section 6: Implementation (always managed) */}
      {/* ═══════════════════════════════════════════════ */}
      <Box>
        <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
          Implementação
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Nosso time cuida de toda a instalação e configuração do seu sistema.
        </Typography>

        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            border: '2px solid',
            borderColor: accentColor,
            position: 'relative',
            backgroundColor: isDark ? 'rgba(0,200,83,0.04)' : 'rgba(0,200,83,0.02)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 20,
              px: 1.5,
              py: 0.3,
              borderRadius: 1.5,
              backgroundColor: accentColor,
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Incluso
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.5,
                borderRadius: 3,
                backgroundColor: `${accentColor}12`,
                color: accentColor,
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Instalação por Nós
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nossa equipe cuida de tudo para você
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7, mb: 2.5 }}>
            {[
              'Instalação completa do sistema',
              'Configuração do ambiente',
              'Testes e validação',
              'Treinamento da equipe',
              'Suporte prioritário por 30 dias',
            ].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: accentColor }} />
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Valor da implantação (único)
            </Typography>
            <Typography
              sx={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              R$ {price.setup.toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
