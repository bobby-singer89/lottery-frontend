import { motion } from 'framer-motion';

interface ActivityData {
  date: string;
  tickets: number;
  wins: number;
}

interface ActivityCardProps {
  activity: ActivityData[] | null;
  summary: {
    totalTickets: number;
    totalWins: number;
    days: number;
  } | null;
  isLoading: boolean;
}

function ActivityCard({ activity, summary, isLoading }: ActivityCardProps) {
  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  // Get the last 7 days for the chart
  const last7Days = activity?.slice(-7) || [];
  const maxTickets = Math.max(...last7Days.map(d => d.tickets), 1);

  return (
    <div className="profile-card">
      <h2 className="card-title">📊 Activity (30 days)</h2>
      
      <div className="activity-chart">
        {last7Days.map((day, index) => (
          <motion.div
            key={day.date}
            className="chart-bar"
            initial={{ height: 0 }}
            animate={{ height: `${(day.tickets / maxTickets) * 100}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="bar-fill" style={{ height: '100%' }}>
              {day.tickets > 0 && <span className="bar-value">{day.tickets}</span>}
            </div>
            <div className="bar-label">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="activity-summary">
        <div className="summary-item">
          <div className="summary-label">Total Tickets</div>
          <div className="summary-value">{summary?.totalTickets || 0}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Active Days</div>
          <div className="summary-value">{last7Days.length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Wins</div>
          <div className="summary-value">{summary?.totalWins || 0}</div>
        </div>
      </div>
    </div>
  );
}

export default ActivityCard;
