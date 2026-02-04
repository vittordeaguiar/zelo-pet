import { create } from 'zustand';

type AppState = {
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  needsOnboarding: false,
  setNeedsOnboarding: (value) => set({ needsOnboarding: value }),
}));
