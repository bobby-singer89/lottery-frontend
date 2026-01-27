import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Ticket, TrendingUp, AlertCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api/client';
import './HistoryPage.css';

interface TicketData {
  id: string;
  numbers: number[];
  lotteryName: string;
  drawDate: string;
  status: 'pending' | 'won' | 'lost';
  prize?: number;
}

function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Try to fetch from weekend-millions as default
        const response = await apiClient.getMyTickets('weekend-millions');
        if (response.success && response.tickets) {
          setTickets(response.tickets);
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        // Show empty state on error
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
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

  const handleConnect = () => {
    console.log('Connecting wallet...');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <span className="status-badge status-won">Won</span>;
      case 'lost':
        return <span className="status-badge status-lost">Lost</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="main-content history-page">
          <motion.div
            className="history-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="history-header">
              <h1>Ticket History</h1>
              <p className="history-subtitle">
                View all your lottery tickets and results
              </p>
            </div>

            {!isAuthenticated ? (
              <div className="auth-required">
                <AlertCircle size={48} />
                <h3>Authentication Required</h3>
                <p>Please connect your wallet to view your ticket history</p>
                <button className="cta-button" onClick={() => navigate('/profile')}>
                  Go to Profile
                </button>
              </div>
            ) : isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="no-tickets">
                <Ticket size={64} />
                <h3>No Tickets Yet</h3>
                <p>You haven't purchased any lottery tickets yet</p>
                <button className="cta-button" onClick={() => navigate('/lotteries')}>
                  Browse Lotteries
                </button>
              </div>
            ) : (
              <div className="tickets-grid">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    className="ticket-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="ticket-header">
                      <div className="ticket-icon">
                        <Ticket size={24} />
                      </div>
                      <div className="ticket-title">
                        <h3>{ticket.lotteryName}</h3>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>

                    <div className="ticket-numbers">
                      {ticket.numbers?.map((num, idx) => (
                        <span key={idx} className="lottery-number">
                          {num}
                        </span>
                      ))}
                    </div>

                    <div className="ticket-details">
                      <div className="ticket-detail-item">
                        <Calendar size={16} />
                        <span>{ticket.drawDate}</span>
                      </div>
                      {ticket.prize && (
                        <div className="ticket-detail-item prize">
                          <TrendingUp size={16} />
                          <span>+{ticket.prize} TON</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default HistoryPage;
