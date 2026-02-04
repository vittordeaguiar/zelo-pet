import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import { tutorCreateSchema, tutorUpdateSchema, TutorCreateInput } from '@/data/validators';

type TutorRow = {
  id: string;
  petId: string;
  name: string;
  role: string | null;
  createdAt: string;
};

export type Tutor = TutorRow;

export async function getTutorsByPet(petId: string): Promise<Tutor[]> {
  const db = await getDb();
  return db.getAllAsync<TutorRow>('SELECT * FROM Tutor WHERE petId = ? ORDER BY createdAt;', [
    petId,
  ]);
}

export async function createTutor(input: TutorCreateInput): Promise<Tutor> {
  const data = tutorCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO Tutor (id, petId, name, role, createdAt)
     VALUES (?, ?, ?, ?, ?);`,
    [id, data.petId, data.name, data.role ?? null, createdAt],
  );

  return {
    id,
    petId: data.petId,
    name: data.name,
    role: data.role ?? null,
    createdAt,
  };
}

export async function updateTutor(id: string, input: Partial<TutorCreateInput>): Promise<void> {
  const data = tutorUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: string, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.name !== undefined) mapField('name', data.name);
  if (data.role !== undefined) mapField('role', data.role ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE Tutor SET ${fields.join(', ')} WHERE id = ?;`, [...values, id]);
}

export async function deleteTutor(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Tutor WHERE id = ?;', [id]);
}
