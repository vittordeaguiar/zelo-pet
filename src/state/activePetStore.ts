import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ActivePetState = {
  activePetId: string | null;
  setActivePetId: (id: string | null) => void;
};

export const useActivePetStore = create<ActivePetState>()(
  persist(
    (set) => ({
      activePetId: null,
      setActivePetId: (id) => set({ activePetId: id }),
    }),
    {
      name: 'active-pet',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
