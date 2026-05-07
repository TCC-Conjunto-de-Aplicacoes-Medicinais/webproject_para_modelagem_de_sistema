'use client';

import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { useThemeMode } from '@/app/contexts/ThemeContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { PageRoute } from '@/app/types';
import logo from '@/app/logo.png';

const NAV_ITEMS = [
  { label: 'Início', route: PageRoute.LANDING },
  { label: 'Criar Sistema', route: PageRoute.SYSTEM_CREATION },
] as const;

export default function Navbar() {
  const { currentPage, navigateTo } = useNavigation();
  const { mode, toggleTheme } = useThemeMode();
  const { isAuthenticated, logout, userEmail } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavigate = (route: PageRoute) => {
    navigateTo(route);
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" color="transparent">
        <Toolbar
          sx={{
            maxWidth: 1200,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              mr: 'auto',
            }}
            onClick={() => handleNavigate(PageRoute.LANDING)}
          >
            <img src={logo.src} alt="Logo" style={{ width: 40, height: 40 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1B5E3B, #00C853)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              POHINC: ClinicaGen
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {NAV_ITEMS.map(({ label, route }) => (
              <Button
                key={route}
                onClick={() => handleNavigate(route)}
                sx={{
                  color: currentPage === route ? 'primary.main' : 'text.secondary',
                  fontWeight: currentPage === route ? 700 : 500,
                  position: 'relative',
                  '&::after': currentPage === route
                    ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 20,
                      height: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1B5E3B, #00C853)',
                    }
                    : {},
                }}
              >
                {label}
              </Button>
            ))}

            {/* Dark Mode Toggle */}
            <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  ml: 0.5,
                  color: 'text.secondary',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'secondary.main',
                    backgroundColor: 'rgba(0, 200, 83, 0.08)',
                  },
                }}
                aria-label={mode === 'light' ? 'ativar modo escuro' : 'ativar modo claro'}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                {userEmail && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' } }}>
                    {userEmail}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={logout}
                  sx={{
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      borderColor: 'error.dark',
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    },
                  }}
                >
                  Sair
                </Button>
              </Box>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => handleNavigate(PageRoute.LOGIN)}
                  sx={{
                    ml: 0.5,
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Entrar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNavigate(PageRoute.REGISTER)}
                >
                  Cadastrar
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { md: 'none' }, alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
              <IconButton
                onClick={toggleTheme}
                sx={{ color: 'text.secondary' }}
                aria-label={mode === 'light' ? 'ativar modo escuro' : 'ativar modo claro'}
              >
                {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <IconButton
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: 'text.primary' }}
              aria-label="abrir menu de navegação"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: { width: 280, pt: 2 },
        }}
      >
        <List>
          {NAV_ITEMS.map(({ label, route }) => (
            <ListItem key={route} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(route)}
                selected={currentPage === route}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' },
                  },
                }}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
          {isAuthenticated ? (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { logout(); setMobileOpen(false); }}
                sx={{ borderRadius: 2, mx: 1, color: 'error.main' }}
              >
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(PageRoute.LOGIN)}
                  sx={{ borderRadius: 2, mx: 1 }}
                >
                  <ListItemText primary="Entrar" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding sx={{ px: 2, pt: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleNavigate(PageRoute.REGISTER)}
                >
                  Cadastrar
                </Button>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}
