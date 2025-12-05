import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Get admin dashboard - To be implemented' }));
router.get('/settings', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Get system settings - To be implemented' }));
router.put('/settings', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Update system settings - To be implemented' }));

export default router;
