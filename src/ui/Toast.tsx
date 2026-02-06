import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '@/theme';
import { useThemeColors } from '@/theme';
import { AppText } from '@/ui/AppText';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const [state, setState] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setState((prev) => ({ ...prev, visible: false }));
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState({ message, type, visible: true });

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, 2400);
    },
    [hide, opacity, translateY],
  );

  const value = useMemo(() => ({ show }), [show]);

  const backgroundColor =
    state.type === 'success'
      ? colors.success
      : state.type === 'error'
        ? colors.danger
        : themeColors.primary;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {state.visible ? (
          <Animated.View
            style={[
              styles.toast,
              { marginTop: insets.top + spacing.md, backgroundColor },
              { opacity, transform: [{ translateY }] },
            ]}
            pointerEvents="none"
          >
            <AppText variant="caption" color="#fff" style={styles.toastText}>
              {state.message}
            </AppText>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toastText: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
