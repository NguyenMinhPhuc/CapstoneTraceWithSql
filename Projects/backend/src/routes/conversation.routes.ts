import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get conversations - To be implemented' }));
router.post('/', authenticate, (req, res) => res.json({ message: 'Create conversation - To be implemented' }));
router.get('/:id', authenticate, (req, res) => res.json({ message: 'Get conversation - To be implemented' }));
router.post('/:id/messages', authenticate, (req, res) => res.json({ message: 'Send message - To be implemented' }));

export default router;
