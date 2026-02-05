import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AccentOption = {
  id: string;
  label: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
};

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'teal', label: 'Teal', primary: '#0D9488', primaryDark: '#0F766E', primarySoft: '#E6FFFB' },
  { id: 'blue', label: 'Azul', primary: '#2563EB', primaryDark: '#1D4ED8', primarySoft: '#DBEAFE' },
  { id: 'orange', label: 'Laranja', primary: '#F97316', primaryDark: '#EA580C', primarySoft: '#FFEDD5' },
  { id: 'rose', label: 'Rosa', primary: '#E11D48', primaryDark: '#BE123C', primarySoft: '#FFE4E6' },
  { id: 'purple', label: 'Roxo', primary: '#7C3AED', primaryDark: '#6D28D9', primarySoft: '#EDE9FE' },
  { id: 'green', label: 'Verde', primary: '#16A34A', primaryDark: '#15803D', primarySoft: '#DCFCE7' },
];

const defaultAccent = ACCENT_OPTIONS[0];

type ThemeState = {
  accentId: string;
  setAccentId: (id: string) => void;
  getAccent: () => AccentOption;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      accentId: defaultAccent.id,
      setAccentId: (id) => set({ accentId: id }),
      getAccent: () => ACCENT_OPTIONS.find((accent) => accent.id === get().accentId) ?? defaultAccent,
    }),
    {
      name: 'theme-accent',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
