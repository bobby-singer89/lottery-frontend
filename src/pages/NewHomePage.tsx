import React, { useState } from 'react';
import ParticlesBackground from '../components/NewDesign/ParticlesBackground';
import NewHeader from '../components/NewDesign/NewHeader';
import LotteryTabs from '../components/NewDesign/LotteryTabs';
import LotteryCarousel from '../components/NewDesign/LotteryCarousel';
import BottomNavigation from '../components/NewDesign/BottomNavigation';
import { LotteryCardData } from '../components/NewDesign/LotteryCard';
import './NewHomePage.css';

const mockLotteries: LotteryCardData[] = [
  { id: 1, name: 'Weekend Special 5x36', jackpot: 1000, color: 'blue', drawDate: '2026-02-14' },
  { id: 2, name: 'Midnight Draw', jackpot: 500, color: 'purple', drawDate: '2026-02-10' },
  { id: 3, name: 'Bonus Round', jackpot: 750, color: 'pink', drawDate: '2026-02-12' },
  { id: 4, name: 'Golden Hour', jackpot: 300, color: 'teal', drawDate: '2026-02-09' },
  { id: 5, name: 'Daily Jackpot', jackpot: 200, color: 'green', drawDate: '2026-02-08' },
];

const NewHomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('draw');
  const [activeNavTab, setActiveNavTab] = useState('profile');

  const handleSettingsClick = () => {
    console.log('Settings clicked');
    // TODO: Navigate to settings
  };

  const handleNavChange = (tab: string) => {
    setActiveNavTab(tab);
    console.log('Navigation tab changed:', tab);
    // TODO: Add navigation logic
  };

  return (
    <div className="new-home-page">
      <ParticlesBackground />
      
      <div className="page-content">
        <NewHeader onSettingsClick={handleSettingsClick} />
        
        <LotteryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="main-section">
          <LotteryCarousel lotteries={mockLotteries} />
        </div>
        
        <BottomNavigation activeTab={activeNavTab} onTabChange={handleNavChange} />
      </div>
    </div>
  );
};

export default NewHomePage;
