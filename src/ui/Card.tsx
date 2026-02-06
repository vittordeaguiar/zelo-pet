import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

type CardProps = ViewProps & {
  padded?: boolean;
  animated?: boolean;
};

export function Card({ padded = true, animated = true, style, ...rest }: CardProps) {
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
        padded && styles.padded,
        animated && { opacity, transform: [{ translateY }] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padded: {
    padding: spacing.lg,
  },
});
