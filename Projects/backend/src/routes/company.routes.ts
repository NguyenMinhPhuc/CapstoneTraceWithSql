import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get companies - To be implemented' }));
router.post('/', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Create company - To be implemented' }));
router.get('/:id', authenticate, (req, res) => res.json({ message: 'Get company - To be implemented' }));
router.put('/:id', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Update company - To be implemented' }));

export default router;
