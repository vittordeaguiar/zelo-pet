import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '@/features/home/HomeScreen';

jest.mock('@/features/home/activityDefaults', () => ({
  DEFAULT_ACTIVITY_TEMPLATES: [],
}));

jest.mock('@/data/repositories', () => ({
  activitiesRepo: {
    getTemplatesByPet: jest.fn().mockResolvedValue([]),
    createTemplate: jest.fn(),
    getLogsByPetDate: jest.fn().mockResolvedValue([]),
  },
  petsRepo: {
    getPets: jest.fn().mockResolvedValue([
      { id: 'pet-1', name: 'Zeca', breed: null, photoUri: null },
    ]),
  },
  tutorsRepo: {
    getTutorsByPet: jest.fn().mockResolvedValue([{ name: 'Ana' }]),
  },
}));

jest.mock('@/state/activePetStore', () => ({
  useActivePetStore: (selector: (state: { activePetId: string; setActivePetId: () => void }) => unknown) =>
    selector({ activePetId: 'pet-1', setActivePetId: jest.fn() }),
}));

jest.mock('@/features/agenda/weather', () => ({
  loadLocationPreference: jest.fn().mockResolvedValue(null),
}));

describe('HomeScreen checklist', () => {
  it('mostra estado vazio quando não há atividades', async () => {
    const { getByText } = render(
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>,
    );

    await waitFor(() => {
      expect(getByText('Sem atividades por aqui.')).toBeTruthy();
    });
  });
});
