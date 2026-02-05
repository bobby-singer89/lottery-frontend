import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onCurrencyChange?: (currency: 'TON' | 'USDT') => void;
  defaultCurrency?: 'TON' | 'USDT';
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
}

export default function Header({
  onCurrencyChange,
  defaultCurrency = 'TON',
  showSearch = false,
  showNotifications = false,
  notificationCount = 0,
}: HeaderProps) {
  const [currency, setCurrency] = useState<'TON' | 'USDT'>(defaultCurrency);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleCurrencyChange = (newCurrency: 'TON' | 'USDT') => {
    setCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.h1
              className="text-xl font-bold"
              style={{
                background: 'var(--theme-text-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              WEEKEND MILLIONS
            </motion.h1>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-4">
            <div
              className="relative inline-flex p-1 rounded-full"
              style={{
                background: 'var(--glass-background)',
                border: '1px solid var(--glass-border)',
              }}
            >
              {/* Animated background indicator */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-full"
                style={{
                  background: 'var(--theme-accent-gradient)',
                  width: 'calc(50% - 4px)',
                }}
                initial={false}
                animate={{
                  left: currency === 'TON' ? '4px' : 'calc(50%)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                layoutId="currency-indicator"
              />

              {/* TON button */}
              <button
                onClick={() => handleCurrencyChange('TON')}
                className="relative px-6 py-2 text-sm font-semibold transition-colors z-10"
                style={{
                  color: currency === 'TON' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                TON
              </button>

              {/* USDT button */}
              <button
                onClick={() => handleCurrencyChange('USDT')}
                className="relative px-6 py-2 text-sm font-semibold transition-colors z-10"
                style={{
                  color: currency === 'USDT' ? '#fff' : 'var(--text-secondary)',
                }}
              >
                USDT
              </button>
            </div>

            {/* Search (optional) */}
            {showSearch && (
              <div className="relative">
                <AnimatePresence>
                  {searchExpanded ? (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      type="text"
                      placeholder="Search..."
                      className="px-4 py-2 rounded-full text-sm"
                      style={{
                        background: 'var(--glass-background)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                      }}
                      onBlur={() => setSearchExpanded(false)}
                      autoFocus
                    />
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchExpanded(true)}
                      className="p-2 rounded-full"
                      style={{
                        background: 'var(--glass-background)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <Search size={20} color="var(--text-primary)" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Notifications (optional) */}
            {showNotifications && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 rounded-full"
                style={{
                  background: 'var(--glass-background)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <Bell size={20} color="var(--text-primary)" />
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'var(--theme-accent-gradient)',
                      color: '#fff',
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </motion.span>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
