/**
 * Constantes de paletas de cores para os sistemas gerados.
 * Cada paleta define cores primárias, secundárias e de background
 * que serão aplicadas no preview e no sistema final.
 */

export interface PaletteColors {
  primary: { main: string; light: string; dark: string };
  secondary: { main: string; light: string; dark: string };
  accent: string;
  backgroundGradient: string;
  backgroundDark: string;
}

export const PALETTE_OPTIONS: Record<string, { label: string; colors: PaletteColors; description: string }> = {
  green: {
    label: 'Verde Esmeralda',
    description: 'Tons de verde — transmite confiança e saúde',
    colors: {
      primary: { main: '#1B5E3B', light: '#4A9B6E', dark: '#0D3320' },
      secondary: { main: '#00C853', light: '#5EE094', dark: '#009624' },
      accent: '#00C853',
      backgroundGradient: 'linear-gradient(160deg, #F8FAF9 0%, #EEF5F0 40%, #E0F2E7 100%)',
      backgroundDark: 'linear-gradient(160deg, #0B1120 0%, #111827 40%, #162032 100%)',
    },
  },
  blue: {
    label: 'Azul Profissional',
    description: 'Tons de azul — sofisticação e seriedade',
    colors: {
      primary: { main: '#1565C0', light: '#42A5F5', dark: '#0D47A1' },
      secondary: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2' },
      accent: '#2196F3',
      backgroundGradient: 'linear-gradient(160deg, #F8F9FC 0%, #EBF0F7 40%, #E0E8F5 100%)',
      backgroundDark: 'linear-gradient(160deg, #0B1120 0%, #111827 40%, #162032 100%)',
    },
  },
  red: {
    label: 'Vermelho Vibrante',
    description: 'Tons de vermelho — energia e urgência',
    colors: {
      primary: { main: '#C62828', light: '#EF5350', dark: '#B71C1C' },
      secondary: { main: '#F44336', light: '#E57373', dark: '#D32F2F' },
      accent: '#F44336',
      backgroundGradient: 'linear-gradient(160deg, #FCF8F8 0%, #F7EBEB 40%, #F5E0E0 100%)',
      backgroundDark: 'linear-gradient(160deg, #0B1120 0%, #111827 40%, #162032 100%)',
    },
  },
} as const;

/**
 * Logo genérica SVG inline (ícone de estetoscópio estilizado).
 * Usada quando o usuário não faz upload de logo própria.
 */
export const GENERIC_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <rect width="48" height="48" rx="12" fill="currentColor" opacity="0.12"/>
  <path d="M24 12c-3.3 0-6 2.7-6 6v6c0 3.3 2.7 6 6 6s6-2.7 6-6v-6c0-3.3-2.7-6-6-6z" stroke="currentColor" stroke-width="2.5" fill="none"/>
  <path d="M18 24v2c0 3.3 2.7 6 6 6s6-2.7 6-6v-2" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="24" cy="36" r="2" fill="currentColor"/>
  <path d="M24 32v4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

/** Tamanho máximo de upload de logo: 2MB */
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

/** Tipos MIME aceitos para logo */
export const ACCEPTED_LOGO_TYPES: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
};
