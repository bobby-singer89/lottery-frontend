import { motion } from 'framer-motion';
import { Ticket, Trophy, Coins } from 'lucide-react';

interface JourneyCardProps {
  stats: {
    ticketsBought: number;
    wins: number;
    tonWon: string;
    tonSpent: string;
    netProfit: string;
    memberSince: string;
  } | null;
  isLoading: boolean;
}

function JourneyCard({ stats, isLoading }: JourneyCardProps) {
  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  const netProfit = parseFloat(stats?.netProfit || '0');
  const profitEmoji = netProfit > 0 ? '📈' : netProfit < 0 ? '📊' : '➡️';
  const memberSinceDate = stats?.memberSince 
    ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';

  return (
    <div className="profile-card">
      <h2 className="card-title">🎰 My Lottery Journey</h2>
      
      <div className="stats-grid">
        <motion.div 
          className="stat-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon">
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tickets Bought</div>
            <div className="stat-value">{stats?.ticketsBought || 0}</div>
          </div>
        </motion.div>

        <motion.div 
          className="stat-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon win">
            <Trophy size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Wins</div>
            <div className="stat-value">{stats?.wins || 0}</div>
          </div>
        </motion.div>

        <motion.div 
          className="stat-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon profit">
            <Coins size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">TON Won</div>
            <div className="stat-value">{stats?.tonWon || '0'}</div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="net-profit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="profit-label">Net Result {profitEmoji}</div>
        <div className={`profit-value ${netProfit > 0 ? 'positive' : netProfit < 0 ? 'neutral' : 'neutral'}`}>
          {netProfit > 0 ? '+' : ''}{stats?.netProfit || '0'} TON
        </div>
      </motion.div>

      <motion.div 
        className="member-since"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Member since {memberSinceDate}
      </motion.div>
    </div>
  );
}

export default JourneyCard;
