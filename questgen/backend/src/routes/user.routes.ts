import { Router } from 'express';
import { getProfile, updateProfile, getUserStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Get user statistics
router.get('/stats', getUserStats);

export default router;