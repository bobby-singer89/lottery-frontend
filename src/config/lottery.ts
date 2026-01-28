// Weekend Special Lottery Configuration
export const WEEKEND_SPECIAL_CONFIG = {
  slug: 'weekend-special',
  name: 'Weekend Special',
  format: '5/36',
  numbersToSelect: 5,
  numbersPool: 36,
  ticketPrice: 1, // TON
  ticketPriceNano: '1000000000', // nanotons
  lotteryWallet: import.meta.env.VITE_LOTTERY_WALLET || '0QDAy6M4QQRcIy8jLl4n4acb7IxmDnPZiBqz7A_6xvY90GeY',
  prizes: {
    5: 500,    // TON
    4: 50,
    3: 5,
    2: 0.5,
    1: 'free_ticket' as const
  },
  drawTime: '18:00',
  timezone: 'Europe/Moscow'
};

// Design Theme: "Sunset Gold"
export const WEEKEND_THEME = {
  primary: '#FFD700',        // золотой
  secondary: '#FF6B35',      // закатный оранжевый
  accent: '#9B59B6',         // королевский фиолетовый
  bg: 'linear-gradient(135deg, #1a1a2e, #16213e)'
};
