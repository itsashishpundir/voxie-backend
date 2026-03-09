import { Router } from 'express';
import { listUnits, getUnit, createUnit, updateUnit, deleteUnit, reorderUnits } from '../controllers/units.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validate } from '../middleware/validate';
import { createUnitSchema, updateUnitSchema, reorderUnitsSchema } from '../schemas/unit.schema';

const router = Router({ mergeParams: true });

router.get('/', optionalAuth, listUnits);
router.post('/', requireAuth, requireAdmin, validate(createUnitSchema), createUnit);
router.post('/reorder', requireAuth, requireAdmin, validate(reorderUnitsSchema), reorderUnits);
router.get('/:id', optionalAuth, getUnit);
router.patch('/:id', requireAuth, requireAdmin, validate(updateUnitSchema), updateUnit);
router.delete('/:id', requireAuth, requireAdmin, deleteUnit);

export default router;
