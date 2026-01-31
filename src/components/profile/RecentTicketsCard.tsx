import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';

interface RecentTicket {
  id: number;
  ticketNumber: string;
  numbers: number[];
  status: string;
  winAmount?: string;
  draw?: {
    lottery?: {
      name: string;
      slug: string;
    };
    status: string;
    winningNumbers?: number[];
  };
}

interface RecentTicketsCardProps {
  tickets: RecentTicket[] | null;
  isLoading: boolean;
}

function RecentTicketsCard({ tickets, isLoading }: RecentTicketsCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="profile-card">
        <div className="card-loading">Loading...</div>
      </div>
    );
  }

  const getStatusText = (ticket: RecentTicket) => {
    if (ticket.status === 'won') return 'Won! 🎉';
    if (ticket.status === 'pending' || ticket.draw?.status === 'scheduled') return 'Pending';
    return 'No match';
  };

  const getStatusClass = (ticket: RecentTicket) => {
    if (ticket.status === 'won') return 'won';
    if (ticket.status === 'pending' || ticket.draw?.status === 'scheduled') return 'pending';
    return 'no-match';
  };

  return (
    <div className="profile-card">
      <h2 className="card-title">🎫 Recent Tickets</h2>
      
      {tickets && tickets.length > 0 ? (
        <>
          <div className="recent-tickets-list">
            {tickets.slice(0, 2).map((ticket, index) => (
              <motion.div
                key={ticket.id}
                className="recent-ticket-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="ticket-header">
                  <div className="ticket-icon-wrapper">
                    <Ticket size={18} />
                  </div>
                  <div className="ticket-lottery-name">
                    {ticket.draw?.lottery?.name || 'Lottery'}
                  </div>
                  <div className={`ticket-status ${getStatusClass(ticket)}`}>
                    {getStatusText(ticket)}
                  </div>
                </div>
                <div className="ticket-numbers">
                  {ticket.numbers.map((num, idx) => (
                    <span 
                      key={idx} 
                      className={`ticket-num ${
                        ticket.draw?.winningNumbers?.includes(num) ? 'matched' : ''
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
                {ticket.status === 'won' && ticket.winAmount && (
                  <div className="ticket-win-amount">
                    Won: {ticket.winAmount} TON
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            className="view-all-btn"
            onClick={() => navigate('/my-tickets')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View All Tickets →
          </motion.button>
        </>
      ) : (
        <div className="no-data">
          <p>No tickets yet</p>
          <p className="hint">Buy your first ticket to get started!</p>
          <motion.button
            className="buy-ticket-btn"
            onClick={() => navigate('/lotteries')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Buy Tickets
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default RecentTicketsCard;
