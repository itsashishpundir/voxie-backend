import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError } from '../utils/errors';

function parseVocab(v: any) {
  return { ...v, tags: JSON.parse(v.tags ?? '[]') };
}

function serializeVocab(data: any) {
  if (data.tags !== undefined && Array.isArray(data.tags)) {
    return { ...data, tags: JSON.stringify(data.tags) };
  }
  return data;
}

export async function listVocab(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const { q, tag, difficulty } = req.query;

    const vocab = await prisma.vocabulary.findMany({
      where: {
        courseId,
        ...(q ? { OR: [{ word: { contains: q as string } }, { translation: { contains: q as string } }] } : {}),
        ...(tag ? { tags: { contains: `"${tag}"` } } : {}),
        ...(difficulty ? { difficulty: parseInt(difficulty as string) } : {}),
      },
      orderBy: { word: 'asc' },
    });

    ok(res, vocab.map(parseVocab));
  } catch (err) {
    next(err);
  }
}

export async function lookupWord(req: Request, res: Response, next: NextFunction) {
  try {
    const { word, courseId } = req.query;

    const vocab = await prisma.vocabulary.findFirst({
      where: {
        word: { equals: word as string },
        ...(courseId ? { courseId: courseId as string } : {}),
      },
    });

    ok(res, vocab ? parseVocab(vocab) : null);
  } catch (err) {
    next(err);
  }
}

export async function getVocabItem(req: Request, res: Response, next: NextFunction) {
  try {
    const vocab = await prisma.vocabulary.findUnique({ where: { id: req.params.id } });
    if (!vocab) throw new NotFoundError('Vocabulary item');
    ok(res, parseVocab(vocab));
  } catch (err) {
    next(err);
  }
}

export async function createVocab(req: Request, res: Response, next: NextFunction) {
  try {
    const vocab = await prisma.vocabulary.create({
      data: { ...serializeVocab(req.body), courseId: req.params.courseId },
    });
    created(res, parseVocab(vocab), 'Vocabulary item created');
  } catch (err) {
    next(err);
  }
}

export async function updateVocab(req: Request, res: Response, next: NextFunction) {
  try {
    const vocab = await prisma.vocabulary.update({
      where: { id: req.params.id },
      data: serializeVocab(req.body),
    });
    ok(res, parseVocab(vocab));
  } catch (err) {
    next(err);
  }
}

export async function deleteVocab(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.vocabulary.delete({ where: { id: req.params.id } });
    ok(res, null, 'Vocabulary item deleted');
  } catch (err) {
    next(err);
  }
}
