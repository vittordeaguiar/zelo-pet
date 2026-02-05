import { useThemeStore } from '@/state/themeStore';
import { colors as baseColors } from '@/theme/tokens';

export const useThemeColors = () => {
  const accent = useThemeStore((state) => state.getAccent());
  return {
    ...baseColors,
    primary: accent.primary,
    primaryDark: accent.primaryDark,
    primarySoft: accent.primarySoft,
  };
};
