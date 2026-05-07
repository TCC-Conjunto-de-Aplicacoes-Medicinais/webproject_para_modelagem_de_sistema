'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/material/styles';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import type {
  DoctorFeatures,
  DoctorPatientRecordFeatures,
  AssistantFeatures,
  ManagementFeatures,
  AssistantScope,
} from '@/app/types';

// ─── Feature Descriptions ──────────────────────────────

interface FeatureItem {
  key: string;
  label: string;
  description: string;
}

const DOCTOR_FEATURES: FeatureItem[] = [
  { key: 'dashboard', label: 'Tela Inicial (Dashboard)', description: 'Mini-agenda, lembretes e visão geral do dia' },
  { key: 'patientList', label: 'Lista de Pacientes', description: 'Visualize e gerencie todos os seus pacientes' },
  { key: 'patientRecord', label: 'Prontuário do Paciente', description: 'Ficha completa com histórico, arquivos e prescrições' },
  { key: 'consultationHistory', label: 'Histórico de Consultas', description: 'Registro detalhado de cada atendimento realizado' },
  { key: 'schedule', label: 'Agenda', description: 'Visualize e gerencie seus horários de atendimento' },
];

const PATIENT_RECORD_SUBFEATURES: FeatureItem[] = [
  { key: 'files', label: 'Arquivos e Exames', description: 'Acesse exames, histórico médico e documentos do paciente' },
  { key: 'allergies', label: 'Alergias', description: 'Registro de alergias e intolerâncias do paciente' },
  { key: 'fileUpload', label: 'Upload de Arquivos', description: 'Envie novos documentos e exames para o prontuário' },
  { key: 'aiEcg', label: 'Análise de IA (ECG)', description: 'Análise inteligente de eletrocardiogramas por IA' },
  { key: 'prescriptions', label: 'Prescrições e Laudos', description: 'Emita laudos, receitas e solicitações de exames' },
  { key: 'prescriptionTemplate', label: 'Template de Prescrição', description: 'Upload de modelo base da clínica para preenchimento' },
  { key: 'digitalSignature', label: 'Receita com Assinatura Digital', description: 'Emita receitas com assinatura digital válida juridicamente' },
  { key: 'stampedPrescription', label: 'Receita Carimbada (Impressão)', description: 'Receita para remédios controlados e farmácia popular — permite impressão' },
  { key: 'medicationControl', label: 'Controle de Remédios', description: 'Gerencie e acompanhe os remédios em uso pelo paciente' },
];

const ASSISTANT_FEATURES: FeatureItem[] = [
  { key: 'doctorScheduleView', label: 'Agendas', description: 'Consulte a disponibilidade e agende para os médicos' },
  { key: 'patientManagement', label: 'Gestão de Pacientes', description: 'Cadastro e atualização de dados dos pacientes' },
  { key: 'billing', label: 'Faturamento', description: 'Controle de faturamento por convênio — discrimine o que cada convênio deve ao final do mês' },
  { key: 'insurancePlans', label: 'Convênios', description: 'Gerenciamento dos convênios aceitos pela clínica' },
  { key: 'checkInOut', label: 'Check-In / Check-Out', description: 'Controle de chegada e saída dos pacientes' },
  { key: 'billingCheckControl', label: 'Controle de Check (Faturamento)', description: 'Marque os atendimentos como faturados — controle visual do que já foi processado por convênio' },
];

const MANAGEMENT_FEATURES: FeatureItem[] = [
  { key: 'doctorSchedules', label: 'Agenda dos Médicos', description: 'Visão geral das agendas de todos os médicos' },
  { key: 'attendanceControl', label: 'Controle de Presença', description: 'Acompanhe a presença e pontualidade dos médicos' },
  { key: 'staffRegistration', label: 'Cadastro de Equipe', description: 'Gerencie médicos e assistentes da clínica' },
  { key: 'billingControl', label: 'Controle de Faturamento', description: 'Faturamento geral da clínica' },
  { key: 'billingByDoctor', label: 'Faturamento por Médico', description: 'Discrimine o faturamento por médico da equipe — veja quanto cada profissional contribui' },
  { key: 'systemCost', label: 'Custo do Sistema', description: 'Exiba o custo mensal do sistema na tela gerencial' },
  { key: 'dashboards', label: 'Dashboards e Relatórios', description: 'Painéis analíticos com métricas da clínica' },
];

// ─── Tab Panel ──────────────────────────────────────────

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 2 }}>
      {value === index && children}
    </Box>
  );
}

// ─── Feature Toggle Component ───────────────────────────

interface FeatureToggleProps {
  feature: FeatureItem;
  checked: boolean;
  onChange: (checked: boolean) => void;
  indent?: boolean;
  accentColor: string;
}

function FeatureToggle({ feature, checked, onChange, indent, accentColor }: FeatureToggleProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.2,
        pl: indent ? 3 : 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ flex: 1, mr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: checked ? 'text.primary' : 'text.secondary',
            }}
          >
            {feature.label}
          </Typography>
          <Tooltip title={feature.description} arrow placement="top">
            <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
        >
          {feature.description}
        </Typography>
      </Box>
      <Switch
        checked={checked}
        onChange={(_, v) => onChange(v)}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
        }}
      />
    </Box>
  );
}

// ─── Main Component ─────────────────────────────────────

interface StepModulesProps {
  /** Callback to notify parent when all tabs have been visited */
  onAllTabsVisited?: (visited: boolean) => void;
}

export default function StepModules({ onAllTabsVisited }: StepModulesProps) {
  const { state, updateModules } = useSystemConfig();
  const [tabIndex, setTabIndex] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0])); // Start with first tab visited
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { doctor, assistant, management, shared } = state.modules;

  const accentColor = '#00C853';

  // Track tab visits
  const handleTabChange = useCallback((_: unknown, newValue: number) => {
    setTabIndex(newValue);
    setVisitedTabs((prev) => {
      const next = new Set(prev);
      next.add(newValue);
      return next;
    });
  }, []);

  // Notify parent about tab visit status
  useEffect(() => {
    const allVisited = visitedTabs.has(0) && visitedTabs.has(1) && visitedTabs.has(2);
    onAllTabsVisited?.(allVisited);
  }, [visitedTabs, onAllTabsVisited]);

  // Tab labels with visit indicators
  const TAB_CONFIGS = [
    { label: 'Médico', icon: <MedicalServicesIcon sx={{ fontSize: 18 }} />, index: 0 },
    { label: 'Assistente', icon: <SupportAgentIcon sx={{ fontSize: 18 }} />, index: 1 },
    { label: 'Gerencial', icon: <BusinessCenterIcon sx={{ fontSize: 18 }} />, index: 2 },
  ];

  // ─── Doctor Handlers ──────────────────────────────

  const toggleDoctorModule = (enabled: boolean) => {
    updateModules({ doctor: { ...doctor, enabled } });
  };

  const toggleDoctorFeature = (key: string, value: boolean) => {
    if (key === 'patientRecord') {
      updateModules({
        doctor: {
          ...doctor,
          features: {
            ...doctor.features,
            patientRecord: { ...doctor.features.patientRecord, enabled: value },
          },
        },
      });
    } else {
      updateModules({
        doctor: {
          ...doctor,
          features: { ...doctor.features, [key]: value } as DoctorFeatures,
        },
      });
    }
  };

  const togglePatientRecordSub = (key: string, value: boolean) => {
    updateModules({
      doctor: {
        ...doctor,
        features: {
          ...doctor.features,
          patientRecord: {
            ...doctor.features.patientRecord,
            [key]: value,
          } as DoctorPatientRecordFeatures,
        },
      },
    });
  };

  // ─── Assistant Handlers ───────────────────────────

  const toggleAssistantModule = (enabled: boolean) => {
    updateModules({ assistant: { ...assistant, enabled } });
  };

  const toggleAssistantFeature = (key: string, value: boolean) => {
    updateModules({
      assistant: {
        ...assistant,
        features: { ...assistant.features, [key]: value } as AssistantFeatures,
      },
    });
  };

  const setAssistantScope = (scope: AssistantScope) => {
    updateModules({ assistant: { ...assistant, scope } });
  };

  // ─── Management Handlers ─────────────────────────

  const toggleManagementModule = (enabled: boolean) => {
    updateModules({ management: { ...management, enabled } });
  };

  const toggleManagementFeature = (key: string, value: boolean) => {
    updateModules({
      management: {
        ...management,
        features: { ...management.features, [key]: value } as ManagementFeatures,
      },
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <TuneIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            Módulos do Sistema
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Escolha quais funcionalidades cada perfil terá acesso no sistema. O preview à
          direita atualiza em tempo real.
        </Typography>

        {/* Tab visit progress indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Abas visitadas:
          </Typography>
          {TAB_CONFIGS.map((tab) => (
            <Chip
              key={tab.index}
              label={tab.label}
              size="small"
              icon={visitedTabs.has(tab.index) ? <CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: `${accentColor} !important` }} /> : undefined}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 500,
                backgroundColor: visitedTabs.has(tab.index) ? `${accentColor}15` : 'action.hover',
                color: visitedTabs.has(tab.index) ? accentColor : 'text.secondary',
                borderColor: visitedTabs.has(tab.index) ? `${accentColor}40` : 'transparent',
                border: '1px solid',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Tabs — 3 tabs only: Médico, Assistente, Gerencial (removed "Geral") */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 0,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
              minHeight: 48,
            },
            '& .Mui-selected': {
              fontWeight: 700,
              color: 'secondary.main',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'secondary.main',
            },
          }}
        >
          <Tab
            icon={<MedicalServicesIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Médico"
          />
          <Tab
            icon={<SupportAgentIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Assistente"
          />
          <Tab
            icon={<BusinessCenterIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Gerencial"
          />
        </Tabs>
      </Box>

      {/* ─── Médico ──────────────────────────────── */}
      <TabPanel value={tabIndex} index={0}>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={doctor.enabled}
                onChange={(_, v) => toggleDoctorModule(v)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
                }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Ativar módulo Médico
              </Typography>
            }
          />
        </Box>

        <Collapse in={doctor.enabled}>
          {DOCTOR_FEATURES.map((f) => {
            const isPatientRecord = f.key === 'patientRecord';
            const checked = isPatientRecord
              ? doctor.features.patientRecord.enabled
              : (doctor.features[f.key as keyof DoctorFeatures] as boolean);

            return (
              <Box key={f.key}>
                <FeatureToggle
                  feature={f}
                  checked={checked}
                  onChange={(v) => toggleDoctorFeature(f.key, v)}
                  accentColor={accentColor}
                />

                {/* Sub-features for patient record */}
                {isPatientRecord && (
                  <Collapse in={doctor.features.patientRecord.enabled}>
                    <Box
                      sx={{
                        ml: 1,
                        pl: 2,
                        borderLeft: '2px solid',
                        borderColor: `${accentColor}40`,
                      }}
                    >
                      {PATIENT_RECORD_SUBFEATURES.map((sub) => (
                        <FeatureToggle
                          key={sub.key}
                          feature={sub}
                          checked={
                            doctor.features.patientRecord[
                              sub.key as keyof DoctorPatientRecordFeatures
                            ] as boolean
                          }
                          onChange={(v) => togglePatientRecordSub(sub.key, v)}
                          indent
                          accentColor={accentColor}
                        />
                      ))}

                      {/* Informativo sobre receita carimbada */}
                      {doctor.features.patientRecord.stampedPrescription && (
                        <Alert
                          severity="info"
                          sx={{
                            mt: 1,
                            ml: 3,
                            '& .MuiAlert-message': { fontSize: '0.8rem' },
                          }}
                        >
                          Em alguns casos, a receita online não é aceita para medicamentos controlados
                          ou na farmácia popular. Esta opção permite gerar uma receita formatada para
                          impressão, que o médico pode preencher digitalmente ou à mão e carimbar
                          pessoalmente.
                        </Alert>
                      )}
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Collapse>
      </TabPanel>

      {/* ─── Assistente ──────────────────────────── */}
      <TabPanel value={tabIndex} index={1}>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={assistant.enabled}
                onChange={(_, v) => toggleAssistantModule(v)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
                }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Ativar módulo Assistente
              </Typography>
            }
          />
        </Box>

        <Collapse in={assistant.enabled}>
          {/* Scope Question */}
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(0, 200, 83, 0.04)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(0, 200, 83, 0.15)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
              As assistentes são gerais ou individuais por médico?
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Gerais: compartilhadas entre todos os médicos. Individuais: cada médico tem
              sua(s) assistente(s) dedicada(s).
            </Typography>
            <RadioGroup
              value={assistant.scope}
              onChange={(e) => setAssistantScope(e.target.value as AssistantScope)}
              row
            >
              <FormControlLabel
                value="global"
                control={
                  <Radio
                    size="small"
                    sx={{ '&.Mui-checked': { color: accentColor } }}
                  />
                }
                label={<Typography variant="body2">Gerais</Typography>}
              />
              <FormControlLabel
                value="per-doctor"
                control={
                  <Radio
                    size="small"
                    sx={{ '&.Mui-checked': { color: accentColor } }}
                  />
                }
                label={<Typography variant="body2">Individual por médico</Typography>}
              />
            </RadioGroup>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {ASSISTANT_FEATURES.map((f) => (
            <FeatureToggle
              key={f.key}
              feature={f}
              checked={assistant.features[f.key as keyof AssistantFeatures] as boolean}
              onChange={(v) => toggleAssistantFeature(f.key, v)}
              accentColor={accentColor}
            />
          ))}
        </Collapse>
      </TabPanel>

      {/* ─── Gerencial ───────────────────────────── */}
      <TabPanel value={tabIndex} index={2}>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={management.enabled}
                onChange={(_, v) => toggleManagementModule(v)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: accentColor },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: accentColor },
                }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Ativar módulo Gerencial
              </Typography>
            }
          />
        </Box>

        <Collapse in={management.enabled}>
          {MANAGEMENT_FEATURES.map((f) => (
            <FeatureToggle
              key={f.key}
              feature={f}
              checked={management.features[f.key as keyof ManagementFeatures] as boolean}
              onChange={(v) => toggleManagementFeature(f.key, v)}
              accentColor={accentColor}
            />
          ))}
        </Collapse>
      </TabPanel>
    </Box>
  );
}
