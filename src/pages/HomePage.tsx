import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, type Lottery } from '../lib/api/client';
import CurrencySwitcher, { Currency } from '../components/CurrencySwitcher/CurrencySwitcher';
import './HomePage.css';

export default function HomePage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('TON');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency') as Currency;
    if (saved) {
      setSelectedCurrency(saved);
    }
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await apiClient.getAllLotteries();
      setLotteries(response.lotteries);
      setExchangeRate(response.exchangeRate || 5.2);
    } catch (error) {
      console.error('Failed to load lotteries:', error);
    } finally {
      setLoading(false);
    }
  }

  const getCurrencyIcon = (currency: string) => {
    return currency === 'TON' ? '💎' : '💵';
  };

  // Convert lottery data to selected currency
  function convertToCurrency(lottery: Lottery) {
    // Assume lottery base currency is TON
    if (selectedCurrency === 'TON') {
      return {
        jackpot: lottery.jackpot,
        ticketPrice: lottery.ticketPrice,
      };
    }

    // Convert to USDT
    return {
      jackpot: lottery.jackpot * exchangeRate,
      ticketPrice: lottery.ticketPrice * exchangeRate,
    };
  }

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">🎰 Lottery TON</h1>
        <p className="page-subtitle">
          Decentralized lottery on TON blockchain
        </p>

        {/* Currency Switcher */}
        <CurrencySwitcher
          selected={selectedCurrency}
          onChange={setSelectedCurrency}
        />

        {/* Exchange Rate Display */}
        <div className="exchange-rate-display">
          💱 1 TON = {exchangeRate.toFixed(2)} USDT
        </div>

        {/* Lotteries Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCurrency}
            className="lotteries-grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {lotteries.map((lottery, index) => {
              const displayData = convertToCurrency(lottery);
              const icon = selectedCurrency === 'TON' ? '💎' : '💵';

              return (
                <motion.div
                  key={lottery.id}
                  className="lottery-card compact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="lottery-name">{lottery.name}</div>
                  
                  <div className="jackpot">
                    <span className="icon">{icon}</span>
                    <span className="amount">
                      {displayData.jackpot.toLocaleString()}
                    </span>
                    <span className="currency">{selectedCurrency}</span>
                  </div>
                  
                  <div className="ticket-price">
                    Билет: {displayData.ticketPrice} {selectedCurrency}
                  </div>

                  {lottery.featured && (
                    <div className="featured-badge">🔥 Популярно</div>
                  )}
                  
                  <a 
                    href={`/lottery/${lottery.slug}?currency=${selectedCurrency}`} 
                    className="play-btn"
                  >
                    Играть →
                  </a>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
