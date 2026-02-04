import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CurrencyToggleMini from '../CurrencyToggleMini/CurrencyToggleMini';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  return (
    <motion.header
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="header-container">
        {/* Left: Logo */}
        <div className="header-left">
          <div className="header-logo" onClick={() => navigate('/')}>
            🎰 WEEKEND MILLIONS
          </div>
        </div>

        {/* Right: Currency Toggle */}
        <div className="header-right">
          <CurrencyToggleMini />
        </div>
      </div>
      <div className="header-gradient"></div>
    </motion.header>
  );
}

export default Header;
