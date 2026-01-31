import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

interface HotNumbersCardProps {
  numbers: Array<{ number: number; frequency: number }>;
  totalDraws: number;
}

const HotNumbersCard: React.FC<HotNumbersCardProps> = ({ numbers, totalDraws }) => {
  const maxFrequency = Math.max(...numbers.map(n => n.frequency), 1);

  return (
    <div className="glass-card glass-card-hot">
      <h2 className="card-title">🔥 Hot Numbers</h2>
      <p className="card-subtitle">Last {totalDraws} draws</p>
      
      <div className="numbers-list">
        {numbers.map(({ number, frequency }) => (
          <div key={number} className="number-row">
            <div className="number-badge hot">{number}</div>
            <div className="frequency-bar">
              <div 
                className="frequency-bar-fill hot"
                style={{ width: `${(frequency / maxFrequency) * 100}%` }}
              />
            </div>
            <span className="frequency-text">{frequency}×</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotNumbersCard;
