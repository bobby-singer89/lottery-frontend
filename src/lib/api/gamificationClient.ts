import { client } from './client';

/**
 * Gamification API Client
 * Provides methods to interact with gamification endpoints
 */

export interface UserProfile {
  userId: string;
  level: number;
  xp: number;
  totalTickets: number;
  totalWinnings: number;
  nextLevelXp: number;
}

export interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  claimedRewards: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
  totalCheckIns: number;
  streakBonus: number;
  canCheckIn: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  reward: { type: string; value: number };
  rewardClaimed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  icon?: string;
  reward: { type: string; value: number };
  unlockedAt?: Date;
  rewardClaimed?: boolean;
}

export interface Reward {
  id: string;
  type: string;
  name: string;
  description?: string;
  value: number;
  currency?: string;
  claimed: boolean;
  expiresAt?: Date;
}

// Helper to add userId to request
const withUserId = (userId: string) => ({
  headers: {
    'x-user-id': userId
  }
});

export const gamificationClient = {
  // Profile
  async getProfile(userId: string) {
    const response = await client.get('/gamification/profile', withUserId(userId));
    return response.data;
  },

  async getLeaderboard(type: 'level' | 'xp' | 'tickets' | 'winnings' = 'level', limit: number = 10, userId?: string) {
    const response = await client.get(`/gamification/leaderboard?type=${type}&limit=${limit}`, 
      userId ? withUserId(userId) : {}
    );
    return response.data;
  },

  // Referral
  async getReferralCode(userId: string) {
    const response = await client.get('/gamification/referral/code', withUserId(userId));
    return response.data;
  },

  async applyReferralCode(userId: string, code: string) {
    const response = await client.post('/gamification/referral/apply', { code }, withUserId(userId));
    return response.data;
  },

  async getReferralStats(userId: string) {
    const response = await client.get('/gamification/referral/stats', withUserId(userId));
    return response.data;
  },

  async getReferralTree(userId: string, maxDepth: number = 3) {
    const response = await client.get(`/gamification/referral/tree?maxDepth=${maxDepth}`, withUserId(userId));
    return response.data;
  },

  // Quests
  async getAvailableQuests(userId: string, type?: string) {
    const url = type ? `/gamification/quests/available?type=${type}` : '/gamification/quests/available';
    const response = await client.get(url, withUserId(userId));
    return response.data;
  },

  async getUserQuests(userId: string) {
    const response = await client.get('/gamification/quests/mine', withUserId(userId));
    return response.data;
  },

  async claimQuestReward(userId: string, questId: string) {
    const response = await client.post(`/gamification/quests/${questId}/claim`, {}, withUserId(userId));
    return response.data;
  },

  // Achievements
  async getAllAchievements(userId?: string) {
    const response = await client.get('/gamification/achievements/all', 
      userId ? withUserId(userId) : {}
    );
    return response.data;
  },

  async getUserAchievements(userId: string) {
    const response = await client.get('/gamification/achievements/mine', withUserId(userId));
    return response.data;
  },

  async claimAchievementReward(userId: string, achievementId: string) {
    const response = await client.post(`/gamification/achievements/${achievementId}/claim`, {}, withUserId(userId));
    return response.data;
  },

  async checkAchievements(userId: string) {
    const response = await client.post('/gamification/achievements/check', {}, withUserId(userId));
    return response.data;
  },

  // Streak
  async getCurrentStreak(userId: string) {
    const response = await client.get('/gamification/streak/current', withUserId(userId));
    return response.data;
  },

  async checkIn(userId: string) {
    const response = await client.post('/gamification/streak/checkin', {}, withUserId(userId));
    return response.data;
  },

  // Rewards
  async getAvailableRewards(userId: string) {
    const response = await client.get('/gamification/rewards/available', withUserId(userId));
    return response.data;
  },

  async getClaimedRewards(userId: string, limit: number = 20) {
    const response = await client.get(`/gamification/rewards/claimed?limit=${limit}`, withUserId(userId));
    return response.data;
  },

  async claimReward(userId: string, rewardId: string) {
    const response = await client.post(`/gamification/rewards/${rewardId}/claim`, {}, withUserId(userId));
    return response.data;
  }
};

export default gamificationClient;
