import axios from 'axios';
// --- ИСПРАВЛЕНИЕ: Возвращаем все ваши импорты типов ---
import type {
  GamificationProfile,
  StreakInfo,
  CheckInResult,
  Quest,
  UserQuest,
  Achievement,
  UserAchievement,
  AchievementProgress,
  UserReward,
  ReferralStats,
  ReferralUser,
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardResponse,
} from '../types/gamification';


// URL вашего бэкенда из переменных окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lottery-backend-gm4j.onrender.com';

// Создаем экземпляр axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/gamification`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Новая функция для получения ID пользователя ---
function getTelegramUserId(): string | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      return String(tg.initDataUnsafe.user.id);
    }
    return null;
  } catch (e) {
    console.error("Ошибка при получении user ID из Telegram WebApp:", e);
    return null;
  }
}

// --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Добавляем "перехватчик" запросов ---
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

// --- Ваш существующий API без изменений, но теперь он использует настроенный apiClient ---
export const gamificationApi = {
  getProfile: async (): Promise<{ profile: GamificationProfile }> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  getStreak: async (): Promise<{ streak: StreakInfo }> => {
    const response = await apiClient.get('/streak');
    return response.data;
  },
  
  checkIn: async (): Promise<CheckInResult> => {
    const response = await apiClient.post('/check-in');
    return response.data;
  },

  getAchievements: async (): Promise<{ achievements: Achievement[] }> => {
    const response = await apiClient.get('/achievements');
    return response.data;
  },
  
  getQuests: async (): Promise<{ quests: Quest[] }> => {
    const response = await apiClient.get('/quests');
    return response.data;
  },
  
  getLeaderboard: async (type: LeaderboardType, period: LeaderboardPeriod): Promise<LeaderboardResponse> => {
    const response = await apiClient.get('/leaderboard', { params: { type, period } });
    return response.data;
  }
};
