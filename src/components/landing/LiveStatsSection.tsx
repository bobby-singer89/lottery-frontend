import { useState, useEffect, useRef } from 'react';

interface CounterAnimationProps {
  target: number;
}

function CounterAnimation({ target }: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return <div ref={ref} className="counter-number">{count.toLocaleString()}</div>;
}

export default function LiveStatsSection() {
  const stats = {
    ticketsSold: 1234,
    totalWinners: 156,
    tonPaidOut: 45670,
    lastWinner: {
      amount: 500,
      timeAgo: '2 hours ago',
      lottery: 'Weekend Special'
    }
  };

  return (
    <section className="landing-section fade-in-section">
      <h2 className="section-title">Live Statistics</h2>
      <div className="stats-grid">
        <div className="glass-card stat-box">
          <div className="stat-label">Tickets Sold</div>
          <CounterAnimation target={stats.ticketsSold} />
        </div>
        <div className="glass-card stat-box">
          <div className="stat-label">Winners</div>
          <CounterAnimation target={stats.totalWinners} />
        </div>
        <div className="glass-card stat-box">
          <div className="stat-label">TON Paid Out</div>
          <CounterAnimation target={stats.tonPaidOut} />
        </div>
      </div>
      <div className="glass-card last-winner-info">
        Last Winner: <strong>{stats.lastWinner.amount} TON</strong> - {stats.lastWinner.timeAgo}
      </div>
    </section>
  );
}
