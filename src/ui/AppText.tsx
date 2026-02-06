import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { typography } from '@/theme';
import { useThemeColors } from '@/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption';

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const colors = useThemeColors();
  return <Text {...rest} style={[styles.base, styles[variant], { color: color ?? colors.textPrimary }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.regular,
  },
  title: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    fontFamily: typography.fontFamily.display,
  },
  subtitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontFamily: typography.fontFamily.medium,
  },
  body: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    fontFamily: typography.fontFamily.regular,
  },
  caption: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    fontFamily: typography.fontFamily.regular,
  },
});
