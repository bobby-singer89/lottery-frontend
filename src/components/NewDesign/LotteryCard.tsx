import React from 'react';
import './LotteryCard.css';

export interface LotteryCardData {
  id: number;
  name: string;
  jackpot: number;
  color: 'blue' | 'purple' | 'pink' | 'teal' | 'green';
  drawDate: string;
}

interface LotteryCardProps {
  lottery: LotteryCardData;
  isCenter?: boolean;
}

const colorGradients = {
  blue: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  purple: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  pink: 'linear-gradient(135deg, #ec4899, #db2777)',
  teal: 'linear-gradient(135deg, #14b8a6, #0d9488)',
  green: 'linear-gradient(135deg, #22c55e, #16a34a)'
};

const LotteryCard: React.FC<LotteryCardProps> = ({ lottery, isCenter = false }) => {
  return (
    <div 
      className={`lottery-card ${isCenter ? 'center' : ''}`}
      style={{ background: colorGradients[lottery.color] }}
    >
      <div className="card-logo">W</div>
      
      <h3 className="card-title">{lottery.name}</h3>
      
      <div className="card-jackpot">
        <span className="jackpot-label">jackpot</span>
        <span className="jackpot-amount">{lottery.jackpot} TON</span>
      </div>
      
      <div className="card-draw-date">
        <span className="draw-label">Draw date</span>
        <span className="draw-value">{new Date(lottery.drawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default LotteryCard;
