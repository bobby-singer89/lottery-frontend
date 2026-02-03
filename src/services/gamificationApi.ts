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

const API_URL = import.meta.env.VITE_API_URL || 'https://lottery-backend-gm4j.onrender.com/api';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const userId = localStorage.getItem('user_id');
  // Also try to get telegramId if user_id is not set
  const telegramId = localStorage.getItem('telegram_id');
  const userIdentifier = userId || telegramId;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(userIdentifier && { 'x-user-id': userIdentifier }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export const gamificationApi = {
  // Profile
  getProfile: () => fetchWithAuth<{ success: boolean; profile: GamificationProfile }>('/gamification/profile'),

  // Streak
  getStreak: () => fetchWithAuth<{ success: boolean; streak: StreakInfo }>('/gamification/streak'),
  checkIn: () => fetchWithAuth<{ success: boolean; result: CheckInResult }>('/gamification/check-in', { method: 'POST' }),

  // Quests - Backend returns user's quests with progress from /quests
  getQuests: () => fetchWithAuth<{ success: boolean; quests: Quest[] }>('/gamification/quests'),
  getMyQuests: () => fetchWithAuth<{ success: boolean; quests: UserQuest[] }>('/gamification/quests'),
  claimQuest: (questId: string) => fetchWithAuth<{ success: boolean; reward: UserReward }>(`/gamification/quests/${questId}/claim`, { method: 'POST' }),

  // Achievements - Backend returns user's achievements from /achievements
  getAchievements: () => fetchWithAuth<{ success: boolean; achievements: Achievement[] }>('/gamification/achievements'),
  getMyAchievements: () => fetchWithAuth<{ success: boolean; achievements: UserAchievement[] }>('/gamification/achievements'),
  getAchievementProgress: () => fetchWithAuth<{ success: boolean; progress: AchievementProgress[] }>('/gamification/achievements'),
  claimAchievement: (id: string) => fetchWithAuth<{ success: boolean; reward: UserReward }>(`/gamification/achievements/${id}/claim`, { method: 'POST' }),

  // Rewards
  getRewards: () => fetchWithAuth<{ success: boolean; rewards: UserReward[] }>('/gamification/rewards'),
  claimReward: (id: string) => fetchWithAuth<{ success: boolean }>(`/gamification/rewards/${id}/claim`, { method: 'POST' }),

  // Referrals
  getReferralStats: () => fetchWithAuth<{ success: boolean; stats: ReferralStats }>('/gamification/referral'),
  getReferrals: () => fetchWithAuth<{ success: boolean; referrals: ReferralUser[] }>('/gamification/referral'),
  applyReferralCode: (code: string) => fetchWithAuth<{ success: boolean }>('/gamification/referral/apply', { method: 'POST', body: JSON.stringify({ code }) }),

  // Leaderboard
  getLeaderboard: (type: LeaderboardType = 'level', period: LeaderboardPeriod = 'all', limit = 100) =>
    fetchWithAuth<{ success: boolean; leaderboard: LeaderboardResponse }>(`/gamification/leaderboard?type=${type}&period=${period}&limit=${limit}`),
  
  // Mine (summary)
  getMine: () => fetchWithAuth<{ success: boolean; data: any }>('/gamification/mine'),
  
  // Progress
  getProgress: () => fetchWithAuth<{ success: boolean; data: any }>('/gamification/progress'),
};
