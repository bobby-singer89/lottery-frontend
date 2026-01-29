import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, Trophy, Star, Flame, AlertCircle } from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../lib/telegram/useTelegram';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user, connectWallet } = useAuth();
  const { user: telegramUser, isReady } = useTelegram();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

  // Profile data from context (Telegram + backend)
  const profileData = {
    name: user?.firstName || user?.username || telegramUser?.first_name || telegramUser?.username || 'Player',
    avatar: user?.photoUrl || telegramUser?.photo_url,
    avatarLetter: (user?.firstName || user?.username || telegramUser?.first_name || telegramUser?.username || 'P').charAt(0).toUpperCase(),
    walletConnected: !!userAddress,
    walletAddress: userAddress || null,
    balance: '125.5 TON', // TODO: Get from blockchain
    level: user?.level ? parseInt(user.level) : 12, // Mock if not available
    xp: user?.experience || 2450, // Mock if not available
    maxXp: 3000, // Mock
    streak: 7, // Mock - will be from backend later
    referralCode: user?.referralCode || 'REF123ABC',
    totalTickets: 24, // Mock
    activeTickets: 8, // Mock
    wonTickets: 3, // Mock
  };

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.openModal();
      // Wallet connection will automatically trigger binding via WalletConnectionHandler
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
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

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(profileData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnectWallet} walletAddress={profileData.walletAddress || undefined} />
        
        <main className="profile-page">
          {!isReady ? (
            // Fallback for non-Telegram access
            <motion.div
              className="profile-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="telegram-only-message">
                <AlertCircle size={64} className="alert-icon" />
                <h2>Авторизация доступна только через Telegram</h2>
                <p>Пожалуйста, откройте это приложение через Telegram Mini App для доступа к полному функционалу.</p>
              </div>
            </motion.div>
          ) : (
          <motion.div
            className="profile-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Header */}
            <motion.div
              className="profile-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {profileData.avatar ? (
                    <img 
                      src={profileData.avatar} 
                      alt="Profile" 
                      className="avatar-image"
                      onError={(e) => {
                        // Fallback to letter if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className="avatar-letter" 
                    style={{ display: profileData.avatar ? 'none' : 'flex' }}
                  >
                    {profileData.avatarLetter}
                  </span>
                </div>
                <div className="avatar-level">
                  <Star size={12} />
                  <span>{profileData.level}</span>
                </div>
              </div>
              
              <div className="profile-info">
                <h1 className="profile-name">{profileData.name}</h1>
                {!userAddress ? (
                  <button onClick={handleConnectWallet} className="profile-wallet-status connect-wallet-btn">
                    <Wallet size={16} />
                    <span>Подключите кошелёк</span>
                  </button>
                ) : (
                  <div className="profile-wallet-status wallet-connected">
                    <Wallet size={16} />
                    <span className="wallet-address-text">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
                    <button onClick={handleDisconnectWallet} className="disconnect-btn">Отключить</button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="profile-stats-grid">
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="stat-icon balance">
                  <Wallet size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Баланс</div>
                  <div className="stat-value">{profileData.balance}</div>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div className="stat-icon level">
                  <Trophy size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Уровень</div>
                  <div className="stat-value">{profileData.level}</div>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="stat-icon streak">
                  <Flame size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Серия</div>
                  <div className="stat-value">{profileData.streak} дней</div>
                </div>
              </motion.div>
            </div>

            {/* XP Progress */}
            <motion.div
              className="xp-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="xp-header">
                <span className="xp-label">Опыт</span>
                <span className="xp-value">{profileData.xp} / {profileData.maxXp} XP</span>
              </div>
              <div className="xp-bar-bg">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(profileData.xp / profileData.maxXp) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>

            {/* My Tickets */}
            <motion.div
              className="tickets-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="section-title">Мои билеты</h2>
              <div className="tickets-summary">
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Всего</span>
                  <span className="ticket-stat-value">{profileData.totalTickets}</span>
                </div>
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Активных</span>
                  <span className="ticket-stat-value active">{profileData.activeTickets}</span>
                </div>
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Выигрышей</span>
                  <span className="ticket-stat-value won">{profileData.wonTickets}</span>
                </div>
              </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div
              className="referral-code-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <h2 className="section-title">Реферальный код</h2>
              <div className="referral-code-card">
                <div className="referral-code-text">{profileData.referralCode}</div>
                <motion.button
                  className="copy-button"
                  onClick={handleCopyReferral}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </motion.button>
              </div>
              {copied && (
                <motion.div
                  className="copy-success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Код скопирован!
                </motion.div>
              )}
            </motion.div>
            </motion.div>
          )}
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default ProfilePage;
