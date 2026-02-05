import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Loader2 } from 'lucide-react';

interface MainLotteryCardProps {
  currency: 'TON' | 'USDT';
  prizePool?: number;
  ticketPrice?: number;
  participantsCount?: number;
  drawDate?: Date;
  onBuyTicket?: () => void;
  isLoading?: boolean;
}

export default function MainLotteryCard({
  currency,
  prizePool = 10000,
  ticketPrice = 5,
  participantsCount = 256,
  drawDate,
  onBuyTicket,
  isLoading = false,
}: MainLotteryCardProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate next Sunday 20:00
  const getNextDrawDate = () => {
    const now = new Date();
    const next = new Date(now);
    
    // Set to next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    next.setDate(now.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    
    // Set time to 20:00
    next.setHours(20, 0, 0, 0);
    
    // If it's Sunday and past 20:00, go to next Sunday
    if (now.getDay() === 0 && now.getHours() >= 20) {
      next.setDate(next.getDate() + 7);
    }
    
    return next;
  };

  useEffect(() => {
    const targetDate = drawDate || getNextDrawDate();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [drawDate]);

  const maxParticipants = 1000;
  const participantsProgress = (participantsCount / maxParticipants) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mx-4 mt-8 mb-8 rounded-3xl overflow-hidden"
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'blur(12px)',
        border: '2px solid var(--glass-border)',
      }}
    >
      {/* Animated glow border */}
      <div
        className="absolute inset-0 rounded-3xl opacity-50"
        style={{
          background: 'var(--theme-ring-gradient)',
          filter: 'blur(20px)',
          animation: 'spin 6s linear infinite',
          zIndex: -1,
        }}
      />

      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: 'var(--theme-neon-color)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: 'var(--theme-accent-gradient)',
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(var(--theme-neon-color-rgb), 0.3)',
                '0 0 40px rgba(var(--theme-neon-color-rgb), 0.5)',
                '0 0 20px rgba(var(--theme-neon-color-rgb), 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={18} color="#fff" />
            <span className="text-sm font-bold text-white">WEEKEND SPECIAL</span>
          </motion.div>

          <h2
            className="text-5xl font-bold mb-2"
            style={{
              background: 'var(--theme-text-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {prizePool.toLocaleString()} {currency}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Prize Pool
          </p>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
            { label: 'Seconds', value: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl text-center"
              style={{
                background: 'var(--glass-background)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {item.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Participants Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <Users size={16} color="var(--text-secondary)" />
              <span style={{ color: 'var(--text-secondary)' }}>Participants</span>
            </div>
            <span style={{ color: 'var(--text-primary)' }}>
              {participantsCount} / {maxParticipants}
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: 'var(--glass-background)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--theme-accent-gradient)' }}
              initial={{ width: 0 }}
              animate={{ width: `${participantsProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Ticket Price */}
        <div className="text-center mb-6">
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
            Ticket Price
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {ticketPrice} {currency}
          </p>
        </div>

        {/* Buy Button */}
        <motion.button
          onClick={onBuyTicket}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white relative overflow-hidden"
          style={{
            background: 'var(--theme-button-gradient)',
            backgroundSize: '200% 200%',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />

          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Buy Ticket Now
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
