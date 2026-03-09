import { Router } from 'express';
import {
  listExercises, getExercise, createExercise, updateExercise,
  deleteExercise, reorderExercises, bulkCreateExercises,
} from '../controllers/exercises.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { createExerciseSchema, updateExerciseSchema, reorderExercisesSchema, bulkCreateExercisesSchema } from '../schemas/exercise.schema';

const router = Router({ mergeParams: true });

router.get('/', optionalAuth, listExercises);
router.post('/', requireAuth, requireAdmin, validate(createExerciseSchema), createExercise);
router.post('/bulk', requireAuth, requireAdmin, validate(bulkCreateExercisesSchema), bulkCreateExercises);
router.post('/reorder', requireAuth, requireAdmin, validate(reorderExercisesSchema), reorderExercises);
router.get('/:id', optionalAuth, getExercise);
router.patch('/:id', requireAuth, requireAdmin, validate(updateExerciseSchema), updateExercise);
router.delete('/:id', requireAuth, requireAdmin, deleteExercise);

export default router;
