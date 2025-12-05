import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res) => res.json({ message: 'Get progress reports - To be implemented' }));
router.post('/', authenticate, authorize('student'), (req, res) => res.json({ message: 'Submit progress report - To be implemented' }));
router.get('/:id', authenticate, (req, res) => res.json({ message: 'Get progress report - To be implemented' }));
router.put('/:id/review', authenticate, authorize('supervisor'), (req, res) => res.json({ message: 'Review progress report - To be implemented' }));

export default router;
