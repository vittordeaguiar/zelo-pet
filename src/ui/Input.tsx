import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { radii, spacing, typography } from '@/theme';
import { useThemeColors } from '@/theme';
import { AppText } from '@/ui/AppText';

type InputProps = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...rest }: InputProps) {
  const themeColors = useThemeColors();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="caption" color={themeColors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={themeColors.textSecondary}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            color: themeColors.textPrimary,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    fontSize: typography.size.md,
  },
});
