import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import { petCreateSchema, petUpdateSchema, PetCreateInput } from '@/data/validators';
import { fromDbBool, toDbBool } from '@/data/repositories/shared';

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  weightKg: number | null;
  neutered: number | null;
  photoUri: string | null;
  createdAt: string;
};

export type Pet = Omit<PetRow, 'neutered'> & { neutered: boolean };

const mapPet = (row: PetRow): Pet => ({
  ...row,
  neutered: fromDbBool(row.neutered),
});

export async function getPets(): Promise<Pet[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PetRow>('SELECT * FROM Pet ORDER BY createdAt DESC;');
  return rows.map(mapPet);
}

export async function getPetById(id: string): Promise<Pet | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PetRow>('SELECT * FROM Pet WHERE id = ?;', [id]);
  return row ? mapPet(row) : null;
}

export async function createPet(input: PetCreateInput): Promise<Pet> {
  const data = petCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO Pet (id, name, species, breed, sex, birthDate, weightKg, neutered, photoUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.name,
      data.species,
      data.breed ?? null,
      data.sex ?? null,
      data.birthDate ?? null,
      data.weightKg ?? null,
      data.neutered === undefined ? null : toDbBool(data.neutered),
      data.photoUri ?? null,
      createdAt,
    ],
  );

  return {
    id,
    createdAt,
    name: data.name,
    species: data.species,
    breed: data.breed ?? null,
    sex: data.sex ?? null,
    birthDate: data.birthDate ?? null,
    weightKg: data.weightKg ?? null,
    neutered: data.neutered ?? false,
    photoUri: data.photoUri ?? null,
  };
}

export async function updatePet(id: string, input: Partial<PetCreateInput>): Promise<void> {
  const data = petUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: keyof PetCreateInput, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.name !== undefined) mapField('name', data.name);
  if (data.species !== undefined) mapField('species', data.species);
  if (data.breed !== undefined) mapField('breed', data.breed ?? null);
  if (data.sex !== undefined) mapField('sex', data.sex ?? null);
  if (data.birthDate !== undefined) mapField('birthDate', data.birthDate ?? null);
  if (data.weightKg !== undefined) mapField('weightKg', data.weightKg ?? null);
  if (data.neutered !== undefined) mapField('neutered', toDbBool(data.neutered));
  if (data.photoUri !== undefined) mapField('photoUri', data.photoUri ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE Pet SET ${fields.join(', ')} WHERE id = ?;`, [...values, id]);
}

export async function deletePet(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM Pet WHERE id = ?;', [id]);
}
