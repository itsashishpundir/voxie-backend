import { Router } from 'express';
import { listVocab, lookupWord, getVocabItem, createVocab, updateVocab, deleteVocab } from '../controllers/vocabulary.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { createVocabSchema, updateVocabSchema } from '../schemas/vocabulary.schema';

const router = Router({ mergeParams: true });

// GET /api/vocabulary/lookup?word=hola&courseId=...
router.get('/lookup', optionalAuth, lookupWord);

router.get('/', optionalAuth, listVocab);
router.post('/', requireAuth, requireAdmin, validate(createVocabSchema), createVocab);
router.get('/:id', optionalAuth, getVocabItem);
router.patch('/:id', requireAuth, requireAdmin, validate(updateVocabSchema), updateVocab);
router.delete('/:id', requireAuth, requireAdmin, deleteVocab);

export default router;
