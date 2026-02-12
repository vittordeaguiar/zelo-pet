import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps } from 'react-native';

import { radii, shadows, spacing } from '@/theme';
import { useResolvedThemeMode, useThemeColors } from '@/theme';

type CardProps = ViewProps & {
  padded?: boolean;
  animated?: boolean;
};

export function Card({ padded = true, animated = true, style, ...rest }: CardProps) {
  const themeColors = useThemeColors();
  const resolvedThemeMode = useResolvedThemeMode();
  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 6 : 0)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, opacity, translateY]);

  return (
    <Animated.View
      {...rest}
      style={[
        styles.base,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          shadowOpacity: resolvedThemeMode === 'dark' ? 0.28 : shadows.card.shadowOpacity,
        },
        padded && styles.padded,
        animated && { opacity, transform: [{ translateY }] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  padded: {
    padding: spacing.lg,
  },
});
