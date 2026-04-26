'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';
import PreviewNavbar from './PreviewNavbar';
import PreviewSidebar from './PreviewSidebar';
import PreviewDashboard from './screens/PreviewDashboard';
import PreviewPatientList from './screens/PreviewPatientList';
import PreviewPatientRecord from './screens/PreviewPatientRecord';
import PreviewSchedule from './screens/PreviewSchedule';
import PreviewFinancial from './screens/PreviewFinancial';
import PreviewSettings from './screens/PreviewSettings';

export type PreviewScreen =
  | 'dashboard'
  | 'patients'
  | 'patient-record'
  | 'schedule'
  | 'history'
  | 'financial'
  | 'reports'
  | 'settings'
  | 'scheduling'
  | 'doctor-schedule'
  | 'patient-mgmt'
  | 'checkin'
  | 'staff'
  | 'attendance';

export type PreviewRole = 'doctor' | 'assistant' | 'management';

export default function SystemPreview() {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const [activeScreen, setActiveScreen] = useState<PreviewScreen>('dashboard');
  const [activeRole, setActiveRole] = useState<PreviewRole>('doctor');

  // Reset screen when role changes
  useEffect(() => {
    if (activeRole === 'doctor') setActiveScreen('dashboard');
    else if (activeRole === 'assistant') setActiveScreen('scheduling');
    else if (activeRole === 'management') setActiveScreen('doctor-schedule');
  }, [activeRole]);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <PreviewDashboard />;
      case 'patients':
        return <PreviewPatientList onViewPatient={() => setActiveScreen('patient-record')} />;
      case 'patient-record':
        return <PreviewPatientRecord onBack={() => setActiveScreen('patients')} />;
      case 'schedule':
      case 'doctor-schedule':
        return <PreviewSchedule />;
      case 'scheduling':
        return <PreviewSchedule />;
      case 'financial':
      case 'reports':
        return <PreviewFinancial />;
      case 'settings':
        return <PreviewSettings />;
      case 'patient-mgmt':
        return <PreviewPatientList onViewPatient={() => setActiveScreen('patient-record')} />;
      case 'checkin':
      case 'attendance':
      case 'staff':
        return <PreviewDashboard />;
      case 'history':
        return <PreviewDashboard />;
      default:
        return <PreviewDashboard />;
    }
  };

  // Which roles are available?
  const availableRoles: { role: PreviewRole; label: string; enabled: boolean }[] = [
    { role: 'doctor', label: 'Médico', enabled: state.modules.doctor.enabled },
    { role: 'assistant', label: 'Assistente', enabled: state.modules.assistant.enabled },
    { role: 'management', label: 'Gerência', enabled: state.modules.management.enabled },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.65rem',
        backgroundColor: isDark ? '#0F172A' : '#f5f7f6',
        overflow: 'hidden',
      }}
    >
      <PreviewNavbar />

      {/* ─── Role Switcher ─── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.3,
          px: 1,
          py: 0.4,
          borderBottom: '1px solid',
          borderColor: isDark ? '#1E293B' : '#e8ece9',
          backgroundColor: isDark ? '#0F172A' : '#ffffff',
        }}
      >
        <Typography sx={{ fontSize: '0.35rem', color: isDark ? '#64748B' : '#9CA3AF', mr: 0.3, flexShrink: 0 }}>
          Visão:
        </Typography>
        {availableRoles
          .filter((r) => r.enabled)
          .map((r) => (
            <Box
              key={r.role}
              onClick={() => setActiveRole(r.role)}
              sx={{
                px: 0.6,
                py: 0.2,
                borderRadius: 0.5,
                cursor: 'pointer',
                backgroundColor: activeRole === r.role ? `${colors.accent}18` : 'transparent',
                border: '1px solid',
                borderColor: activeRole === r.role ? `${colors.accent}40` : 'transparent',
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: activeRole === r.role
                    ? `${colors.accent}18`
                    : (isDark ? '#1E293B' : '#f0f2f1'),
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.35rem',
                  fontWeight: activeRole === r.role ? 600 : 400,
                  color: activeRole === r.role ? colors.accent : (isDark ? '#94A3B8' : '#6B7280'),
                }}
              >
                {r.label}
              </Typography>
            </Box>
          ))}
      </Box>

      <Box sx={{ display: 'flex', flex: 1 }}>
        <PreviewSidebar
          activeScreen={activeScreen}
          onSelectScreen={setActiveScreen}
          activeRole={activeRole}
        />
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            overflow: 'auto',
          }}
        >
          {renderScreen()}
        </Box>
      </Box>
    </Box>
  );
}
