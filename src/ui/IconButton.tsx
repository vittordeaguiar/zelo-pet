import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type Variant = 'primary' | 'ghost';

type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, onPress, variant = 'ghost', size = 44, style }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
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
    backgroundColor: colors.primary,
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
