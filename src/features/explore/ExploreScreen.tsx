import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { AppText, Button, Card, Input } from '@/ui';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <AppText variant="title">Explorar</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Busca e filtros para serviços próximos.
      </AppText>

      <Card style={styles.card}>
        <AppText variant="subtitle">Busca</AppText>
        <Input value={query} onChangeText={setQuery} placeholder="Petshop, saúde..." />
        <Button label={`Filtrar (${count})`} onPress={() => setCount((v) => v + 1)} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
});
