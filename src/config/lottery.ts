import { CURRENT_CONFIG } from './contracts';

// Lottery Configuration Constants
export const LOTTERY_CONFIG = {
  // Use contract configuration
  WALLET_ADDRESS: CURRENT_CONFIG.LOTTERY_WALLET,
  
  // Ticket price in TON
  TICKET_PRICE: 1, // Updated to 1 TON
  
  // Discount threshold (5+ tickets = 5% off)
  DISCOUNT_THRESHOLD: 5,
  DISCOUNT_PERCENT: 0.05,
};

// Weekend Millions Lottery Configuration
export const WEEKEND_MILLIONS_CONFIG = {
  slug: 'weekend-millions',
  name: 'Weekend Millions',
  format: '5/36',
  numbersToSelect: 5,
  numbersPool: 36,
  ticketPrice: 1, // 1 TON
  ticketPriceNano: (1 * 1e9).toString(),
  seedJackpot: 1000, // 1000 TON starting jackpot
  lotteryWallet: CURRENT_CONFIG.LOTTERY_WALLET,
  prizes: {
    5: 500,    // TON
    4: 50,
    3: 5,
    2: 0.5,
    1: 'free_ticket' as const
  },
  drawDay: 0, // Sunday (JavaScript Date: 0=Sunday, 1=Monday, ..., 6=Saturday)
  drawHour: 20, // 20:00 (8 PM)
  drawMinute: 0,
  drawTime: 'Каждое воскресенье в 20:00',
  timezone: 'Europe/Moscow'
};

// Backward compatibility alias
export const WEEKEND_SPECIAL_CONFIG = WEEKEND_MILLIONS_CONFIG;

// Design Theme: "Sunset Gold"
export const WEEKEND_THEME = {
  primary: '#FFD700',        // золотой
  secondary: '#FF6B35',      // закатный оранжевый
  accent: '#9B59B6',         // королевский фиолетовый
  bg: 'linear-gradient(135deg, #1a1a2e, #16213e)'
};
