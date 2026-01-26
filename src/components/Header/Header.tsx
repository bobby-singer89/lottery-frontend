import { motion } from 'framer-motion';
import { Wallet, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onConnect?: () => void;
  walletAddress?: string;
}

function Header({ onConnect, walletAddress }: HeaderProps) {
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
        </div>

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
      <div className="header-gradient"></div>
    </motion.header>
  );
}

export default Header;
