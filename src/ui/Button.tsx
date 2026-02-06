import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';
import { useThemeColors } from '@/theme';
import { AppText } from '@/ui/AppText';

type Variant = 'primary' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}: ButtonProps) {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 30,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={animateIn}
      onPressOut={animateOut}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        variant === 'primary' && { backgroundColor: colors.primary },
        styles[size],
        disabled && styles.disabled,
        style,
        pressed && { opacity: 1 },
        { transform: [{ scale }], opacity },
      ]}
    >
      <AppText
        variant="body"
        color={variant === 'primary' ? '#FFFFFF' : colors.textPrimary}
        style={styles.label}
      >
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: '#000000',
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sm: {
    paddingVertical: spacing.sm,
  },
  md: {
    paddingVertical: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '600',
    fontSize: typography.size.md,
  },
});
