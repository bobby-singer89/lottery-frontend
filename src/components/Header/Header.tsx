import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, Ticket, ShieldCheck, LogIn, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiClient } from '../../lib/api/adminClient';
import TelegramLoginWidget from '../TelegramLoginWidget/TelegramLoginWidget';
import type { TelegramUser } from '../TelegramLoginWidget/TelegramLoginWidget';
import './Header.css';

interface HeaderProps {
  onConnect?: () => void;
  walletAddress?: string;
}

function Header({ onConnect, walletAddress }: HeaderProps) {
  const { user, isAuthenticated, loginWithTelegram, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status when user is authenticated
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await adminApiClient.checkAdminStatus();
          setIsAdmin(response.success && response.isAdmin);
        } catch (error) {
          console.error('Failed to check admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  const handleTelegramAuth = useCallback(async (telegramUser: TelegramUser) => {
    const success = await loginWithTelegram(telegramUser);
    if (success) {
      setShowLoginModal(false);
    }
  }, [loginWithTelegram]);

  const handleLogout = useCallback(() => {
    logout();
    setIsAdmin(false);
  }, [logout]);

  return (
    <>
      <motion.header
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="header-content">
        <motion.div
          className="header-logo"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-text">Weekend Millions</span>
          </Link>
        </motion.div>

        <div className="header-nav">
          <Link to="/demo" className="demo-nav-link">
            <Sparkles size={16} />
            <span>Демо</span>
          </Link>
          {walletAddress && (
            <Link to="/my-tickets" className="nav-link">
              <Ticket size={16} />
              <span>Мои билеты</span>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <ShieldCheck size={16} />
              <span>Админ-панель</span>
            </Link>
          )}
        </div>

        <div className="header-actions">
          {!isAuthenticated ? (
            <motion.button
              className="login-btn"
              onClick={() => setShowLoginModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <LogIn size={18} />
              <span>Войти</span>
            </motion.button>
          ) : (
            <motion.div
              className="user-menu"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="user-info">
                <User size={18} />
                <span>{user?.firstName || user?.username || 'User'}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
              </button>
            </motion.div>
          )}

          <motion.button
            className="wallet-btn"
            onClick={onConnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Wallet size={20} />
            <span>{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect'}</span>
          </motion.button>
        </div>
      </div>
      <div className="header-gradient"></div>
    </motion.header>

      {/* Telegram Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="login-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              className="login-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Вход через Telegram</h2>
              <p>Войдите с помощью вашего Telegram аккаунта для доступа к полному функционалу</p>
              <div className="telegram-widget-container">
                <TelegramLoginWidget
                  botName="Lottery_555_bot"
                  onAuth={handleTelegramAuth}
                  buttonSize="large"
                  cornerRadius={8}
                  requestAccess="write"
                  usePic={true}
                  lang="ru"
                />
              </div>
              <button className="close-modal-btn" onClick={() => setShowLoginModal(false)}>
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
