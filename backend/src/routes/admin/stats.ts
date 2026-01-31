import { Router } from 'express';
import { supabase } from '../../lib/supabase';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();

/**
 * GET /api/admin/stats/overview
 * Get dashboard overview statistics
 */
router.get('/overview', adminAuth, async (req, res) => {
  try {
    // Total tickets
    const { count: totalTickets } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true });

    // Total sales (sum of ticket prices)
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('price');
    
    const totalSales = tickets?.reduce((sum, t) => sum + (t.price || 0), 0) || 0;

    // Total draws
    const { count: totalDraws } = await supabase
      .from('Draw')
      .select('*', { count: 'exact', head: true });

    // Total winners
    const { count: totalWinners } = await supabase
      .from('Winner')
      .select('*', { count: 'exact', head: true });

    // Active lotteries
    const { count: activeLotteries } = await supabase
      .from('Lottery')
      .select('*', { count: 'exact', head: true })
      .eq('isActive', true);

    // Pending payouts
    const { count: pendingPayouts } = await supabase
      .from('Payout')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Recent activity (last 10 tickets)
    const { data: recentTickets } = await supabase
      .from('Ticket')
      .select('id, createdAt, price, Lottery(name)')
      .order('createdAt', { ascending: false })
      .limit(10);

    res.json({
      overview: {
        totalTickets: totalTickets || 0,
        totalSales: totalSales.toFixed(2),
        totalDraws: totalDraws || 0,
        totalWinners: totalWinners || 0,
        activeLotteries: activeLotteries || 0,
        pendingPayouts: pendingPayouts || 0,
      },
      recentActivity: recentTickets || [],
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/admin/stats/sales
 * Get sales statistics over time
 */
router.get('/sales', adminAuth, async (req, res) => {
  try {
    const { data: tickets } = await supabase
      .from('Ticket')
      .select('createdAt, price')
      .order('createdAt', { ascending: true });

    // Group by date
    const salesByDate: Record<string, number> = {};
    
    tickets?.forEach(ticket => {
      const date = new Date(ticket.createdAt).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + ticket.price;
    });

    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount,
    }));

    res.json({ sales: chartData });
  } catch (error) {
    console.error('Failed to fetch sales stats:', error);
    res.status(500).json({ error: 'Failed to fetch sales statistics' });
  }
});

export default router;
