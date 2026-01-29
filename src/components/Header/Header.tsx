import { motion } from 'framer-motion';
import { Wallet, Sparkles, Ticket, ShieldCheck, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTelegram } from '../../lib/telegram/useTelegram';
import { adminApiClient } from '../../lib/api/adminClient';
import './Header.css';

interface HeaderProps {
  onConnect?: () => void;
  walletAddress?: string;
}

function Header({ onConnect, walletAddress }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { user: telegramUser } = useTelegram();
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

  const handleLogout = useCallback(() => {
    logout();
    setIsAdmin(false);
  }, [logout]);

  return (
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
          {isAuthenticated && (
            <motion.div
              className="user-menu"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="user-info">
                {(user?.photoUrl || telegramUser?.photo_url) ? (
                  <img 
                    src={user?.photoUrl || telegramUser?.photo_url} 
                    alt="Profile" 
                    className="user-avatar"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={18} />
                )}
                <span>{user?.firstName || user?.username || telegramUser?.first_name || telegramUser?.username || 'User'}</span>
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
  );
}

export default Header;
