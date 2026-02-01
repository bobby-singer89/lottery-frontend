import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { Achievement, UserAchievement, AchievementProgress, AchievementCategory } from '../types/gamification';
import { useState } from 'react';

/**
 * Hook for achievements with progress tracking and filtering by category
 */
export function useAchievements(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all achievements
  const { data: allAchievementsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['gamification', 'achievements', 'all'],
    queryFn: async () => {
      const response = await gamificationApi.getAchievements();
      return response;
    }
  });

  // Get user's unlocked achievements
  const { data: myAchievementsData, isLoading: isLoadingMine } = useQuery({
    queryKey: ['gamification', 'achievements', 'mine', userId],
    queryFn: async () => {
      const response = await gamificationApi.getMyAchievements();
      return response;
    },
    enabled: !!userId
  });

  // Get achievement progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['gamification', 'achievements', 'progress', userId],
    queryFn: async () => {
      const response = await gamificationApi.getAchievementProgress();
      return response;
    },
    enabled: !!userId
  });

  const allAchievements = allAchievementsData?.achievements || [];
  const myAchievements = myAchievementsData?.achievements || [];
  const progress = progressData?.progress || [];

  // Claim achievement reward mutation
  const claimAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await gamificationApi.claimAchievement(achievementId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'rewards'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to claim achievement reward');
    }
  });

  // Filter by category
  const getByCategory = (category: AchievementCategory) => {
    return progress.filter(p => p.achievement.category === category);
  };

  const ticketsAchievements = getByCategory('tickets');
  const winsAchievements = getByCategory('wins');
  const streakAchievements = getByCategory('streak');
  const referralsAchievements = getByCategory('referrals');
  const levelAchievements = getByCategory('level');

  return {
    // Data
    allAchievements,
    myAchievements,
    progress,
    error,

    // Filtered by category
    ticketsAchievements,
    winsAchievements,
    streakAchievements,
    referralsAchievements,
    levelAchievements,

    // Loading states
    isLoading: isLoadingAll || isLoadingMine || isLoadingProgress,

    // Actions
    claimAchievement: claimAchievementMutation.mutate,
    isClaiming: claimAchievementMutation.isPending,
  };
}

export default useAchievements;
