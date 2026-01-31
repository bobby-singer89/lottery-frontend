import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../lib/telegram/useTelegram';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import JourneyCard from '../components/profile/JourneyCard';
import AchievementsCard from '../components/profile/AchievementsCard';
import ActivityCard from '../components/profile/ActivityCard';
import FavoriteNumbersCard from '../components/profile/FavoriteNumbersCard';
import EarningsCard from '../components/profile/EarningsCard';
import RecentTicketsCard from '../components/profile/RecentTicketsCard';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const { user: telegramUser } = useTelegram();
  const userAddress = useTonAddress();
  const [activeCard, setActiveCard] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [favoriteNumbers, setFavoriteNumbers] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userAddress && !telegramUser?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (userAddress) {
        params.append('walletAddress', userAddress);
      } else if (telegramUser?.id) {
        params.append('telegramId', telegramUser.id.toString());
      }

      try {
        // Fetch all profile data in parallel
        const [statsRes, achievementsRes, activityRes, favNumbersRes, earningsRes, ticketsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/profile/stats?${params}`),
          fetch(`${API_BASE_URL}/user/profile/achievements?${params}`),
          fetch(`${API_BASE_URL}/user/profile/activity?${params}&days=30`),
          fetch(`${API_BASE_URL}/user/profile/favorite-numbers?${params}`),
          fetch(`${API_BASE_URL}/user/profile/earnings?${params}`),
          fetch(`${API_BASE_URL}/user/profile/recent-tickets?${params}&limit=6`),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }

        if (achievementsRes.ok) {
          const data = await achievementsRes.json();
          setAchievements(data.achievements);
        }

        if (activityRes.ok) {
          const data = await activityRes.json();
          setActivity(data.activity);
          setActivitySummary(data.summary);
        }

        if (favNumbersRes.ok) {
          const data = await favNumbersRes.json();
          setFavoriteNumbers(data.favoriteNumbers);
        }

        if (earningsRes.ok) {
          const data = await earningsRes.json();
          setEarnings(data.earnings);
        }

        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setRecentTickets(data.tickets);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userAddress, telegramUser?.id, API_BASE_URL]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveCard(prev => Math.min(prev + 1, 5)),
    onSwipedRight: () => setActiveCard(prev => Math.max(prev - 1, 0)),
    trackMouse: true,
    trackTouch: true,
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header />
        
        <main className="profile-page-new">
          <div className="profile-header-new">
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">Swipe to explore your lottery journey</p>
          </div>

          {/* Swipeable Cards Container */}
          <div className="cards-container" {...handlers}>
            <div 
              className="cards-track"
              style={{ 
                transform: `translateX(-${activeCard * 100}%)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="card-wrapper">
                <JourneyCard stats={stats} isLoading={isLoading} />
              </div>
              <div className="card-wrapper">
                <AchievementsCard achievements={achievements} isLoading={isLoading} />
              </div>
              <div className="card-wrapper">
                <ActivityCard 
                  activity={activity} 
                  summary={activitySummary} 
                  isLoading={isLoading} 
                />
              </div>
              <div className="card-wrapper">
                <FavoriteNumbersCard 
                  favoriteNumbers={favoriteNumbers} 
                  isLoading={isLoading} 
                />
              </div>
              <div className="card-wrapper">
                <EarningsCard earnings={earnings} isLoading={isLoading} />
              </div>
              <div className="card-wrapper">
                <RecentTicketsCard tickets={recentTickets} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="pagination-dots">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <button
                key={index}
                className={`dot ${activeCard === index ? 'active' : ''}`}
                onClick={() => setActiveCard(index)}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default ProfilePage;
