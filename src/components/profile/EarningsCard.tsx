import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

interface EarningsCardProps {
  earnings: {
    spent: string;
    won: string;
    referralEarnings: string;
    netProfit: string;
  } | null;
  isLoading: boolean;
}

function EarningsCard({ earnings, isLoading }: EarningsCardProps) {
  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  const netProfit = parseFloat(earnings?.netProfit || '0');
  const isProfitable = netProfit > 0;

  return (
    <div className="profile-card">
      <h2 className="card-title">💰 Earnings</h2>
      
      <div className="earnings-breakdown">
        <motion.div
          className="earning-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="earning-icon spent">
            <TrendingDown size={20} />
          </div>
          <div className="earning-info">
            <div className="earning-label">Spent</div>
            <div className="earning-value">{earnings?.spent || '0'} TON</div>
          </div>
        </motion.div>

        <motion.div
          className="earning-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="earning-icon won">
            <TrendingUp size={20} />
          </div>
          <div className="earning-info">
            <div className="earning-label">Won</div>
            <div className="earning-value">{earnings?.won || '0'} TON</div>
          </div>
        </motion.div>

        <motion.div
          className="earning-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="earning-icon referral">
            <Users size={20} />
          </div>
          <div className="earning-info">
            <div className="earning-label">Referral Earnings</div>
            <div className="earning-value">{earnings?.referralEarnings || '0'} TON</div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="total-profit"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="profit-icon">
          <DollarSign size={32} />
        </div>
        <div className="profit-details">
          <div className="profit-label">Total Result</div>
          <div className={`profit-amount ${isProfitable ? 'positive' : 'neutral'}`}>
            {isProfitable ? '+' : ''}{earnings?.netProfit || '0'} TON
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default EarningsCard;
