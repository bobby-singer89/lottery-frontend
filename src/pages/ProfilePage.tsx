import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, Check, Trophy, Star, Flame, AlertCircle, Ticket } from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../lib/telegram/useTelegram';
import { apiClient } from '../lib/api/client';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

interface UserProfile {
  user: {
    id: number;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    tonWallet?: string;
    level: string;
    experience: number;
    referralCode: string;
  };
  statistics: {
    currentLevel: number;
    experiencePoints: number;
    streakDays: number;
    totalSpent: string;
    totalWon: string;
    ticketsCount: number;
    activeTicketsCount: number;
    wonTicketsCount: number;
    referredUsers: number;
    referralEarnings: string;
  };
  activeTickets?: Array<{
    id: number;
    ticketNumber: string;
    numbers: number[];
    lottery: {
      title: string;
      slug: string;
    };
    draw: {
      drawDate: string;
    };
  }>;
}

function ProfilePage() {
  const { user } = useAuth();
  const { user: telegramUser, isReady } = useTelegram();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        setIsLoadingProfile(true);
        const response = await apiClient.getProfile();
        
        if (response.success) {
          setProfileData(response as any);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  // Profile display data (fallback to Telegram data if API data not available)
  const displayData = {
    name: profileData?.user?.firstName || user?.firstName || user?.username || telegramUser?.first_name || telegramUser?.username || 'Player',
    avatar: profileData?.user?.photoUrl || user?.photoUrl || telegramUser?.photo_url,
    avatarLetter: (profileData?.user?.firstName || user?.firstName || user?.username || telegramUser?.first_name || telegramUser?.username || 'P').charAt(0).toUpperCase(),
    walletConnected: !!userAddress,
    walletAddress: userAddress || profileData?.user?.tonWallet || user?.tonWallet || null,
    level: profileData?.statistics?.currentLevel || (user?.level ? parseInt(user.level, 10) : 1),
    xp: profileData?.statistics?.experiencePoints || user?.experience || 0,
    maxXp: (profileData?.statistics?.currentLevel || 1) * 1000, // Calculate max XP based on level
    streak: profileData?.statistics?.streakDays || 0,
    totalSpent: profileData?.statistics?.totalSpent || '0',
    totalWon: profileData?.statistics?.totalWon || '0',
    referralCode: profileData?.user?.referralCode || user?.referralCode || 'N/A',
    totalTickets: profileData?.statistics?.ticketsCount || 0,
    activeTickets: profileData?.statistics?.activeTicketsCount || 0,
    wonTickets: profileData?.statistics?.wonTicketsCount || 0,
    referredUsers: profileData?.statistics?.referredUsers || 0,
    referralEarnings: profileData?.statistics?.referralEarnings || '0',
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
      await navigator.clipboard.writeText(displayData.referralCode);
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
        <Header onConnect={handleConnectWallet} walletAddress={displayData.walletAddress || undefined} />
        
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
          ) : isLoadingProfile ? (
            // Loading state
            <motion.div
              className="profile-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="profile-loading">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: '2rem' }}
                >
                  ⟳
                </motion.div>
                <p>Загрузка профиля...</p>
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
                  {displayData.avatar ? (
                    <img 
                      src={displayData.avatar} 
                      alt="Profile" 
                      className="avatar-image"
                      onError={(e) => {
                        // Fallback to letter if image fails to load
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const sibling = target.nextElementSibling as HTMLSpanElement | null;
                        if (sibling) {
                          sibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <span 
                    className="avatar-letter" 
                    style={{ display: displayData.avatar ? 'none' : 'flex' }}
                  >
                    {displayData.avatarLetter}
                  </span>
                </div>
                <div className="avatar-level">
                  <Star size={12} />
                  <span>{displayData.level}</span>
                </div>
              </div>
              
              <div className="profile-info">
                <h1 className="profile-name">{displayData.name}</h1>
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
                  <div className="stat-label">Потрачено</div>
                  <div className="stat-value">{displayData.totalSpent} TON</div>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.225 }}
              >
                <div className="stat-icon won">
                  <Trophy size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Выиграно</div>
                  <div className="stat-value">{displayData.totalWon} TON</div>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div className="stat-icon level">
                  <Star size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Уровень</div>
                  <div className="stat-value">{displayData.level}</div>
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
                  <div className="stat-value">{displayData.streak} дней</div>
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
                <span className="xp-value">{displayData.xp} / {displayData.maxXp} XP</span>
              </div>
              <div className="xp-bar-bg">
                <motion.div
                  className="xp-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(displayData.xp / displayData.maxXp) * 100}%` }}
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
                  <span className="ticket-stat-value">{displayData.totalTickets}</span>
                </div>
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Активных</span>
                  <span className="ticket-stat-value active">{displayData.activeTickets}</span>
                </div>
                <div className="ticket-stat">
                  <span className="ticket-stat-label">Выигрышей</span>
                  <span className="ticket-stat-value won">{displayData.wonTickets}</span>
                </div>
              </div>
              
              {/* Active Tickets List */}
              {profileData?.activeTickets && profileData.activeTickets.length > 0 && (
                <div className="active-tickets-list">
                  <h3 className="tickets-subtitle">Активные билеты</h3>
                  {profileData.activeTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      className="ticket-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="ticket-icon">
                        <Ticket size={20} />
                      </div>
                      <div className="ticket-details">
                        <div className="ticket-lottery">{ticket.lottery.title}</div>
                        <div className="ticket-numbers">
                          {ticket.numbers.map((num, idx) => (
                            <span key={idx} className="ticket-number">{num}</span>
                          ))}
                        </div>
                        <div className="ticket-draw-date">
                          Розыгрыш: {new Date(ticket.draw.drawDate).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Referral Section */}
            <motion.div
              className="referral-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <h2 className="section-title">Реферальная программа</h2>
              <div className="referral-stats">
                <div className="referral-stat">
                  <span className="referral-stat-label">Приглашено</span>
                  <span className="referral-stat-value">{displayData.referredUsers}</span>
                </div>
                <div className="referral-stat">
                  <span className="referral-stat-label">Заработано</span>
                  <span className="referral-stat-value">{displayData.referralEarnings} TON</span>
                </div>
              </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div
              className="referral-code-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="section-title">Реферальный код</h2>
              <div className="referral-code-card">
                <div className="referral-code-text">{displayData.referralCode}</div>
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
