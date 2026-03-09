import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok } from '../utils/response';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [users, courses, lessons, exercises, completions] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.exercise.count(),
      prisma.lessonCompletion.count(),
    ]);

    const recentCompletions = await prisma.lessonCompletion.findMany({
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        lesson: { select: { title: true } },
      },
    });

    const topCourses = await prisma.userProgress.groupBy({
      by: ['courseId'],
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
    });

    ok(res, { users, courses, lessons, exercises, completions, recentCompletions, topCourses });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, role } = req.query;
    const users = await prisma.user.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q as string } }, { email: { contains: q as string } }] } : {}),
        ...(role ? { role: role as any } : {}),
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true, _count: { select: { completions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    ok(res, users);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    ok(res, user);
  } catch (err) {
    next(err);
  }
}

export async function getExerciseAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    // Get all completions grouped by lesson, compute avg accuracy
    const lessonStats = await prisma.lessonCompletion.groupBy({
      by: ['lessonId'],
      _avg: { accuracy: true, stars: true },
      _count: { id: true },
      orderBy: { _avg: { accuracy: 'asc' } },
      take: 20,
    });

    const lessonIds = lessonStats.map((l) => l.lessonId);
    const lessons = await prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
      select: { id: true, title: true },
    });
    const lessonMap = new Map(lessons.map((l) => [l.id, l]));

    const result = lessonStats.map((s) => ({
      lessonId: s.lessonId,
      lessonTitle: lessonMap.get(s.lessonId)?.title ?? 'Unknown',
      avgAccuracy: Math.round(s._avg.accuracy ?? 0),
      avgStars: s._avg.stars?.toFixed(1),
      attempts: s._count.id,
    }));

    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAppConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const configs = await prisma.appConfig.findMany();
    const result = Object.fromEntries(configs.map((c) => [c.key, JSON.parse(c.value)]));
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function setAppConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, value } = req.body;
    const serialized = JSON.stringify(value);
    const config = await prisma.appConfig.upsert({
      where: { key },
      update: { value: serialized },
      create: { key, value: serialized },
    });
    ok(res, { key: config.key, value: JSON.parse(config.value) });
  } catch (err) {
    next(err);
  }
}
