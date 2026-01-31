import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

interface AllTimeStatsCardProps {
  stats: {
    totalDraws: number;
    totalWinners: number;
    totalPrizePool: number;
    avgWin: number;
    biggestWin: number;
    mostPopularNumbers: number[];
    winRate: number;
  };
}

const AllTimeStatsCard: React.FC<AllTimeStatsCardProps> = ({ stats }) => {
  return (
    <div className="glass-card full-width-card">
      <h2 className="card-title">📊 All-Time Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalDraws}</div>
          <div className="stat-label">Total Draws</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalWinners}</div>
          <div className="stat-label">Total Winners</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalPrizePool.toLocaleString()}</div>
          <div className="stat-label">Total Prize Pool (TON)</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{Math.round(stats.avgWin)}</div>
          <div className="stat-label">Average Win (TON)</div>
        </div>
      </div>
      
      <div className="stats-extra">
        <div className="stat-extra-item">
          <span className="stat-extra-label">Biggest Single Win:</span>
          <span className="stat-extra-value">{stats.biggestWin.toLocaleString()} TON</span>
        </div>
        
        <div className="stat-extra-item">
          <span className="stat-extra-label">Most Popular Numbers:</span>
          <span className="stat-extra-value">{stats.mostPopularNumbers.join(', ')}</span>
        </div>
        
        <div className="stat-extra-item">
          <span className="stat-extra-label">Win Rate:</span>
          <span className="stat-extra-value">{stats.winRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AllTimeStatsCard;
