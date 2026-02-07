import React from 'react';
import { Home, FileText, User, HelpCircle, Plus } from 'lucide-react';
import './BottomNavigation.css';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bottom-navigation">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={22} />
        <span className="nav-label">Home</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
        onClick={() => onTabChange('archive')}
      >
        <FileText size={22} />
        <span className="nav-label">Archive Draws</span>
      </button>

      <button 
        className={`nav-item center ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <div className="center-icon">
          <User size={24} />
        </div>
        <span className="nav-label">Profile</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
        onClick={() => onTabChange('help')}
      >
        <HelpCircle size={22} />
        <span className="nav-label">Help</span>
      </button>

      <button 
        className={`nav-item ${activeTab === 'placeholder' ? 'active' : ''}`}
        onClick={() => onTabChange('placeholder')}
      >
        <Plus size={22} />
        <span className="nav-label">More</span>
      </button>
    </nav>
  );
};

export default BottomNavigation;
