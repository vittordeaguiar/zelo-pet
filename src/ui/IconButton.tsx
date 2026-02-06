import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radii, spacing } from '@/theme';
import { useThemeColors } from '@/theme';

type Variant = 'primary' | 'ghost';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.94,
        useNativeDriver: true,
        speed: 30,
        bounciness: 0,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
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
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={animateIn}
      onPressOut={animateOut}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        variant === 'primary' && { backgroundColor: colors.primary },
        { width: size, height: size },
        style,
        { transform: [{ scale }], opacity },
      ]}
    >
      {icon}
    </AnimatedPressable>
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
});
