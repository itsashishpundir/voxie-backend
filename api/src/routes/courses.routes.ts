import { Router } from 'express';
import {
  listCourses, getCourse, createCourse, updateCourse,
  deleteCourse, publishCourse, unpublishCourse,
} from '../controllers/courses.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { createCourseSchema, updateCourseSchema } from '../schemas/course.schema';

const router = Router();

router.get('/', optionalAuth, listCourses);
router.get('/:id', optionalAuth, getCourse);
router.post('/', requireAuth, requireAdmin, validate(createCourseSchema), createCourse);
router.patch('/:id', requireAuth, requireAdmin, validate(updateCourseSchema), updateCourse);
router.delete('/:id', requireAuth, requireAdmin, deleteCourse);
router.post('/:id/publish', requireAuth, requireAdmin, publishCourse);
router.post('/:id/unpublish', requireAuth, requireAdmin, unpublishCourse);

export default router;
