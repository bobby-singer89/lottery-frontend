import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, LogOut, Wallet, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../lib/telegram/useTelegram';
import PlayerLevel, { type PlayerLevelData } from '../components/Gamification/PlayerLevel';
import StreakCounter from '../components/Gamification/StreakCounter';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

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

  const handleConnect = () => {
    console.log('Connecting wallet...');
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    logout();
    navigate('/');
  };

  const truncateAddress = (address: string) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Mock data for demo
  const playerLevel: PlayerLevelData = {
    current: (user?.level as any) || 'bronze',
    xp: user?.experience || 2500,
    xpToNext: 5000,
    benefits: [
      'Скидка 5% на все билеты',
      'Базовая поддержка',
      'Доступ к стандартным лотереям',
    ],
  };

  const streakHistory = [true, true, true, false, false, false, false];
  const currentStreak = 3;

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="main-content profile-page">
          <motion.div
            className="profile-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Header */}
            <div className="profile-header-card">
              <div className="profile-avatar">
                {telegramUser?.photo_url ? (
                  <img src={telegramUser.photo_url} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {(telegramUser?.first_name || user?.firstName || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h1 className="profile-name">
                  {telegramUser?.first_name || user?.firstName || 'User'}{' '}
                  {telegramUser?.last_name || user?.lastName || ''}
                </h1>
                {telegramUser?.username && (
                  <p className="profile-username">@{telegramUser.username}</p>
                )}
              </div>
            </div>

            {/* Wallet Card */}
            <motion.div
              className="profile-card wallet-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="card-header">
                <Wallet size={24} />
                <h3>TON Wallet</h3>
              </div>
              <div className="wallet-address">
                {truncateAddress(user?.tonWallet || '')}
              </div>
              <div className="wallet-balance">
                <span className="balance-label">Balance:</span>
                <span className="balance-amount">0.00 TON</span>
              </div>
            </motion.div>

            {/* Level Card */}
            <div className="profile-section">
              <h2>Your Level</h2>
              <PlayerLevel levelData={playerLevel} />
            </div>

            {/* Streak Counter */}
            <div className="profile-section">
              <h2>Activity Streak</h2>
              <StreakCounter currentStreak={currentStreak} streakHistory={streakHistory} />
            </div>

            {/* Active Tickets */}
            <div className="profile-section">
              <h2>My Active Tickets</h2>
              <div className="placeholder-card">
                <p>No active tickets yet</p>
                <button className="cta-button" onClick={() => navigate('/lotteries')}>
                  Buy Your First Ticket
                </button>
              </div>
            </div>

            {/* Winnings History */}
            <div className="profile-section">
              <h2>Winnings History</h2>
              <div className="placeholder-card">
                <p>No winnings yet</p>
                <p className="placeholder-subtitle">Keep playing to win big!</p>
              </div>
            </div>

            {/* Referral Code */}
            <motion.div
              className="profile-card referral-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="card-header">
                <h3>Your Referral Code</h3>
              </div>
              <div className="referral-code-display">
                <code>{user?.referralCode || 'N/A'}</code>
                <button
                  className="copy-button"
                  onClick={copyReferralCode}
                  disabled={!user?.referralCode}
                >
                  {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="referral-info">Share this code to earn rewards!</p>
            </motion.div>

            {/* Disconnect Wallet Button */}
            {isAuthenticated && user?.tonWallet && (
              <motion.button
                className="disconnect-button"
                onClick={handleDisconnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={20} />
                Disconnect Wallet
              </motion.button>
            )}
          </motion.div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default ProfilePage;
