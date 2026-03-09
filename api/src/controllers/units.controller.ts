import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError } from '../utils/errors';

function parseUnit(u: any) {
  return { ...u, tips: JSON.parse(u.tips ?? '[]') };
}

function serializeUnit(data: any) {
  if (data.tips !== undefined && Array.isArray(data.tips)) {
    return { ...data, tips: JSON.stringify(data.tips) };
  }
  return data;
}

export async function listUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const isAdmin = req.user?.role === 'ADMIN';
    const units = await prisma.unit.findMany({
      where: { courseId, ...(isAdmin ? {} : { isPublished: true }) },
      orderBy: { orderIndex: 'asc' },
      include: { _count: { select: { lessons: true } } },
    });
    ok(res, units.map(parseUnit));
  } catch (err) {
    next(err);
  }
}

export async function getUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: { orderBy: { orderIndex: 'asc' }, include: { _count: { select: { exercises: true } } } },
      },
    });
    if (!unit) throw new NotFoundError('Unit');
    ok(res, parseUnit(unit));
  } catch (err) {
    next(err);
  }
}

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const unit = await prisma.unit.create({ data: { ...serializeUnit(req.body), courseId } });
    created(res, parseUnit(unit), 'Unit created');
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const unit = await prisma.unit.update({ where: { id: req.params.id }, data: serializeUnit(req.body) });
    ok(res, parseUnit(unit));
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.unit.delete({ where: { id: req.params.id } });
    ok(res, null, 'Unit deleted');
  } catch (err) {
    next(err);
  }
}

export async function reorderUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const { ids } = req.body as { ids: string[] };

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.unit.update({
          where: { id, courseId },
          data: { orderIndex: index },
        })
      )
    );

    ok(res, null, 'Units reordered');
  } catch (err) {
    next(err);
  }
}
