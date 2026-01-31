import React from 'react';
import '../ui/GlassCard.css';
import './AnalyticsComponents.css';

const WinProbabilityCard: React.FC = () => {
  const probabilities = [
    { match: 5, percentage: 0.00001, odds: '1 in 10,000,000' },
    { match: 4, percentage: 0.01, odds: '1 in 10,000' },
    { match: 3, percentage: 1.5, odds: '1 in 66' },
  ];

  const handleCalculate = () => {
    // Future enhancement: Open modal with odds calculator
    alert('Калькулятор шансов скоро будет доступен!');
  };

  return (
    <div className="glass-card">
      <h2 className="card-title">🎯 Win Probability</h2>
      <p className="card-subtitle">Your chances to win</p>
      
      <div className="probability-list">
        {probabilities.map(({ match, percentage, odds }) => (
          <div key={match} className="probability-item">
            <div className="probability-header">
              <span className="probability-match">Match {match}/5</span>
              <span className="probability-percentage">{percentage}%</span>
            </div>
            <div className="probability-bar">
              <div 
                className="probability-bar-fill"
                style={{ width: `${Math.min(percentage * 10, 100)}%` }}
              />
            </div>
            <div className="probability-odds">{odds}</div>
          </div>
        ))}
      </div>
      
      <button className="glass-button" onClick={handleCalculate}>Calculate My Odds</button>
    </div>
  );
};

export default WinProbabilityCard;
