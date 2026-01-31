import React, { useEffect, useState, useCallback } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ticketApi } from '../services/ticketApi';
import type { PurchasedTicket } from '../services/ticketApi';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import TicketCard from '../components/Ticket/TicketCard';
import './MyTicketsPage.css';

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const walletAddress = useTonAddress();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const loadTickets = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      setLoading(true);
      const data = await ticketApi.getUserTickets(walletAddress);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Не удалось загрузить билеты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      loadTickets();
    } else {
      setLoading(false);
    }
  }, [walletAddress, loadTickets]);


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch(tab) {
      case 'home':
        navigate('/');
        break;
      case 'lotteries':
        navigate('/lotteries');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'referral':
        navigate('/referral');
        break;
    }
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header />
        
        <main className="my-tickets-page">
          {!walletAddress ? (
            <>
              <h1>🎫 Мои билеты</h1>
              <p>Подключите кошелёк, чтобы увидеть ваши билеты</p>
            </>
          ) : loading ? (
            <>
              <h1>🎫 Мои билеты</h1>
              <p>Загрузка...</p>
            </>
          ) : error ? (
            <>
              <h1>🎫 Мои билеты</h1>
              <p className="error">{error}</p>
            </>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎫 Мои билеты
              </motion.h1>
              
              {tickets.length === 0 ? (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>У вас пока нет билетов</p>
                  <Link to="/lottery/weekend-special" className="buy-btn">
                    💎 Купить билет
                  </Link>
                </motion.div>
              ) : (
                <div className="tickets-grid">
                  {tickets.map((ticket) => (
                    <div key={ticket.id}>
                      <TicketCard ticket={ticket} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default MyTicketsPage;
