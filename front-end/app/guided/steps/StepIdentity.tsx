'use client';

import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PaletteIcon from '@mui/icons-material/Palette';
import { useSystemConfig } from '@/app/contexts/SystemConfigContext';
import {
  PALETTE_OPTIONS,
  MAX_LOGO_SIZE_BYTES,
  ACCEPTED_LOGO_TYPES,
} from '@/app/guided/constants';
import type { PaletteOption, LogoType } from '@/app/types';

export default function StepIdentity() {
  const { state, updateIdentity } = useSystemConfig();
  const { identity } = state;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ─── Logo Upload ──────────────────────────────────────

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_LOGO_SIZE_BYTES) {
        return; // silently reject — dropzone already validates
      }

      const reader = new FileReader();
      reader.onload = () => {
        updateIdentity({
          logoType: 'custom',
          logoFile: reader.result as string,
          logoFileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    },
    [updateIdentity],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_LOGO_TYPES,
    maxSize: MAX_LOGO_SIZE_BYTES,
    maxFiles: 1,
    multiple: false,
  });

  const handleRemoveLogo = () => {
    updateIdentity({
      logoType: 'generic',
      logoFile: null,
      logoFileName: null,
    });
  };

  const handleSelectLogoType = (type: LogoType) => {
    if (type === 'generic') {
      handleRemoveLogo();
    }
  };

  const handleSelectPalette = (palette: PaletteOption) => {
    updateIdentity({ palette });
  };

  const handleClinicNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateIdentity({ clinicName: event.target.value });
  };

  return (
    <Box>
      {/* Section Title */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
          <Typography variant="h3" sx={{ color: 'text.primary' }}>
            Identidade Visual
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Personalize a aparência do seu sistema com a identidade da sua clínica.
        </Typography>
      </Box>

      {/* ─── Clinic Name ─── */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          sx={{ mb: 1.5, color: 'text.primary' }}
        >
          Nome da Clínica
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Este nome aparecerá no cabeçalho do seu sistema.
        </Typography>
        <TextField
          id="identity-clinic-name"
          fullWidth
          label="Nome da clínica"
          value={identity.clinicName}
          onChange={handleClinicNameChange}
          placeholder="Ex: Clínica São Lucas"
          sx={{ maxWidth: 480 }}
        />
      </Box>

      {/* ─── Logo Section ─── */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h5"
          sx={{ mb: 1.5, color: 'text.primary' }}
        >
          Logo
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Faça upload da logo da sua clínica ou utilize nossa logo genérica.
        </Typography>

        <Grid container spacing={2}>
          {/* Option: Generic Logo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: identity.logoType === 'generic' ? 'secondary.main' : 'divider',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'secondary.main',
                  transform: 'none',
                  boxShadow: 'none',
                },
              }}
              onClick={() => handleSelectLogoType('generic')}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 4,
                  position: 'relative',
                }}
              >
                {identity.logoType === 'generic' && (
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      color: 'secondary.main',
                      fontSize: 22,
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    backgroundColor: isDark
                      ? 'rgba(0, 200, 83, 0.12)'
                      : 'rgba(0, 200, 83, 0.08)',
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
                  Logo Genérica
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Utilizamos uma logo padrão para seu sistema
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Option: Custom Logo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card
              sx={{
                height: '100%',
                border: '2px solid',
                borderColor: identity.logoType === 'custom' ? 'secondary.main' : 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'none',
                  boxShadow: 'none',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 4,
                  position: 'relative',
                }}
              >
                {identity.logoType === 'custom' && (
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      color: 'secondary.main',
                      fontSize: 22,
                    }}
                  />
                )}

                {identity.logoFile ? (
                  <>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        overflow: 'hidden',
                        mb: 2,
                        position: 'relative',
                      }}
                    >
                      <Box
                        component="img"
                        src={identity.logoFile}
                        alt="Logo da clínica"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        color: 'text.primary',
                        fontWeight: 500,
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {identity.logoFileName}
                    </Typography>
                    <Tooltip title="Remover logo">
                      <IconButton
                        size="small"
                        onClick={handleRemoveLogo}
                        sx={{ color: 'error.main' }}
                        aria-label="remover logo"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Box
                    {...getRootProps()}
                    sx={{
                      width: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <input {...getInputProps()} />
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        border: '2px dashed',
                        borderColor: isDragActive ? 'secondary.main' : 'grey.300',
                        backgroundColor: isDragActive
                          ? isDark
                            ? 'rgba(0, 200, 83, 0.08)'
                            : 'rgba(0, 200, 83, 0.04)'
                          : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: 28,
                          color: isDragActive ? 'secondary.main' : 'grey.400',
                        }}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ mb: 0.5, color: 'text.primary' }}>
                      Logo Própria
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {isDragActive
                        ? 'Solte o arquivo aqui...'
                        : 'Clique ou arraste sua logo (PNG, JPG, SVG — máx. 2MB)'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ─── Color Palette Section ─── */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <PaletteIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
          <Typography variant="h5" sx={{ color: 'text.primary' }}>
            Paleta de Cores
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Escolha a paleta que melhor representa a identidade da sua clínica. As cores serão
          aplicadas em todo o sistema.
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(PALETTE_OPTIONS).map(([key, option]) => {
            const isSelected = identity.palette === key;
            const { colors } = option;

            return (
              <Grid size={{ xs: 12, sm: 4 }} key={key}>
                <Card
                  sx={{
                    border: '2px solid',
                    borderColor: isSelected ? colors.accent : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      borderColor: colors.accent,
                      transform: 'none',
                      boxShadow: 'none',
                    },
                  }}
                  onClick={() => handleSelectPalette(key as PaletteOption)}
                >
                  {isSelected && (
                    <CheckCircleIcon
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        color: colors.accent,
                        fontSize: 22,
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
                    {/* Color Preview Dots */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: colors.primary.dark,
                          border: '2px solid',
                          borderColor: isDark ? 'grey.700' : 'grey.200',
                        }}
                      />
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: colors.primary.main,
                          border: '2px solid',
                          borderColor: isDark ? 'grey.700' : 'grey.200',
                        }}
                      />
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: colors.secondary.main,
                          border: '2px solid',
                          borderColor: isDark ? 'grey.700' : 'grey.200',
                        }}
                      />
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: colors.secondary.light,
                          border: '2px solid',
                          borderColor: isDark ? 'grey.700' : 'grey.200',
                        }}
                      />
                    </Box>

                    {/* Miniature UI Preview */}
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        mb: 2,
                        border: '1px solid',
                        borderColor: isDark ? 'grey.700' : 'grey.200',
                      }}
                    >
                      {/* Mini Navbar */}
                      <Box
                        sx={{
                          height: 20,
                          background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                          display: 'flex',
                          alignItems: 'center',
                          px: 1,
                        }}
                      >
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)' }} />
                        <Box sx={{ flex: 1 }} />
                        <Box sx={{ width: 12, height: 3, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.5)', mr: 0.5 }} />
                        <Box sx={{ width: 12, height: 3, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.5)' }} />
                      </Box>
                      {/* Mini Content */}
                      <Box sx={{ height: 44, backgroundColor: isDark ? 'grey.900' : 'grey.50', display: 'flex', p: 0.5, gap: 0.5 }}>
                        {/* Mini Sidebar */}
                        <Box sx={{ width: 16, backgroundColor: isDark ? 'grey.800' : 'white', borderRadius: 0.5 }}>
                          <Box sx={{ width: 8, height: 3, borderRadius: 0.5, backgroundColor: colors.accent, mx: 'auto', mt: 0.5 }} />
                          <Box sx={{ width: 8, height: 2, borderRadius: 0.5, backgroundColor: 'grey.300', mx: 'auto', mt: 0.3 }} />
                          <Box sx={{ width: 8, height: 2, borderRadius: 0.5, backgroundColor: 'grey.300', mx: 'auto', mt: 0.3 }} />
                        </Box>
                        {/* Mini Main */}
                        <Box sx={{ flex: 1, backgroundColor: isDark ? 'grey.800' : 'white', borderRadius: 0.5, p: 0.5 }}>
                          <Box sx={{ width: '60%', height: 3, borderRadius: 0.5, backgroundColor: 'grey.300', mb: 0.3 }} />
                          <Box sx={{ width: '40%', height: 2, borderRadius: 0.5, backgroundColor: 'grey.200', mb: 0.5 }} />
                          <Box sx={{ display: 'flex', gap: 0.3 }}>
                            <Box sx={{ flex: 1, height: 10, borderRadius: 0.5, backgroundColor: `${colors.accent}22` }} />
                            <Box sx={{ flex: 1, height: 10, borderRadius: 0.5, backgroundColor: `${colors.accent}22` }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
