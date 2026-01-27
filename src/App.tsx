import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import LotteryCarousel from './components/LotteryCarousel/LotteryCarousel';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import DemoPage from './pages/DemoPage';
import WeekendSpecial from './pages/WeekendSpecial';
import ProfilePage from './pages/ProfilePage';
import LotteriesPage from './pages/LotteriesPage';
import HistoryPage from './pages/HistoryPage';
import ReferralPage from './pages/ReferralPage';
import { AuthProvider } from './contexts/AuthContext';
import { apiClient } from './lib/api/client';
import type { Lottery } from './types/lottery';
import './App.css';

declare global {
  interface Window {
    tonConnectButton?: HTMLButtonElement;
  }
}

// Age Gate Component
function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="age-overlay">
      <motion.div
        className="age-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h2 className="age-title">Вход в Weekend Millions</h2>
        <p className="age-text">
          Подтвердите, что вам уже <strong>18 лет</strong>, чтобы продолжить.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="pill-btn pill-solid"
          onClick={onConfirm}
        >
          Мне 18+
        </motion.button>
        <p className="age-subtext">Если вам нет 18 лет, покиньте приложение.</p>
      </motion.div>
    </div>
  );
}

function MainScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getLotteryList();
        if (response.success && response.lotteries) {
          setLotteries(response.lotteries);
        }
      } catch (error) {
        console.error('Failed to fetch lotteries:', error);
        // Fallback to sample data on error
        setLotteries([
          {
            id: '1',
            slug: 'mega-jackpot',
            title: 'Mega Jackpot',
            prizePool: '10,000 TON',
            drawDate: '25 января 2026',
            ticketPrice: '10 TON',
            participants: 1234,
            icon: 'trending' as const,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  const handleBuyTicket = (slug: string) => {
    navigate(`/lottery/${slug}`);
  };

  const handleConnect = () => {
    console.log('Connecting wallet...');
    // TODO: Implement wallet connection logic
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
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

  return (
    <div className="app-root">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Header */}
        <Header onConnect={handleConnect} />

        {/* Main Content */}
        <main className="main-content">
          {/* Hero Section */}
          <Hero />

          {/* Lottery Carousel */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
              Loading lotteries...
            </div>
          ) : (
            <LotteryCarousel
              lotteries={lotteries}
              onBuyTicket={handleBuyTicket}
            />
          )}
        </main>

        {/* Footer Navigation */}
        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    return localStorage.getItem('ageConfirmed') === 'true';
  });

  const handleAgeConfirm = () => {
    localStorage.setItem('ageConfirmed', 'true');
    setAgeConfirmed(true);
  };

  return (
    <TonConnectUIProvider manifestUrl="https://ton-connect-manifest.vercel.app/manifest.json">
      <AuthProvider>
        {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}
        {ageConfirmed && (
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/weekend-special" element={<WeekendSpecial />} />
            <Route path="/lottery/:slug" element={<WeekendSpecial />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/lotteries" element={<LotteriesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/referral" element={<ReferralPage />} />
          </Routes>
        )}
      </AuthProvider>
    </TonConnectUIProvider>
  );
}

export default App;
