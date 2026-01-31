export default function WhyChooseSection() {
  const features = [
    {
      icon: '✅',
      title: 'Provably Fair',
      description: 'Blockchain-verified randomness'
    },
    {
      icon: '⚡',
      title: 'Instant Payouts',
      description: 'Automatic TON transfers'
    },
    {
      icon: '💰',
      title: 'Low Fees',
      description: 'Only network costs'
    },
    {
      icon: '🔒',
      title: 'Secure & Transparent',
      description: 'On-chain verification'
    },
    {
      icon: '🎁',
      title: 'Referral Program',
      description: 'Earn 5% from friends'
    }
  ];

  return (
    <section className="landing-section fade-in-section">
      <h2 className="section-title">Why TON Lottery?</h2>
      <div className="section-grid">
        {features.map((feature, index) => (
          <div key={index} className="glass-card feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
