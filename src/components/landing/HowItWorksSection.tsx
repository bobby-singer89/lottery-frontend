export default function HowItWorksSection() {
  const steps = [
    {
      icon: '🎯',
      title: 'Pick Your Numbers',
      description: 'Choose 5 lucky numbers'
    },
    {
      icon: '⏰',
      title: 'Wait for Draw',
      description: 'Draws every Saturday 20:00 UTC'
    },
    {
      icon: '🏆',
      title: 'Win Prizes',
      description: 'Instant TON payouts'
    }
  ];

  return (
    <section id="how-it-works" className="landing-section fade-in-section">
      <h2 className="section-title">How It Works</h2>
      <div className="section-grid">
        {steps.map((step, index) => (
          <div key={index} className="glass-card step-card">
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
