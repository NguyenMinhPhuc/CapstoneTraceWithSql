import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get resources - To be implemented' }));
router.post('/', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Create resource - To be implemented' }));
router.get('/:id', authenticate, (req, res) => res.json({ message: 'Get resource - To be implemented' }));
router.put('/:id', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Update resource - To be implemented' }));

export default router;
