import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import { initializeDatabase } from '@/data/db';
import { petsRepo } from '@/data/repositories';
import OnboardingFlow from '@/features/onboarding/OnboardingFlow';
import RootNavigator from '@/navigation/RootNavigator';
import { colors, spacing } from '@/theme';
import { AppText, ToastProvider } from '@/ui';
import { useAppStore } from '@/state/appStore';

enableScreens();

const shouldSeed = process.env.EXPO_PUBLIC_SEED_DB === 'true';

export default function App() {
  const [ready, setReady] = useState(false);
  const needsOnboarding = useAppStore((state) => state.needsOnboarding);
  const setNeedsOnboarding = useAppStore((state) => state.setNeedsOnboarding);

  useEffect(() => {
    let mounted = true;
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

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="caption" color={colors.textSecondary}>
          Preparando dados locais...
        </AppText>
      </View>
    );
  }

  if (needsOnboarding) {
    return (
      <SafeAreaProvider>
        <ToastProvider>
          <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
        </ToastProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ToastProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
