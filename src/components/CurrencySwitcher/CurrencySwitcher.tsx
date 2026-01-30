import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTonAddress } from '@tonconnect/ui-react';
import { apiClient } from '../../lib/api/client';
import './CurrencySwitcher.css';

export type Currency = 'TON' | 'USDT';

interface CurrencySwitcherProps {
  selected: Currency;
  onChange: (currency: Currency) => void;
}

export default function CurrencySwitcher({ selected, onChange }: CurrencySwitcherProps) {
  const wallet = useTonAddress();
  const [balances, setBalances] = useState({ TON: 0, USDT: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet) {
      loadBalances();
    }
  }, [wallet]);

  async function loadBalances() {
    try {
      setLoading(true);
      const response = await apiClient.getUserBalance(wallet);
      setBalances(response.balances);

      // Auto-select currency with balance
      const savedCurrency = localStorage.getItem('preferredCurrency') as Currency;
      
      if (!savedCurrency) {
        // Smart selection: choose currency with balance
        if (response.balances.USDT > response.balances.TON * 5) {
          onChange('USDT');
        } else if (response.balances.TON > 0) {
          onChange('TON');
        }
      }
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCurrencyChange(currency: Currency) {
    onChange(currency);
    localStorage.setItem('preferredCurrency', currency);
  }

  return (
    <div className="currency-switcher">
      <span className="label">Играть в:</span>
      
      <div className="switcher-buttons">
        <motion.button
          className={`currency-btn ${selected === 'TON' ? 'active' : ''}`}
          onClick={() => handleCurrencyChange('TON')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="currency-icon">💎</span>
          <span className="currency-name">TON</span>
          {wallet && (
            <span className="balance">
              {loading ? '...' : balances.TON.toFixed(2)}
            </span>
          )}
        </motion.button>

        <motion.button
          className={`currency-btn ${selected === 'USDT' ? 'active' : ''}`}
          onClick={() => handleCurrencyChange('USDT')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="currency-icon">💵</span>
          <span className="currency-name">USDT</span>
          {wallet && (
            <span className="balance">
              {loading ? '...' : balances.USDT.toFixed(2)}
            </span>
          )}
        </motion.button>
      </div>

      {/* Hint based on balance */}
      {wallet && renderHint()}
    </div>
  );

  function renderHint() {
    if (selected === 'TON' && balances.TON === 0 && balances.USDT > 0) {
      return (
        <motion.div
          className="currency-hint"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          💡 У вас есть {balances.USDT.toFixed(2)} USDT, но нет TON
          <a href="/swap">Обменять USDT на TON →</a>
        </motion.div>
      );
    }

    if (selected === 'USDT' && balances.USDT === 0 && balances.TON > 0) {
      return (
        <motion.div
          className="currency-hint"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          💡 Нет USDT?
          <a href="/swap">Обменять TON на USDT →</a>
        </motion.div>
      );
    }

    if (selected === 'TON' && balances.TON > 0) {
      return (
        <motion.div
          className="currency-hint success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ У вас есть {balances.TON.toFixed(2)} TON, отлично!
        </motion.div>
      );
    }

    return null;
  }
}
