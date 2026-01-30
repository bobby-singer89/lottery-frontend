import { useState, useEffect } from 'react';
import './CurrencyToggleMini.css';

interface CurrencyToggleMiniProps {
  onChange?: (currency: 'TON' | 'USDT') => void;
}

export default function CurrencyToggleMini({ onChange }: CurrencyToggleMiniProps) {
  const [currency, setCurrency] = useState<'TON' | 'USDT'>('TON');

  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency') as 'TON' | 'USDT';
    if (saved) {
      setCurrency(saved);
    }
  }, []);

  function handleToggle(newCurrency: 'TON' | 'USDT') {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    if (onChange) {
      onChange(newCurrency);
    }
  }

  return (
    <div className="currency-toggle-mini">
      <button
        className={currency === 'TON' ? 'active' : ''}
        onClick={() => handleToggle('TON')}
        title="TON"
      >
        💎
      </button>
      <button
        className={currency === 'USDT' ? 'active' : ''}
        onClick={() => handleToggle('USDT')}
        title="USDT"
      >
        💵
      </button>
    </div>
  );
}
