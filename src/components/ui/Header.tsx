import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onCurrencyChange?: (currency: 'TON' | 'USDT') => void;
  defaultCurrency?: 'TON' | 'USDT';
}

export default function Header({ onCurrencyChange, defaultCurrency = 'TON' }: HeaderProps) {
  const [currency, setCurrency] = useState<'TON' | 'USDT'>(
    () => (localStorage.getItem('preferredCurrency') as 'TON' | 'USDT') || defaultCurrency
  );

  const handleCurrencyChange = (newCurrency: 'TON' | 'USDT') => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    onCurrencyChange?.(newCurrency);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: newCurrency }));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Weekend Millions
        </div>

        {/* Currency Switcher */}
        <motion.div
          className="flex items-center gap-1 bg-black/50 rounded-full p-1 backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.05 }}
        >
          {(['TON', 'USDT'] as const).map((c) => (
            <motion.button
              key={c}
              onClick={() => handleCurrencyChange(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currency === c
                  ? c === 'TON'
                    ? 'bg-purple-600/80 shadow-lg shadow-purple-500/50 text-white'
                    : 'bg-green-600/80 shadow-lg shadow-green-500/50 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
