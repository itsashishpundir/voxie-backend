import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exerciseTypes = [
  // Original 10
  { slug: 'translate',           name: 'Translate',              icon: '🔤', description: 'Pick the correct translation',               uiPattern: 'choice',        sortOrder: 0 },
  { slug: 'match',               name: 'Match Pairs',            icon: '🔗', description: 'Match words to their translations',          uiPattern: 'pair_match',    sortOrder: 1 },
  { slug: 'fill',                name: 'Fill in the Blank',      icon: '✏️', description: 'Complete the sentence',                     uiPattern: 'text_input',    sortOrder: 2 },
  { slug: 'build',               name: 'Build Sentence',         icon: '🧩', description: 'Order the words to form a sentence',        uiPattern: 'word_order',    sortOrder: 3 },
  { slug: 'listen',              name: 'Listen',                 icon: '🎧', description: 'What do you hear?',                         uiPattern: 'choice',        sortOrder: 4 },
  { slug: 'speak',               name: 'Speak',                  icon: '🎤', description: 'Pronounce the phrase',                      uiPattern: 'voice',         sortOrder: 5 },
  { slug: 'type_answer',         name: 'Type Answer',            icon: '⌨️', description: 'Type the translation',                     uiPattern: 'text_input',    sortOrder: 6 },
  { slug: 'conversation',        name: 'Conversation',           icon: '💬', description: 'Dialogue practice',                         uiPattern: 'dialogue',      sortOrder: 7 },
  { slug: 'image_select',        name: 'Image Select',           icon: '🖼️', description: 'Pick the matching image',                  uiPattern: 'choice',        sortOrder: 8 },
  { slug: 'story',               name: 'Story',                  icon: '📖', description: 'Read and answer',                           uiPattern: 'choice',        sortOrder: 9 },
  // New 13
  { slug: 'mcq',                 name: 'MCQ Quiz',               icon: '❓', description: 'Multiple choice question',                  uiPattern: 'choice',        sortOrder: 10 },
  { slug: 'sentence_building',   name: 'Sentence Building',      icon: '🏗️', description: 'Tap word tiles to build a sentence',       uiPattern: 'word_order',    sortOrder: 11 },
  { slug: 'crossword',           name: 'Crossword Puzzle',       icon: '🔲', description: 'Fill in the crossword grid',                uiPattern: 'crossword',     sortOrder: 12 },
  { slug: 'word_scramble',       name: 'Word Scramble',          icon: '🔀', description: 'Unscramble the jumbled letters',            uiPattern: 'word_scramble', sortOrder: 13 },
  { slug: 'voice_pronunciation', name: 'Voice Pronunciation',    icon: '🗣️', description: 'Pronounce and check your accuracy',        uiPattern: 'voice',         sortOrder: 14 },
  { slug: 'word_matching',       name: 'Word Matching',          icon: '🎯', description: 'Match all word pairs from a grid',          uiPattern: 'pair_match',    sortOrder: 15 },
  { slug: 'speed_tap',           name: 'Speed Word Tap',         icon: '⚡', description: 'Tap the correct words before time runs out', uiPattern: 'speed_tap',    sortOrder: 16 },
  { slug: 'flashcard',           name: 'Flashcard Flip',         icon: '🃏', description: 'Flip the card and recall the answer',       uiPattern: 'flashcard',     sortOrder: 17 },
  { slug: 'picture_word',        name: 'Picture to Word',        icon: '🖼️', description: 'See a picture, find the matching word',    uiPattern: 'choice',        sortOrder: 18 },
  { slug: 'category_sort',       name: 'Category Sort',          icon: '🗂️', description: 'Drag items into the correct category',     uiPattern: 'category_sort', sortOrder: 19 },
  { slug: 'fill_blank',          name: 'Fill in the Blanks',     icon: '📝', description: 'Choose the word that completes the blank',  uiPattern: 'choice',        sortOrder: 20 },
  { slug: 'sentence_correction', name: 'Sentence Correction',    icon: '✅', description: 'Find and fix the error in the sentence',    uiPattern: 'correction',    sortOrder: 21 },
  { slug: 'word_order',          name: 'Word Order Puzzle',      icon: '🔢', description: 'Arrange shuffled words in the right order', uiPattern: 'word_order',    sortOrder: 22 },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const et of exerciseTypes) {
    const existing = await prisma.exerciseTypeConfig.findUnique({ where: { slug: et.slug } });
    if (existing) {
      await prisma.exerciseTypeConfig.update({ where: { slug: et.slug }, data: et });
      updated++;
    } else {
      await prisma.exerciseTypeConfig.create({ data: et });
      created++;
    }
  }

  console.log(`[seed-exercise-types] Created: ${created}, Updated: ${updated}`);
  console.log(`[seed-exercise-types] Total: ${exerciseTypes.length} exercise types`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
