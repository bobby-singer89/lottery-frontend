import { useState, useEffect, useMemo } from 'react';
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
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ReferralPage from './pages/ReferralPage';
import SwapPage from './pages/SwapPage';
import AdminGuard from './components/Admin/AdminGuard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLotteries from './pages/admin/AdminLotteries';
import AdminDraws from './pages/admin/AdminDraws';
import AdminTickets from './pages/admin/AdminTickets';
import AdminNotifications from './pages/admin/AdminNotifications';
import MyTicketsPage from './pages/MyTicketsPage';
import VerifyDrawPage from './pages/VerifyDrawPage';
import DrawResultsPage from './pages/DrawResultsPage';
import VerificationPage from './pages/VerificationPage';
import FAQPage from './pages/FAQPage';
import { AuthProvider } from './contexts/AuthContext';
import { SoundProvider } from './components/Advanced/SoundManager';
import { WalletConnectionHandler } from './components/WalletConnectionHandler';
import DevToolsPanel from './components/DevTools/DevToolsPanel';
import './App.css';

declare global {
  interface Window {
    tonConnectButton?: HTMLButtonElement;
  }
}

// Sample lottery data with BOTH TON and USDT prices
const sampleLotteries = [
  {
    id: '1',
    title: 'Mega Jackpot',
    prizePoolTON: '10,000 TON',
    prizePoolUSDT: '52,000 USDT',
    drawDate: '25 января 2026',
    ticketPriceTON: '10 TON',
    ticketPriceUSDT: '52 USDT',
    participants: 1234,
    icon: 'trending' as const,
  },
  {
    id: '2',
    title: 'Weekend Special',
    prizePoolTON: '5,075 TON',
    prizePoolUSDT: '26,390 USDT',
    drawDate: '26 января 2026',
    ticketPriceTON: '5 TON',
    ticketPriceUSDT: '26 USDT',
    participants: 856,
    icon: 'ticket' as const,
  },
  {
    id: '3',
    title: 'Daily Draw',
    prizePoolTON: '2,000 TON',
    prizePoolUSDT: '10,400 USDT',
    drawDate: '24 января 2026',
    ticketPriceTON: '2 TON',
    ticketPriceUSDT: '10 USDT',
    participants: 432,
    icon: 'calendar' as const,
  },
  {
    id: '4',
    title: 'Lucky Seven',
    prizePoolTON: '7,777 TON',
    prizePoolUSDT: '40,440 USDT',
    drawDate: '27 января 2026',
    ticketPriceTON: '7 TON',
    ticketPriceUSDT: '36 USDT',
    participants: 777,
    icon: 'coins' as const,
  },
  {
    id: '5',
    title: 'Flash Lottery',
    prizePoolTON: '3,500 TON',
    prizePoolUSDT: '18,200 USDT',
    drawDate: '25 января 2026',
    ticketPriceTON: '3 TON',
    ticketPriceUSDT: '15 USDT',
    participants: 521,
    icon: 'trending' as const,
  },
  {
    id: '6',
    title: 'Grand Prize',
    prizePoolTON: '15,000 TON',
    prizePoolUSDT: '78,000 USDT',
    drawDate: '28 января 2026',
    ticketPriceTON: '15 TON',
    ticketPriceUSDT: '78 USDT',
    participants: 1500,
    icon: 'coins' as const,
  },
];

// Main Screen Component
function MainScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCurrency, setSelectedCurrency] = useState<'TON' | 'USDT'>(() => {
    // Initialize from localStorage to match CurrencyToggleMini
    const saved = localStorage.getItem('preferredCurrency') as 'TON' | 'USDT';
    return saved || 'TON';
  });

  // Listen for currency changes from mini toggle
  useEffect(() => {
    function handleCurrencyChange(e: Event) {
      const customEvent = e as CustomEvent<{ currency: 'TON' | 'USDT' }>;
      const newCurrency = customEvent.detail.currency;
      
      console.group('📱 MainScreen Currency Update');
      console.log('Previous:', selectedCurrency);
      console.log('New:', newCurrency);
      console.log('Will update displayLotteries');
      console.groupEnd();
      
      setSelectedCurrency(newCurrency);
    }

    window.addEventListener('currencyChange', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange);
    };
  }, []);

  const handleBuyTicket = (lotteryId: string) => {
    console.log('Buying ticket for:', lotteryId);
    navigate(`/lottery/${lotteryId}`);
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
      case 'verify':
        navigate('/verify');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'referral':
        navigate('/referral');
        break;
    }
  };

  // Map lotteries to display format based on selected currency
  const displayLotteries = useMemo(() => {
    const lotteries = sampleLotteries.map(lottery => ({
      id: lottery.id,
      title: lottery.title,
      prizePool: selectedCurrency === 'TON' ? lottery.prizePoolTON : lottery.prizePoolUSDT,
      drawDate: lottery.drawDate,
      ticketPrice: selectedCurrency === 'TON' ? lottery.ticketPriceTON : lottery.ticketPriceUSDT,
      participants: lottery.participants,
      icon: lottery.icon,
    }));

    console.log('💰 Current currency:', selectedCurrency);
    console.log('🎰 Display lotteries:', lotteries.map(l => `${l.title}: ${l.prizePool}`));
    
    return lotteries;
  }, [selectedCurrency]);

  return (
    <div className="app-root">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="main-content">
          {/* Hero Section */}
          <Hero />

          {/* Lottery Carousel */}
          <LotteryCarousel
            lotteries={displayLotteries}
            onBuyTicket={handleBuyTicket}
          />
        </main>

        {/* Footer Navigation */}
        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
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
        <WalletConnectionHandler />
        <SoundProvider>
          {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}
          {ageConfirmed && (
            <Routes>
              <Route path="/" element={<MainScreen />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/weekend-special" element={<WeekendSpecialPage />} />
              <Route path="/lottery/:slug" element={<WeekendSpecialPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/lotteries" element={<LotteriesPage />} />
              <Route path="/history" element={<TransactionHistoryPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/swap" element={<SwapPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/verify-draw/:drawId" element={<VerifyDrawPage />} />
              <Route path="/verify/:ticketId?" element={<VerificationPage />} />
              <Route path="/draw/:drawId/results" element={<DrawResultsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
              <Route path="/admin/lotteries" element={<AdminGuard><AdminLotteries /></AdminGuard>} />
              <Route path="/admin/draws" element={<AdminGuard><AdminDraws /></AdminGuard>} />
              <Route path="/admin/tickets" element={<AdminGuard><AdminTickets /></AdminGuard>} />
              <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
            </Routes>
          )}
          {/* DevTools Panel - Only in Development */}
          <DevToolsPanel />
        </SoundProvider>
      </AuthProvider>
    </TonConnectUIProvider>
  );
}

export default App;
