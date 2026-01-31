export default function FooterSection() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer-section fade-in-section">
      <div className="footer-logo">🎰 TON Lottery</div>
      <div className="footer-links">
        <a href="#" className="footer-link">About</a>
        <a href="#" className="footer-link">FAQ</a>
        <a 
          href="#" 
          className="footer-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('how-it-works');
          }}
        >
          How It Works
        </a>
        <a href="#" className="footer-link">Contact</a>
      </div>
      <div className="footer-copyright">
        © 2026 TON Lottery. All rights reserved.
      </div>
    </footer>
  );
}
