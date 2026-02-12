import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import { initializeDatabase } from '@/data/db';
import { petsRepo } from '@/data/repositories';
import OnboardingFlow from '@/features/onboarding/OnboardingFlow';
import RootNavigator from '@/navigation/RootNavigator';
import { spacing } from '@/theme';
import { useResolvedThemeMode, useThemeColors } from '@/theme';
import { AppText, ToastProvider } from '@/ui';
import { useAppStore } from '@/state/appStore';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { initErrorHandler } from '@/app/errorHandler';

enableScreens();

const shouldSeed = process.env.EXPO_PUBLIC_SEED_DB === 'true';

export default function App() {
  const [ready, setReady] = useState(false);
  const themeColors = useThemeColors();
  const resolvedThemeMode = useResolvedThemeMode();
  const needsOnboarding = useAppStore((state) => state.needsOnboarding);
  const setNeedsOnboarding = useAppStore((state) => state.setNeedsOnboarding);
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    let mounted = true;
    initErrorHandler();
    initializeDatabase({ seed: shouldSeed })
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((error) => {
        console.error('DB init failed', error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    petsRepo
      .getPets()
      .then((pets) => {
        if (active) setNeedsOnboarding(pets.length === 0);
      })
      .catch((error) => console.error('loadPetsForOnboarding', error));
    return () => {
      active = false;
    };
  }, [ready]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator color={themeColors.primary} />
        <AppText variant="caption" color={themeColors.textSecondary}>
          Preparando dados locais...
        </AppText>
      </View>
    );
  }

  const navigationTheme = resolvedThemeMode === 'dark' ? DarkTheme : DefaultTheme;
  const mergedNavigationTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      background: themeColors.background,
      card: themeColors.surface,
      text: themeColors.textPrimary,
      border: themeColors.border,
      primary: themeColors.primary,
    },
  };

  if (needsOnboarding) {
    return (
      <SafeAreaProvider>
        <ToastProvider>
          <ErrorBoundary>
            <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
          </ErrorBoundary>
        </ToastProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <SafeAreaProvider>
        <ToastProvider>
          <NavigationContainer theme={mergedNavigationTheme}>
            <StatusBar style={resolvedThemeMode === 'dark' ? 'light' : 'dark'} />
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </NavigationContainer>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
