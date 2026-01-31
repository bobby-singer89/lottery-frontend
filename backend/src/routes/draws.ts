import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { drawEngine } from '../services/drawEngine';

const router = Router();

/**
 * GET /api/draws/:drawId/results
 * Get public draw results
 */
router.get('/:drawId/results', async (req, res) => {
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

    if (draw.status !== 'completed') {
      return res.status(400).json({ error: 'Draw not completed yet' });
    }

    // Get winners breakdown by tier
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('matchedNumbers, prizeAmount')
      .eq('drawId', drawId)
      .eq('status', 'won');

    const winnersByTier: Record<number, { count: number; totalPrize: number }> = {
      5: { count: 0, totalPrize: 0 },
      4: { count: 0, totalPrize: 0 },
      3: { count: 0, totalPrize: 0 },
    };

    for (const ticket of tickets || []) {
      const tier = ticket.matchedNumbers;
      if (tier >= 3) {
        winnersByTier[tier].count++;
        winnersByTier[tier].totalPrize += parseFloat(ticket.prizeAmount);
      }
    }

    res.json({
      success: true,
      draw: {
        id: draw.id,
        lotteryId: draw.lotteryId,
        lotteryName: draw.lottery?.name,
        drawDate: draw.executedAt || draw.scheduledAt,
        winningNumbers: draw.winningNumbers,
        totalPrizePool: draw.totalPrizePool,
        totalWinners: draw.totalWinners,
        status: draw.status,
      },
      winnersByTier,
    });
  } catch (error: any) {
    console.error('Failed to fetch draw results:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch draw results' });
  }
});

/**
 * GET /api/draws/:drawId/verify
 * Get verification data for provably fair check
 */
router.get('/:drawId/verify', async (req, res) => {
  const { drawId } = req.params;

  try {
    const verificationData = await drawEngine.getVerificationData(drawId);

    res.json({
      success: true,
      verification: verificationData,
    });
  } catch (error: any) {
    console.error('Failed to get verification data:', error);
    res.status(500).json({ error: error.message || 'Failed to get verification data' });
  }
});

/**
 * GET /api/draws/lottery/:slug/latest
 * Get latest draw for a lottery
 */
router.get('/lottery/:slug/latest', async (req, res) => {
  const { slug } = req.params;

  try {
    // Get lottery
    const { data: lottery, error: lotteryError } = await supabase
      .from('Lottery')
      .select('id')
      .eq('slug', slug)
      .single();

    if (lotteryError || !lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    // Get latest completed draw
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('*')
      .eq('lotteryId', lottery.id)
      .eq('status', 'completed')
      .order('executedAt', { ascending: false })
      .limit(1)
      .single();

    if (drawError || !draw) {
      return res.status(404).json({ error: 'No completed draws found' });
    }

    res.json({
      success: true,
      draw: {
        id: draw.id,
        drawDate: draw.executedAt,
        winningNumbers: draw.winningNumbers,
        totalWinners: draw.totalWinners,
        totalPrizePool: draw.totalPrizePool,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch latest draw:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch latest draw' });
  }
});

export default router;
