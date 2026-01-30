import { Router } from 'express';
import { financeService } from '../../services/financeService';
import { supabase } from '../../lib/supabase';

const router = Router();

// Simple admin auth middleware
function isAdmin(req: any, res: any, next: any) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * GET /api/admin/finance/lottery/:lotteryId/stats
 */
router.get('/lottery/:lotteryId/stats', isAdmin, async (req, res) => {
  const { lotteryId } = req.params;

  try {
    const stats = await financeService.getLotteryStats(lotteryId);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/finance/draw/:drawId
 */
router.get('/draw/:drawId', isAdmin, async (req, res) => {
  const { drawId } = req.params;

  try {
    const financials = await financeService.getDrawFinancials(drawId);

    res.json({
      success: true,
      financials,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/finance/reserve
 */
router.get('/reserve', isAdmin, async (req, res) => {
  try {
    const { data: reserves } = await supabase
      .from('ReserveFund')
      .select('*');

    res.json({
      success: true,
      reserves,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/finance/transactions
 */
router.get('/transactions', isAdmin, async (req, res) => {
  const { limit = 100, offset = 0, type } = req.query;

  try {
    let query = supabase
      .from('FinancialTransaction')
      .select('*')
      .order('createdAt', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: transactions } = await query;

    res.json({
      success: true,
      transactions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
