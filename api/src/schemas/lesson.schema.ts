import { z } from 'zod';

const LESSON_TYPES = ['mixed', 'learning', 'mcq', 'fill_blank', 'build_sentence', 'listen', 'speak', 'match', 'story', 'conversation', 'review'] as const;

export const createLessonSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(100),
  lessonType: z.enum(LESSON_TYPES).default('mixed'),
  xpReward: z.number().int().min(0).default(50),
  difficulty: z.number().int().min(1).max(5).default(1),
  tips: z.string().optional().nullable(),
  newWords: z.array(z.string()).default([]),
  orderIndex: z.number().int().min(0),
  isPublished: z.boolean().default(true),
  estimatedMinutes: z.number().int().min(1).max(60).default(5),
});

export const updateLessonSchema = createLessonSchema.partial().omit({ slug: true });

export const reorderLessonsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
