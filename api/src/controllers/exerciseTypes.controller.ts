import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';

const upsertSchema = z.object({
  slug: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  icon: z.string().default('📝'),
  description: z.string(),
  uiPattern: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function listExerciseTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const onlyActive = req.query.active === 'true';
    const types = await prisma.exerciseTypeConfig.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    ok(res, types);
  } catch (err) {
    next(err);
  }
}

export async function getExerciseType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await prisma.exerciseTypeConfig.findUnique({ where: { slug: req.params.slug } });
    if (!type) throw new NotFoundError('Exercise type');
    ok(res, type);
  } catch (err) {
    next(err);
  }
}

export async function createExerciseType(req: Request, res: Response, next: NextFunction) {
  try {
    const body = upsertSchema.parse(req.body);
    const type = await prisma.exerciseTypeConfig.create({ data: body });
    created(res, type, 'Exercise type created');
  } catch (err) {
    next(err);
  }
}

export async function updateExerciseType(req: Request, res: Response, next: NextFunction) {
  try {
    const body = upsertSchema.partial().parse(req.body);
    const type = await prisma.exerciseTypeConfig.update({
      where: { slug: req.params.slug },
      data: body,
    });
    ok(res, type);
  } catch (err) {
    next(err);
  }
}

export async function deleteExerciseType(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.exerciseTypeConfig.delete({ where: { slug: req.params.slug } });
    ok(res, null, 'Exercise type deleted');
  } catch (err) {
    next(err);
  }
}

export async function reorderExerciseTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const { slugs } = req.body as { slugs: string[] };
    await prisma.$transaction(
      slugs.map((slug, index) =>
        prisma.exerciseTypeConfig.update({ where: { slug }, data: { sortOrder: index } })
      )
    );
    ok(res, null, 'Exercise types reordered');
  } catch (err) {
    next(err);
  }
}
