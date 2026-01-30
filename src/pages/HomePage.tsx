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
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCurrency, setSelectedCurrency] = useState<'TON' | 'USDT' | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    loadLotteries();
    loadExchangeRate();
  }, []);

  // Add global currency change listener
  useEffect(() => {
    function handleGlobalCurrencyChange(e: Event) {
      const customEvent = e as CustomEvent<{ currency: 'TON' | 'USDT' }>;
      const newCurrency = customEvent.detail.currency;
      
      console.log('Global currency changed to:', newCurrency);
      setSelectedCurrency(newCurrency);
      loadLotteries(newCurrency);
    }

    window.addEventListener('currencyChange', handleGlobalCurrencyChange);
    
    return () => {
      window.removeEventListener('currencyChange', handleGlobalCurrencyChange);
    };
  }, []);

  async function loadLotteries(currency?: 'TON' | 'USDT') {
    try {
      setLoading(true);
      console.log('Loading lotteries, currency:', currency);
      
      const response = await apiClient.getLotteries(currency);
      
      console.log('Lotteries response:', response);
      
      let allLotteries = response.lotteries || [];
      
      // Set mock data flag
      setUsingMockData(response._isMock || false);
      
      // Log if using mock data
      if (response._isMock) {
        console.log('📦 Using mock lottery data (API not available)');
      }
      
      // Smart filtering with fallback
      if (currency && allLotteries.length > 0) {
        const filtered = allLotteries.filter(lottery => lottery.currency === currency);
        
        // If filter returns results, use them
        // Otherwise show all lotteries
        if (filtered.length > 0) {
          console.log(`Showing ${filtered.length} ${currency} lotteries`);
          setLotteries(filtered);
        } else {
          console.warn(`No ${currency} lotteries found, showing all ${allLotteries.length} lotteries`);
          setLotteries(allLotteries);
        }
      } else {
        // No currency filter - show all
        console.log(`Showing all ${allLotteries.length} lotteries`);
        setLotteries(allLotteries);
      }
      
    } catch (error) {
      console.error('Failed to load lotteries:', error);
      // Don't clear lotteries on error - keep previous state
    } finally {
      setLoading(false);
    }
  }

  async function loadExchangeRate() {
    try {
      const response = await apiClient.getExchangeRate('TON', 'USDT');
      setExchangeRate(response.rate || 5.2);
    } catch (error) {
      console.error('Failed to load exchange rate:', error);
      setExchangeRate(5.2); // Default fallback
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
                      className={`lottery-card ${lottery.featured ? 'featured' : ''} ${
                        selectedCurrency && lottery.currency === selectedCurrency ? 'highlighted' : ''
                      } ${
                        selectedCurrency && lottery.currency !== selectedCurrency ? 'dimmed' : ''
                      }`}
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
                    Нет активных лотерей
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Development indicator */}
      {usingMockData && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 107, 53, 0.2)',
          border: '1px solid rgba(255, 107, 53, 0.5)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
        }}>
          🎲 Mock Data (API unavailable)
        </div>
      )}
    </div>
  );
}
