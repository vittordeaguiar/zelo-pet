import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ padded = true, style, ...rest }: CardProps) {
  return <View {...rest} style={[styles.base, padded && styles.padded, style]} />;
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
