import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient, type Lottery } from '../lib/api/client';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(5.2);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'TON' | 'USDT'>('TON');
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    const currency = (savedCurrency === 'TON' || savedCurrency === 'USDT') ? savedCurrency : 'TON';
    setSelectedCurrency(currency);
    loadLotteries();
    loadExchangeRate();
  }, []);

  useEffect(() => {
    function handleCurrencyChange(e: CustomEvent) {
      setSelectedCurrency(e.detail);
      // Optionally reload lotteries
      // loadLotteries(e.detail);
    }

    window.addEventListener('currencyChange', handleCurrencyChange as EventListener);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange as EventListener);
    };
  }, []);

  async function loadLotteries() {
    try {
      const response = await apiClient.getLotteries();
      
      // ALWAYS show lotteries, just mark the selected currency
      setLotteries(response.lotteries || []);
      
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

  const handleConnect = () => {
    console.log('Connecting wallet...');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch(tab) {
      case 'home':
        navigate('/');
        break;
      case 'lotteries':
        navigate('/lotteries');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'referral':
        navigate('/referral');
        break;
    }
  };

  if (loading) {
    return (
      <div className="app-root">
        <AnimatedBackground />
        <div className="content-wrapper">
          <Header onConnect={handleConnect} />
          <main className="main-content">
            <div className="home-page">
              <div className="loading">Загрузка...</div>
            </div>
          </main>
          <Footer activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="main-content">
          <div className="home-page">
            {/* Header */}
            <header className="hero-section">
              <h1 className="main-title">WEEKEND MILLIONS</h1>
              <p className="subtitle">Криптовалютная лотерея нового поколения на блокчейне TON</p>
            </header>

            {/* Lotteries Section */}
            <section className="lotteries-section">
              <h2>Активные лотереи</h2>
              <div className="lotteries-grid">
                {lotteries.length > 0 ? (
                  lotteries.map((lottery, index) => (
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

                      <Link to={`/lottery/${lottery.slug}`} className="play-btn">
                        🎲 Играть
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="no-lotteries">
                    {selectedCurrency === 'TON' 
                      ? 'Нет активных лотерей в TON' 
                      : 'Нет активных лотерей в USDT'}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
