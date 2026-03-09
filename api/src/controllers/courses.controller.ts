import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import type { CreateCourseInput, UpdateCourseInput } from '../schemas/course.schema';

function parseCourse(c: any) {
  return { ...c, tags: JSON.parse(c.tags ?? '[]') };
}

function serializeCourse(data: any) {
  if (data.tags !== undefined && Array.isArray(data.tags)) {
    return { ...data, tags: JSON.stringify(data.tags) };
  }
  return data;
}

export async function listCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const courses = await prisma.course.findMany({
      where: isAdmin ? {} : { isPublished: true },
      select: {
        id: true, slug: true, title: true, description: true,
        sourceLanguage: true, targetLanguage: true, level: true,
        difficulty: true, tags: true, isPublished: true, thumbnailUrl: true,
        version: true, createdAt: true,
        _count: { select: { units: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    ok(res, courses.map(parseCourse));
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';

    const course = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }], ...(isAdmin ? {} : { isPublished: true }) },
      include: {
        units: {
          where: isAdmin ? {} : { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: isAdmin ? {} : { isPublished: true },
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true, slug: true, title: true, xpReward: true,
                difficulty: true, estimatedMinutes: true, orderIndex: true,
                isPublished: true, newWords: true, tips: true,
                _count: { select: { exercises: true } },
              },
            },
          },
        },
      },
    });

    if (!course) throw new NotFoundError('Course');
    ok(res, parseCourse(course));
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as CreateCourseInput;
    const course = await prisma.course.create({
      data: { ...serializeCourse(data), createdById: req.user!.id },
    });
    created(res, parseCourse(course), 'Course created');
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = req.body as UpdateCourseInput;
    const course = await prisma.course.update({ where: { id }, data: serializeCourse(data) });
    ok(res, parseCourse(course));
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    ok(res, null, 'Course deleted');
  } catch (err) {
    next(err);
  }
}

export async function publishCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { isPublished: true },
    });
    ok(res, parseCourse(course), 'Course published');
  } catch (err) {
    next(err);
  }
}

export async function unpublishCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { isPublished: false },
    });
    ok(res, parseCourse(course), 'Course unpublished');
  } catch (err) {
    next(err);
  }
}
