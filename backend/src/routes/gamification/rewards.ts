import { Router } from 'express';
import { rewardService } from '../../services/rewardService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware(50, 60000));

/**
 * GET /api/gamification/rewards/available
 * Get available rewards for user
 */
router.get('/available', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const rewards = await rewardService.getAvailableRewards(userId);
    
    res.json({
      success: true,
      rewards
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/rewards/claimed
 * Get claimed rewards for user
 */
router.get('/claimed', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const rewards = await rewardService.getClaimedRewards(userId, limit);
    
    res.json({
      success: true,
      rewards
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/rewards/:id/claim
 * Claim a reward
 */
router.post('/:id/claim', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const rewardId = req.params.id;

    const result = await rewardService.claimReward(userId, rewardId);
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
