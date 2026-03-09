import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const EXERCISE_TYPES = [
  // Original 10
  { value: 'translate',           label: 'Translate',           icon: '🔤', desc: 'Pick the correct translation' },
  { value: 'match',               label: 'Match Pairs',         icon: '🔗', desc: 'Match words to translations' },
  { value: 'fill',                label: 'Fill in the Blank',   icon: '✏️', desc: 'Complete the sentence' },
  { value: 'build',               label: 'Build Sentence',      icon: '🧩', desc: 'Order the words' },
  { value: 'listen',              label: 'Listen',              icon: '🎧', desc: 'What do you hear?' },
  { value: 'speak',               label: 'Speak',               icon: '🎤', desc: 'Pronounce the phrase' },
  { value: 'type_answer',         label: 'Type Answer',         icon: '⌨️', desc: 'Type the translation' },
  { value: 'conversation',        label: 'Conversation',        icon: '💬', desc: 'Dialogue practice' },
  { value: 'image_select',        label: 'Image Select',        icon: '🖼️', desc: 'Pick the matching image' },
  { value: 'story',               label: 'Story',               icon: '📖', desc: 'Read and answer' },
  // New 13
  { value: 'mcq',                 label: 'MCQ Quiz',            icon: '❓', desc: 'Multiple choice question' },
  { value: 'sentence_building',   label: 'Sentence Building',   icon: '🏗️', desc: 'Tap tiles to build a sentence' },
  { value: 'crossword',           label: 'Crossword Puzzle',    icon: '🔲', desc: 'Fill in the crossword grid' },
  { value: 'word_scramble',       label: 'Word Scramble',       icon: '🔀', desc: 'Unscramble the jumbled letters' },
  { value: 'voice_pronunciation', label: 'Voice Pronunciation', icon: '🗣️', desc: 'Pronounce and check accuracy' },
  { value: 'word_matching',       label: 'Word Matching',       icon: '🎯', desc: 'Match all word pairs' },
  { value: 'speed_tap',           label: 'Speed Word Tap',      icon: '⚡', desc: 'Tap correct words fast' },
  { value: 'flashcard',           label: 'Flashcard Flip',      icon: '🃏', desc: 'Flip and recall the answer' },
  { value: 'picture_word',        label: 'Picture to Word',     icon: '🖼️', desc: 'See a picture, find the word' },
  { value: 'category_sort',       label: 'Category Sort',       icon: '🗂️', desc: 'Sort items into categories' },
  { value: 'fill_blank',          label: 'Fill in the Blanks',  icon: '📝', desc: 'Choose the word for the blank' },
  { value: 'sentence_correction', label: 'Sentence Correction', icon: '✅', desc: 'Find and fix the error' },
  { value: 'word_order',          label: 'Word Order Puzzle',   icon: '🔢', desc: 'Arrange words in correct order' },
] as const;

export type ExerciseTypeName = (typeof EXERCISE_TYPES)[number]['value'];
