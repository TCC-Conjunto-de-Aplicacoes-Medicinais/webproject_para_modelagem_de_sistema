'use client';

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
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
import PreviewHistory from './screens/PreviewHistory';
import PreviewPatientCards from './screens/PreviewPatientCards';
import PreviewCheckIn from './screens/PreviewCheckIn';
import PreviewStaffAttendance from './screens/PreviewStaffAttendance';

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

interface SystemPreviewProps {
  /** Controlled fullscreen from parent */
  fullscreen?: boolean;
  onFullscreenChange?: (open: boolean) => void;
  showMiniature?: boolean;
}

/**
 * Fullscreen uses CSS `zoom` to proportionally scale the miniature preview
 * to fill the screen. This way all child components render at their designed
 * miniature sizes and zoom handles the rest — no need to touch individual
 * font-size/padding values in every screen component.
 */

export default function SystemPreview({
  fullscreen: controlledFullscreen,
  onFullscreenChange,
  showMiniature = true,
}: SystemPreviewProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const [activeScreen, setActiveScreen] = useState<PreviewScreen>('dashboard');
  const [activeRole, setActiveRole] = useState<PreviewRole>('doctor');

  // Fullscreen: use controlled state if provided, otherwise internal
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const fullscreen = controlledFullscreen !== undefined ? controlledFullscreen : internalFullscreen;
  const setFullscreen = (open: boolean) => {
    if (onFullscreenChange) onFullscreenChange(open);
    else setInternalFullscreen(open);
  };

  // Compute zoom factor based on window size vs miniature preview size
  // The miniature preview is designed at ~420px wide, ~500px tall
  const [zoomFactor, setZoomFactor] = useState(2.5);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fullscreen) return;

    const computeZoom = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setWindowSize({ width: vw, height: vh });

      const isMobileDevice = window.matchMedia('(max-width: 900px)').matches;
      const isPortrait = vh > vw;
      const portraitMobile = isMobileDevice && isPortrait;
      setIsPortraitMobile(portraitMobile);

      const effectiveVh = portraitMobile ? vw : vh;

      // Scale to fit the viewport height, and stretch width to fill 100% of the viewport width
      const zoom = effectiveVh / 520;
      setZoomFactor(zoom);
    };

    computeZoom();
    window.addEventListener('resize', computeZoom);
    return () => window.removeEventListener('resize', computeZoom);
  }, [fullscreen]);

  // Reset screen when role changes
  useEffect(() => {
    if (activeRole === 'doctor') setActiveScreen('dashboard');
    else if (activeRole === 'assistant') setActiveScreen('doctor-schedule');
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
      case 'history':
        return <PreviewHistory />;
      case 'financial':
        return <PreviewFinancial activeRole={activeRole} />;
      case 'reports':
        return <PreviewFinancial activeRole={activeRole} />;
      case 'settings':
        return <PreviewSettings />;
      case 'patient-mgmt':
        return <PreviewPatientCards />;
      case 'checkin':
        return <PreviewCheckIn />;
      case 'attendance':
      case 'staff':
        return <PreviewStaffAttendance />;
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

  const roleSwitcher = (
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
  );

  // The core preview layout — reused in both mini and fullscreen
  const previewContent = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#0F172A' : '#f5f7f6',
        overflow: 'hidden',
      }}
    >
      <PreviewNavbar />
      {roleSwitcher}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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

  return (
    <>
      {/* ─── Miniature preview (in-page) ─── */}
      {showMiniature && (
        <Box
          sx={{
            width: '100%',
            height: 380,
            display: 'flex',
            flexDirection: 'column',
            fontSize: '0.65rem',
            overflow: 'hidden',
          }}
        >
          {previewContent}
        </Box>
      )}

      {/* ─── Fullscreen Dialog ─── */}
      <Dialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#0F172A' : '#f5f7f6',
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        {/* Close button — stays at native scale, positioned outside the zoomed area */}
        <IconButton
          onClick={() => setFullscreen(false)}
          sx={{
            position: 'fixed',
            ...(isPortraitMobile
              ? {
                  bottom: 24,
                  right: 24,
                }
              : {
                  top: 16,
                  right: 16,
                }),
            zIndex: 9999,
            width: 40,
            height: 40,
            backgroundColor: isDark ? '#1E293B' : '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            border: '1px solid',
            borderColor: isDark ? '#334155' : '#e0e0e0',
            '&:hover': { backgroundColor: isDark ? '#334155' : '#f0f0f0' },
          }}
        >
          <CloseIcon sx={{ fontSize: 22, color: isDark ? '#E2E8F0' : '#333' }} />
        </IconButton>

        {/* Zoomed preview content — same components, scaled up via CSS zoom */}
        <Box
          ref={containerRef}
          sx={{
            ...(isPortraitMobile
              ? {
                  width: `${windowSize.height / zoomFactor}px`,
                  height: `${windowSize.width / zoomFactor}px`,
                  position: 'absolute',
                  top: 0,
                  left: `${windowSize.width / zoomFactor}px`,
                  transform: 'rotate(90deg)',
                  transformOrigin: 'top left',
                }
              : {
                  width: `${windowSize.width / zoomFactor}px`,
                  height: `${windowSize.height / zoomFactor}px`,
                  transformOrigin: 'top left',
                }),
            zoom: zoomFactor,
            overflow: 'hidden',
          }}
        >
          {previewContent}
        </Box>
      </Dialog>
    </>
  );
}
