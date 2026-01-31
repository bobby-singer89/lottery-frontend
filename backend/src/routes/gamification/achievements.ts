import { Router } from 'express';
import { achievementService } from '../../services/achievementService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware(50, 60000));

/**
 * GET /api/gamification/achievements/all
 * Get all available achievements
 */
router.get('/all', async (req: AuthenticatedRequest, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    
    res.json({
      success: true,
      achievements
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/achievements/mine
 * Get user's unlocked achievements
 */
router.get('/mine', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const achievements = await achievementService.getUserAchievements(userId);
    
    res.json({
      success: true,
      achievements
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/achievements/:id/claim
 * Claim achievement reward
 */
router.post('/:id/claim', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const achievementId = req.params.id;

    await achievementService.claimAchievementReward(userId, achievementId);
    
    res.json({
      success: true,
      message: 'Achievement reward claimed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/achievements/check
 * Manually trigger achievement check
 */
router.post('/check', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const newlyUnlocked = await achievementService.checkAchievements(userId);
    
    res.json({
      success: true,
      newlyUnlocked
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
