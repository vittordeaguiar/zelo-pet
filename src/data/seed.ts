import type * as SQLite from 'expo-sqlite';

import { createId, nowIso } from '@/data/utils';

export async function seedDatabase(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM Pet;');
  if (row?.count && row.count > 0) return;

  const petId = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO Pet (id, name, species, breed, sex, birthDate, weightKg, neutered, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      petId,
      'Paçoca',
      'Cão',
      'Golden Retriever',
      'Macho',
      '2021-05-12',
      28.5,
      1,
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
      createdAt,
    ],
  );

  const activityTemplates = [
    { title: 'Alimentar', icon: 'bone', targetCountPerDay: 2, isTimer: 0, sortOrder: 1 },
    { title: 'Passear', icon: 'walk', targetCountPerDay: 2, isTimer: 1, sortOrder: 2 },
    { title: 'Brincar', icon: 'play', targetCountPerDay: 1, isTimer: 1, sortOrder: 3 },
    { title: 'Trocar água', icon: 'water', targetCountPerDay: 3, isTimer: 0, sortOrder: 4 },
  ];

  for (const template of activityTemplates) {
    await db.runAsync(
      `INSERT INTO ActivityTemplate (id, petId, title, icon, targetCountPerDay, isTimer, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        createId(),
        petId,
        template.title,
        template.icon,
        template.targetCountPerDay,
        template.isTimer,
        template.sortOrder,
      ],
    );
  }

  await db.runAsync(
    `INSERT INTO Reminder (id, petId, title, type, datetime, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      createId(),
      petId,
      'Vacina Antirrábica',
      'vacina',
      '2026-03-10T09:00:00.000Z',
      'Levar cartão de vacinação',
      nowIso(),
    ],
  );

  await db.runAsync(
    `INSERT INTO VaccineRecord (id, petId, name, appliedAt, nextDoseAt, vetName, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      createId(),
      petId,
      'V10 (Polivalente)',
      '2025-10-10',
      '2026-10-10',
      'Dr. André Souza',
      'Sem reações',
      nowIso(),
    ],
  );

  await db.runAsync(
    `INSERT INTO Tutor (id, petId, name, role, createdAt)
     VALUES (?, ?, ?, ?, ?);`,
    [createId(), petId, 'Ana Silva', 'Dono', nowIso()],
  );

  await db.runAsync(
    `INSERT INTO Memory (id, petId, title, text, memoryDate, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      createId(),
      petId,
      'Primeiro dia na praia',
      'Ele ficou com medo das ondas no começo, mas depois não queria mais sair da água!',
      '2023-01-12',
      'https://images.unsplash.com/photo-1594145070146-5db2e622b724?auto=format&fit=crop&w=500&q=80',
      nowIso(),
    ],
  );
}
