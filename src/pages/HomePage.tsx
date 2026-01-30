import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient, type Lottery } from '../lib/api/client';
import CurrencySwitcher from '../components/CurrencySwitcher/CurrencySwitcher';
import './HomePage.css';

export default function HomePage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.2);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'TON' | 'USDT'>('TON');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    const currency = (savedCurrency === 'TON' || savedCurrency === 'USDT') ? savedCurrency : 'TON';
    setSelectedCurrency(currency);
    loadLotteries(currency);
    loadExchangeRate();
  }, []);

  async function loadLotteries(currency?: 'TON' | 'USDT') {
    try {
      const response = await apiClient.getLotteries();
      // Filter lotteries by currency if specified
      let filteredLotteries = response.lotteries;
      if (currency) {
        filteredLotteries = response.lotteries.filter(lottery => lottery.currency === currency);
      }
      setLotteries(filteredLotteries);
    } catch (error) {
      console.error('Failed to load lotteries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadExchangeRate() {
    try {
      const response = await apiClient.getExchangeRate('TON', 'USDT');
      setExchangeRate(response.rate);
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
    }
  }

  const getCurrencyIcon = (currency: string) => {
    return currency === 'TON' ? '💎' : '💵';
  };

  function handleCurrencyChange(currency: 'TON' | 'USDT') {
    setSelectedCurrency(currency);
    loadLotteries(currency);
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
      <h1>🎰 Доступные лотереи</h1>

      {/* Currency Switcher */}
      <CurrencySwitcher 
        defaultCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
      />

      <div className="exchange-rate-banner">
        💱 Курс: 1 TON = {exchangeRate.toFixed(2)} USDT
      </div>

      <div className="lotteries-grid">
        {lotteries.map((lottery, index) => (
          <motion.div
            key={lottery.id}
            className={`lottery-card ${lottery.featured ? 'featured' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="lottery-header">
              <h2>{lottery.name}</h2>
              <span className="currency-badge">
                {getCurrencyIcon(lottery.currency)} {lottery.currency}
              </span>
            </div>

            <div className="jackpot">
              <span className="label">Джекпот:</span>
              <span className="amount">
                {getCurrencyIcon(lottery.currency)} {lottery.jackpot.toLocaleString()} {lottery.currency}
              </span>
              {lottery.currency === 'TON' && (
                <span className="equivalent">
                  ≈ {(lottery.jackpot * exchangeRate).toFixed(0)} USDT
                </span>
              )}
            </div>

            <div className="ticket-price">
              Билет: {lottery.ticketPrice} {lottery.currency}
            </div>

            <a href={`/lottery/${lottery.slug}`} className="play-btn">
              🎲 Играть
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
