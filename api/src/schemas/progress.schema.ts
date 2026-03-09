import { z } from 'zod';

export const completeLessonSchema = z.object({
  stars: z.number().int().min(1).max(3),
  xpEarned: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  isPerfect: z.boolean(),
  maxCombo: z.number().int().min(0).default(0),
});

export const vocabAttemptSchema = z.object({
  vocabId: z.string(),
  correct: z.boolean(),
});

export const updateSettingsSchema = z.object({
  dailyGoal: z.number().int().min(1).max(20).optional(),
  darkMode: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
});

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type VocabAttemptInput = z.infer<typeof vocabAttemptSchema>;
