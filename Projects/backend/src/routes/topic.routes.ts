import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get topics - To be implemented' }));
router.post('/', authenticate, authorize('student'), (req, res) => res.json({ message: 'Create topic - To be implemented' }));
router.get('/:id', authenticate, (req, res) => res.json({ message: 'Get topic - To be implemented' }));
router.put('/:id', authenticate, (req, res) => res.json({ message: 'Update topic - To be implemented' }));
router.post('/:id/approve', authenticate, authorize('admin', 'supervisor'), (req, res) => res.json({ message: 'Approve topic - To be implemented' }));

export default router;
