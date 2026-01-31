/**
 * API Configuration
 * Central configuration for API base URLs and endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  ENDPOINTS: {
    PROFILE: {
      STATS: '/user/profile/stats',
      ACHIEVEMENTS: '/user/profile/achievements',
      ACTIVITY: '/user/profile/activity',
      FAVORITE_NUMBERS: '/user/profile/favorite-numbers',
      EARNINGS: '/user/profile/earnings',
      RECENT_TICKETS: '/user/profile/recent-tickets',
    },
  },
};
