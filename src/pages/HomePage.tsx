import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '../lib/api/client';
import './HomePage.css';

interface Lottery {
  id: string;
  slug: string;
  name: string;
  currency: string;
  ticketPrice: number;
  jackpot: number;
  featured: boolean;
}

export default function HomePage() {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLotteries();
    loadExchangeRate();
  }, []);

  async function loadLotteries() {
    try {
      const response = await apiClient.getLotteries();
      setLotteries(response.lotteries);
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
