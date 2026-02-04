import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDb } from '@/data/db';

const STORAGE_KEYS = ['active-pet', 'weather-cache-v1', 'weather-location-v1'];

export const resetAppData = async () => {
  const db = await getDb();
  await db.execAsync('BEGIN;');
  try {
    await db.runAsync('DELETE FROM ActivityLog;');
    await db.runAsync('DELETE FROM ActivityTemplate;');
    await db.runAsync('DELETE FROM Reminder;');
    await db.runAsync('DELETE FROM VaccineRecord;');
    await db.runAsync('DELETE FROM Tutor;');
    await db.runAsync('DELETE FROM Memory;');
    await db.runAsync('DELETE FROM Pet;');
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }

  await AsyncStorage.multiRemove(STORAGE_KEYS);
};
