import { Router } from 'express';
import {
  listExerciseTypes, getExerciseType, createExerciseType,
  updateExerciseType, deleteExerciseType, reorderExerciseTypes,
} from '../controllers/exerciseTypes.controller';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.get('/', listExerciseTypes);                                              // public
router.get('/:slug', getExerciseType);                                           // public
router.post('/', requireAuth, requireAdmin, createExerciseType);                 // admin
router.patch('/reorder', requireAuth, requireAdmin, reorderExerciseTypes);       // admin
router.patch('/:slug', requireAuth, requireAdmin, updateExerciseType);           // admin
router.delete('/:slug', requireAuth, requireAdmin, deleteExerciseType);          // admin

export default router;
