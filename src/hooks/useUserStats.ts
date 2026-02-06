/**
 * Hook for fetching user statistics
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';

export interface UserStats {
  userId: string;
  totalTicketsBought: number;
  totalSpent: {
    ton: number;
    usdt: number;
  };
  totalWins: number;
  totalWinnings: {
    ton: number;
    usdt: number;
  };
  currentBalance: {
    ton: number;
    usdt: number;
  };
  winRate: number;
  favoriteNumbers: number[];
  memberSince: string;
  lastActivity: string;
  currentStreak: number;
  bestStreak: number;
}

interface UserStatsResponse {
  success: boolean;
  stats: UserStats;
}

export function useUserStats() {
  return useQuery<UserStatsResponse>({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const response = await apiClient.getUserStats();
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}
