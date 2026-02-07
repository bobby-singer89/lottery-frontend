import { useState, useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { 
  Settings, 
  Info, 
  Home, 
  Archive, 
  User, 
  HelpCircle, 
  MoreHorizontal 
} from 'lucide-react';
import '../styles/premium.css';

// Lottery data with unique colors
const lotteries = [
  {
    id: 1,
    title: 'Weekend Special',
    format: '5x36',
    jackpot: '1000 TON',
    date: 'Next Draw: Saturday',
    color: 'purple',
    icon: 'WS',
  },
  {
    id: 2,
    title: 'Midnight Draw',
    format: '6x36',
    jackpot: '750 TON',
    date: 'Next Draw: Friday',
    color: 'pink',
    icon: 'MD',
  },
  {
    id: 3,
    title: 'Golden Hour',
    format: '4x36',
    jackpot: '500 TON',
    date: 'Next Draw: Sunday',
    color: 'gold',
    icon: 'GH',
  },
  {
    id: 4,
    title: 'Daily Jackpot',
    format: '5x30',
    jackpot: '300 TON',
    date: 'Next Draw: Today',
    color: 'green',
    icon: 'DJ',
  },
  {
    id: 5,
    title: 'Bonus Round',
    format: '7x36',
    jackpot: '1200 TON',
    date: 'Next Draw: Monday',
    color: 'cyan',
    icon: 'BR',
  },
];

function PremiumMainScreen() {
  const [activeTab, setActiveTab] = useState('draw');
  const [activeCardIndex, setActiveCardIndex] = useState(2); // Center card

  // Particles initialization
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  // Particles configuration
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
        type: ['circle', 'star'],
        star: { 
          sides: 5, 
          inset: 2 
        }
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
        direction: 'bottom',
        random: true,
        straight: false,
        outModes: { 
          default: 'out'
        },
      },
      shadow: {
        enable: true,
        color: '#a78bfa',
        blur: 8,
      },
    },
    detectRetina: true,
  } as const;

  // Calculate card position and transform
  const getCardStyle = (index: number) => {
    const position = index - activeCardIndex;
    
    let transform = '';
    let opacity = 1;
    let zIndex = 5;
    let className = 'premium-lottery-card';
    
    if (position === 0) {
      // Active (center) card
      transform = 'scale(1.12)';
      zIndex = 10;
      className += ' active';
    } else if (position === -1) {
      // Left side card
      transform = 'translateX(-100px) scale(0.9) rotateY(8deg)';
      zIndex = 5;
      className += ' side';
    } else if (position === 1) {
      // Right side card
      transform = 'translateX(100px) scale(0.9) rotateY(-8deg)';
      zIndex = 5;
      className += ' side';
    } else if (position === -2) {
      // Far left card
      transform = 'translateX(-180px) scale(0.85) rotateY(12deg)';
      opacity = 0.7;
      zIndex = 3;
      className += ' outer';
    } else if (position === 2) {
      // Far right card
      transform = 'translateX(180px) scale(0.85) rotateY(-12deg)';
      opacity = 0.7;
      zIndex = 3;
      className += ' outer';
    } else {
      // Hidden cards
      transform = 'translateX(0) scale(0.5)';
      opacity = 0;
      zIndex = 1;
    }
    
    return {
      transform,
      opacity,
      zIndex,
      className,
    };
  };

  // Handle card click
  const handleCardClick = (index: number) => {
    setActiveCardIndex(index);
  };

  // Handle navigation
  const handleNavClick = (page: string) => {
    console.log('Navigate to:', page);
  };

  return (
    <div className="premium-container">
      {/* Background Layers */}
      <div className="premium-background">
        <div className="premium-bg-layer-1" />
        <div className="premium-bg-layer-2" />
        <div className="premium-bg-layer-3" />
      </div>

      {/* Particles */}
      <div className="premium-particles">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
        />
      </div>

      {/* Header */}
      <header className="premium-header">
        <div className="premium-header-left">
          <div className="premium-logo-icon">
            <span style={{ fontSize: '20px', color: 'white', fontWeight: 'bold' }}>W</span>
          </div>
          <h1 className="premium-logo-text">WEEKEND MILLIONS</h1>
        </div>
        <div className="premium-header-right">
          <Settings className="premium-header-icon" onClick={() => handleNavClick('settings')} />
          <Info className="premium-header-icon" onClick={() => handleNavClick('info')} />
        </div>
      </header>

      {/* Main Content */}
      <main className="premium-content">
        {/* Tabs */}
        <section className="premium-tabs-section">
          <div className="premium-tabs-container">
            <button
              className={`premium-tab ${activeTab === 'draw' ? 'active' : ''}`}
              onClick={() => setActiveTab('draw')}
            >
              Draw Lotteries
            </button>
            <button
              className={`premium-tab ${activeTab === 'keno' ? 'active' : ''}`}
              onClick={() => setActiveTab('keno')}
            >
              Keno
            </button>
            <button
              className={`premium-tab ${activeTab === 'momentum' ? 'active' : ''}`}
              onClick={() => setActiveTab('momentum')}
            >
              Momentum
            </button>
          </div>
        </section>

        {/* Carousel */}
        <section className="premium-carousel-section">
          <div className="premium-carousel-container">
            {lotteries.map((lottery, index) => {
              const style = getCardStyle(index);
              return (
                <div
                  key={lottery.id}
                  className={`${style.className} ${lottery.color}`}
                  style={{
                    transform: style.transform,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="premium-card-content">
                    {/* Logo */}
                    <div className="premium-card-logo">
                      <span>{lottery.icon}</span>
                    </div>

                    {/* Title and Format */}
                    <div>
                      <h2 className="premium-card-title">{lottery.title}</h2>
                      <p className="premium-card-format">{lottery.format}</p>
                    </div>

                    {/* Jackpot */}
                    <div>
                      <p className="premium-card-jackpot-label">Jackpot</p>
                      <p className="premium-card-jackpot">{lottery.jackpot}</p>
                    </div>

                    {/* Date */}
                    <p className="premium-card-date">{lottery.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="premium-footer">
        <div className="premium-footer-left">
          <button className="premium-footer-button" onClick={() => handleNavClick('home')}>
            <Home />
            <span>Home</span>
          </button>
          <button className="premium-footer-button" onClick={() => handleNavClick('archive')}>
            <Archive />
            <span>Archive</span>
          </button>
        </div>

        {/* Profile Button (Center) */}
        <button className="premium-profile-button" onClick={() => handleNavClick('profile')}>
          <User />
        </button>

        <div className="premium-footer-right">
          <button className="premium-footer-button" onClick={() => handleNavClick('help')}>
            <HelpCircle />
            <span>Help</span>
          </button>
          <button className="premium-footer-button" onClick={() => handleNavClick('more')}>
            <MoreHorizontal />
            <span>More</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default PremiumMainScreen;
