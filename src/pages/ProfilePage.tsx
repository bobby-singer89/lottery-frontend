import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './ProfilePage.css';

interface ProfileStats {
  ticketsBought: number;
  totalWins: number;
  totalWinnings: number;
  spent: number;
  netProfit: number;
  memberSince: string;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: { current: number; target: number };
}

interface ActivityData {
  chartData: Array<{ date: string; tickets: number }>;
  summary: {
    ticketsPurchased: number;
    drawsParticipated: number;
    wins: number;
  };
}

interface FavoriteNumber {
  number: number;
  count: number;
}

interface Earnings {
  spent: number;
  won: number;
  netProfit: number;
  referralEarnings: number;
  totalProfit: number;
}

interface Ticket {
  id: string;
  lotteryName: string;
  numbers: number[];
  status: 'pending' | 'won' | 'lost';
  winAmount?: number;
  drawDate: string;
}

export default function ProfilePage() {
  const [activeCard, setActiveCard] = useState(0);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  async function loadProfileData() {
    try {
      // Use mock data if API not ready
      setStats({
        ticketsBought: 42,
        totalWins: 3,
        totalWinnings: 500,
        spent: 420,
        netProfit: 80,
        memberSince: '2026-01-15T00:00:00Z'
      });

      setAchievements([
        {
          id: 'first-win',
          name: 'First Win',
          icon: '🎖️',
          description: 'Won your first prize!',
          unlocked: true
        },
        {
          id: 'hot-streak',
          name: 'Hot Streak',
          icon: '🔥',
          description: '3 wins in a row!',
          unlocked: true
        },
        {
          id: 'lucky-7',
          name: 'Lucky 7',
          icon: '🎯',
          description: 'Win 7 times',
          unlocked: false,
          progress: { current: 3, target: 7 }
        }
      ]);

      setActivity({
        chartData: [
          { date: '2026-01-05', tickets: 2 },
          { date: '2026-01-10', tickets: 4 },
          { date: '2026-01-15', tickets: 3 },
          { date: '2026-01-20', tickets: 5 },
          { date: '2026-01-25', tickets: 2 },
          { date: '2026-01-30', tickets: 4 }
        ],
        summary: {
          ticketsPurchased: 12,
          drawsParticipated: 4,
          wins: 3
        }
      });

      setFavorites([
        { number: 7, count: 8 },
        { number: 12, count: 6 },
        { number: 23, count: 5 },
        { number: 31, count: 4 },
        { number: 42, count: 4 }
      ]);

      setEarnings({
        spent: 420,
        won: 500,
        netProfit: 80,
        referralEarnings: 45,
        totalProfit: 125
      });

      setTickets([
        {
          id: '12345',
          lotteryName: 'Weekend Special',
          numbers: [5, 12, 23, 31, 36],
          status: 'pending',
          drawDate: '2026-02-03T20:00:00Z'
        },
        {
          id: '12344',
          lotteryName: 'Mega Jackpot',
          numbers: [7, 14, 21, 28, 35],
          status: 'won',
          winAmount: 50,
          drawDate: '2026-01-30T00:00:00Z'
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setIsLoading(false);
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setActiveCard((prev) => (prev < 5 ? prev + 1 : prev));
    },
    onSwipedRight: () => {
      setActiveCard((prev) => (prev > 0 ? prev - 1 : prev));
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: false
  });

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>👤 My Profile</h1>

      <div className="swipeable-container" {...handlers}>
        <div
          className="cards-wrapper"
          style={{
            transform: `translateX(-${activeCard * 100}%)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Card 1: Journey */}
          {stats && (
            <div className="profile-card journey-card">
              <h2>🎫 My Lottery Journey</h2>
              <div className="stats-mini-grid">
                <div className="stat-mini">
                  <div className="stat-number">{stats.ticketsBought}</div>
                  <div className="stat-label">Tickets</div>
                </div>
                <div className="stat-mini">
                  <div className="stat-number">{stats.totalWins}</div>
                  <div className="stat-label">Wins</div>
                </div>
                <div className="stat-mini">
                  <div className="stat-number">{stats.totalWinnings}</div>
                  <div className="stat-label">TON Won</div>
                </div>
              </div>
              <div className="net-result">
                Net: <strong>{stats.netProfit > 0 ? '+' : ''}{stats.netProfit} TON</strong>
                {stats.netProfit > 0 ? ' 📈' : ' 📊'}
              </div>
              <p className="member-since">
                Member since {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}

          {/* Card 2: Achievements */}
          <div className="profile-card achievements-card">
            <h2>🏆 Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h2>
            <div className="achievements-list">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <span className="ach-icon">{ach.icon}</span>
                  <div className="ach-info">
                    <div className="ach-name">
                      {ach.unlocked ? '✅' : '🔒'} {ach.name}
                    </div>
                    <div className="ach-desc">{ach.description}</div>
                    {!ach.unlocked && ach.progress && (
                      <div className="ach-progress">
                        <div
                          className="ach-progress-bar"
                          style={{ width: `${(ach.progress.current / ach.progress.target) * 100}%` }}
                        />
                        <span className="ach-progress-text">
                          {ach.progress.current}/{ach.progress.target}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Activity */}
          {activity && (
            <div className="profile-card activity-card">
              <h2>📊 Activity (30 days)</h2>
              <div className="mini-chart">
                {activity.chartData.map((data, i) => {
                  const maxTickets = Math.max(...activity.chartData.map(d => d.tickets));
                  return (
                    <div key={i} className="chart-bar-wrapper">
                      <div
                        className="chart-bar"
                        style={{ height: `${(data.tickets / maxTickets) * 100}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="activity-stats">
                <div className="activity-stat-item">
                  🎫 {activity.summary.ticketsPurchased} tickets purchased
                </div>
                <div className="activity-stat-item">
                  🎲 {activity.summary.drawsParticipated} draws participated
                </div>
                <div className="activity-stat-item">
                  🏆 {activity.summary.wins} wins
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Favorites */}
          <div className="profile-card favorites-card">
            <h2>🎰 Favorite Numbers</h2>
            <p className="fav-subtitle">Your most picked:</p>
            <div className="fav-numbers-grid">
              {favorites.map((fav, i) => (
                <div key={i} className="fav-number-item">
                  <div className="fav-number-badge">{fav.number}</div>
                  <div className="fav-count">{fav.count}×</div>
                </div>
              ))}
            </div>
            <button className="glass-button quick-pick-btn">
              Quick Pick These Numbers →
            </button>
          </div>

          {/* Card 5: Earnings */}
          {earnings && (
            <div className="profile-card earnings-card">
              <h2>💰 Earnings</h2>
              <div className="earnings-breakdown">
                <div className="earnings-row">
                  <span>Spent:</span>
                  <span>{earnings.spent} TON</span>
                </div>
                <div className="earnings-row">
                  <span>Won:</span>
                  <span>{earnings.won} TON</span>
                </div>
                <div className="earnings-divider" />
                <div className="earnings-row net">
                  <span>Net:</span>
                  <span className={earnings.netProfit >= 0 ? 'positive' : 'neutral'}>
                    {earnings.netProfit >= 0 ? '+' : ''}{earnings.netProfit} TON
                    {earnings.netProfit >= 0 ? ' 📈' : ' 📊'}
                  </span>
                </div>
                <div className="earnings-spacer" />
                <div className="earnings-row">
                  <span>🎁 Referrals:</span>
                  <span>{earnings.referralEarnings} TON</span>
                </div>
                <div className="earnings-divider" />
                <div className="earnings-row total">
                  <span>Total:</span>
                  <span className="positive">+{earnings.totalProfit} TON ✨</span>
                </div>
              </div>
            </div>
          )}

          {/* Card 6: Tickets */}
          <div className="profile-card tickets-card">
            <h2>🎫 Recent Tickets</h2>
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className={`ticket-item ${ticket.status}`}>
                  <div className="ticket-header">
                    {ticket.lotteryName} #{ticket.id}
                  </div>
                  <div className="ticket-numbers">
                    {ticket.numbers.map((num) => (
                      <span key={num} className="ticket-number">{num}</span>
                    ))}
                  </div>
                  <div className="ticket-status">
                    {ticket.status === 'pending' && (
                      <span>⏳ Pending • {new Date(ticket.drawDate).toLocaleString()}</span>
                    )}
                    {ticket.status === 'won' && (
                      <span>✅ Won {ticket.winAmount} TON! • {new Date(ticket.drawDate).toLocaleDateString()}</span>
                    )}
                    {ticket.status === 'lost' && (
                      <span>No match • {new Date(ticket.drawDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="glass-button view-all-btn">View All Tickets →</button>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="pagination-dots">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            className={`dot ${index === activeCard ? 'active' : ''}`}
            onClick={() => setActiveCard(index)}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      <p className="swipe-hint">← Swipe to explore →</p>
    </div>
  );
}
