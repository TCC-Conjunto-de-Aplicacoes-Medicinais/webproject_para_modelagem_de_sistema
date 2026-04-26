'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useTheme } from '@mui/material/styles';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { PALETTE_OPTIONS } from '@/app/guided/constants';
import type { PreviewScreen, PreviewRole } from './SystemPreview';

interface SidebarItem {
  id: PreviewScreen;
  icon: React.ReactNode;
  label: string;
}

interface PreviewSidebarProps {
  activeScreen: PreviewScreen;
  onSelectScreen: (screen: PreviewScreen) => void;
  activeRole: PreviewRole;
}

export default function PreviewSidebar({ activeScreen, onSelectScreen, activeRole }: PreviewSidebarProps) {
  const { state } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colors = PALETTE_OPTIONS[state.identity.palette].colors;
  const { doctor, assistant, management, shared } = state.modules;

  const items: SidebarItem[] = [];

  // ─── Doctor View ──────────────────────────────
  if (activeRole === 'doctor') {
    if (doctor.features.dashboard) {
      items.push({ id: 'dashboard', icon: <DashboardIcon sx={{ fontSize: 12 }} />, label: 'Dashboard' });
    }
    if (doctor.features.patientList) {
      items.push({ id: 'patients', icon: <PeopleIcon sx={{ fontSize: 12 }} />, label: 'Pacientes' });
    }
    if (doctor.features.schedule) {
      items.push({ id: 'schedule', icon: <CalendarMonthIcon sx={{ fontSize: 12 }} />, label: 'Agenda' });
    }
    if (doctor.features.consultationHistory) {
      items.push({ id: 'history', icon: <HistoryIcon sx={{ fontSize: 12 }} />, label: 'Histórico' });
    }
  }

  // ─── Assistant View ───────────────────────────
  if (activeRole === 'assistant') {
    if (assistant.features.scheduling) {
      items.push({ id: 'scheduling', icon: <EventNoteIcon sx={{ fontSize: 12 }} />, label: 'Agendar' });
    }
    if (assistant.features.doctorScheduleView) {
      items.push({ id: 'doctor-schedule', icon: <CalendarMonthIcon sx={{ fontSize: 12 }} />, label: 'Agendas' });
    }
    if (assistant.features.patientManagement) {
      items.push({ id: 'patient-mgmt', icon: <PersonAddIcon sx={{ fontSize: 12 }} />, label: 'Pacientes' });
    }
    if (assistant.features.basicFinancial) {
      items.push({ id: 'financial', icon: <AttachMoneyIcon sx={{ fontSize: 12 }} />, label: 'Financeiro' });
    }
    if (assistant.features.checkInOut) {
      items.push({ id: 'checkin', icon: <HowToRegIcon sx={{ fontSize: 12 }} />, label: 'Check-In' });
    }
  }

  // ─── Management View ──────────────────────────
  if (activeRole === 'management') {
    if (management.features.doctorSchedules) {
      items.push({ id: 'doctor-schedule', icon: <CalendarMonthIcon sx={{ fontSize: 12 }} />, label: 'Agendas' });
    }
    if (management.features.attendanceControl) {
      items.push({ id: 'attendance', icon: <FactCheckIcon sx={{ fontSize: 12 }} />, label: 'Presença' });
    }
    if (management.features.staffRegistration) {
      items.push({ id: 'staff', icon: <BadgeIcon sx={{ fontSize: 12 }} />, label: 'Equipe' });
    }
    if (management.features.advancedFinancial) {
      items.push({ id: 'financial', icon: <AttachMoneyIcon sx={{ fontSize: 12 }} />, label: 'Financeiro' });
    }
    if (management.features.dashboards) {
      items.push({ id: 'reports', icon: <BarChartIcon sx={{ fontSize: 12 }} />, label: 'Relatórios' });
    }
  }

  // ─── Shared (all roles) ───────────────────────
  if (shared.settings) {
    items.push({ id: 'settings', icon: <SettingsIcon sx={{ fontSize: 12 }} />, label: 'Config.' });
  }

  return (
    <Box
      sx={{
        width: 70,
        flexShrink: 0,
        backgroundColor: isDark ? '#0F172A' : '#ffffff',
        borderRight: '1px solid',
        borderColor: isDark ? '#1E293B' : '#e8ece9',
        py: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.25,
      }}
    >
      {items.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <Box
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              py: 0.6,
              px: 0.5,
              mx: 0.5,
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: isActive ? `${colors.accent}18` : 'transparent',
              color: isActive ? colors.accent : isDark ? '#94A3B8' : '#6B7280',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: isActive ? `${colors.accent}18` : (isDark ? '#1E293B' : '#f0f2f1'),
              },
            }}
          >
            {item.icon}
            <Typography
              sx={{
                fontSize: '0.45rem',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
