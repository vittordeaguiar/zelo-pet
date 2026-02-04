import { z } from 'zod';

export const petCreateSchema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birthDate: z.string().optional(),
  weightKg: z.coerce.number().nonnegative().optional(),
  neutered: z.boolean().optional(),
  photoUri: z.string().optional(),
});

export const petUpdateSchema = petCreateSchema.partial();

export const activityTemplateCreateSchema = z.object({
  petId: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().optional(),
  targetCountPerDay: z.coerce.number().int().positive().optional(),
  isTimer: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const activityTemplateUpdateSchema = activityTemplateCreateSchema.partial();

export const activityLogCreateSchema = z.object({
  petId: z.string().min(1),
  templateId: z.string().min(1),
  date: z.string().min(1),
  countIncrement: z.coerce.number().int().min(1),
  durationSec: z.coerce.number().int().nonnegative().optional(),
});

export const reminderCreateSchema = z.object({
  petId: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  datetime: z.string().min(1),
  notes: z.string().optional(),
});

export const reminderUpdateSchema = reminderCreateSchema.partial();

export const vaccineCreateSchema = z.object({
  petId: z.string().min(1),
  name: z.string().min(1),
  appliedAt: z.string().min(1),
  nextDoseAt: z.string().optional(),
  vetName: z.string().optional(),
  notes: z.string().optional(),
});

export const vaccineUpdateSchema = vaccineCreateSchema.partial();

export const tutorCreateSchema = z.object({
  petId: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
});

export const tutorUpdateSchema = tutorCreateSchema.partial();

export const memoryCreateSchema = z.object({
  petId: z.string().min(1),
  title: z.string().optional(),
  text: z.string().min(1),
  memoryDate: z.string().min(1),
  photoUri: z.string().optional(),
});

export const memoryUpdateSchema = memoryCreateSchema.partial();

export type PetCreateInput = z.infer<typeof petCreateSchema>;
export type ActivityTemplateCreateInput = z.infer<typeof activityTemplateCreateSchema>;
export type ActivityLogCreateInput = z.infer<typeof activityLogCreateSchema>;
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type VaccineCreateInput = z.infer<typeof vaccineCreateSchema>;
export type TutorCreateInput = z.infer<typeof tutorCreateSchema>;
export type MemoryCreateInput = z.infer<typeof memoryCreateSchema>;
