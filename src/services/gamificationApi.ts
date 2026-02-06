import axios, { AxiosInstance } from 'axios';
import type {
  GamificationProfile,
  StreakInfo,
  CheckInResult,
  Quest,
  Achievement,
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardResponse,
  AchievementProgress,
  ReferralStats,
  ReferralUser,
  UserReward
} from '../types/gamification';

// Создаем типизированный экземпляр apiClient
const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/gamification`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Функция для получения ID пользователя ---
function getTelegramUserId(): string | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null;
  } catch (e) {
    console.error("Ошибка при получении user ID из Telegram WebApp:", e);
    return null;
  }
}

// --- КЛЮЧЕВОЙ ПЕРЕХВАТЧИК ЗАПРОСОВ ---
apiClient.interceptors.request.use(
  (config) => {
    const userId = getTelegramUserId();
    if (userId) {
      config.headers['x-user-id'] = userId;
    } else {
      console.warn(`[gamificationApi] User ID не найден. Запрос к ${config.url} будет неавторизован.`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- ПОЛНОСТЬЮ ВОССТАНОВЛЕННЫЙ API-СЕРВИС ---
export const gamificationApi = {
  // Profile
  getProfile: (): Promise<{ profile: GamificationProfile }> => apiClient.get('/profile').then(res => res.data),

  // Streaks
  getStreak: (): Promise<{ streak: StreakInfo }> => apiClient.get('/streak').then(res => res.data),
  checkIn: (): Promise<CheckInResult> => apiClient.post('/check-in').then(res => res.data),

  // Achievements
  getMyAchievements: (): Promise<{ achievements: Achievement[] }> => apiClient.get('/achievements').then(res => res.data),
  getAchievementProgress: (achievementId: string): Promise<{ progress: AchievementProgress }> => 
    apiClient.get(`/achievements/${achievementId}/progress`).then(res => res.data),
  claimAchievement: (achievementId: string): Promise<{ reward: UserReward }> => 
    apiClient.post(`/achievements/${achievementId}/claim`).then(res => res.data),

  // Quests
  getMyQuests: (): Promise<{ quests: Quest[] }> => apiClient.get('/quests').then(res => res.data),
  claimQuest: (questId: string): Promise<{ reward: UserReward }> => 
    apiClient.post(`/quests/${questId}/claim`).then(res => res.data),

  // Leaderboard
  getLeaderboard: (type: LeaderboardType, period: LeaderboardPeriod): Promise<LeaderboardResponse> =>
    apiClient.get(`/leaderboard?type=${type}&period=${period}`).then(res => res.data),

  // Referrals
  getReferralStats: (): Promise<{ stats: ReferralStats }> => apiClient.get('/referrals/stats').then(res => res.data),
  getReferrals: (): Promise<{ referrals: ReferralUser[] }> => apiClient.get('/referrals').then(res => res.data),
  applyReferralCode: (code: string): Promise<{ success: boolean; message: string }> => 
    apiClient.post('/referrals/apply', { code }).then(res => res.data),
};
