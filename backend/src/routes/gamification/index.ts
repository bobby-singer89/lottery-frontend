import { Router } from 'express';
import { gamificationService } from '../../services/gamificationService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';
import referralRoutes from './referral';
import questRoutes from './quests';
import achievementRoutes from './achievements';
import streakRoutes from './streak';
import rewardRoutes from './rewards';

const router = Router();

// Apply auth middleware to profile route
router.use(authMiddleware);
router.use(rateLimitMiddleware(100, 60000));

/**
 * GET /api/gamification/profile
 * Get complete gamification profile
 */
router.get('/profile', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const profile = await gamificationService.getUserProfile(userId);
    
    res.json({
      success: true,
      profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', async (req: AuthenticatedRequest, res) => {
  try {
    const type = (req.query.type as 'level' | 'xp' | 'tickets' | 'winnings') || 'level';
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationService.getLeaderboard(type, limit);
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mount sub-routes
router.use('/referral', referralRoutes);
router.use('/quests', questRoutes);
router.use('/achievements', achievementRoutes);
router.use('/streak', streakRoutes);
router.use('/rewards', rewardRoutes);

export default router;
