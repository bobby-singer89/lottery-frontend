import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { Settings, Home, Archive, User, HelpCircle, MoreHorizontal } from 'lucide-react';

// Типы
type Currency = 'TON' | 'USDT';
type LotteryCategory = 'draw' | 'keno' | 'momentum';

interface LotteryCard {
  name: string;
  format: string;
  jackpot: number;
  drawDate: string;
  color: string;
}

const lotteryCards: Record<LotteryCategory, LotteryCard[]> = {
  draw: [
    {
      name: 'Weekend Special',
      format: '5x36',
      jackpot: 1000,
      drawDate: 'Every Sunday 20:00',
      color: '#8b5cf6',
    },
    {
      name: 'Midnight Draw',
      format: '6x36',
      jackpot: 750,
      drawDate: 'Every Friday 00:00',
      color: '#ec4899',
    },
    {
      name: 'Golden Hour',
      format: '4x36',
      jackpot: 500,
      drawDate: 'Every Wednesday 18:00',
      color: '#eab308',
    },
    {
      name: 'Daily Jackpot',
      format: '5x30',
      jackpot: 300,
      drawDate: 'Every day 21:00',
      color: '#22c55e',
    },
    {
      name: 'Bonus Round',
      format: '7x36',
      jackpot: 1200,
      drawDate: 'Every Saturday 22:00',
      color: '#06b6d4',
    },
  ],
  keno: [
    { name: 'Keno Classic', format: '10/80', jackpot: 800, drawDate: 'Every hour', color: '#a78bfa' },
    { name: 'Keno Turbo', format: '10/80', jackpot: 400, drawDate: 'Every 15 min', color: '#f472b6' },
    { name: 'Keno Max', format: '15/80', jackpot: 1500, drawDate: 'Every 2 hours', color: '#38bdf8' },
    { name: 'Keno Mini', format: '5/80', jackpot: 200, drawDate: 'Every 30 min', color: '#4ade80' },
    { name: 'Keno Gold', format: '10/80', jackpot: 1000, drawDate: 'Daily', color: '#fbbf24' },
  ],
  momentum: [
    { name: 'Momentum Rush', format: 'Instant', jackpot: 600, drawDate: 'Anytime', color: '#f43f5e' },
    { name: 'Quick Win', format: 'Instant', jackpot: 300, drawDate: 'Anytime', color: '#8b5cf6' },
    { name: 'Flash Draw', format: 'Instant', jackpot: 450, drawDate: 'Anytime', color: '#06b6d4' },
    { name: 'Instant Fortune', format: 'Instant', jackpot: 800, drawDate: 'Anytime', color: '#22c55e' },
    { name: 'Speed Lottery', format: 'Instant', jackpot: 550, drawDate: 'Anytime', color: '#eab308' },
  ],
};

export default function NewMainScreen() {
  const [currency, setCurrency] = useState<Currency>('TON');
  const [category, setCategory] = useState<LotteryCategory>('draw');
  const [activeCardIndex, setActiveCardIndex] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const particlesOptions = {
    particles: {
      number: { value: 80, density: { enable: true, area: 800 } },
      color: { value: '#8b5cf6' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'bottom' as const,
        random: true,
        straight: false,
        outModes: { default: 'out' as const },
      },
    },
    interactivity: { 
      events: { 
        onHover: { enable: true, mode: 'repulse' } 
      } 
    },
    detectRetina: true,
  };

  const currentCards = lotteryCards[category];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeCardIndex < currentCards.length - 1) {
      setActiveCardIndex(prev => prev + 1);
    } else if (direction === 'right' && activeCardIndex > 0) {
      setActiveCardIndex(prev => prev - 1);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? 'left' : 'right');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black via-purple-950 to-black">
      {/* Падающие частицы */}
      <Particles 
        id="tsparticles" 
        init={particlesInit} 
        options={particlesOptions} 
        className="absolute inset-0 z-0" 
      />

      {/* Хэдер */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
              W
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              WEEKEND MILLIONS
            </span>
          </div>

          {/* TON/USDT переключатель + Настройки */}
          <div className="flex items-center gap-3">
            {/* Currency Toggle */}
            <div className="flex bg-black/50 rounded-full p-1 border border-white/10">
              <motion.button
                onClick={() => setCurrency('TON')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currency === 'TON'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                TON
              </motion.button>
              <motion.button
                onClick={() => setCurrency('USDT')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  currency === 'USDT'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                USDT
              </motion.button>
            </div>

            {/* Settings */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              className="p-2 rounded-full bg-black/50 border border-white/10 hover:bg-purple-900/30 transition-colors"
            >
              <Settings size={20} className="text-purple-400" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="relative z-10 pt-24 pb-32 px-4 max-w-7xl mx-auto">
        {/* Табы категорий */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-black/50 rounded-full p-1 border border-white/10 backdrop-blur-sm">
            {(['draw', 'keno', 'momentum'] as LotteryCategory[]).map((cat) => (
              <motion.button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setActiveCardIndex(2);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {cat === 'draw' ? 'Draw Lotteries' : cat === 'keno' ? 'Keno' : 'Momentum'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Карточки лотерей - 3D карусель */}
        <div 
          ref={carouselRef}
          className="relative h-[450px] flex items-center justify-center perspective-1000"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentCards.map((card, index) => {
            const offset = index - activeCardIndex;
            const isActive = index === activeCardIndex;
            
            return (
              <motion.div
                key={`${category}-${index}`}
                className="absolute w-72 cursor-pointer"
                initial={false}
                animate={{
                  x: offset * 80,
                  scale: isActive ? 1 : 0.85,
                  zIndex: isActive ? 10 : 5 - Math.abs(offset),
                  opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2,
                  rotateY: offset * -5,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => setActiveCardIndex(index)}
                whileHover={isActive ? { scale: 1.05, y: -10 } : {}}
              >
                <div 
                  className="h-[380px] rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}20, ${card.color}05)`,
                    boxShadow: isActive 
                      ? `0 0 60px ${card.color}60, 0 0 100px ${card.color}30, inset 0 0 60px ${card.color}10`
                      : `0 0 30px ${card.color}30`,
                  }}
                >
                  {/* Фоновый градиент */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${card.color}50, transparent 70%)`,
                    }}
                  />
                  
                  {/* Контент карточки */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                    {/* Логотип W */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-white/20"
                      style={{ 
                        background: `linear-gradient(135deg, ${card.color}80, ${card.color}40)`,
                        boxShadow: `0 0 20px ${card.color}50`,
                      }}
                    >
                      <span className="text-2xl font-bold text-white">W</span>
                    </div>

                    {/* Название */}
                    <h3 className="text-xl font-bold text-white mb-1">
                      {card.name}
                    </h3>
                    <p className="text-lg text-white/80 mb-4">{card.format}</p>

                    {/* Джекпот */}
                    <p className="text-sm text-purple-300 mb-1">jackpot</p>
                    <p 
                      className="text-4xl font-extrabold mb-4"
                      style={{ color: card.color }}
                    >
                      {card.jackpot} <span className="text-2xl">{currency}</span>
                    </p>

                    {/* Разделитель */}
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4" />

                    {/* Дата розыгрыша */}
                    <p className="text-sm text-purple-300">Draw Date</p>
                    <p className="text-white/90">{card.drawDate}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Навигационные стрелки */}
          <button
            onClick={() => handleSwipe('right')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-purple-900/50 transition-colors z-20"
            disabled={activeCardIndex === 0}
            style={{ opacity: activeCardIndex === 0 ? 0.3 : 1 }}
          >
            ←
          </button>
          <button
            onClick={() => handleSwipe('left')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-purple-900/50 transition-colors z-20"
            disabled={activeCardIndex === currentCards.length - 1}
            style={{ opacity: activeCardIndex === currentCards.length - 1 ? 0.3 : 1 }}
          >
            →
          </button>

          {/* Индикаторы */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
            {currentCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveCardIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeCardIndex 
                    ? 'bg-purple-500 w-6' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center relative">
          {/* Левая часть */}
          <div className="flex items-center gap-8">
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Home size={24} />
              <span className="text-xs">Home</span>
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.92 }} 
              className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Archive size={24} />
              <span className="text-xs">Archive</span>
            </motion.button>
          </div>

          {/* Центральная кнопка Profile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-600/50 border-4 border-black/50"
          >
            <User size={28} className="text-white" />
          </motion.button>

          {/* Правая часть */}
          <div className="flex items-center gap-8">
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <HelpCircle size={24} />
              <span className="text-xs">Help</span>
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.92 }} 
              className="flex flex-col items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <MoreHorizontal size={24} />
              <span className="text-xs">More</span>
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}
