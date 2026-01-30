import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { payoutService } from '../services/payoutService';

const router = Router();

// Middleware to check admin (simple version)
function isAdmin(req: any, res: any, next: any) {
  // In production: check JWT, verify admin role
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * POST /api/admin/lottery/update-price
 */
router.post('/lottery/update-price', isAdmin, async (req, res) => {
  const { lotterySlug, newPrice } = req.body;

  try {
    // Get current lottery data
    const { data: oldLottery } = await supabase
      .from('Lottery')
      .select('ticketPrice')
      .eq('slug', lotterySlug)
      .single();

    const { data, error } = await supabase
      .from('Lottery')
      .update({
        ticketPrice: newPrice,
        updatedAt: new Date().toISOString(),
      })
      .eq('slug', lotterySlug)
      .select()
      .single();

    if (error) throw error;

    // Log to audit
    await supabase.from('AuditLog').insert({
      action: 'price_updated',
      details: {
        lotterySlug,
        oldPrice: oldLottery?.ticketPrice,
        newPrice,
      },
    });

    res.json({
      success: true,
      lottery: data,
      message: `Price updated to ${newPrice} ${data.currency}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/wallet/balance
 */
router.get('/wallet/balance', isAdmin, async (req, res) => {
  try {
    const tonBalance = await payoutService.getBalance('TON');
    const usdtBalance = await payoutService.getBalance('USDT');

    res.json({
      success: true,
      balances: {
        TON: tonBalance,
        USDT: usdtBalance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
