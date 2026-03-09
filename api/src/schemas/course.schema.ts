import { z } from 'zod';

export const createCourseSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  sourceLanguage: z.string().length(2),
  targetLanguage: z.string().length(2),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().url().optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial().omit({ slug: true });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
