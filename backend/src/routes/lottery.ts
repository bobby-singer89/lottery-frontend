import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { financeService } from '../services/financeService';

const router = Router();

/**
 * POST /api/lottery/:slug/buy-ticket
 * Purchase a single lottery ticket
 */
router.post('/:slug/buy-ticket', async (req, res) => {
  const { slug } = req.params;
  const { numbers, txHash, walletAddress } = req.body;

  try {
    // Validate input
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Invalid numbers' });
    }

    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash required' });
    }

    // Get lottery info
    const { data: lottery, error: lotteryError } = await supabase
      .from('Lottery')
      .select('id, ticketPrice, currency')
      .eq('slug', slug)
      .single();

    if (lotteryError || !lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    // Get current draw
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('id, status, ticketSalesOpen')
      .eq('lotteryId', lottery.id)
      .eq('status', 'scheduled')
      .order('scheduledAt', { ascending: true })
      .limit(1)
      .single();

    if (drawError || !draw) {
      return res.status(400).json({ error: 'No active draw found' });
    }

    if (!draw.ticketSalesOpen) {
      return res.status(400).json({ error: 'Ticket sales are closed for this draw' });
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('Ticket')
      .insert({
        lotteryId: lottery.id,
        drawId: draw.id,
        numbers,
        walletAddress: walletAddress || 'unknown',
        txHash,
        price: lottery.ticketPrice,
        currency: lottery.currency,
        status: 'pending',
      })
      .select()
      .single();

    if (ticketError || !ticket) {
      console.error('Ticket creation error:', ticketError);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }

    // Record financial transaction
    try {
      await financeService.recordTicketSale(
        ticket.id,
        lottery.id,
        draw.id,
        parseFloat(lottery.ticketPrice),
        lottery.currency
      );
    } catch (financeError) {
      console.error('Finance recording error:', financeError);
      // Don't fail the ticket purchase if finance recording fails
      // The ticket is still valid, we just log the error
    }

    // Update draw ticket count
    const { count } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true })
      .eq('drawId', draw.id);

    await supabase
      .from('Draw')
      .update({ totalTickets: count })
      .eq('id', draw.id);

    res.json({
      success: true,
      ticket: {
        id: ticket.id,
        numbers: ticket.numbers,
        purchasedAt: ticket.createdAt,
        status: ticket.status,
        drawId: ticket.drawId,
        txHash: ticket.txHash,
        price: ticket.price,
        currency: ticket.currency,
      },
    });
  } catch (error: any) {
    console.error('Buy ticket error:', error);
    res.status(500).json({ error: error.message || 'Failed to purchase ticket' });
  }
});

/**
 * POST /api/tickets/purchase-bulk
 * Purchase multiple lottery tickets in bulk
 */
router.post('/purchase-bulk', async (req, res) => {
  const { tickets, lotterySlug } = req.body;

  try {
    // Validate input
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ error: 'Invalid tickets data' });
    }

    // Get lottery info (use slug from first ticket or from request)
    const slug = lotterySlug || tickets[0].lotterySlug;
    const { data: lottery, error: lotteryError } = await supabase
      .from('Lottery')
      .select('id, ticketPrice, currency')
      .eq('slug', slug)
      .single();

    if (lotteryError || !lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    // Get current draw
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('id, status, ticketSalesOpen')
      .eq('lotteryId', lottery.id)
      .eq('status', 'scheduled')
      .order('scheduledAt', { ascending: true })
      .limit(1)
      .single();

    if (drawError || !draw) {
      return res.status(400).json({ error: 'No active draw found' });
    }

    if (!draw.ticketSalesOpen) {
      return res.status(400).json({ error: 'Ticket sales are closed for this draw' });
    }

    const createdTickets = [];

    // Create all tickets
    for (const ticketData of tickets) {
      const { data: ticket, error: ticketError } = await supabase
        .from('Ticket')
        .insert({
          lotteryId: lottery.id,
          drawId: draw.id,
          numbers: ticketData.numbers,
          walletAddress: ticketData.walletAddress || 'unknown',
          txHash: ticketData.txHash,
          price: ticketData.price || lottery.ticketPrice,
          currency: lottery.currency,
          status: 'pending',
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        console.error('Ticket creation error:', ticketError);
        continue; // Skip failed tickets
      }

      createdTickets.push(ticket);

      // Record financial transaction for each ticket
      try {
        await financeService.recordTicketSale(
          ticket.id,
          lottery.id,
          draw.id,
          parseFloat(ticket.price),
          lottery.currency
        );
      } catch (financeError) {
        console.error('Finance recording error for ticket:', ticket.id, financeError);
        // Don't fail the entire operation if finance recording fails
      }
    }

    // Update draw ticket count
    const { count } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true })
      .eq('drawId', draw.id);

    await supabase
      .from('Draw')
      .update({ totalTickets: count })
      .eq('id', draw.id);

    res.json({
      success: true,
      tickets: createdTickets.map(ticket => ({
        id: ticket.id,
        numbers: ticket.numbers,
        purchasedAt: ticket.createdAt,
        status: ticket.status,
        drawId: ticket.drawId,
        txHash: ticket.txHash,
        price: ticket.price,
        currency: ticket.currency,
      })),
    });
  } catch (error: any) {
    console.error('Bulk purchase error:', error);
    res.status(500).json({ error: error.message || 'Failed to purchase tickets' });
  }
});

export default router;
