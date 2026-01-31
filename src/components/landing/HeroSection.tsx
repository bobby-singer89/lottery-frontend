import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section fade-in-section">
      <div className="hero-background"></div>
      <div className="hero-content glass-card">
        <h1 className="hero-title">Win Big on The Open Network</h1>
        <p className="hero-subtitle">First Provably Fair Lottery on TON</p>
        <div className="hero-buttons">
          <button
            className="cta-button pulse"
            onClick={() => navigate('/lottery')}
          >
            Buy Your First Ticket
          </button>
          <button
            className="cta-button secondary"
            onClick={() => scrollToSection('how-it-works')}
          >
            How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
