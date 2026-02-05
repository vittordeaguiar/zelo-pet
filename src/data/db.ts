import * as SQLite from 'expo-sqlite';

import { seedDatabase } from '@/data/seed';

const DB_NAME = 'zelo-pet.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  const db = await dbPromise;
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

type Migration = {
  version: number;
  statements: string[];
};

const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS Pet (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        sex TEXT,
        birthDate TEXT,
        weightKg REAL,
        neutered INTEGER,
        photoUri TEXT,
        createdAt TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS ActivityTemplate (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        title TEXT NOT NULL,
        icon TEXT,
        targetCountPerDay INTEGER,
        isTimer INTEGER,
        sortOrder INTEGER,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS ActivityLog (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        templateId TEXT NOT NULL,
        date TEXT NOT NULL,
        countIncrement INTEGER NOT NULL,
        durationSec INTEGER,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE,
        FOREIGN KEY (templateId) REFERENCES ActivityTemplate(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS Reminder (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        datetime TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS VaccineRecord (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        name TEXT NOT NULL,
        appliedAt TEXT NOT NULL,
        nextDoseAt TEXT,
        vetName TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS Tutor (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS Memory (
        id TEXT PRIMARY KEY NOT NULL,
        petId TEXT NOT NULL,
        title TEXT,
        text TEXT NOT NULL,
        memoryDate TEXT NOT NULL,
        photoUri TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (petId) REFERENCES Pet(id) ON DELETE CASCADE
      );`,
    ],
  },
];

async function getCurrentVersion(db: SQLite.SQLiteDatabase) {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );`,
  );
  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_migrations;',
  );
  return row?.version ?? 0;
}

async function applyMigration(db: SQLite.SQLiteDatabase, migration: Migration) {
  await db.execAsync('BEGIN;');
  try {
    for (const statement of migration.statements) {
      await db.execAsync(statement);
    }
    await db.runAsync(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?);',
      [migration.version, new Date().toISOString()],
    );
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function migrateDb() {
  const db = await getDb();
  const currentVersion = await getCurrentVersion(db);
  const pending = migrations.filter((migration) => migration.version > currentVersion);

  for (const migration of pending) {
    await applyMigration(db, migration);
  }
}

export async function initializeDatabase({ seed = false } = {}) {
  await migrateDb();
  if (seed) {
    const db = await getDb();
    await seedDatabase(db);
  }
}
