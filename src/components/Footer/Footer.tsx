import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NeonIcon from '../Icons/NeonIcon';
import './Footer.css';

interface FooterProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

function Footer({ activeTab = 'home', onTabChange }: FooterProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Главная', icon: 'home' as const },
    { id: 'archive', label: 'Архив', icon: 'archive' as const },
    { id: 'about', label: 'О проекте', icon: 'about' as const },
    { id: 'profile', label: 'Профиль', icon: 'profile' as const },
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange?.(tabId);
    
    switch(tabId) {
      case 'home':
        navigate('/');
        break;
      case 'archive':
        navigate('/history');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  return (
    <footer className="footer-glass">
      <motion.div
        className="footer-nav"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="footer-content">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              className={`footer-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <NeonIcon icon={item.icon} active={activeTab === item.id} size={24} />
              <span className="footer-label">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  className="footer-active-indicator"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Legal Footer Bar */}
      <div className="footer-legal">
        <div className="footer-legal-content">
          <span className="footer-copyright">© 2024 Weekend Millions</span>
          <div className="footer-links">
            <a href="/legal" className="footer-link">Правовая информация</a>
            <span className="footer-separator">|</span>
            <a href="/contact" className="footer-link">Контакты</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
