import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useTonAddress } from '@tonconnect/ui-react';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../lib/telegram/useTelegram';
import { API_CONFIG } from '../config/api';
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

// Types
interface UserStats {
  ticketsBought: number;
  wins: number;
  tonWon: string;
  tonSpent: string;
  netProfit: string;
  memberSince: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

interface ActivityData {
  date: string;
  tickets: number;
  wins: number;
}

interface ActivitySummary {
  totalTickets: number;
  totalWins: number;
  days: number;
}

interface FavoriteNumber {
  number: number;
  frequency: number;
}

interface Earnings {
  spent: string;
  won: string;
  referralEarnings: string;
  netProfit: string;
}

interface Ticket {
  id: number;
  ticketNumber: string;
  numbers: number[];
  status: string;
  winAmount?: string;
  draw?: {
    lottery?: {
      name: string;
      slug: string;
    };
    status: string;
    winningNumbers?: number[];
  };
}

function ProfilePage() {
  const { user } = useAuth();
  const { user: telegramUser } = useTelegram();
  const userAddress = useTonAddress();
  const [activeCard, setActiveCard] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

  // Data states
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [activity, setActivity] = useState<ActivityData[] | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [favoriteNumbers, setFavoriteNumbers] = useState<FavoriteNumber[] | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        // Fetch all profile data in parallel with error resilience
        const results = await Promise.allSettled([
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.STATS}?${params}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.ACHIEVEMENTS}?${params}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.ACTIVITY}?${params}&days=30`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.FAVORITE_NUMBERS}?${params}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.EARNINGS}?${params}`),
          fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE.RECENT_TICKETS}?${params}&limit=6`),
        ]);

        // Process stats
        if (results[0].status === 'fulfilled' && results[0].value.ok) {
          const data = await results[0].value.json();
          setStats(data.stats);
        }

        // Process achievements
        if (results[1].status === 'fulfilled' && results[1].value.ok) {
          const data = await results[1].value.json();
          setAchievements(data.achievements);
        }

        // Process activity
        if (results[2].status === 'fulfilled' && results[2].value.ok) {
          const data = await results[2].value.json();
          setActivity(data.activity);
          setActivitySummary(data.summary);
        }

        // Process favorite numbers
        if (results[3].status === 'fulfilled' && results[3].value.ok) {
          const data = await results[3].value.json();
          setFavoriteNumbers(data.favoriteNumbers);
        }

        // Process earnings
        if (results[4].status === 'fulfilled' && results[4].value.ok) {
          const data = await results[4].value.json();
          setEarnings(data.earnings);
        }

        // Process recent tickets
        if (results[5].status === 'fulfilled' && results[5].value.ok) {
          const data = await results[5].value.json();
          setRecentTickets(data.tickets);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userAddress, telegramUser?.id]);

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
