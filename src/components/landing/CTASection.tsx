import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="landing-section fade-in-section">
      <div className="glass-card cta-section-content">
        <h2 className="section-title">Ready to Win?</h2>
        <p className="cta-text">
          Join thousands of players on TON Lottery today!
        </p>
        <div className="cta-buttons">
          <button
            className="cta-button pulse"
            onClick={() => navigate('/lottery')}
          >
            Buy Your First Ticket
          </button>
          <button
            className="cta-button secondary"
            onClick={() => navigate('/referral')}
          >
            Invite Friends & Earn
          </button>
        </div>
      </div>
    </section>
  );
}
