import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import { vaccineCreateSchema, vaccineUpdateSchema, VaccineCreateInput } from '@/data/validators';

type VaccineRow = {
  id: string;
  petId: string;
  name: string;
  appliedAt: string;
  nextDoseAt: string | null;
  vetName: string | null;
  notes: string | null;
  createdAt: string;
};

export type VaccineRecord = VaccineRow;

export async function getVaccinesByPet(petId: string): Promise<VaccineRecord[]> {
  const db = await getDb();
  return db.getAllAsync<VaccineRow>(
    'SELECT * FROM VaccineRecord WHERE petId = ? ORDER BY appliedAt DESC;',
    [petId],
  );
}

export async function createVaccine(input: VaccineCreateInput): Promise<VaccineRecord> {
  const data = vaccineCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO VaccineRecord (id, petId, name, appliedAt, nextDoseAt, vetName, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.petId,
      data.name,
      data.appliedAt,
      data.nextDoseAt ?? null,
      data.vetName ?? null,
      data.notes ?? null,
      createdAt,
    ],
  );

  return {
    id,
    petId: data.petId,
    name: data.name,
    appliedAt: data.appliedAt,
    nextDoseAt: data.nextDoseAt ?? null,
    vetName: data.vetName ?? null,
    notes: data.notes ?? null,
    createdAt,
  };
}

export async function updateVaccine(id: string, input: Partial<VaccineCreateInput>): Promise<void> {
  const data = vaccineUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: string, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.name !== undefined) mapField('name', data.name);
  if (data.appliedAt !== undefined) mapField('appliedAt', data.appliedAt);
  if (data.nextDoseAt !== undefined) mapField('nextDoseAt', data.nextDoseAt ?? null);
  if (data.vetName !== undefined) mapField('vetName', data.vetName ?? null);
  if (data.notes !== undefined) mapField('notes', data.notes ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE VaccineRecord SET ${fields.join(', ')} WHERE id = ?;`, [
    ...values,
    id,
  ]);
}

export async function deleteVaccine(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM VaccineRecord WHERE id = ?;', [id]);
}
