import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import MainLotteryCard from '../components/ui/MainLotteryCard';
import Advantages from '../components/ui/Advantages';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currency, setCurrency] = useState<'TON' | 'USDT'>('TON');

  const handleCurrencyChange = (newCurrency: 'TON' | 'USDT') => {
    setCurrency(newCurrency);
    // Emit global currency change event for other components
    window.dispatchEvent(
      new CustomEvent('currencyChange', { detail: { currency: newCurrency } })
    );
  };

  const handleBuyTicket = () => {
    // Navigate to lottery page
    navigate('/lottery/weekend-millions');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: 'var(--theme-background-gradient)' }}>
        <Header
          onCurrencyChange={handleCurrencyChange}
          defaultCurrency={currency}
          showSearch={false}
          showNotifications={true}
          notificationCount={0}
        />
        
        <main className="pt-20 pb-24">
          <MainLotteryCard
            currency={currency}
            onBuyTicket={handleBuyTicket}
          />
          <Advantages />
        </main>
        
        <Footer user={user} onLogout={logout} />
      </div>
    </ThemeProvider>
  );
}
