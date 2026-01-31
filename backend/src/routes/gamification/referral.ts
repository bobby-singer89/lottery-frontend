import { Router } from 'express';
import { referralService } from '../../services/referralService';
import { authMiddleware, AuthenticatedRequest, rateLimitMiddleware } from '../../middleware/gamificationAuth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(rateLimitMiddleware(50, 60000)); // 50 requests per minute

/**
 * GET /api/gamification/referral/code
 * Get or generate referral code for user
 */
router.get('/code', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const code = await referralService.generateReferralCode(userId);
    
    res.json({
      success: true,
      code
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gamification/referral/apply
 * Apply a referral code
 */
router.post('/apply', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required'
      });
    }

    const result = await referralService.applyReferralCode(userId, code);
    
    res.json({
      success: true,
      message: 'Referral code applied successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/referral/stats
 * Get referral statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const stats = await referralService.getReferralStats(userId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gamification/referral/tree
 * Get referral tree
 */
router.get('/tree', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;
    const maxDepth = parseInt(req.query.maxDepth as string) || 3;
    const tree = await referralService.getReferralTree(userId, maxDepth);
    
    res.json({
      success: true,
      tree
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
