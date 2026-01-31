import { Router } from 'express';
import { supabase } from '../../lib/supabase';

const router = Router();

/**
 * GET /api/user/profile/stats
 * Get user's lottery statistics
 */
router.get('/stats', async (req, res) => {
  const { walletAddress, telegramId } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id, createdAt');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get ticket statistics
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('id, status, winAmount')
      .eq('userId', user.id);

    const totalTickets = tickets?.length || 0;
    const wonTickets = tickets?.filter(t => t.status === 'won').length || 0;
    const totalWon = tickets
      ?.filter(t => t.status === 'won')
      .reduce((sum, t) => sum + parseFloat(t.winAmount || '0'), 0) || 0;

    // Calculate total spent (assuming each ticket costs something)
    const { data: ticketsWithPrice } = await supabase
      .from('Ticket')
      .select(`
        id,
        draw:Draw(
          lottery:Lottery(ticketPrice)
        )
      `)
      .eq('userId', user.id);

    const totalSpent = ticketsWithPrice?.reduce((sum, t: any) => {
      const price = t.draw?.lottery?.ticketPrice || 0;
      return sum + parseFloat(price);
    }, 0) || 0;

    const netProfit = totalWon - totalSpent;

    res.json({
      success: true,
      stats: {
        ticketsBought: totalTickets,
        wins: wonTickets,
        tonWon: totalWon.toFixed(2),
        tonSpent: totalSpent.toFixed(2),
        netProfit: netProfit.toFixed(2),
        memberSince: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/profile/achievements
 * Get user's achievements
 */
router.get('/achievements', async (req, res) => {
  const { walletAddress, telegramId } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get ticket statistics for achievements
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('id, status, winAmount')
      .eq('userId', user.id);

    const totalTickets = tickets?.length || 0;
    const wonTickets = tickets?.filter(t => t.status === 'won').length || 0;
    const totalWon = tickets
      ?.filter(t => t.status === 'won')
      .reduce((sum, t) => sum + parseFloat(t.winAmount || '0'), 0) || 0;

    // Define achievements
    const achievements = [
      {
        id: 'first_ticket',
        name: 'First Steps',
        description: 'Buy your first ticket',
        icon: '🎫',
        unlocked: totalTickets >= 1,
        progress: Math.min(totalTickets, 1),
        target: 1,
      },
      {
        id: 'ticket_collector',
        name: 'Collector',
        description: 'Buy 10 tickets',
        icon: '🎖️',
        unlocked: totalTickets >= 10,
        progress: Math.min(totalTickets, 10),
        target: 10,
      },
      {
        id: 'first_win',
        name: 'Lucky Beginner',
        description: 'Win your first prize',
        icon: '🔥',
        unlocked: wonTickets >= 1,
        progress: Math.min(wonTickets, 1),
        target: 1,
      },
      {
        id: 'big_winner',
        name: 'Big Winner',
        description: 'Win 100+ TON total',
        icon: '💎',
        unlocked: totalWon >= 100,
        progress: Math.min(totalWon, 100),
        target: 100,
      },
    ];

    res.json({
      success: true,
      achievements,
    });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/profile/activity
 * Get user's activity over the last N days
 */
router.get('/activity', async (req, res) => {
  const { walletAddress, telegramId, days = 30 } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const daysNum = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get tickets purchased in the last N days
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('id, createdAt, status')
      .eq('userId', user.id)
      .gte('createdAt', startDate.toISOString());

    // Group by date
    const activityByDate: { [key: string]: { tickets: number; wins: number } } = {};
    
    tickets?.forEach((ticket) => {
      const date = new Date(ticket.createdAt).toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = { tickets: 0, wins: 0 };
      }
      activityByDate[date].tickets += 1;
      if (ticket.status === 'won') {
        activityByDate[date].wins += 1;
      }
    });

    // Convert to array format
    const activity = Object.entries(activityByDate).map(([date, data]) => ({
      date,
      tickets: data.tickets,
      wins: data.wins,
    }));

    res.json({
      success: true,
      activity,
      summary: {
        totalTickets: tickets?.length || 0,
        totalWins: tickets?.filter(t => t.status === 'won').length || 0,
        days: daysNum,
      },
    });
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/profile/favorite-numbers
 * Get user's most frequently picked numbers
 */
router.get('/favorite-numbers', async (req, res) => {
  const { walletAddress, telegramId } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all tickets with numbers
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('numbers')
      .eq('userId', user.id);

    // Count number frequencies
    const numberFrequency: { [key: number]: number } = {};
    
    tickets?.forEach((ticket) => {
      const numbers = ticket.numbers as number[];
      numbers.forEach((num) => {
        numberFrequency[num] = (numberFrequency[num] || 0) + 1;
      });
    });

    // Sort by frequency and get top 5
    const favoriteNumbers = Object.entries(numberFrequency)
      .map(([number, count]) => ({
        number: parseInt(number),
        frequency: count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    res.json({
      success: true,
      favoriteNumbers,
    });
  } catch (error: any) {
    console.error('Error fetching favorite numbers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/profile/earnings
 * Get user's earnings breakdown
 */
router.get('/earnings', async (req, res) => {
  const { walletAddress, telegramId } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id, referralCode');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get ticket statistics
    const { data: ticketsWithPrice } = await supabase
      .from('Ticket')
      .select(`
        id,
        status,
        winAmount,
        draw:Draw(
          lottery:Lottery(ticketPrice)
        )
      `)
      .eq('userId', user.id);

    const totalSpent = ticketsWithPrice?.reduce((sum, t: any) => {
      const price = t.draw?.lottery?.ticketPrice || 0;
      return sum + parseFloat(price);
    }, 0) || 0;

    const totalWon = ticketsWithPrice
      ?.filter((t: any) => t.status === 'won')
      .reduce((sum, t: any) => sum + parseFloat(t.winAmount || '0'), 0) || 0;

    // Get referral earnings
    const { data: referrals } = await supabase
      .from('User')
      .select('id')
      .eq('referredBy', user.referralCode);

    // Simplified referral earnings calculation (5% of their spending)
    const referralEarnings = (referrals?.length || 0) * 0.5; // Simplified

    const netProfit = totalWon - totalSpent + referralEarnings;

    res.json({
      success: true,
      earnings: {
        spent: totalSpent.toFixed(2),
        won: totalWon.toFixed(2),
        referralEarnings: referralEarnings.toFixed(2),
        netProfit: netProfit.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/profile/recent-tickets
 * Get user's recent tickets
 */
router.get('/recent-tickets', async (req, res) => {
  const { walletAddress, telegramId, limit = 6 } = req.query;

  if (!walletAddress && !telegramId) {
    return res.status(400).json({ error: 'Wallet address or Telegram ID required' });
  }

  try {
    // Find user
    let userQuery = supabase.from('User').select('id');
    
    if (walletAddress) {
      userQuery = userQuery.eq('tonWallet', walletAddress);
    } else if (telegramId) {
      userQuery = userQuery.eq('telegramId', telegramId);
    }

    const { data: user } = await userQuery.single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const limitNum = parseInt(limit as string);

    // Get recent tickets
    const { data: tickets } = await supabase
      .from('Ticket')
      .select(`
        id,
        ticketNumber,
        numbers,
        status,
        winAmount,
        createdAt,
        draw:Draw(
          id,
          drawNumber,
          drawDate,
          status,
          winningNumbers,
          lottery:Lottery(
            id,
            name,
            slug
          )
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(limitNum);

    res.json({
      success: true,
      tickets: tickets || [],
    });
  } catch (error: any) {
    console.error('Error fetching recent tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
