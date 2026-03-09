import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getLeaderboard);

export default router;
