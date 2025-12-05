import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// TODO: Implement user management endpoints
router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Get all users - To be implemented' });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'Get user by ID - To be implemented' });
});

router.put('/:id', authenticate, (req, res) => {
  res.json({ message: 'Update user - To be implemented' });
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Delete user - To be implemented' });
});

export default router;
