import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@voxie.app';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';
  const name = process.env.SEED_ADMIN_NAME ?? 'Voxie Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { email, passwordHash, name, role: 'ADMIN' },
  });

  // Create demo Spanish course
  const course = await prisma.course.create({
    data: {
      slug: 'spanish-basics',
      title: 'Spanish Basics',
      description: 'Learn essential Spanish for beginners — greetings, numbers, food, and more.',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      level: 'A1',
      difficulty: 'beginner',
      tags: JSON.stringify(['spanish', 'beginner', 'a1']),
      isPublished: true,
      createdById: admin.id,
    },
  });

  // Unit 1
  const unit1 = await prisma.unit.create({
    data: {
      courseId: course.id,
      slug: 'greetings',
      title: 'Greetings',
      description: 'Say hello and goodbye in Spanish',
      icon: '👋',
      color: '#4A90E2',
      orderIndex: 0,
      tips: JSON.stringify([
        'Spanish has formal (usted) and informal (tú) ways to address people.',
        '"Buenos días" is used until noon, "buenas tardes" until sunset.',
      ]),
    },
  });

  // Lesson 1-1
  const lesson = await prisma.lesson.create({
    data: {
      unitId: unit1.id,
      slug: 'hello-goodbye',
      title: 'Hello & Goodbye',
      xpReward: 50,
      difficulty: 1,
      orderIndex: 0,
      estimatedMinutes: 5,
    },
  });

  // Exercises
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson.id, orderIndex: 0,
        type: 'translate', prompt: 'What does this mean?',
        data: JSON.stringify({ question: 'Hola', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correctIndex: 0 }),
        explanation: '"Hola" is the most common Spanish greeting, used any time of day.',
      },
      {
        lessonId: lesson.id, orderIndex: 1,
        type: 'translate', prompt: 'What does this mean?',
        data: JSON.stringify({ question: 'Adiós', options: ['Hello', 'Goodbye', 'Yes', 'No'], correctIndex: 1 }),
        explanation: '"Adiós" is the standard farewell in Spanish.',
      },
      {
        lessonId: lesson.id, orderIndex: 2,
        type: 'match', prompt: 'Match the pairs',
        data: JSON.stringify({
          pairs: [
            { left: 'Hola', right: 'Hello' },
            { left: 'Adiós', right: 'Goodbye' },
            { left: 'Buenos días', right: 'Good morning' },
            { left: 'Buenas noches', right: 'Good night' },
          ],
        }),
      },
      {
        lessonId: lesson.id, orderIndex: 3,
        type: 'build', prompt: 'Put the words in the correct order',
        data: JSON.stringify({
          words: ['me', 'llamo', 'Carlos', 'Yo'],
          correctOrder: ['Yo', 'me', 'llamo', 'Carlos'],
        }),
        explanation: '"Yo me llamo Carlos" means "My name is Carlos".',
      },
      {
        lessonId: lesson.id, orderIndex: 4,
        type: 'type_answer', prompt: 'How do you say "Good morning" in Spanish?',
        data: JSON.stringify({
          question: 'Good morning',
          acceptedAnswers: ['Buenos días', 'buenos días', 'Buenos dias', 'buenos dias'],
          caseSensitive: false,
        }),
        hint: 'Think of "good" (buenos) + "days" (días)',
      },
    ],
  });

  // Vocab
  await prisma.vocabulary.createMany({
    data: [
      { courseId: course.id, word: 'hola', translation: 'hello', partOfSpeech: 'interjection', difficulty: 1, tags: JSON.stringify(['greetings']) },
      { courseId: course.id, word: 'adiós', translation: 'goodbye', partOfSpeech: 'interjection', difficulty: 1, tags: JSON.stringify(['greetings']) },
      { courseId: course.id, word: 'buenos días', translation: 'good morning', partOfSpeech: 'phrase', difficulty: 1, tags: JSON.stringify(['greetings', 'time']) },
      { courseId: course.id, word: 'buenas tardes', translation: 'good afternoon', partOfSpeech: 'phrase', difficulty: 1, tags: JSON.stringify(['greetings', 'time']) },
      { courseId: course.id, word: 'buenas noches', translation: 'good night', partOfSpeech: 'phrase', difficulty: 1, tags: JSON.stringify(['greetings', 'time']) },
      { courseId: course.id, word: 'gracias', translation: 'thank you', partOfSpeech: 'interjection', difficulty: 1, tags: JSON.stringify(['basics']) },
      { courseId: course.id, word: 'por favor', translation: 'please', partOfSpeech: 'phrase', difficulty: 1, tags: JSON.stringify(['basics']) },
      { courseId: course.id, word: 'sí', translation: 'yes', partOfSpeech: 'adverb', difficulty: 1, tags: JSON.stringify(['basics']) },
      { courseId: course.id, word: 'no', translation: 'no', partOfSpeech: 'adverb', difficulty: 1, tags: JSON.stringify(['basics']) },
    ],
  });

  // Exercise type registry
  const exerciseTypes = [
    // ── Original 10 ──────────────────────────────────────────────────────────
    { slug: 'translate',           name: 'Translate',              icon: '🔤', description: 'Pick the correct translation',             uiPattern: 'choice',        sortOrder: 0 },
    { slug: 'match',               name: 'Match Pairs',            icon: '🔗', description: 'Match words to their translations',        uiPattern: 'pair_match',    sortOrder: 1 },
    { slug: 'fill',                name: 'Fill in the Blank',      icon: '✏️', description: 'Complete the sentence',                   uiPattern: 'text_input',    sortOrder: 2 },
    { slug: 'build',               name: 'Build Sentence',         icon: '🧩', description: 'Order the words to form a sentence',      uiPattern: 'word_order',    sortOrder: 3 },
    { slug: 'listen',              name: 'Listen',                 icon: '🎧', description: 'What do you hear?',                       uiPattern: 'choice',        sortOrder: 4 },
    { slug: 'speak',               name: 'Speak',                  icon: '🎤', description: 'Pronounce the phrase',                    uiPattern: 'voice',         sortOrder: 5 },
    { slug: 'type_answer',         name: 'Type Answer',            icon: '⌨️', description: 'Type the translation',                   uiPattern: 'text_input',    sortOrder: 6 },
    { slug: 'conversation',        name: 'Conversation',           icon: '💬', description: 'Dialogue practice',                       uiPattern: 'dialogue',      sortOrder: 7 },
    { slug: 'image_select',        name: 'Image Select',           icon: '🖼️', description: 'Pick the matching image',                uiPattern: 'choice',        sortOrder: 8 },
    { slug: 'story',               name: 'Story',                  icon: '📖', description: 'Read and answer',                         uiPattern: 'choice',        sortOrder: 9 },
    // ── New 13 ───────────────────────────────────────────────────────────────
    { slug: 'mcq',                 name: 'MCQ Quiz',               icon: '❓', description: 'Multiple choice question',                uiPattern: 'choice',        sortOrder: 10 },
    { slug: 'sentence_building',   name: 'Sentence Building',      icon: '🏗️', description: 'Tap word tiles to build a sentence',     uiPattern: 'word_order',    sortOrder: 11 },
    { slug: 'crossword',           name: 'Crossword Puzzle',       icon: '🔲', description: 'Fill in the crossword grid',              uiPattern: 'crossword',     sortOrder: 12 },
    { slug: 'word_scramble',       name: 'Word Scramble',          icon: '🔀', description: 'Unscramble the jumbled letters',          uiPattern: 'word_scramble', sortOrder: 13 },
    { slug: 'voice_pronunciation', name: 'Voice Pronunciation',    icon: '🗣️', description: 'Pronounce and check your accuracy',      uiPattern: 'voice',         sortOrder: 14 },
    { slug: 'word_matching',       name: 'Word Matching',          icon: '🎯', description: 'Match all word pairs from a grid',        uiPattern: 'pair_match',    sortOrder: 15 },
    { slug: 'speed_tap',           name: 'Speed Word Tap',         icon: '⚡', description: 'Tap the correct words before time runs out', uiPattern: 'speed_tap', sortOrder: 16 },
    { slug: 'flashcard',           name: 'Flashcard Flip',         icon: '🃏', description: 'Flip the card and recall the answer',     uiPattern: 'flashcard',     sortOrder: 17 },
    { slug: 'picture_word',        name: 'Picture to Word',        icon: '🖼️', description: 'See a picture, find the matching word',  uiPattern: 'choice',        sortOrder: 18 },
    { slug: 'category_sort',       name: 'Category Sort',          icon: '🗂️', description: 'Drag items into the correct category',   uiPattern: 'category_sort', sortOrder: 19 },
    { slug: 'fill_blank',          name: 'Fill in the Blanks',     icon: '📝', description: 'Choose the word that completes the blank', uiPattern: 'choice',      sortOrder: 20 },
    { slug: 'sentence_correction', name: 'Sentence Correction',    icon: '✅', description: 'Find and fix the error in the sentence',  uiPattern: 'correction',    sortOrder: 21 },
    { slug: 'word_order',          name: 'Word Order Puzzle',      icon: '🔢', description: 'Arrange shuffled words in the right order', uiPattern: 'word_order',  sortOrder: 22 },
  ];

  for (const et of exerciseTypes) {
    await prisma.exerciseTypeConfig.upsert({
      where: { slug: et.slug },
      create: et,
      update: { name: et.name, icon: et.icon, description: et.description, uiPattern: et.uiPattern, sortOrder: et.sortOrder },
    });
  }

  // Default app config
  await prisma.appConfig.createMany({
    data: [
      { key: 'hearts_per_refill', value: JSON.stringify(1) },
      { key: 'heart_refill_minutes', value: JSON.stringify(30) },
      { key: 'max_hearts', value: JSON.stringify(5) },
      { key: 'daily_challenge_enabled', value: JSON.stringify(true) },
      { key: 'double_xp_weekend', value: JSON.stringify(false) },
      { key: 'min_app_version', value: JSON.stringify('1.0.0') },
    ],
  });

  console.log(`[seed] Admin created: ${email}`);
  console.log(`[seed] Course created: ${course.slug}`);
  console.log('[seed] Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
