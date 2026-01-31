import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * GET /api/analytics/hot-cold-numbers
 * Get hot and cold numbers from last 10 draws
 */
router.get('/hot-cold-numbers', async (req, res) => {
  try {
    // Get last 10 completed draws
    const { data: draws, error: drawsError } = await supabase
      .from('Draw')
      .select('winningNumbers')
      .eq('status', 'completed')
      .order('executedAt', { ascending: false })
      .limit(10);

    if (drawsError) {
      console.error('Error fetching draws:', drawsError);
      return res.status(500).json({ error: 'Failed to fetch draws' });
    }

    // Count frequency of each number
    const numberFrequency: Record<number, number> = {};
    
    if (draws && draws.length > 0) {
      for (const draw of draws) {
        if (draw.winningNumbers && Array.isArray(draw.winningNumbers)) {
          for (const num of draw.winningNumbers) {
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          }
        }
      }
    }

    // Convert to array and sort by frequency
    const sortedNumbers = Object.entries(numberFrequency)
      .map(([number, frequency]) => ({
        number: parseInt(number),
        frequency,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Get hot numbers (top 5-7)
    const hotNumbers = sortedNumbers.slice(0, 7);

    // Get cold numbers (bottom 3-5)
    const coldNumbers = sortedNumbers.slice(-5).reverse();

    // If no data, return mock data
    if (sortedNumbers.length === 0) {
      return res.json({
        success: true,
        hotNumbers: [
          { number: 5, frequency: 8 },
          { number: 12, frequency: 7 },
          { number: 23, frequency: 6 },
          { number: 7, frequency: 5 },
          { number: 31, frequency: 4 },
        ],
        coldNumbers: [
          { number: 36, frequency: 1 },
          { number: 42, frequency: 2 },
          { number: 18, frequency: 2 },
        ],
        totalDraws: 0,
      });
    }

    res.json({
      success: true,
      hotNumbers,
      coldNumbers,
      totalDraws: draws.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch hot/cold numbers:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch hot/cold numbers' });
  }
});

/**
 * GET /api/analytics/biggest-wins
 * Get top biggest wins
 */
router.get('/biggest-wins', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;

    const { data: winners, error: winnersError } = await supabase
      .from('Winner')
      .select(`
        id,
        amount,
        walletAddress,
        createdAt,
        ticket:Ticket(
          id,
          lottery:Lottery(
            id,
            name
          )
        ),
        draw:Draw(
          id,
          executedAt
        )
      `)
      .order('amount', { ascending: false })
      .limit(limit);

    if (winnersError) {
      console.error('Error fetching winners:', winnersError);
      return res.status(500).json({ error: 'Failed to fetch winners' });
    }

    // If no data, return mock data
    if (!winners || winners.length === 0) {
      return res.json({
        success: true,
        winners: [
          {
            amount: 7500,
            lottery: 'Weekend Special',
            walletAddress: 'UQDAy...90NwS',
            date: new Date().toISOString(),
          },
          {
            amount: 5200,
            lottery: 'Mega Jackpot',
            walletAddress: 'UQABC...XYZ12',
            date: new Date().toISOString(),
          },
          {
            amount: 3800,
            lottery: 'Daily Draw',
            walletAddress: 'UQDEF...ABC45',
            date: new Date().toISOString(),
          },
        ],
      });
    }

    // Format winners data
    const formattedWinners = winners.map((winner: any) => ({
      id: winner.id,
      amount: parseFloat(winner.amount),
      lottery: winner.ticket?.lottery?.name || 'Unknown Lottery',
      walletAddress: winner.walletAddress,
      date: winner.draw?.executedAt || winner.createdAt,
    }));

    res.json({
      success: true,
      winners: formattedWinners,
    });
  } catch (error: any) {
    console.error('Failed to fetch biggest wins:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch biggest wins' });
  }
});

/**
 * GET /api/analytics/draw-history
 * Get draw history for the last N days
 */
router.get('/draw-history', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get tickets grouped by date
    const { data: tickets, error: ticketsError } = await supabase
      .from('Ticket')
      .select('createdAt')
      .gte('createdAt', startDate.toISOString());

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return res.status(500).json({ error: 'Failed to fetch tickets' });
    }

    // Group tickets by day
    const ticketsByDay: Record<string, number> = {};
    
    if (tickets) {
      for (const ticket of tickets) {
        const date = new Date(ticket.createdAt);
        const dayKey = date.toISOString().split('T')[0];
        ticketsByDay[dayKey] = (ticketsByDay[dayKey] || 0) + 1;
      }
    }

    // Create array for last N days
    const historyData = [];
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      historyData.push({
        date: dayKey,
        label: dayLabels[dayOfWeek],
        count: ticketsByDay[dayKey] || 0,
      });
    }

    // Calculate max for percentage
    const maxCount = Math.max(...historyData.map(d => d.count), 1);
    const dataWithPercentage = historyData.map(d => ({
      ...d,
      percentage: (d.count / maxCount) * 100,
    }));

    // Calculate total
    const totalTickets = historyData.reduce((sum, d) => sum + d.count, 0);

    res.json({
      success: true,
      history: dataWithPercentage,
      totalTickets,
      days,
    });
  } catch (error: any) {
    console.error('Failed to fetch draw history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch draw history' });
  }
});

/**
 * GET /api/analytics/all-time-stats
 * Get all-time statistics
 */
router.get('/all-time-stats', async (req, res) => {
  try {
    // Get total draws
    const { count: totalDraws, error: drawsError } = await supabase
      .from('Draw')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get total winners
    const { count: totalWinners, error: winnersError } = await supabase
      .from('Winner')
      .select('*', { count: 'exact', head: true });

    // Get all winner amounts for calculations
    const { data: winners, error: winnersDataError } = await supabase
      .from('Winner')
      .select('amount');

    // Calculate prize pool and average
    let totalPrizePool = 0;
    let avgWin = 0;
    let biggestWin = 0;

    if (winners && winners.length > 0) {
      totalPrizePool = winners.reduce((sum, w) => sum + parseFloat(w.amount), 0);
      avgWin = totalPrizePool / winners.length;
      biggestWin = Math.max(...winners.map(w => parseFloat(w.amount)));
    }

    // Get most popular numbers from all draws
    const { data: draws } = await supabase
      .from('Draw')
      .select('winningNumbers')
      .eq('status', 'completed');

    const numberFrequency: Record<number, number> = {};
    if (draws) {
      for (const draw of draws) {
        if (draw.winningNumbers && Array.isArray(draw.winningNumbers)) {
          for (const num of draw.winningNumbers) {
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          }
        }
      }
    }

    const mostPopularNumbers = Object.entries(numberFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => parseInt(num));

    // Calculate win rate (winners / total tickets)
    const { count: totalTickets } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true });

    const winRate = totalTickets && totalTickets > 0 
      ? ((totalWinners || 0) / totalTickets) * 100 
      : 0;

    // If no data, return mock data
    if (!totalDraws || totalDraws === 0) {
      return res.json({
        success: true,
        stats: {
          totalDraws: 23,
          totalWinners: 156,
          totalPrizePool: 45670,
          avgWin: 292,
          biggestWin: 7500,
          mostPopularNumbers: [5, 12, 23],
          winRate: 6.8,
        },
      });
    }

    res.json({
      success: true,
      stats: {
        totalDraws: totalDraws || 0,
        totalWinners: totalWinners || 0,
        totalPrizePool: Math.round(totalPrizePool * 100) / 100,
        avgWin: Math.round(avgWin * 100) / 100,
        biggestWin: Math.round(biggestWin * 100) / 100,
        mostPopularNumbers,
        winRate: Math.round(winRate * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch all-time stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch all-time stats' });
  }
});

export default router;
