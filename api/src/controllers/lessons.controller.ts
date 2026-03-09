import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError } from '../utils/errors';

function parseLesson(l: any) {
  return { ...l, newWords: JSON.parse(l.newWords ?? '[]') };
}

function serializeLesson(data: any) {
  if (data.newWords !== undefined && Array.isArray(data.newWords)) {
    return { ...data, newWords: JSON.stringify(data.newWords) };
  }
  return data;
}

export async function listLessons(req: Request, res: Response, next: NextFunction) {
  try {
    const { unitId } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';
    const lessons = await prisma.lesson.findMany({
      where: { unitId, ...(isAdmin ? {} : { isPublished: true }) },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { exercises: true } } },
    });
    ok(res, lessons.map(parseLesson));
  } catch (err) {
    next(err);
  }
}

export async function getLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        exercises: {
          where: isAdmin ? {} : {},
          orderBy: { orderIndex: 'asc' },
        },
        unit: {
          select: {
            id: true, title: true,
            course: { select: { id: true, title: true, targetLanguage: true } },
          },
        },
      },
    });

    if (!lesson) throw new NotFoundError('Lesson');
    ok(res, parseLesson(lesson));
  } catch (err) {
    next(err);
  }
}

export async function createLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const { unitId } = req.params;
    const lesson = await prisma.lesson.create({ data: { ...serializeLesson(req.body), unitId } });
    created(res, parseLesson(lesson), 'Lesson created');
  } catch (err) {
    next(err);
  }
}

export async function updateLesson(req: Request, res: Response, next: NextFunction) {
  try {
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data: serializeLesson(req.body) });
    ok(res, parseLesson(lesson));
  } catch (err) {
    next(err);
  }
}

export async function deleteLesson(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    ok(res, null, 'Lesson deleted');
  } catch (err) {
    next(err);
  }
}

export async function reorderLessons(req: Request, res: Response, next: NextFunction) {
  try {
    const { unitId } = req.params;
    const { ids } = req.body as { ids: string[] };

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.lesson.update({
          where: { id, unitId },
          data: { orderIndex: index },
        })
      )
    );

    ok(res, null, 'Lessons reordered');
  } catch (err) {
    next(err);
  }
}
