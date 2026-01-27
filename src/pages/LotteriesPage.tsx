import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LotteryCard from '../components/LotteryCard/LotteryCard';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import SkeletonLoader from '../components/Animations/SkeletonLoader';
import { apiClient } from '../lib/api/client';
import './LotteriesPage.css';

function LotteriesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lotteries');
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getLotteryList();
        if (response.success && response.lotteries) {
          setLotteries(response.lotteries);
        }
      } catch (error) {
        console.error('Failed to fetch lotteries:', error);
        // Fallback to sample data
        setLotteries([
          {
            id: '1',
            slug: 'mega-jackpot',
            title: 'Mega Jackpot',
            prizePool: '10,000 TON',
            drawDate: '25 января 2026',
            ticketPrice: '10 TON',
            participants: 1234,
            icon: 'trending' as const,
          },
          {
            id: '2',
            slug: 'weekend-special',
            title: 'Weekend Special',
            prizePool: '5,000 TON',
            drawDate: '26 января 2026',
            ticketPrice: '5 TON',
            participants: 856,
            icon: 'ticket' as const,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
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

  const handleConnect = () => {
    console.log('Connecting wallet...');
  };

  const handleBuyTicket = (slug: string) => {
    navigate(`/lottery/${slug}`);
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="main-content lotteries-page">
          <motion.div
            className="lotteries-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lotteries-header">
              <h1>All Lotteries</h1>
              <p className="lotteries-subtitle">
                Choose from our exciting selection of lotteries
              </p>
            </div>

            {isLoading ? (
              <div className="lotteries-grid">
                <SkeletonLoader type="lottery-card" count={3} />
              </div>
            ) : (
              <div className="lotteries-grid">
                {lotteries.map((lottery, index) => (
                  <motion.div
                    key={lottery.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="lottery-grid-item"
                  >
                    <LotteryCard
                      {...lottery}
                      onBuyTicket={() => handleBuyTicket(lottery.slug || lottery.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && lotteries.length === 0 && (
              <div className="no-lotteries">
                <p>No lotteries available at the moment</p>
                <p className="no-lotteries-subtitle">Check back soon!</p>
              </div>
            )}
          </motion.div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default LotteriesPage;
