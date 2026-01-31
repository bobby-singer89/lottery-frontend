import { Router } from 'express';
import { streakService } from '../../services/streakService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware(50, 60000));

/**
 * GET /api/gamification/streak/current
 * Get user's current streak
 */
router.get('/current', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const streak = await streakService.getCurrentStreak(userId);
    
    res.json({
      success: true,
      streak
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/streak/checkin
 * Perform daily check-in
 */
router.post('/checkin', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const result = await streakService.checkIn(userId);
    
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
