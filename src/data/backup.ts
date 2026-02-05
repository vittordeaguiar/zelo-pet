import { getDb } from '@/data/db';
import { resetAppData } from '@/data/reset';

type BackupPayload = {
  version: number;
  exportedAt: string;
  data: Record<string, Array<Record<string, unknown>>>;
};

const TABLES_IN_ORDER = [
  'Pet',
  'ActivityTemplate',
  'ActivityLog',
  'Reminder',
  'VaccineRecord',
  'Tutor',
  'Memory',
];

const buildInsert = (table: string, row: Record<string, unknown>) => {
  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map((key) => row[key] ?? null);
  return {
    sql: `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders});`,
    values,
  };
};

export async function exportDatabase(): Promise<string> {
  const db = await getDb();
  const data: BackupPayload['data'] = {};

  for (const table of TABLES_IN_ORDER) {
    const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table};`);
    data[table] = rows;
  }

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importDatabase(json: string, { overwrite = true } = {}) {
  const parsed = JSON.parse(json) as BackupPayload;
  if (!parsed?.data || typeof parsed.data !== 'object') {
    throw new Error('Backup inválido.');
  }

  const db = await getDb();
  if (overwrite) {
    await resetAppData();
  }

  await db.execAsync('BEGIN;');
  try {
    for (const table of TABLES_IN_ORDER) {
      const rows = parsed.data[table] ?? [];
      for (const row of rows) {
        const { sql, values } = buildInsert(table, row);
        await db.runAsync(sql, values);
      }
    }
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}
