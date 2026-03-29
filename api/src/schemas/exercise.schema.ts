import { z } from 'zod';

// ── Existing type schemas ────────────────────────────────────────────────────

const translateData = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  audioUrl: z.string().optional(),
});

const matchData = z.object({
  pairs: z.array(z.object({ left: z.string(), right: z.string() })).min(2).max(8),
});

const fillData = z.object({
  sentence: z.string(), // contains ___ for blank
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  translation: z.string().optional(),
  audioUrl: z.string().optional(),
});

const buildData = z.object({
  words: z.array(z.string()).min(2),
  correctOrder: z.array(z.string()).min(2),
  translation: z.string().optional(), // English meaning shown to user
  audioUrl: z.string().optional(),
});

const listenData = z.object({
  audioUrl: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  correctText: z.string(),
});

const speakData = z.object({
  targetText: z.string(),
  targetAudioUrl: z.string().optional(),
  acceptedPronunciations: z.array(z.string()).optional(),
});

const typeAnswerData = z.object({
  question: z.string(),
  acceptedAnswers: z.array(z.string()).min(1),
  audioUrl: z.string().optional(),
  caseSensitive: z.boolean().default(false),
});

const conversationData = z.object({
  characterName: z.string(),
  characterAvatar: z.string().optional(),
  turns: z.array(
    z.object({
      speaker: z.enum(['char', 'user']),
      text: z.string(),
      audioUrl: z.string().optional(),
    })
  ).min(2),
  userTurnIndex: z.number().int().min(0),
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

const imageSelectData = z.object({
  imageUrl: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

const storyData = z.object({
  storyText: z.string().min(10),
  audioUrl: z.string().optional(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0),
});

// ── New type schemas ─────────────────────────────────────────────────────────

// MCQ Quiz — general multiple choice (not translation-specific)
const mcqData = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
});

// Sentence Building — tap word tiles to build the sentence
const sentenceBuildingData = z.object({
  prompt: z.string(),
  wordBank: z.array(z.string()).min(2),
  correctSentence: z.string(),
  translation: z.string().optional(),
});

// Crossword Puzzle — mini crossword
const crosswordData = z.object({
  gridSize: z.number().int().min(4).max(15).default(8),
  words: z.array(z.object({
    word: z.string(),
    clue: z.string(),
    direction: z.enum(['across', 'down']),
    startRow: z.number().int().min(0),
    startCol: z.number().int().min(0),
  })).min(2),
});

// Word Scramble — unscramble jumbled letters to form the word
const wordScrambleData = z.object({
  scrambledWord: z.string(),
  correctWord: z.string(),
  hint: z.string().optional(),
  audioUrl: z.string().optional(),
});

// Voice Pronunciation Check — record and check pronunciation
const voicePronunciationData = z.object({
  targetText: z.string(),
  targetAudioUrl: z.string().optional(),
  acceptedPronunciations: z.array(z.string()).optional(),
  language: z.string().optional(), // e.g. "es-ES"
});

// Word Matching — match all word pairs at once from a grid
const wordMatchingData = z.object({
  pairs: z.array(z.object({ word: z.string(), match: z.string() })).min(2).max(8),
  timeLimit: z.number().int().optional(), // seconds
});

// Speed Word Tap — tap all correct words before time runs out
const speedTapData = z.object({
  instruction: z.string(), // e.g. "Tap all Spanish greetings"
  wordList: z.array(z.string()).min(4).max(16),
  correctIndices: z.array(z.number().int().min(0)),
  timeLimit: z.number().int().min(5).max(60).default(15),
});

// Flashcard Flip Game — flip and recall
const flashcardData = z.object({
  front: z.string(),
  back: z.string(),
  frontAudioUrl: z.string().optional(),
  backAudioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Picture to Word Match — see a picture, pick/type the word
const pictureWordData = z.object({
  imageUrl: z.string(),
  correctWord: z.string(),
  options: z.array(z.string()).min(2).max(6).optional(),
  audioUrl: z.string().optional(),
});

// Category Sort Game — drag items into the right category
const categorySortData = z.object({
  categories: z.array(z.object({
    name: z.string(),
    color: z.string().optional(),
  })).min(2).max(4),
  items: z.array(z.object({
    text: z.string(),
    categoryIndex: z.number().int().min(0),
    imageUrl: z.string().optional(),
  })).min(4),
});

// Fill in the Blanks — fill blank with multiple choice options
const fillBlankData = z.object({
  sentence: z.string(), // contains ___ for blank
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  translation: z.string().optional(),
  audioUrl: z.string().optional(),
});

// Sentence Correction — find and fix the error in the sentence
const sentenceCorrectionData = z.object({
  incorrectSentence: z.string(),
  correctSentence: z.string(),
  translation: z.string().optional(), // English meaning of the correct sentence
  errorType: z.string().optional(), // e.g. "grammar", "spelling", "word order"
  explanation: z.string().optional(),
});

// Word Order Puzzle — arrange shuffled words into correct order
const wordOrderData = z.object({
  words: z.array(z.string()).min(2),
  correctOrder: z.array(z.string()).min(2),
  translation: z.string().optional(),
  audioUrl: z.string().optional(),
});

// ── Map type → data schema ────────────────────────────────────────────────

export const exerciseDataSchemas = {
  // Original 10
  translate: translateData,
  match: matchData,
  fill: fillData,
  build: buildData,
  listen: listenData,
  speak: speakData,
  type_answer: typeAnswerData,
  conversation: conversationData,
  image_select: imageSelectData,
  story: storyData,
  // New 13
  mcq: mcqData,
  sentence_building: sentenceBuildingData,
  crossword: crosswordData,
  word_scramble: wordScrambleData,
  voice_pronunciation: voicePronunciationData,
  word_matching: wordMatchingData,
  speed_tap: speedTapData,
  flashcard: flashcardData,
  picture_word: pictureWordData,
  category_sort: categorySortData,
  fill_blank: fillBlankData,
  sentence_correction: sentenceCorrectionData,
  word_order: wordOrderData,
} as const;

export type ExerciseTypeName = keyof typeof exerciseDataSchemas;

// ── Top-level schemas ─────────────────────────────────────────────────────

export const createExerciseSchema = z.object({
  type: z.enum([
    'translate', 'match', 'fill', 'build', 'listen', 'speak',
    'type_answer', 'conversation', 'image_select', 'story',
    'mcq', 'sentence_building', 'crossword', 'word_scramble',
    'voice_pronunciation', 'word_matching', 'speed_tap', 'flashcard',
    'picture_word', 'category_sort', 'fill_blank', 'sentence_correction', 'word_order',
  ]),
  prompt: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0),
  difficulty: z.number().int().min(1).max(5).default(1),
  hint: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  data: z.record(z.unknown()),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const reorderExercisesSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export const bulkCreateExercisesSchema = z.object({
  exercises: z.array(createExerciseSchema).min(1).max(50),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
