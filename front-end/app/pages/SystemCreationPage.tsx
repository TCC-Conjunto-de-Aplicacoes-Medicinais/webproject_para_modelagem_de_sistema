'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderIcon from '@mui/icons-material/Folder';
import PaletteIcon from '@mui/icons-material/Palette';
import ExtensionIcon from '@mui/icons-material/Extension';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { SystemConfigProvider, useSystemConfig } from '@/app/contexts/SystemConfigContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { PageRoute } from '@/app/types';
import GuidedWizard from '@/app/guided/GuidedWizard';
import type { SystemBlueprint } from '@/app/types';

// ─── Project List (inside provider to access context) ───

function ProjectList({ onCreateNew }: { onCreateNew: () => void }) {
  const { state, deleteProject } = useSystemConfig();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = '#00C853';

  // ─── Delete confirmation state ────
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  function getPaletteLabel(palette: string): string {
    const map: Record<string, string> = { green: 'Verde', blue: 'Azul', red: 'Vermelho' };
    return map[palette] || palette;
  }

  function getModuleCount(bp: SystemBlueprint): number {
    let count = 0;
    if (bp.modules.doctor.enabled) count++;
    if (bp.modules.assistant.enabled) count++;
    if (bp.modules.management.enabled) count++;
    return count;
  }

  if (state.projects.length === 0) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>
        Seus Projetos
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Sistemas que você já configurou.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {state.projects.map((project) => (
          <Card
            key={project.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { borderColor: 'secondary.main' },
              transition: 'border-color 0.2s ease',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <FolderIcon sx={{ color: accentColor, fontSize: 22 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {project.identity.clinicName || 'Sistema sem nome'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PaletteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {getPaletteLabel(project.identity.palette)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ExtensionIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {getModuleCount(project)} módulos
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {project.modules.doctor.enabled && (
                      <Chip label="Médico" size="small" sx={{ fontSize: '0.65rem', height: 22, backgroundColor: `${accentColor}12`, color: accentColor, fontWeight: 600 }} />
                    )}
                    {project.modules.assistant.enabled && (
                      <Chip label="Assistente" size="small" sx={{ fontSize: '0.65rem', height: 22, backgroundColor: `${accentColor}12`, color: accentColor, fontWeight: 600 }} />
                    )}
                    {project.modules.management.enabled && (
                      <Chip label="Gerencial" size="small" sx={{ fontSize: '0.65rem', height: 22, backgroundColor: `${accentColor}12`, color: accentColor, fontWeight: 600 }} />
                    )}
                    <Chip
                      label={`R$ ${project.technical.estimatedPrice.monthly.toLocaleString('pt-BR')}/mês`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        fontWeight: 700,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        color: 'text.primary',
                      }}
                    />
                  </Box>
                </Box>

                <Tooltip title="Excluir projeto">
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, id: project.id, name: project.identity.clinicName || 'Sistema sem nome' })}
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main', backgroundColor: 'rgba(244,67,54,0.08)' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onCreateNew}
        sx={{
          borderColor: isDark ? 'grey.700' : 'grey.300',
          color: 'text.primary',
          '&:hover': { borderColor: 'secondary.main' },
        }}
      >
        Criar novo sistema
      </Button>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => { setDeleteDialog({ open: false, id: '', name: '' }); setDeletePassword(''); setDeleteError(''); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Para excluir o projeto <strong>&ldquo;{deleteDialog.name}&rdquo;</strong>, confirme digitando sua senha.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Senha"
            value={deletePassword}
            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
            error={!!deleteError}
            helperText={deleteError}
            autoFocus
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': { borderColor: 'error.main' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setDeleteDialog({ open: false, id: '', name: '' }); setDeletePassword(''); setDeleteError(''); }}
            sx={{ color: 'text.secondary' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (!deletePassword.trim()) {
                setDeleteError('Digite sua senha para confirmar');
                return;
              }
              deleteProject(deleteDialog.id);
              setDeleteDialog({ open: false, id: '', name: '' });
              setDeletePassword('');
              setDeleteError('');
            }}
            sx={{ fontWeight: 600 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Inner Page (inside provider) ───────────────────────

function SystemCreationContent() {
  const { state } = useSystemConfig();
  const { isAuthenticated, isLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const [showWizard, setShowWizard] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const hasProjects = state.projects.length > 0;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>;
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Você precisa estar logado para acessar esta página.</Typography>
        <Button variant="contained" color="secondary" onClick={() => navigateTo(PageRoute.LOGIN)}>
          Fazer Login
        </Button>
      </Box>
    );
  }

  // Show wizard
  if (showWizard) {
    return (
      <Fade in timeout={400}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="text"
              startIcon={<Box component="span">←</Box>}
              onClick={() => setShowWizard(false)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
              }}
            >
              Voltar
            </Button>
          </Box>
          <GuidedWizard onComplete={() => setShowWizard(false)} />
        </Box>
      </Fade>
    );
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }} className="animate-fade-in-up">
        <Typography
          variant="body2"
          sx={{
            display: 'inline-block',
            mb: 2,
            px: 2.5,
            py: 0.75,
            borderRadius: 5,
            backgroundColor: isDark
              ? 'rgba(0, 200, 83, 0.12)'
              : 'rgba(0, 200, 83, 0.1)',
            color: 'secondary.main',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          ✦ Criação de sistema
        </Typography>
        <Typography variant="h2" sx={{ color: 'text.primary', mb: 2 }}>
          {hasProjects ? 'Seus Sistemas' : 'Crie seu sistema'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 520,
            mx: 'auto',
            fontSize: '1.1rem',
            color: 'text.secondary',
          }}
        >
          {hasProjects
            ? 'Gerencie seus projetos ou crie um novo sistema personalizado.'
            : 'Configure seu sistema de gestão personalizado para sua clínica.'}
        </Typography>
      </Box>

      {/* Project List (if any) */}
      <ProjectList onCreateNew={() => setShowWizard(true)} />

      {/* Guided Mode Card */}
      {!hasProjects && (
        <Grid
          container
          justifyContent="center"
          className="animate-fade-in-up animate-delay-100"
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'visible',
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': { borderColor: 'secondary.main' },
              }}
            >
              <Chip
                label="Recomendado"
                color="secondary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: 20,
                  fontWeight: 600,
                }}
              />
              <CardActionArea
                onClick={() => setShowWizard(true)}
                sx={{ p: 0 }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2.5,
                      borderRadius: 4,
                      mb: 3,
                      background: `linear-gradient(135deg, rgba(0, 200, 83, ${isDark ? '0.18' : '0.12'}), rgba(0, 200, 83, ${isDark ? '0.08' : '0.04'}))`,
                      color: 'secondary.main',
                    }}
                  >
                    <AutoFixHighIcon sx={{ fontSize: 48 }} />
                  </Box>

                  <Typography variant="h3" sx={{ mb: 1, color: 'text.primary' }}>
                    Modo Guiado
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2.5, color: 'text.secondary', fontWeight: 500 }}
                  >
                    Ideal para quem não tem experiência técnica
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, color: 'text.secondary' }}
                  >
                    Nós te guiamos passo a passo na criação do seu sistema. Basta responder
                    perguntas simples sobre o que você precisa.
                  </Typography>

                  <Box sx={{ textAlign: 'left' }}>
                    {[
                      'Interface visual intuitiva',
                      'Templates prontos para clínicas',
                      'Configurações por perguntas simples',
                      'Preview em tempo real',
                    ].map((feature) => (
                      <Box
                        key={feature}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────

export default function SystemCreationPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        flex: 1,
        py: { xs: 4, md: 6 },
        px: 2,
        background: isDark
          ? 'linear-gradient(160deg, #0A0F0C 0%, #0D1A12 40%, #0F2318 100%)'
          : 'linear-gradient(160deg, #F8FAF9 0%, #EEF5F0 40%, #E0F2E7 100%)',
        minHeight: '80vh',
      }}
    >
      <Container maxWidth="xl">
        <SystemConfigProvider>
          <SystemCreationContent />
        </SystemConfigProvider>
      </Container>
    </Box>
  );
}
