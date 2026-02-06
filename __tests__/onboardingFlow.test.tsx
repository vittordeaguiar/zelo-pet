import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingFlow from '@/features/onboarding/OnboardingFlow';

jest.mock('@/data/repositories', () => ({
  petsRepo: {
    createPet: jest.fn(),
  },
  tutorsRepo: {
    createTutor: jest.fn(),
  },
}));

jest.mock('@/state/activePetStore', () => ({
  useActivePetStore: (selector: (state: { setActivePetId: () => void }) => unknown) =>
    selector({ setActivePetId: jest.fn() }),
}));

describe('OnboardingFlow', () => {
  it('avança do welcome para dados do tutor', () => {
    const { getByText } = render(
      <SafeAreaProvider>
        <OnboardingFlow onComplete={jest.fn()} />
      </SafeAreaProvider>,
    );

    expect(getByText('Boas-vindas!')).toBeTruthy();
    fireEvent.press(getByText('Começar'));
    expect(getByText('Seus dados')).toBeTruthy();
  });
});
