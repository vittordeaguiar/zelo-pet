import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button } from '@/ui';
import { colors, spacing } from '@/theme';
import { logError } from '@/app/logger';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logError('ui_error_boundary', error);
  }

  handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppText variant="title">Algo deu errado</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Tente novamente ou feche e abra o app.
          </AppText>
          <Button label="Tentar de novo" onPress={this.handleRestart} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
});
