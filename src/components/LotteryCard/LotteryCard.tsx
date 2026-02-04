import { motion } from 'framer-motion';
import { Calendar, Coins, Ticket, TrendingUp } from 'lucide-react';
import Button from '../Button/Button';
import './LotteryCard.css';

interface LotteryCardProps {
  title?: string; // Make title optional - will only show for Weekend Millions
  prizePool: string;
  drawDate: string;
  ticketPrice: string;
  icon?: 'ticket' | 'coins' | 'trending' | 'calendar';
  showTitle?: boolean; // Control whether to show title
  onBuyTicket?: () => void;
}

const iconMap = {
  ticket: Ticket,
  coins: Coins,
  trending: TrendingUp,
  calendar: Calendar,
};

function LotteryCard({
  title,
  prizePool,
  drawDate,
  ticketPrice,
  icon = 'ticket',
  showTitle = true,
  onBuyTicket,
}: LotteryCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <motion.div
      className="lottery-card-glass"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="lottery-card-glow"></div>
      
      <div className="lottery-card-header">
        <div className="lottery-icon">
          <IconComponent size={32} />
        </div>
        {showTitle && title && <h3 className="lottery-title">{title}</h3>}
      </div>

      <div className="lottery-card-body">
        <div className="lottery-prize">
          <div className="prize-label">Джекпот</div>
          <div className="prize-amount">{prizePool}</div>
        </div>

        <div className="lottery-details">
          <div className="lottery-detail-item">
            <Calendar size={16} />
            <span>{drawDate}</span>
          </div>
          <div className="lottery-detail-item">
            <Coins size={16} />
            <span>{ticketPrice}</span>
          </div>
        </div>
      </div>

      <div className="lottery-card-footer">
        <Button onClick={onBuyTicket} pulse={true} size="medium">
          КУПИТЬ БИЛЕТ
        </Button>
      </div>
    </motion.div>
  );
}

export default LotteryCard;
