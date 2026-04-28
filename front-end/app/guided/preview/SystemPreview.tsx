'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
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
  const [fullscreen, setFullscreen] = useState(false);

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
        return <PreviewFinancial activeRole={activeRole} />;
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
    <>
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
        <Box sx={{ ml: 'auto' }}>
          <Box
            onClick={() => setFullscreen(true)}
            sx={{
              px: 0.5,
              py: 0.15,
              borderRadius: 0.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.2,
              backgroundColor: `${colors.accent}12`,
              transition: 'all 0.15s ease',
              '&:hover': { backgroundColor: `${colors.accent}25` },
            }}
          >
            <FullscreenIcon sx={{ fontSize: 10, color: colors.accent }} />
            <Typography sx={{ fontSize: '0.3rem', fontWeight: 600, color: colors.accent }}>Tela Cheia</Typography>
          </Box>
        </Box>
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

      {/* ─── Fullscreen Dialog ─── */}
      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#0F172A' : '#f5f7f6',
          },
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={() => setFullscreen(false)}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: isDark ? '#1E293B' : '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { backgroundColor: isDark ? '#334155' : '#f0f0f0' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Full preview content at real scale */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', fontSize: '0.9rem' }}>
          <PreviewNavbar />

          {/* Role Switcher (fullscreen version) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: isDark ? '#1E293B' : '#e8ece9',
              backgroundColor: isDark ? '#0F172A' : '#ffffff',
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', color: isDark ? '#64748B' : '#9CA3AF', mr: 0.5 }}>
              Visão:
            </Typography>
            {availableRoles
              .filter((r) => r.enabled)
              .map((r) => (
                <Box
                  key={r.role}
                  onClick={() => setActiveRole(r.role)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
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
                      fontSize: '0.85rem',
                      fontWeight: activeRole === r.role ? 600 : 400,
                      color: activeRole === r.role ? colors.accent : (isDark ? '#94A3B8' : '#6B7280'),
                    }}
                  >
                    {r.label}
                  </Typography>
                </Box>
              ))}
          </Box>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Full-size sidebar */}
            <Box
              sx={{
                width: 200,
                flexShrink: 0,
                backgroundColor: isDark ? '#0F172A' : '#ffffff',
                borderRight: '1px solid',
                borderColor: isDark ? '#1E293B' : '#e8ece9',
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                overflow: 'auto',
              }}
            >
              <PreviewSidebar
                activeScreen={activeScreen}
                onSelectScreen={setActiveScreen}
                activeRole={activeRole}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 3,
                overflow: 'auto',
              }}
            >
              {renderScreen()}
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
