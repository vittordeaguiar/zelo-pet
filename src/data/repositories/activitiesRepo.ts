import { getDb } from '@/data/db';
import { createId, nowIso } from '@/data/utils';
import {
  activityLogCreateSchema,
  activityTemplateCreateSchema,
  activityTemplateUpdateSchema,
  ActivityLogCreateInput,
  ActivityTemplateCreateInput,
} from '@/data/validators';
import { fromDbBool, toDbBool } from '@/data/repositories/shared';

type ActivityTemplateRow = {
  id: string;
  petId: string;
  title: string;
  icon: string | null;
  targetCountPerDay: number | null;
  isTimer: number | null;
  sortOrder: number | null;
};

type ActivityLogRow = {
  id: string;
  petId: string;
  templateId: string;
  date: string;
  countIncrement: number;
  durationSec: number | null;
  createdAt: string;
};

export type ActivityTemplate = Omit<ActivityTemplateRow, 'isTimer'> & { isTimer: boolean };
export type ActivityLog = ActivityLogRow;

const mapTemplate = (row: ActivityTemplateRow): ActivityTemplate => ({
  ...row,
  isTimer: fromDbBool(row.isTimer),
});

export async function getTemplatesByPet(petId: string): Promise<ActivityTemplate[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActivityTemplateRow>(
    'SELECT * FROM ActivityTemplate WHERE petId = ? ORDER BY sortOrder ASC;',
    [petId],
  );
  return rows.map(mapTemplate);
}

export async function createTemplate(input: ActivityTemplateCreateInput): Promise<ActivityTemplate> {
  const data = activityTemplateCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();

  await db.runAsync(
    `INSERT INTO ActivityTemplate (id, petId, title, icon, targetCountPerDay, isTimer, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.petId,
      data.title,
      data.icon ?? null,
      data.targetCountPerDay ?? null,
      data.isTimer === undefined ? null : toDbBool(data.isTimer),
      data.sortOrder ?? null,
    ],
  );

  return {
    id,
    petId: data.petId,
    title: data.title,
    icon: data.icon ?? null,
    targetCountPerDay: data.targetCountPerDay ?? null,
    isTimer: data.isTimer ?? false,
    sortOrder: data.sortOrder ?? null,
  };
}

export async function updateTemplate(
  id: string,
  input: Partial<ActivityTemplateCreateInput>,
): Promise<void> {
  const data = activityTemplateUpdateSchema.parse(input);
  const db = await getDb();

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  const mapField = (key: string, value: unknown) => {
    fields.push(`${key} = ?`);
    values.push(value as string | number | null);
  };

  if (data.title !== undefined) mapField('title', data.title);
  if (data.icon !== undefined) mapField('icon', data.icon ?? null);
  if (data.targetCountPerDay !== undefined) {
    mapField('targetCountPerDay', data.targetCountPerDay ?? null);
  }
  if (data.isTimer !== undefined) mapField('isTimer', toDbBool(data.isTimer));
  if (data.sortOrder !== undefined) mapField('sortOrder', data.sortOrder ?? null);

  if (fields.length === 0) return;

  await db.runAsync(`UPDATE ActivityTemplate SET ${fields.join(', ')} WHERE id = ?;`, [
    ...values,
    id,
  ]);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM ActivityTemplate WHERE id = ?;', [id]);
}

export async function deleteTemplatesByPet(petId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM ActivityTemplate WHERE petId = ?;', [petId]);
}

export async function logActivity(input: ActivityLogCreateInput): Promise<ActivityLog> {
  const data = activityLogCreateSchema.parse(input);
  const db = await getDb();
  const id = createId();
  const createdAt = nowIso();

  await db.runAsync(
    `INSERT INTO ActivityLog (id, petId, templateId, date, countIncrement, durationSec, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      data.petId,
      data.templateId,
      data.date,
      data.countIncrement,
      data.durationSec ?? null,
      createdAt,
    ],
  );

  return {
    id,
    petId: data.petId,
    templateId: data.templateId,
    date: data.date,
    countIncrement: data.countIncrement,
    durationSec: data.durationSec ?? null,
    createdAt,
  };
}

export async function getLogsByPetDate(petId: string, date: string): Promise<ActivityLog[]> {
  const db = await getDb();
  return db.getAllAsync<ActivityLogRow>(
    'SELECT * FROM ActivityLog WHERE petId = ? AND date = ? ORDER BY createdAt DESC;',
    [petId, date],
  );
}
