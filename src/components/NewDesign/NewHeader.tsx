import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import './NewHeader.css';

interface NewHeaderProps {
  onSettingsClick?: () => void;
}

const NewHeader: React.FC<NewHeaderProps> = ({ onSettingsClick }) => {
  const [currency, setCurrency] = useState<'TON' | 'USDT'>('TON');

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TON' ? 'USDT' : 'TON');
  };

  return (
    <header className="new-header">
      <div className="new-header-logo">
        <div className="logo-icon">W</div>
        <span className="logo-text">WEEKEND MILLIONS</span>
      </div>
      
      <div className="new-header-actions">
        <div className="currency-toggle">
          <button 
            className={`currency-btn ${currency === 'TON' ? 'active' : ''}`}
            onClick={toggleCurrency}
          >
            TON
          </button>
          <button 
            className={`currency-btn ${currency === 'USDT' ? 'active' : ''}`}
            onClick={toggleCurrency}
          >
            USDT
          </button>
        </div>
        
        <button className="settings-btn" onClick={onSettingsClick}>
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};

export default NewHeader;
