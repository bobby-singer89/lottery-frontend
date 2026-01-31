import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

interface Winner {
  id?: string;
  amount: number;
  lottery: string;
  walletAddress: string;
  date: string;
}

interface BiggestWinsCardProps {
  winners: Winner[];
}

const BiggestWinsCard: React.FC<BiggestWinsCardProps> = ({ winners }) => {
  const medals = ['🥇', '🥈', '🥉'];
  
  const truncateWallet = (wallet: string) => {
    if (wallet.length <= 13) return wallet;
    return `${wallet.slice(0, 5)}...${wallet.slice(-5)}`;
  };

  const handleViewAll = () => {
    // Future enhancement: Navigate to winners page or open modal
    alert('Полный список победителей скоро будет доступен!');
  };

  return (
    <div className="glass-card">
      <h2 className="card-title">💰 Biggest Wins</h2>
      
      <div className="wins-list">
        {winners.slice(0, 6).map((winner, index) => (
          <div key={winner.id || index} className="win-item">
            <div className="win-medal">{medals[index] || '🏆'}</div>
            <div className="win-details">
              <div className="win-amount">{winner.amount.toLocaleString()} TON</div>
              <div className="win-info">
                <span className="win-lottery">{winner.lottery}</span>
                <span className="win-separator">•</span>
                <span className="win-wallet">{truncateWallet(winner.walletAddress)}</span>
              </div>
              <div className="win-date">
                {new Date(winner.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="glass-button" onClick={handleViewAll}>View All Winners →</button>
    </div>
  );
};

export default BiggestWinsCard;
