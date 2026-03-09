import { z } from 'zod';

export const createUnitSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(100),
  description: z.string().max(300).default(''),
  icon: z.string().default('📚'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#4A90E2'),
  tips: z.array(z.string()).default([]),
  orderIndex: z.number().int().min(0),
  isPublished: z.boolean().default(true),
});

export const updateUnitSchema = createUnitSchema.partial().omit({ slug: true });

export const reorderUnitsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
