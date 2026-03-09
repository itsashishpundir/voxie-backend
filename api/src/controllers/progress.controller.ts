import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import type { CompleteLessonInput, VocabAttemptInput } from '../schemas/progress.schema';

async function getOrCreateProgress(userId: string, courseId: string) {
  return prisma.userProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });
}

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const progress = await getOrCreateProgress(req.user!.id, courseId);
    ok(res, progress);
  } catch (err) {
    next(err);
  }
}

export async function completeLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;
    const { stars, xpEarned, accuracy, isPerfect, maxCombo } = req.body as CompleteLessonInput;
    const userId = req.user!.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { unit: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundError('Lesson');

    const courseId = lesson.unit.courseId;
    const progress = await getOrCreateProgress(userId, courseId);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Streak logic
    let newStreak = progress.currentStreak;
    if (progress.lastCompletedDate) {
      const last = new Date(progress.lastCompletedDate);
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diff = Math.round((today.getTime() - lastDay.getTime()) / 86400000);
      if (diff === 1) newStreak += 1;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, progress.longestStreak);
    const newBestCombo = Math.max(maxCombo, progress.bestCombo);

    const [updatedProgress, completion] = await prisma.$transaction([
      prisma.userProgress.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          totalXp: { increment: xpEarned },
          currentStreak: newStreak,
          longestStreak: newLongest,
          lessonsCompletedToday: { increment: 1 },
          lastCompletedDate: now,
          bestCombo: newBestCombo,
          perfectLessons: isPerfect ? { increment: 1 } : undefined,
        },
      }),
      prisma.lessonCompletion.create({
        data: { userId, lessonId, stars, xpEarned, accuracy, isPerfect },
      }),
    ]);

    // Update weekly leaderboard
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    await prisma.leaderboardEntry.upsert({
      where: { userId_courseId_weekStart: { userId, courseId, weekStart } },
      update: { weekXp: { increment: xpEarned } },
      create: { userId, courseId, weekStart, weekXp: xpEarned },
    });

    ok(res, { progress: updatedProgress, completion });
  } catch (err) {
    next(err);
  }
}

export async function recordVocabAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const { vocabId, correct } = req.body as VocabAttemptInput;
    const userId = req.user!.id;

    const existing = await prisma.vocabProgress.findUnique({
      where: { userId_vocabId: { userId, vocabId } },
    });

    // SM-2 spaced repetition: adjust ease factor and next review date
    const attempts = (existing?.attempts ?? 0) + 1;
    const correctCount = (existing?.correctCount ?? 0) + (correct ? 1 : 0);
    let easeFactor = existing?.easeFactor ?? 2.5;

    if (correct) {
      easeFactor = Math.min(2.5, easeFactor + 0.1);
    } else {
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const intervalDays = correct ? Math.round(easeFactor * (attempts || 1)) : 1;
    const nextReviewAt = new Date(Date.now() + intervalDays * 86400000);

    await prisma.vocabProgress.upsert({
      where: { userId_vocabId: { userId, vocabId } },
      update: { attempts, correctCount, lastSeenAt: new Date(), nextReviewAt, easeFactor },
      create: { userId, vocabId, attempts, correctCount, lastSeenAt: new Date(), nextReviewAt, easeFactor },
    });

    ok(res, { attempts, correctCount, nextReviewAt });
  } catch (err) {
    next(err);
  }
}

export async function getReviewWords(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.query;
    const userId = req.user!.id;

    const due = await prisma.vocabProgress.findMany({
      where: {
        userId,
        nextReviewAt: { lte: new Date() },
        vocab: courseId ? { courseId: courseId as string } : {},
      },
      include: {
        vocab: true,
      },
      orderBy: { nextReviewAt: 'asc' },
      take: 20,
    });

    // If fewer than 5 due, pad with unseen words
    if (due.length < 5 && courseId) {
      const seenIds = due.map((d) => d.vocabId);
      const unseen = await prisma.vocabulary.findMany({
        where: {
          courseId: courseId as string,
          id: { notIn: seenIds },
          vocabProgress: { none: { userId } },
        },
        take: 20 - due.length,
        orderBy: { difficulty: 'asc' },
      });

      return ok(res, {
        due: due.map((d) => d.vocab),
        unseen,
      });
    }

    ok(res, { due: due.map((d) => d.vocab), unseen: [] });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const updated = await prisma.userProgress.update({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      data: req.body,
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

export async function loseHeart(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const progress = await getOrCreateProgress(req.user!.id, courseId);
    const newHearts = Math.max(0, progress.hearts - 1);

    const updated = await prisma.userProgress.update({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      data: { hearts: newHearts, lastHeartLossTime: new Date() },
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
}
