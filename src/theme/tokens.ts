export const lightColors = {
  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F5',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#0D9488',
  primaryDark: '#0F766E',
  primarySoft: '#E6FFFB',
  success: '#10B981',
  danger: '#EF4444',
};

export const darkColors = {
  background: '#0B1220',
  surface: '#111827',
  surfaceMuted: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  primary: '#2DD4BF',
  primaryDark: '#14B8A6',
  primarySoft: '#134E4A',
  success: '#22C55E',
  danger: '#F87171',
};

// Backward-compatible alias for files still importing `colors`.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const typography = {
  fontFamily: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    display: 'Nunito_800ExtraBold',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
  },
  lineHeight: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 30,
  },
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
};

export type Theme = typeof theme;
