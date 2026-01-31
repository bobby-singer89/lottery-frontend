import { supabase } from '../lib/supabase';
import { provablyFair } from './provablyFair';
import { financeService } from './financeService';

interface DrawResult {
  drawId: string;
  winningNumbers: number[];
  winners: WinnerInfo[];
  totalPrizePool: number;
}

interface WinnerInfo {
  ticketId: string;
  userId: string;
  tier: number;
  matches: number;
  prizeAmount: number;
}

export class DrawEngine {
  /**
   * Execute a draw for a lottery
   */
  async executeDraw(drawId: string): Promise<DrawResult> {
    // Get draw info
    const { data: draw, error: drawError } = await supabase
      .from('Draw')
      .select('*, lottery:Lottery(*)')
      .eq('id', drawId)
      .single();

    if (drawError || !draw) {
      throw new Error('Draw not found');
    }

    if (draw.status !== 'scheduled') {
      throw new Error(`Draw already ${draw.status}`);
    }

    // Generate winning numbers
    const seed = draw.seed || provablyFair.generateSeed();
    const winningNumbers = provablyFair.generateWinningNumbers(seed, 5, 36);

    // Update draw with winning numbers
    await supabase
      .from('Draw')
      .update({
        seed,
        winningNumbers,
        executedAt: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', drawId);

    // Get all tickets for this draw
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('*')
      .eq('drawId', drawId);

    // Count winners by tier
    const winnersCount: Record<number, number> = { 5: 0, 4: 0, 3: 0 };
    
    for (const ticket of tickets || []) {
      const matched = this.countMatches(ticket.numbers, winningNumbers);
      if (matched >= 3) {
        winnersCount[matched] = (winnersCount[matched] || 0) + 1;
      }
    }

    // Get financials
    const financials = await financeService.getDrawFinancials(drawId);

    // Process each ticket and create winners
    const winners: WinnerInfo[] = [];
    
    for (const ticket of tickets || []) {
      const matched = this.countMatches(ticket.numbers, winningNumbers);
      
      if (matched < 3) {
        // No prize
        await supabase
          .from('Ticket')
          .update({
            status: 'lost',
            matchedNumbers: matched,
            prizeAmount: 0,
          })
          .eq('id', ticket.id);
        continue;
      }

      // Calculate prize
      const prizeAmount = await financeService.calculateDynamicPrize(
        draw.lotteryId,
        matched,
        winnersCount,
        financials.payoutPool
      );

      // Update ticket
      await supabase
        .from('Ticket')
        .update({
          status: 'won',
          matchedNumbers: matched,
          prizeAmount,
        })
        .eq('id', ticket.id);

      // Create winner record
      winners.push({
        ticketId: ticket.id,
        userId: ticket.userId || 'unknown',
        tier: matched,
        matches: matched,
        prizeAmount,
      });

      // Record financial transaction
      await supabase.from('FinancialTransaction').insert({
        type: 'prize_payout',
        lotteryId: draw.lotteryId,
        drawId: draw.id,
        ticketId: ticket.id,
        amount: prizeAmount,
        currency: ticket.currency || 'TON',
        category: `match_${matched}`,
        details: { winnersInCategory: winnersCount[matched] },
      });
    }

    // Update draw with winner stats
    const totalPaid = winners.reduce((sum, w) => sum + w.prizeAmount, 0);
    
    await supabase
      .from('Draw')
      .update({
        winners: winnersCount,
        totalWinners: winners.length,
        totalPaid,
      })
      .eq('id', drawId);

    return {
      drawId,
      winningNumbers,
      winners,
      totalPrizePool: financials.payoutPool,
    };
  }

  /**
   * Count matching numbers between ticket and winning numbers
   */
  private countMatches(ticketNumbers: number[], winningNumbers: number[]): number {
    return ticketNumbers.filter(n => winningNumbers.includes(n)).length;
  }

  /**
   * Get draw results
   */
  async getDrawResults(drawId: string) {
    const { data: draw } = await supabase
      .from('Draw')
      .select('*, lottery:Lottery(*)')
      .eq('id', drawId)
      .single();

    if (!draw) {
      throw new Error('Draw not found');
    }

    const { data: tickets } = await supabase
      .from('Ticket')
      .select('*')
      .eq('drawId', drawId)
      .eq('status', 'won');

    return {
      draw,
      winners: tickets || [],
    };
  }

  /**
   * Get verification data for provably fair check
   */
  async getVerificationData(drawId: string) {
    const { data: draw } = await supabase
      .from('Draw')
      .select('*')
      .eq('id', drawId)
      .single();

    if (!draw) {
      throw new Error('Draw not found');
    }

    return {
      drawId: draw.id,
      seed: draw.seed,
      seedHash: draw.seedHash,
      winningNumbers: draw.winningNumbers,
      blockHash: draw.blockHash,
      blockHeight: draw.blockHeight,
    };
  }
}

export const drawEngine = new DrawEngine();
