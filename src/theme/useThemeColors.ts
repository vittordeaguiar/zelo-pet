import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/state/themeStore';
import { darkColors, lightColors } from '@/theme/tokens';

export const useResolvedThemeMode = () => {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  if (themeMode === 'light' || themeMode === 'dark') return themeMode;
  return systemScheme === 'dark' ? 'dark' : 'light';
};

export const useThemeColors = () => {
  const accent = useThemeStore((state) => state.getAccent());
  const resolvedMode = useResolvedThemeMode();
  const baseColors = resolvedMode === 'dark' ? darkColors : lightColors;
  return {
    ...baseColors,
    primary: accent.primary,
    primaryDark: accent.primaryDark,
    primarySoft: accent.primarySoft,
  };
};
