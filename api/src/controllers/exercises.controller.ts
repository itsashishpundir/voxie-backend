import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ok, created } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/errors';
import { exerciseDataSchemas, type ExerciseTypeName } from '../schemas/exercise.schema';

function parseExercise(e: any) {
  return { ...e, data: JSON.parse(e.data) };
}

function validateExerciseData(type: ExerciseTypeName, data: unknown) {
  const schema = exerciseDataSchemas[type];
  if (!schema) throw new ValidationError(`Unknown exercise type: ${type}`);
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(`Invalid data for type "${type}": ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export async function listExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { lessonId: req.params.lessonId },
      orderBy: { orderIndex: 'asc' },
    });
    ok(res, exercises.map(parseExercise));
  } catch (err) {
    next(err);
  }
}

export async function getExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const exercise = await prisma.exercise.findUnique({ where: { id: req.params.id } });
    if (!exercise) throw new NotFoundError('Exercise');
    ok(res, parseExercise(exercise));
  } catch (err) {
    next(err);
  }
}

export async function createExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;
    const { type, data, ...rest } = req.body;

    const validatedData = validateExerciseData(type as ExerciseTypeName, data);

    const exercise = await prisma.exercise.create({
      data: { ...rest, type, data: JSON.stringify(validatedData), lessonId },
    });
    created(res, parseExercise(exercise), 'Exercise created');
  } catch (err) {
    next(err);
  }
}

export async function updateExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, data, ...rest } = req.body;
    let validatedData = data;

    if (type && data) {
      validatedData = validateExerciseData(type as ExerciseTypeName, data);
    }

    const exercise = await prisma.exercise.update({
      where: { id: req.params.id },
      data: { ...rest, ...(type && { type }), ...(validatedData && { data: JSON.stringify(validatedData) }) },
    });
    ok(res, parseExercise(exercise));
  } catch (err) {
    next(err);
  }
}

export async function deleteExercise(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.exercise.delete({ where: { id: req.params.id } });
    ok(res, null, 'Exercise deleted');
  } catch (err) {
    next(err);
  }
}

export async function reorderExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;
    const { ids } = req.body as { ids: string[] };

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.exercise.update({
          where: { id, lessonId },
          data: { orderIndex: index },
        })
      )
    );

    ok(res, null, 'Exercises reordered');
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const { lessonId } = req.params;
    const { exercises } = req.body as { exercises: any[] };

    const validated = exercises.map((ex) => ({
      ...ex,
      lessonId,
      data: JSON.stringify(validateExerciseData(ex.type as ExerciseTypeName, ex.data)),
    }));

    await prisma.exercise.createMany({ data: validated });
    ok(res, { count: validated.length }, `${validated.length} exercises created`);
  } catch (err) {
    next(err);
  }
}
