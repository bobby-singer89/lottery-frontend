import axios from 'axios';
// ИСПРАВЛЕНИЕ: Используем 'import type' для типов
import type { AxiosInstance } from 'axios';
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
  UserReward,
  UserQuest
} from '../types/gamification';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/gamification`,
  headers: { 'Content-Type': 'application/json' },
});

function getTelegramUserId(): string | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id ? String(tg.initDataUnsafe.user.id) : null;
  } catch (e) {
    return null;
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const userId = getTelegramUserId();
    if (userId) config.headers['x-user-id'] = userId;
    return config;
  },
  (error) => Promise.reject(error)
);

export const gamificationApi = {
  // ИСПРАВЛЕНИЕ: Возвращаем данные в формате, который ожидают хуки
  getProfile: (): Promise<{ profile: GamificationProfile }> => apiClient.get('/profile').then(res => res.data),
  getStreak: (): Promise<{ streak: StreakInfo }> => apiClient.get('/streak').then(res => res.data),
  checkIn: (): Promise<{ result: CheckInResult }> => apiClient.post('/check-in').then(res => res.data),
  
  // ИСПРАВЛЕНИЕ: Возвращаем полное название и правильный тип
  getAchievements: (): Promise<{ achievements: Achievement[] }> => apiClient.get('/achievements').then(res => res.data),
  getAchievementProgress: (achievementId: string): Promise<{ progress: AchievementProgress[] }> => 
    apiClient.get(`/achievements/${achievementId}/progress`).then(res => res.data),
  claimAchievement: (achievementId: string): Promise<{ reward: UserReward }> => 
    apiClient.post(`/achievements/${achievementId}/claim`).then(res => res.data),

  // ИСПРАВЛЕНИЕ: Возвращаем полное название и правильный тип
  getQuests: (): Promise<{ quests: UserQuest[] }> => apiClient.get('/quests').then(res => res.data),
  claimQuest: (questId: string): Promise<{ reward: UserReward }> => 
    apiClient.post(`/quests/${questId}/claim`).then(res => res.data),

  getLeaderboard: (type: LeaderboardType, period: LeaderboardPeriod): Promise<LeaderboardResponse> =>
    apiClient.get(`/leaderboard?type=${type}&period=${period}`).then(res => res.data),

  getReferralStats: (): Promise<{ stats: ReferralStats }> => apiClient.get('/referrals/stats').then(res => res.data),
  getReferrals: (): Promise<{ referrals: ReferralUser[] }> => apiClient.get('/referrals').then(res => res.data),
  applyReferralCode: (code: string): Promise<{ success: boolean; message: string }> => 
    apiClient.post('/referrals/apply', { code }).then(res => res.data),
};
