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
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentStep]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <StepIdentity />;
      case 1:
        return <StepModules />;
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
            {GUIDED_STEP_LABELS.map((label, index) => (
              <Step
                key={label}
                onClick={() => setStep(index as 0 | 1 | 2 | 3)}
                sx={{ cursor: 'pointer' }}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
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
            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon />}
              onClick={goNext}
              sx={{ px: 4 }}
            >
              Próximo
            </Button>
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
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Pré-visualização
            </Typography>
          </Box>
          <Box
            sx={{
              height: 'calc(100vh - 160px)',
              overflow: 'auto',
            }}
          >
            <SystemPreview />
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
              <IconButton onClick={() => setPreviewOpen(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <SystemPreview />
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
