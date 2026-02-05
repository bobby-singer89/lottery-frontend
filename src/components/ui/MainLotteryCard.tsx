import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MainLotteryCardProps {
  currency: 'TON' | 'USDT';
  prizePool?: number;
  ticketPrice?: number;
  onBuyTicket?: () => void;
}

function getNextSunday8PM(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(20, 0, 0, 0);
  if (nextSunday <= now) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }
  return nextSunday;
}

function formatCountdown(ms: number) {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function MainLotteryCard({ currency, prizePool = 1000, ticketPrice = 1, onBuyTicket }: MainLotteryCardProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(getNextSunday8PM().getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = getNextSunday8PM().getTime() - Date.now();
      setCountdown(formatCountdown(Math.max(0, diff)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative max-w-2xl mx-auto p-8 rounded-3xl border border-purple-500/40 backdrop-blur-2xl bg-black/50 shadow-2xl overflow-hidden"
      style={{ boxShadow: 'var(--theme-card-glow)' }}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div
          className="absolute inset-[-50%] animate-spin-slow"
          style={{
            background: 'var(--theme-ring)',
            animationDuration: '8s',
          }}
        />
        <div className="absolute inset-[2px] rounded-3xl bg-black/90" />
      </div>

      <div className="relative z-10">
        <h2 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent"
            style={{ backgroundImage: 'var(--theme-text-gradient)' }}>
          Weekend Millions
        </h2>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(countdown).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-3xl font-bold text-white">{String(value).padStart(2, '0')}</div>
              <div className="text-xs text-gray-400 uppercase">{key}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mb-8">
          <div>
            <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-neon-color)' }}>
              {prizePool} {currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Draw</p>
            <p className="text-lg font-semibold">Sunday 20:00</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Ticket</p>
            <p className="text-xl font-bold text-green-400">{ticketPrice} {currency}</p>
          </div>
        </div>

        {/* Buy Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168, 85, 247, 0.7)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onBuyTicket}
          className="w-full py-5 rounded-2xl text-xl font-bold shadow-lg"
          style={{ background: 'var(--theme-button)' }}
        >
          Buy Ticket
        </motion.button>
      </div>
    </motion.div>
  );
}
