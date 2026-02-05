import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { useThemeColors } from '@/theme';

type Variant = 'primary' | 'ghost';

type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 44,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        variant === 'primary' && { backgroundColor: colors.primary },
        { width: size, height: size },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  primary: {
    backgroundColor: '#000000',
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
