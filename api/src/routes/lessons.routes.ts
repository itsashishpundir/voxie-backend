import { Router } from 'express';
import { listLessons, getLesson, createLesson, updateLesson, deleteLesson, reorderLessons } from '../controllers/lessons.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema } from '../schemas/lesson.schema';

const router = Router({ mergeParams: true });

router.get('/', optionalAuth, listLessons);
router.post('/', requireAuth, requireAdmin, validate(createLessonSchema), createLesson);
router.post('/reorder', requireAuth, requireAdmin, validate(reorderLessonsSchema), reorderLessons);
router.get('/:id', optionalAuth, getLesson);
router.patch('/:id', requireAuth, requireAdmin, validate(updateLessonSchema), updateLesson);
router.delete('/:id', requireAuth, requireAdmin, deleteLesson);

export default router;
