import { supabase } from '../lib/supabase';

interface TicketDistribution {
  total: number;
  prizeFund: number;
  jackpotContribution: number;
  payoutPool: number;
  platform: number;
  reserve: number;
  revenue: number;
}

export class FinanceService {
  /**
   * Calculate revenue distribution for a ticket
   */
  async calculateTicketDistribution(
    ticketPrice: number,
    lotteryId: string
  ): Promise<TicketDistribution> {
    // Get lottery financial config
    const { data: lottery } = await supabase
      .from('Lottery')
      .select('prizeFundPercentage, jackpotPercentage, platformPercentage, reservePercentage')
      .eq('id', lotteryId)
      .single();

    if (!lottery) {
      throw new Error('Lottery not found');
    }

    const prizeFund = ticketPrice * parseFloat(lottery.prizeFundPercentage || '0.50'); // 50%
    const jackpotContribution = prizeFund * parseFloat(lottery.jackpotPercentage || '0.15'); // 15% of prizeFund
    const payoutPool = prizeFund - jackpotContribution; // 85% of prizeFund

    const platform = ticketPrice * parseFloat(lottery.platformPercentage || '0.50'); // 50%
    const reserve = platform * parseFloat(lottery.reservePercentage || '0.10'); // 10% of platform
    const revenue = platform - reserve; // 90% of platform

    return {
      total: ticketPrice,
      prizeFund,
      jackpotContribution,
      payoutPool,
      platform,
      reserve,
      revenue,
    };
  }

  /**
   * Record ticket sale financials
   */
  async recordTicketSale(
    ticketId: string,
    lotteryId: string,
    drawId: string,
    ticketPrice: number,
    currency: string
  ) {
    const distribution = await this.calculateTicketDistribution(ticketPrice, lotteryId);

    // Record all financial transactions
    const transactions = [
      {
        type: 'ticket_sale',
        lotteryId,
        drawId,
        ticketId,
        amount: distribution.total,
        currency,
        category: 'total',
        details: { distribution },
      },
      {
        type: 'jackpot_contribution',
        lotteryId,
        drawId,
        ticketId,
        amount: distribution.jackpotContribution,
        currency,
        category: 'jackpot',
        details: { percentage: '15% of prize fund' },
      },
      {
        type: 'platform_revenue',
        lotteryId,
        drawId,
        ticketId,
        amount: distribution.revenue,
        currency,
        category: 'revenue',
        details: { percentage: '45% of total' },
      },
      {
        type: 'reserve_contribution',
        lotteryId,
        drawId,
        ticketId,
        amount: distribution.reserve,
        currency,
        category: 'reserve',
        details: { percentage: '5% of total' },
      },
    ];

    await supabase.from('FinancialTransaction').insert(transactions);

    // Update jackpot
    await this.updateJackpot(lotteryId, distribution.jackpotContribution);

    // Update reserve fund
    await this.updateReserveFund(currency, distribution.reserve);

    return distribution;
  }

  /**
   * Update lottery jackpot
   */
  async updateJackpot(lotteryId: string, contribution: number) {
    const { data: lottery } = await supabase
      .from('Lottery')
      .select('jackpot')
      .eq('id', lotteryId)
      .single();

    const newJackpot = parseFloat(lottery?.jackpot || '0') + contribution;

    await supabase
      .from('Lottery')
      .update({ jackpot: newJackpot, updatedAt: new Date().toISOString() })
      .eq('id', lotteryId);

    // Log to jackpot history (if table exists)
    const { data: lotteryData } = await supabase
      .from('Lottery')
      .select('currency')
      .eq('id', lotteryId)
      .single();

    // Check if JackpotHistory table exists before inserting
    const { error: tableError } = await supabase
      .from('JackpotHistory')
      .select('id')
      .limit(1);

    if (!tableError) {
      await supabase.from('JackpotHistory').insert({
        lotteryId,
        amount: contribution,
        currency: lotteryData?.currency,
        reason: 'ticket_sold',
      });
    }

    return newJackpot;
  }

  /**
   * Update reserve fund
   */
  async updateReserveFund(currency: string, amount: number) {
    const { data: fund } = await supabase
      .from('ReserveFund')
      .select('balance')
      .eq('currency', currency)
      .single();

    const newBalance = parseFloat(fund?.balance || '0') + amount;

    await supabase
      .from('ReserveFund')
      .upsert({
        currency,
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      }, {
        onConflict: 'currency',
      });

    return newBalance;
  }

  /**
   * Calculate dynamic prize for match category
   */
  async calculateDynamicPrize(
    lotteryId: string,
    matchCount: number,
    winnersCount: Record<number, number>,
    totalPayoutPool: number
  ): Promise<number> {
    // Special case: 5/5 = jackpot
    if (matchCount === 5) {
      const { data: lottery } = await supabase
        .from('Lottery')
        .select('jackpot')
        .eq('id', lotteryId)
        .single();
      
      return parseFloat(lottery?.jackpot || '0');
    }

    // Get prize distribution config
    const { data: config } = await supabase
      .from('PrizeDistribution')
      .select('*')
      .eq('lotteryId', lotteryId)
      .eq('matchCount', matchCount)
      .single();

    if (!config) {
      return 0;
    }

    // Fixed prize
    if (config.distributionType === 'fixed') {
      return parseFloat(config.fixedAmount || '0');
    }

    // Dynamic prize
    const poolForCategory = totalPayoutPool * parseFloat(config.percentage || '0');
    const winners = winnersCount[matchCount] || 0;

    if (winners === 0) return 0;

    return poolForCategory / winners;
  }

  /**
   * Get draw financial summary
   */
  async getDrawFinancials(drawId: string) {
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('price, currency, lotteryId')
      .eq('drawId', drawId);

    if (!tickets || tickets.length === 0) {
      return {
        totalRevenue: 0,
        prizeFund: 0,
        jackpotContribution: 0,
        payoutPool: 0,
        platformRevenue: 0,
        reserve: 0,
        ticketsSold: 0,
      };
    }

    // Calculate totals
    let totalRevenue = 0;
    let prizeFund = 0;
    let jackpotContribution = 0;
    let payoutPool = 0;
    let platformRevenue = 0;
    let reserve = 0;

    for (const ticket of tickets) {
      const distribution = await this.calculateTicketDistribution(
        parseFloat(ticket.price),
        ticket.lotteryId
      );

      totalRevenue += distribution.total;
      prizeFund += distribution.prizeFund;
      jackpotContribution += distribution.jackpotContribution;
      payoutPool += distribution.payoutPool;
      platformRevenue += distribution.revenue;
      reserve += distribution.reserve;
    }

    return {
      totalRevenue,
      prizeFund,
      jackpotContribution,
      payoutPool,
      platformRevenue,
      reserve,
      ticketsSold: tickets.length,
      currency: tickets[0].currency,
    };
  }

  /**
   * Get lottery financial statistics
   */
  async getLotteryStats(lotteryId: string) {
    // Get all completed draws
    const { data: draws } = await supabase
      .from('Draw')
      .select('id')
      .eq('lotteryId', lotteryId)
      .eq('status', 'completed');

    if (!draws || draws.length === 0) {
      return {
        totalTicketsSold: 0,
        totalRevenue: 0,
        totalPrizesPaid: 0,
        totalJackpotGrowth: 0,
        totalReserve: 0,
      };
    }

    // Aggregate financials
    const { data: transactions } = await supabase
      .from('FinancialTransaction')
      .select('type, amount')
      .eq('lotteryId', lotteryId);

    const stats = {
      totalTicketsSold: 0,
      totalRevenue: 0,
      totalPrizesPaid: 0,
      totalJackpotGrowth: 0,
      totalReserve: 0,
    };

    for (const tx of transactions || []) {
      const amount = parseFloat(tx.amount.toString());
      
      switch (tx.type) {
        case 'ticket_sale':
          stats.totalTicketsSold++;
          stats.totalRevenue += amount;
          break;
        case 'prize_payout':
          stats.totalPrizesPaid += amount;
          break;
        case 'jackpot_contribution':
          stats.totalJackpotGrowth += amount;
          break;
        case 'reserve_contribution':
          stats.totalReserve += amount;
          break;
      }
    }

    return stats;
  }

  /**
   * Reset jackpot after win (to seed amount)
   */
  async resetJackpot(lotteryId: string, seedAmount: number = 1000) {
    await supabase
      .from('Lottery')
      .update({ jackpot: seedAmount, updatedAt: new Date().toISOString() })
      .eq('id', lotteryId);

    return seedAmount;
  }
}

export const financeService = new FinanceService();
