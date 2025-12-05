import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/rubrics', authenticate, (req, res) => res.json({ message: 'Get rubrics - To be implemented' }));
router.post('/rubrics', authenticate, authorize('admin'), (req, res) => res.json({ message: 'Create rubric - To be implemented' }));
router.post('/grades', authenticate, authorize('supervisor', 'council_member'), (req, res) => res.json({ message: 'Submit grade - To be implemented' }));
router.get('/grades/:studentId', authenticate, (req, res) => res.json({ message: 'Get student grades - To be implemented' }));

export default router;
