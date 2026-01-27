import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import LotteryCard from '../components/LotteryCard/LotteryCard';
import './LotteriesPage.css';

// Use the same sample lotteries from App.tsx
const sampleLotteries = [
  {
    id: '1',
    title: 'Mega Jackpot',
    prizePool: '10,000 TON',
    drawDate: '25 января 2026',
    ticketPrice: '10 TON',
    participants: 1234,
    icon: 'trending' as const,
  },
  {
    id: '2',
    title: 'Weekend Special',
    prizePool: '5,000 TON',
    drawDate: '26 января 2026',
    ticketPrice: '5 TON',
    participants: 856,
    icon: 'ticket' as const,
  },
  {
    id: '3',
    title: 'Daily Draw',
    prizePool: '1,000 TON',
    drawDate: '24 января 2026',
    ticketPrice: '2 TON',
    participants: 432,
    icon: 'calendar' as const,
  },
  {
    id: '4',
    title: 'Golden Lottery',
    prizePool: '25,000 TON',
    drawDate: '31 января 2026',
    ticketPrice: '20 TON',
    participants: 2156,
    icon: 'coins' as const,
  },
  {
    id: '5',
    title: 'Super Prize',
    prizePool: '15,000 TON',
    drawDate: '28 января 2026',
    ticketPrice: '15 TON',
    participants: 1567,
    icon: 'trending' as const,
  },
];

function LotteriesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lotteries');

  const handleConnect = () => {
    console.log('Connecting wallet...');
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

  const handleBuyTicket = (lotteryId: string) => {
    // Navigate to lottery detail page
    if (lotteryId === '2') {
      navigate('/weekend-special');
    } else {
      // For other lotteries, navigate to weekend-special as placeholder
      navigate('/weekend-special');
    }
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="lotteries-page">
          <motion.div
            className="lotteries-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              className="lotteries-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Все лотереи
            </motion.h1>
            
            <motion.p
              className="lotteries-subtitle"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Выберите лотерею и попробуйте свою удачу!
            </motion.p>

            <div className="lotteries-grid">
              {sampleLotteries.map((lottery, index) => (
                <motion.div
                  key={lottery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <LotteryCard
                    title={lottery.title}
                    prizePool={lottery.prizePool}
                    drawDate={lottery.drawDate}
                    ticketPrice={lottery.ticketPrice}
                    participants={lottery.participants}
                    icon={lottery.icon}
                    onBuyTicket={() => handleBuyTicket(lottery.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default LotteriesPage;
