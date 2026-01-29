import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { provablyFair } from '../services/provablyFair';

const router = Router();

/**
 * GET /api/public/draw/:drawId/verify
 * Public endpoint to verify draw fairness
 * 
 * NOTE: In production, add rate limiting to prevent abuse
 * Example: Use express-rate-limit middleware
 */
router.get('/draw/:drawId/verify', async (req, res) => {
  const { drawId } = req.params;

  try {
    // Get draw data
    const { data: draw, error } = await supabase
      .from('Draw')
      .select('*')
      .eq('id', drawId)
      .single();

    if (error || !draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    // Verify seed hash
    const seedHashMatches = draw.seed && draw.seedHash
      ? provablyFair.verifySeedHash(draw.seed, draw.seedHash)
      : null;

    // Verify numbers
    const numbersValid = draw.seed && draw.winningNumbers
      ? provablyFair.verifyNumbers(draw.seed, draw.winningNumbers, 5, 36)
      : null;

    // Get audit log
    const { data: auditLogs } = await supabase
      .from('AuditLog')
      .select('*')
      .eq('drawId', drawId)
      .order('createdAt', { ascending: true });

    res.json({
      success: true,
      drawId: draw.id,
      drawNumber: draw.drawNumber,
      status: draw.status,
      scheduledAt: draw.scheduledAt,
      executedAt: draw.executedAt,
      
      // Provably Fair data
      seedHash: draw.seedHash,
      seedHashPublishedAt: draw.seedHashPublishedAt,
      seed: draw.seed,
      seedRevealedAt: draw.seedRevealedAt,
      winningNumbers: draw.winningNumbers,
      
      // Verification results
      verified: seedHashMatches === true && numbersValid === true,
      proof: {
        seedHashMatches,
        numbersValid,
        seedHashPublishedBefore: draw.seedHashPublishedAt && draw.executedAt 
          ? draw.seedHashPublishedAt < draw.executedAt 
          : null,
      },
      
      // Stats
      totalTickets: draw.totalTickets,
      winners: draw.winners,
      totalPaid: draw.totalPaid,
      
      // Audit trail
      auditLog: auditLogs,
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/public/ticket/:ticketId/verify
 * Public endpoint to verify individual ticket
 * 
 * NOTE: In production, add rate limiting to prevent abuse
 * Example: Use express-rate-limit middleware
 */
router.get('/ticket/:ticketId/verify', async (req, res) => {
  const { ticketId } = req.params;

  try {
    const { data: ticket } = await supabase
      .from('Ticket')
      .select(`
        *,
        draw:Draw(*)
      `)
      .eq('id', ticketId)
      .single();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket: {
        id: ticket.id,
        numbers: ticket.numbers,
        status: ticket.status,
        matchedNumbers: ticket.matchedNumbers,
        prizeAmount: ticket.prizeAmount,
        txHash: ticket.txHash,
        purchasedAt: ticket.createdAt,
      },
      draw: {
        drawNumber: ticket.draw.drawNumber,
        winningNumbers: ticket.draw.winningNumbers,
        executedAt: ticket.draw.executedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
