import { Router } from 'express';
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();

/**
 * GET /api/admin/lotteries
 * Get all lotteries with stats
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { data: lotteries, error } = await supabase
      .from('Lottery')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Get ticket counts for each lottery
    const lotteriesWithStats = await Promise.all(
      (lotteries || []).map(async (lottery) => {
        const { count: ticketCount } = await supabase
          .from('Ticket')
          .select('*', { count: 'exact', head: true })
          .eq('lotteryId', lottery.id);

        const { data: tickets } = await supabase
          .from('Ticket')
          .select('price')
          .eq('lotteryId', lottery.id);

        const prizePool = tickets?.reduce((sum, t) => sum + t.price, 0) || 0;

        return {
          ...lottery,
          ticketCount: ticketCount || 0,
          prizePool,
        };
      })
    );

    res.json({ lotteries: lotteriesWithStats });
  } catch (error) {
    console.error('Failed to fetch lotteries:', error);
    res.status(500).json({ error: 'Failed to fetch lotteries' });
  }
});

/**
 * POST /api/admin/lotteries
 * Create new lottery
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, slug, description, ticketPrice, maxTickets, drawDate } = req.body;

    const { data: lottery, error } = await supabase
      .from('Lottery')
      .insert({
        name,
        slug,
        description,
        ticketPrice,
        maxTickets,
        drawDate,
        isActive: true,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, lottery });
  } catch (error) {
    console.error('Failed to create lottery:', error);
    res.status(500).json({ error: 'Failed to create lottery' });
  }
});

/**
 * PUT /api/admin/lotteries/:id
 * Update lottery
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: lottery, error } = await supabase
      .from('Lottery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, lottery });
  } catch (error) {
    console.error('Failed to update lottery:', error);
    res.status(500).json({ error: 'Failed to update lottery' });
  }
});

/**
 * DELETE /api/admin/lotteries/:id
 * Delete lottery
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('Lottery')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Lottery deleted' });
  } catch (error) {
    console.error('Failed to delete lottery:', error);
    res.status(500).json({ error: 'Failed to delete lottery' });
  }
});

export default router;
