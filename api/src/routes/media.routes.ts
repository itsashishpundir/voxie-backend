import { Router } from 'express';
import { uploadMedia, listMedia, deleteMedia } from '../controllers/media.controller';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', requireAuth, requireAdmin, listMedia);
router.post('/upload', requireAuth, requireAdmin, upload.single('file'), uploadMedia);
router.delete('/:id', requireAuth, requireAdmin, deleteMedia);

export default router;
