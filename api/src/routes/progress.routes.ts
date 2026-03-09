import { Router } from 'express';
import { getProgress, completeLesson, recordVocabAttempt, getReviewWords, updateSettings, loseHeart } from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { completeLessonSchema, vocabAttemptSchema, updateSettingsSchema } from '../schemas/progress.schema';

const router = Router();

router.get('/review-words', requireAuth, getReviewWords);
router.get('/:courseId', requireAuth, getProgress);
router.patch('/:courseId/settings', requireAuth, validate(updateSettingsSchema), updateSettings);
router.post('/:courseId/lose-heart', requireAuth, loseHeart);
router.post('/lessons/:lessonId/complete', requireAuth, validate(completeLessonSchema), completeLesson);
router.post('/vocab/attempt', requireAuth, validate(vocabAttemptSchema), recordVocabAttempt);

export default router;
