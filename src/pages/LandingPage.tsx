import { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import WhyChooseSection from '../components/landing/WhyChooseSection';
import LiveStatsSection from '../components/landing/LiveStatsSection';
import RecentWinnersSection from '../components/landing/RecentWinnersSection';
import CTASection from '../components/landing/CTASection';
import FooterSection from '../components/landing/FooterSection';
import '../styles/landing.css';

export default function LandingPage() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Setup scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <LiveStatsSection />
      <RecentWinnersSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
