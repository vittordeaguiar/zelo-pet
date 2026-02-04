import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import { memoryCreateSchema, memoryUpdateSchema, MemoryCreateInput } from '@/data/validators';

type MemoryRow = {
  id: string;
  petId: string;
  title: string | null;
  text: string;
  memoryDate: string;
  photoUri: string | null;
  createdAt: string;
};

export type Memory = MemoryRow;

export async function getMemoriesByPet(petId: string): Promise<Memory[]> {
  const db = await getDb();
  return db.getAllAsync<MemoryRow>(
    'SELECT * FROM Memory WHERE petId = ? ORDER BY memoryDate DESC;',
    [petId],
  );
}

export async function createMemory(input: MemoryCreateInput): Promise<Memory> {
  const data = memoryCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO Memory (id, petId, title, text, memoryDate, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.petId,
      data.title ?? null,
      data.text,
      data.memoryDate,
      data.photoUri ?? null,
      createdAt,
    ],
  );

  return {
    id,
    petId: data.petId,
    title: data.title ?? null,
    text: data.text,
    memoryDate: data.memoryDate,
    photoUri: data.photoUri ?? null,
    createdAt,
  };
}

export async function updateMemory(id: string, input: Partial<MemoryCreateInput>): Promise<void> {
  const data = memoryUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: string, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.title !== undefined) mapField('title', data.title ?? null);
  if (data.text !== undefined) mapField('text', data.text);
  if (data.memoryDate !== undefined) mapField('memoryDate', data.memoryDate);
  if (data.photoUri !== undefined) mapField('photoUri', data.photoUri ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE Memory SET ${fields.join(', ')} WHERE id = ?;`, [...values, id]);
}

export async function deleteMemory(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Memory WHERE id = ?;', [id]);
}
