import { Router } from 'express';
import { getStats, listUsers, updateUser, getExerciseAnalytics, getAppConfig, setAppConfig } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.get('/analytics/exercises', getExerciseAnalytics);
router.get('/config', getAppConfig);
router.post('/config', setAppConfig);

export default router;
