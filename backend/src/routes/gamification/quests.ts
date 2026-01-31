import { Router } from 'express';
import { questService } from '../../services/questService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware(50, 60000));

/**
 * GET /api/gamification/quests/available
 * Get available quests
 */
router.get('/available', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const type = req.query.type as string;
    const quests = await questService.getAvailableQuests(userId, type);
    
    res.json({
      success: true,
      quests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/quests/mine
 * Get user's active quests
 */
router.get('/mine', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const quests = await questService.getUserQuests(userId);
    
    res.json({
      success: true,
      quests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/quests/:id/claim
 * Claim quest reward
 */
router.post('/:id/claim', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const questId = req.params.id;

    await questService.claimQuestReward(userId, questId);
    
    res.json({
      success: true,
      message: 'Quest reward claimed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
