import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import LotteryCarousel from './components/LotteryCarousel/LotteryCarousel';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import DemoPage from './pages/DemoPage';
import WeekendSpecialPage from './pages/WeekendSpecialPage';
import ProfilePage from './pages/ProfilePage';
import LotteriesPage from './pages/LotteriesPage';
import HistoryPage from './pages/HistoryPage';
import ReferralPage from './pages/ReferralPage';
import AdminGuard from './components/Admin/AdminGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLotteries from './pages/admin/AdminLotteries';
import AdminDraws from './pages/admin/AdminDraws';
import AdminTickets from './pages/admin/AdminTickets';
import AdminNotifications from './pages/admin/AdminNotifications';
import { AuthProvider } from './contexts/AuthContext';
import { SoundProvider } from './components/Advanced/SoundManager';
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

// Sample lottery data
const sampleLotteries = [
  {
    id: '1',
    title: 'Mega Jackpot',
    prizePool: '10,000 TON',
    drawDate: '25 января 2026',
    ticketPrice: '10 TON',
    participants: 1234,
    icon: 'trending' as const,
  },
  {
    id: '2',
    title: 'Weekend Special',
    prizePool: '5,000 TON',
    drawDate: '26 января 2026',
    ticketPrice: '5 TON',
    participants: 856,
    icon: 'ticket' as const,
  },
  {
    id: '3',
    title: 'Daily Draw',
    prizePool: '1,000 TON',
    drawDate: '24 января 2026',
    ticketPrice: '2 TON',
    participants: 432,
    icon: 'calendar' as const,
  },
  {
    id: '4',
    title: 'Golden Lottery',
    prizePool: '25,000 TON',
    drawDate: '31 января 2026',
    ticketPrice: '20 TON',
    participants: 2156,
    icon: 'coins' as const,
  },
  {
    id: '5',
    title: 'Super Prize',
    prizePool: '15,000 TON',
    drawDate: '28 января 2026',
    ticketPrice: '15 TON',
    participants: 1567,
    icon: 'trending' as const,
  },
];

function MainScreen() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const handleBuyTicket = (lotteryId: string) => {
    console.log('Buying ticket for lottery:', lotteryId);
    // Navigate to lottery detail page
    if (lotteryId === '2') {
      navigate('/weekend-special');
    } else {
      // For other lotteries, navigate to a generic lottery detail page
      navigate('/weekend-special');
    }
  };

  const handleConnect = () => {
    console.log('Connecting wallet...');
    // TODO: Implement wallet connection logic
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
          <LotteryCarousel
            lotteries={sampleLotteries}
            onBuyTicket={handleBuyTicket}
          />
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
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/bobby-singer89/lottery-frontend/main/public/tonconnect-manifest.json">
      <AuthProvider>
        <SoundProvider>
          {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}
          {ageConfirmed && (
            <Routes>
              <Route path="/" element={<MainScreen />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/weekend-special" element={<WeekendSpecialPage />} />
              <Route path="/lottery/:slug" element={<WeekendSpecialPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/lotteries" element={<LotteriesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
              <Route path="/admin/lotteries" element={<AdminGuard><AdminLotteries /></AdminGuard>} />
              <Route path="/admin/draws" element={<AdminGuard><AdminDraws /></AdminGuard>} />
              <Route path="/admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
              <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
            </Routes>
          )}
        </SoundProvider>
      </AuthProvider>
    </TonConnectUIProvider>
  );
}

export default App;
