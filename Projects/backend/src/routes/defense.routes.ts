import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/sessions', authenticate, (req, res) => res.json({ message: 'Get defense sessions - To be implemented' }));
router.post('/sessions', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Create defense session - To be implemented' }));
router.get('/sessions/:id', authenticate, (req, res) => res.json({ message: 'Get defense session - To be implemented' }));
router.post('/sessions/:id/assign', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Assign students to defense - To be implemented' }));

export default router;
