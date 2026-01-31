import { Router } from 'express';
import { supabase } from '../../lib/supabase';
import { drawEngine } from '../../services/drawEngine';
import { notificationService } from '../../services/notificationService';
import { payoutQueue } from '../../services/payoutQueue';

const router = Router();

// Middleware to check admin
function isAdmin(req: any, res: any, next: any) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * POST /api/admin/draws/:lotteryId/execute
 * Manually trigger a draw execution
 */
router.post('/:lotteryId/execute', isAdmin, async (req, res) => {
  const { lotteryId } = req.params;

  try {
    // Get the next scheduled draw for this lottery
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('*')
      .eq('lotteryId', lotteryId)
      .eq('status', 'scheduled')
      .order('scheduledAt', { ascending: true })
      .limit(1)
      .single();

    if (drawError || !draw) {
      return res.status(404).json({ error: 'No scheduled draw found for this lottery' });
    }

    // Execute the draw
    const result = await drawEngine.executeDraw(draw.id);

    // Queue payouts for winners
    for (const winner of result.winners) {
      const { data: ticket } = await supabase
        .from('Ticket')
        .select('walletAddress, currency')
        .eq('id', winner.ticketId)
        .single();

      if (ticket && winner.prizeAmount > 0) {
        await payoutQueue.queuePayout({
          ticketId: winner.ticketId,
          userId: winner.userId,
          walletAddress: ticket.walletAddress,
          amount: winner.prizeAmount,
          currency: ticket.currency || 'TON',
          drawId: draw.id,
        });

        // Notify winner
        await notificationService.notifyWinner(
          winner.ticketId,
          winner.prizeAmount,
          ticket.currency || 'TON'
        );
      }
    }

    // Notify all participants
    await notificationService.notifyDrawComplete(draw.id);

    res.json({
      success: true,
      draw: {
        id: draw.id,
        winningNumbers: result.winningNumbers,
        totalWinners: result.winners.length,
        totalPrizePool: result.totalPrizePool,
      },
      winners: result.winners,
    });
  } catch (error: any) {
    console.error('Failed to execute draw:', error);
    res.status(500).json({ error: error.message || 'Failed to execute draw' });
  }
});

/**
 * GET /api/admin/draws
 * List all draws
 */
router.get('/', isAdmin, async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('Draw')
      .select('*, lottery:Lottery(*)')
      .order('scheduledAt', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      draws: draws || [],
    });
  } catch (error: any) {
    console.error('Failed to fetch draws:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch draws' });
  }
});

/**
 * GET /api/admin/draws/:drawId
 * Get draw details with winners
 */
router.get('/:drawId', isAdmin, async (req, res) => {
  const { drawId } = req.params;

  try {
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('*, lottery:Lottery(*)')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    // Get winning tickets
    const { data: winners } = await supabase
      .from('Ticket')
      .select('*')
      .eq('drawId', drawId)
      .eq('status', 'won')
      .order('matchedNumbers', { ascending: false });

    // Get payout status
    const { data: payouts } = await supabase
      .from('Payout')
      .select('*')
      .in('ticketId', (winners || []).map(w => w.id));

    res.json({
      success: true,
      draw,
      winners: (winners || []).map(winner => {
        const payout = (payouts || []).find(p => p.ticketId === winner.id);
        return {
          ...winner,
          payoutStatus: payout?.status || 'not_queued',
          txHash: payout?.txHash,
        };
      }),
    });
  } catch (error: any) {
    console.error('Failed to fetch draw details:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch draw details' });
  }
});

export default router;
