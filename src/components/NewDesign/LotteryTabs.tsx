import React from 'react';
import './LotteryTabs.css';

interface LotteryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'draw', label: 'Draw Lotteries' },
  { id: 'keno', label: 'Keno' },
  { id: 'momentum', label: 'Momentum' }
];

const LotteryTabs: React.FC<LotteryTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="lottery-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default LotteryTabs;
