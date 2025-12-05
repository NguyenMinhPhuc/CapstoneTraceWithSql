import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get notifications - To be implemented' }));
router.put('/:id/read', authenticate, (req, res) => res.json({ message: 'Mark notification as read - To be implemented' }));

export default router;
