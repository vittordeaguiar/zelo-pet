import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MemoriesScreen from '@/features/memories/MemoriesScreen';

jest.mock('@/data/repositories', () => ({
  memoriesRepo: {
    getMemoriesByPet: jest.fn().mockResolvedValue([]),
  },
  petsRepo: {
    getPets: jest.fn().mockResolvedValue([
      { id: 'pet-1', name: 'Zeca', species: 'Cão' },
    ]),
  },
}));

jest.mock('@/state/activePetStore', () => ({
  useActivePetStore: (selector: (state: { activePetId: string; setActivePetId: () => void }) => unknown) =>
    selector({ activePetId: 'pet-1', setActivePetId: jest.fn() }),
}));

describe('MemoriesScreen', () => {
  it('mostra estado vazio quando não há memórias', async () => {
    const { getByText } = render(
      <SafeAreaProvider>
        <MemoriesScreen />
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(getByText('Guarde bons momentos')).toBeTruthy();
    });
  });
});
