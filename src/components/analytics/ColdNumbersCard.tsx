import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

interface ColdNumbersCardProps {
  numbers: Array<{ number: number; frequency: number }>;
  totalDraws: number;
}

const ColdNumbersCard: React.FC<ColdNumbersCardProps> = ({ numbers, totalDraws }) => {
  const maxFrequency = Math.max(...numbers.map(n => n.frequency), 1);

  return (
    <div className="glass-card glass-card-cold">
      <h2 className="card-title">❄️ Cold Numbers</h2>
      <p className="card-subtitle">Last {totalDraws} draws</p>
      
      <div className="numbers-list">
        {numbers.map(({ number, frequency }) => (
          <div key={number} className="number-row">
            <div className="number-badge cold">{number}</div>
            <div className="frequency-bar">
              <div 
                className="frequency-bar-fill cold"
                style={{ width: `${(frequency / maxFrequency) * 100}%` }}
              />
            </div>
            <span className="frequency-text">{frequency}×</span>
          </div>
        ))}
      </div>
      
      <p className="card-note">Numbers that rarely appear - try your luck!</p>
    </div>
  );
};

export default ColdNumbersCard;
