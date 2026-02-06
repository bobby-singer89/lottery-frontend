/**
 * API Endpoints Configuration
 * 
 * Centralized endpoint constants for all API calls.
 * This ensures consistency across the application and makes it easier to maintain API routes.
 */

export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    TELEGRAM: '/api/auth/telegram',
    CONNECT_WALLET: '/api/auth/connect-wallet',
    REFRESH: '/api/auth/refresh',
  },

  /**
   * Lottery endpoints
   */
  LOTTERY: {
    LIST: '/api/lottery/list',
    DETAILS: (slug: string) => `/api/lottery/${slug}`,
    INFO: (slug: string) => `/api/lottery/${slug}/info`,
    BUY_TICKET: (slug: string) => `/api/lottery/${slug}/buy-ticket`,
    MY_TICKETS: (slug: string) => `/api/lottery/${slug}/my-tickets`,
    CURRENT_DRAW: (slug: string) => `/api/lottery/${slug}/current-draw`,
  },

  /**
   * Public endpoints (no auth required)
   */
  PUBLIC: {
    LOTTERIES: '/api/public/lotteries',
    LOTTERY_INFO: (slug: string) => `/api/public/lottery/${slug}`,
    CURRENT_DRAW: (slug: string) => `/api/public/lottery/${slug}/current-draw`,
    EXCHANGE_RATES: (from: string, to: string) => `/api/public/exchange-rates/${from}/${to}`,
  },

  /**
   * Ticket endpoints
   */
  TICKETS: {
    MY_TICKETS: '/api/tickets/my-tickets',
    DETAILS: (id: string) => `/api/tickets/${id}`,
    VERIFY: (id: string) => `/api/tickets/${id}/verify`,
  },

  /**
   * Draw endpoints
   */
  DRAWS: {
    CURRENT: '/api/draws/current',
    DETAILS: (id: string) => `/api/draws/${id}`,
    RESULTS: (id: string) => `/api/draws/${id}/results`,
    VERIFY: (id: string) => `/api/draws/${id}/verify`,
  },

  /**
   * User endpoints
   */
  USER: {
    PROFILE: '/api/user/profile',
    STATS: '/api/user/stats',
    HISTORY: '/api/user/history',
    UPDATE_PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
  },

  /**
   * Gamification endpoints
   */
  GAMIFICATION: {
    ACHIEVEMENTS: '/api/gamification/achievements',
    PROGRESS: '/api/gamification/progress',
    PROFILE: '/api/gamification/profile',
    STREAK: '/api/gamification/streak',
    CHECK_IN: '/api/gamification/check-in',
    QUESTS: '/api/gamification/quests',
    REWARDS: '/api/gamification/rewards',
    CLAIM_REWARD: (id: string) => `/api/gamification/rewards/${id}/claim`,
  },

  /**
   * Referral endpoints
   */
  REFERRAL: {
    STATS: '/api/referral/stats',
    CODE: '/api/referral/code',
    HISTORY: '/api/referral/history',
  },

  /**
   * Swap/Exchange endpoints
   */
  SWAP: {
    QUOTE: '/api/swap/quote',
    BUILD_TRANSACTION: '/api/swap/build-transaction',
    TOKENS: '/api/swap/tokens',
    RATE: (from: string, to: string) => `/api/swap/rate/${from}/${to}`,
  },

  /**
   * Admin endpoints
   */
  ADMIN: {
    LOGIN: '/api/admin/login',
    USERS: '/api/admin/users',
    LOTTERIES: '/api/admin/lotteries',
    DRAWS: '/api/admin/draws',
    TICKETS: '/api/admin/tickets',
    NOTIFICATIONS: '/api/admin/notifications',
    STATS: '/api/admin/stats',
  },
} as const;

/**
 * Helper function to build query string from params
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}
