import React, { useEffect, useState, useCallback } from 'react';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/ticketApi';
import type { PurchasedTicket } from '../services/ticketApi';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './MyTicketsPage.css';

const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
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

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

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
        <Header onConnect={handleConnectWallet} walletAddress={walletAddress || undefined} />
        
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
              <h1>🎫 Мои билеты</h1>
              
              {tickets.length === 0 ? (
                <p>У вас пока нет билетов</p>
              ) : (
                <div className="tickets-list">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="ticket-card">
                      <div className="ticket-header">
                        <span className="lottery-name">{ticket.lotterySlug}</span>
                        <span className="ticket-date">
                          {new Date(ticket.purchasedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      
                      <div className="ticket-numbers">
                        {ticket.numbers.map((num, idx) => (
                          <span key={idx} className="number-ball">{num}</span>
                        ))}
                      </div>
                      
                      <div className="ticket-footer">
                        <span className={`status status-${ticket.status}`}>
                          {ticket.status === 'active' && '🟢 Активный'}
                          {ticket.status === 'won' && '🏆 Выиграл'}
                          {ticket.status === 'lost' && '⚫ Не выиграл'}
                        </span>
                        <span className="price">{ticket.price} TON</span>
                      </div>
                      
                      <div className="ticket-tx">
                        TX: {ticket.txHash.slice(0, 10)}...{ticket.txHash.slice(-6)}
                      </div>
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
