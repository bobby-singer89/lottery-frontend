import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import WeekendSpecialPage from './pages/WeekendSpecialPage';
import ProfilePage from './pages/ProfilePage';
import LotteriesPage from './pages/LotteriesPage';
import HistoryPage from './pages/HistoryPage';
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
  const navigate = useNavigate();

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
          {/* New HomePage with Currency Switcher */}
          <HomePage />
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
        <WalletConnectionHandler />
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
              <Route path="/swap" element={<SwapPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/verify/:drawId" element={<VerifyDrawPage />} />
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
