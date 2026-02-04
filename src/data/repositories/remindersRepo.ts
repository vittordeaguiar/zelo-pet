import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import {
  reminderCreateSchema,
  reminderUpdateSchema,
  ReminderCreateInput,
} from '@/data/validators';

type ReminderRow = {
  id: string;
  petId: string;
  title: string;
  type: string;
  datetime: string;
  notes: string | null;
  createdAt: string;
};

export type Reminder = ReminderRow;

export async function getRemindersByPet(petId: string): Promise<Reminder[]> {
  const db = await getDb();
  return db.getAllAsync<ReminderRow>(
    'SELECT * FROM Reminder WHERE petId = ? ORDER BY datetime ASC;',
    [petId],
  );
}

export async function createReminder(input: ReminderCreateInput): Promise<Reminder> {
  const data = reminderCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO Reminder (id, petId, title, type, datetime, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [id, data.petId, data.title, data.type, data.datetime, data.notes ?? null, createdAt],
  );

  return {
    id,
    petId: data.petId,
    title: data.title,
    type: data.type,
    datetime: data.datetime,
    notes: data.notes ?? null,
    createdAt,
  };
}

export async function updateReminder(id: string, input: Partial<ReminderCreateInput>): Promise<void> {
  const data = reminderUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: string, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.title !== undefined) mapField('title', data.title);
  if (data.type !== undefined) mapField('type', data.type);
  if (data.datetime !== undefined) mapField('datetime', data.datetime);
  if (data.notes !== undefined) mapField('notes', data.notes ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE Reminder SET ${fields.join(', ')} WHERE id = ?;`, [...values, id]);
}

export async function deleteReminder(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Reminder WHERE id = ?;', [id]);
}
