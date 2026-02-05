import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import MainLotteryCard from '../components/ui/MainLotteryCard';
import Advantages from '../components/ui/Advantages';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';

export default function HomePage() {
  const [currency, setCurrency] = useState<'TON' | 'USDT'>(
    () => (localStorage.getItem('preferredCurrency') as 'TON' | 'USDT') || 'TON'
  );
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Listen for currency changes from other components
  useEffect(() => {
    const handler = (e: CustomEvent) => setCurrency(e.detail);
    window.addEventListener('currencyChange', handler as EventListener);
    return () => window.removeEventListener('currencyChange', handler as EventListener);
  }, []);

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      // Will trigger Telegram/TON wallet auth flow
      navigate('/weekend-special');
    } else {
      navigate('/weekend-special');
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen text-white relative overflow-hidden">
        <AnimatedBackground />
        <Header onCurrencyChange={setCurrency} defaultCurrency={currency} />
        
        <main className="pt-24 pb-28 px-4">
          <MainLotteryCard
            currency={currency}
            prizePool={currency === 'TON' ? 1000 : 5000}
            ticketPrice={currency === 'TON' ? 1 : 5}
            onBuyTicket={handleBuyTicket}
          />
          <Advantages />
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}
