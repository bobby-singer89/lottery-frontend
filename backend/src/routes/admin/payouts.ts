import { Router } from 'express';
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../middleware/adminAuth';
import { payoutQueue } from '../../services/payoutQueue';

const router = Router();

/**
 * GET /api/admin/payouts
 * Get all payouts with filters
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('Payout')
      .select('*, Winner(*, Ticket(*, Lottery(name)))')
      .order('createdAt', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: payouts, error } = await query;

    if (error) throw error;

    res.json({ payouts: payouts || [] });
  } catch (error) {
    console.error('Failed to fetch payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

/**
 * POST /api/admin/payouts/:id/process
 * Manually process a payout
 */
router.post('/:id/process', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await payoutQueue.processPayoutById(id);

    res.json({ success: true, message: 'Payout processed' });
  } catch (error) {
    console.error('Failed to process payout:', error);
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

/**
 * DELETE /api/admin/payouts/:id
 * Cancel a pending payout
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('Payout')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Payout cancelled' });
  } catch (error) {
    console.error('Failed to cancel payout:', error);
    res.status(500).json({ error: 'Failed to cancel payout' });
  }
});

export default router;
