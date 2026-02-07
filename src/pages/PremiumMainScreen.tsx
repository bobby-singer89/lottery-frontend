import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { Home, Archive, HelpCircle, MoreHorizontal, User } from 'lucide-react';
import '../styles/premium.css';

// Lottery cards data with exact specifications
const lotteryCards = [
  {
    id: 1,
    title: 'Weekend Special',
    subtitle: '5x36',
    jackpot: '1000 TON',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.5)',
    emoji: '🎫'
  },
  {
    id: 2,
    title: 'Midnight Draw',
    subtitle: '6x36',
    jackpot: '750 TON',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    emoji: '🌙'
  },
  {
    id: 3,
    title: 'Golden Hour',
    subtitle: '4x36',
    jackpot: '500 TON',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.5)',
    emoji: '⭐'
  },
  {
    id: 4,
    title: 'Daily Jackpot',
    subtitle: '5x30',
    jackpot: '300 TON',
    color: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.5)',
    emoji: '💎'
  },
  {
    id: 5,
    title: 'Bonus Round',
    subtitle: '7x36',
    jackpot: '1200 TON',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.5)',
    emoji: '🎰'
  }
];

// Simple particles configuration (NO star shape)
const particlesOptions = {
  particles: {
    number: { 
      value: 120, 
      density: { 
        enable: true, 
        area: 1000 
      } 
    },
    color: { 
      value: ['#a78bfa', '#ec4899', '#d8b4fe', '#c084fc'] 
    },
    shape: { 
      type: 'circle' as const  // ONLY circle, no star
    },
    opacity: { 
      value: { min: 0.3, max: 0.8 },
      random: true 
    },
    size: { 
      value: { min: 4, max: 14 },
      random: true 
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: 'bottom' as const,
      random: true,
      straight: false,
      outModes: { 
        default: 'out' as const 
      },
    },
  },
  detectRetina: true,
};

export default function PremiumMainScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Initialize tsparticles
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Auto-rotate cards every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % lotteryCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Get card position class
  const getCardPositionClass = (index: number) => {
    const diff = index - activeCardIndex;
    
    if (diff === 0) return 'active';
    if (diff === 1 || diff === -(lotteryCards.length - 1)) return 'side-right';
    if (diff === -1 || diff === lotteryCards.length - 1) return 'side-left';
    if (diff === 2 || diff === -(lotteryCards.length - 2)) return 'far-right';
    if (diff === -2 || diff === lotteryCards.length - 2) return 'far-left';
    
    return 'hidden';
  };

  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
  };

  const handlePlayNow = () => {
    const activeCard = lotteryCards[activeCardIndex];
    // Navigate to lottery detail or buy ticket page
    navigate(`/lottery/${activeCard.id}`);
  };

  return (
    <div className="premium-root">
      {/* 3-Layer Background */}
      <div className="premium-background">
        <div className="bg-layer-1"></div>
        <div className="bg-layer-2"></div>
        <div className="bg-layer-3"></div>
      </div>

      {/* Falling Particles */}
      <div className="particles-container">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
        />
      </div>

      {/* Header */}
      <header className="premium-header">
        <div className="premium-logo">
          <div className="logo-icon"></div>
          <div className="logo-text">Weekend Millions</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="premium-main">
        {/* Category Tabs */}
        <section className="premium-tabs-section">
          <div className="tabs-container">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
              onClick={() => setActiveTab('popular')}
            >
              Popular
            </button>
            <button 
              className={`tab ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New
            </button>
          </div>
        </section>

        {/* 3D Carousel with Lottery Cards */}
        <section className="premium-carousel-section">
          <div className="carousel-container">
            {lotteryCards.map((card, index) => (
              <div
                key={card.id}
                className={`lottery-card ${getCardPositionClass(index)}`}
                style={{
                  '--card-color': card.color,
                  '--card-glow': card.glow,
                } as React.CSSProperties}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-logo">{card.emoji}</div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-subtitle">{card.subtitle}</p>
                  <div className="card-jackpot-label">Jackpot</div>
                  <div className="card-jackpot">{card.jackpot}</div>
                  {getCardPositionClass(index) === 'active' && (
                    <button 
                      className="card-play-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayNow();
                      }}
                    >
                      Play Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="premium-footer">
        {/* Profile button (protruding upward) */}
        <button className="profile-button" onClick={() => navigate('/profile')}>
          <User />
        </button>

        {/* Footer navigation buttons */}
        <button className="footer-button" onClick={() => navigate('/')}>
          <Home />
          <span className="footer-button-label">Home</span>
        </button>

        <button className="footer-button" onClick={() => navigate('/history')}>
          <Archive />
          <span className="footer-button-label">Archive</span>
        </button>

        {/* Spacer for profile button */}
        <div style={{ width: '84px' }}></div>

        <button className="footer-button" onClick={() => navigate('/faq')}>
          <HelpCircle />
          <span className="footer-button-label">Help</span>
        </button>

        <button className="footer-button" onClick={() => navigate('/settings')}>
          <MoreHorizontal />
          <span className="footer-button-label">More</span>
        </button>
      </footer>
    </div>
  );
}
