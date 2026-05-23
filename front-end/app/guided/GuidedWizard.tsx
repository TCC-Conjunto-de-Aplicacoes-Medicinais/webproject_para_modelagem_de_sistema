'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import { useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { GUIDED_STEP_LABELS } from '@/app/types';
import StepIdentity from './steps/StepIdentity';
import StepModules from './steps/StepModules';
import StepTechnical from './steps/StepTechnical';
import StepFinalization from './steps/StepFinalization';
import SystemPreview from './preview/SystemPreview';

interface GuidedWizardProps {
  onComplete?: () => void;
}

export default function GuidedWizard({ onComplete }: GuidedWizardProps) {
  const { state, setStep, goNext, goBack, canGoNext, canGoBack } = useSystemConfig();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track if all module tabs have been visited (for step 1 validation)
  const [allModuleTabsVisited, setAllModuleTabsVisited] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentStep]);

  // Determine if the "next" button should be enabled
  const isNextDisabled =
    (state.currentStep === 0 && !state.identity.clinicName?.trim()) ||
    (state.currentStep === 1 && !allModuleTabsVisited);

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <StepIdentity />;
      case 1:
        return <StepModules onAllTabsVisited={setAllModuleTabsVisited} />;
      case 2:
        return <StepTechnical />;
      case 3:
        return <StepFinalization onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* ─── Left: Wizard Steps ──── */}
      <Box
        sx={{
          flex: isMobile ? '1 1 100%' : '1 1 60%',
          minWidth: 0,
        }}
      >
        {/* Stepper */}
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stepper
            activeStep={state.currentStep}
            alternativeLabel
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: '0.8rem',
                fontWeight: 500,
              },
              '& .MuiStepLabel-label.Mui-active': {
                fontWeight: 700,
                color: 'secondary.main',
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: 'secondary.main',
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: 'success.main',
              },
            }}
          >
            {GUIDED_STEP_LABELS.map((label, index) => {
              const isClickable =
                index <= state.currentStep ||
                (index === state.currentStep + 1 && !isNextDisabled);

              return (
                <Step
                  key={label}
                  onClick={() => {
                    if (isClickable) {
                      setStep(index as 0 | 1 | 2 | 3);
                    }
                  }}
                  sx={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        {/* Active Step Content */}
        <Fade in key={state.currentStep} timeout={400}>
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 400,
            }}
          >
            {renderStep()}
          </Box>
        </Fade>

        {/* Navigation Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 3,
            gap: 2,
          }}
        >
          {canGoBack ? (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              sx={{
                borderColor: 'grey.300',
                color: 'text.primary',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              Voltar
            </Button>
          ) : (
            <Box />
          )}

          {canGoNext && state.currentStep < 3 && (
            <Tooltip
              title={
                isNextDisabled
                  ? state.currentStep === 0
                    ? 'Preencha o nome da clínica para prosseguir'
                    : 'Visite todas as abas (Médico, Assistente, Gerencial) antes de prosseguir'
                  : ''
              }
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={goNext}
                  disabled={isNextDisabled}
                  sx={{ px: 4 }}
                >
                  Próximo
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ─── Right: Preview Panel (Desktop) ──── */}
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 38%',
            position: 'sticky',
            top: 80,
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <VisibilityIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>
              Pré-visualização
            </Typography>
            {/* Fullscreen button — now visible and next to the title */}
            <Tooltip title="Abrir em tela cheia" arrow>
              <IconButton
                onClick={() => setFullscreen(true)}
                size="small"
                sx={{
                  backgroundColor: 'secondary.main',
                  color: '#fff',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <FullscreenIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
            }}
          >
            <SystemPreview fullscreen={fullscreen} onFullscreenChange={setFullscreen} />
          </Box>
        </Box>
      )}

      {/* ─── FAB + Drawer: Preview (Mobile) ──── */}
      {isMobile && (
        <>
          <Fab
            color="secondary"
            onClick={() => setPreviewOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
            aria-label="abrir pré-visualização"
          >
            <VisibilityIcon />
          </Fab>

          <Drawer
            anchor="bottom"
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            PaperProps={{
              sx: {
                height: '90vh',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pré-visualização
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => { setPreviewOpen(false); setFullscreen(true); }}
                  size="small"
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'secondary.dark' },
                  }}
                >
                  <FullscreenIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton onClick={() => setPreviewOpen(false)} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <SystemPreview fullscreen={fullscreen} onFullscreenChange={setFullscreen} />
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
