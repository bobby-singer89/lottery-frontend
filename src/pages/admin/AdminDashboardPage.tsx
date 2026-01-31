import { useState, useEffect } from 'react';
import './AdminDashboardPage.css';

interface Stats {
  totalTickets: number;
  totalSales: string;
  totalDraws: number;
  totalWinners: number;
  activeLotteries: number;
  pendingPayouts: number;
}

interface Activity {
  id: string;
  createdAt: string;
  price: number;
  Lottery: { name: string };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setStats(data.overview);
      setActivity(data.recentActivity || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{stats?.totalTickets || 0}</div>
          <div className="stat-label">Total Tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats?.totalSales || '0.00'} TON</div>
          <div className="stat-label">Total Sales</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎲</div>
          <div className="stat-value">{stats?.totalDraws || 0}</div>
          <div className="stat-label">Draws</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats?.totalWinners || 0}</div>
          <div className="stat-label">Winners</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎰</div>
          <div className="stat-value">{stats?.activeLotteries || 0}</div>
          <div className="stat-label">Active Lotteries</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats?.pendingPayouts || 0}</div>
          <div className="stat-label">Pending Payouts</div>
        </div>
      </div>

      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activity.length === 0 ? (
            <p className="empty-message">No recent activity</p>
          ) : (
            activity.map(item => (
              <div key={item.id} className="activity-item">
                <span className="activity-icon">🎫</span>
                <span className="activity-text">
                  Ticket purchased for {item.Lottery?.name || 'Unknown'}
                </span>
                <span className="activity-amount">{item.price} TON</span>
                <span className="activity-time">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
