import { useNavigate } from 'react-router-dom';

export default function RecentWinnersSection() {
  const navigate = useNavigate();

  const recentWinners = [
    { medal: '🥇', amount: 500, timeAgo: '2 hours ago', lottery: 'Weekend Special' },
    { medal: '🥈', amount: 250, timeAgo: '1 day ago', lottery: 'Mega Jackpot' },
    { medal: '🥉', amount: 100, timeAgo: '3 days ago', lottery: 'Daily Draw' }
  ];

  return (
    <section className="landing-section slide-from-left fade-in-section">
      <h2 className="section-title">Recent Winners</h2>
      <div className="winners-list">
        {recentWinners.map((winner, index) => (
          <div key={index} className="winner-item">
            <div className="winner-medal">{winner.medal}</div>
            <div className="winner-details">
              <div className="winner-amount">{winner.amount} TON</div>
              <div className="winner-time">{winner.timeAgo}</div>
              <div className="winner-lottery">{winner.lottery}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button
          className="cta-button"
          onClick={() => navigate('/history')}
        >
          View All Winners
        </button>
      </div>
    </section>
  );
}
