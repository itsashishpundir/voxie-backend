import { z } from 'zod';

export const createVocabSchema = z.object({
  word: z.string().min(1).max(100),
  translation: z.string().min(1).max(200),
  audioUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'conjunction', 'interjection', 'phrase']).optional().nullable(),
  gender: z.enum(['masculine', 'feminine', 'neuter']).optional().nullable(),
  plural: z.string().optional().nullable(),
  example: z.string().optional().nullable(),
  conjugationNotes: z.string().optional().nullable(),
  difficulty: z.number().int().min(1).max(5).default(1),
  tags: z.array(z.string()).default([]),
});

export const updateVocabSchema = createVocabSchema.partial();

export type CreateVocabInput = z.infer<typeof createVocabSchema>;
export type UpdateVocabInput = z.infer<typeof updateVocabSchema>;
