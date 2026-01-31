import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationClient } from '../lib/api/gamificationClient';
import type { Achievement } from '../lib/api/gamificationClient';
import { useState } from 'react';

/**
 * Hook for achievement system functionality
 */
export function useAchievements(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all achievements
  const { data: allAchievements, isLoading: isLoadingAll } = useQuery({
    queryKey: ['achievements', 'all'],
    queryFn: async () => {
      const response = await gamificationClient.getAllAchievements(userId) as { achievements?: Achievement[] };
      return (response?.achievements || []) as Achievement[];
    }
  });

  // Get user's achievements
  const { data: userAchievements, isLoading: isLoadingMine } = useQuery({
    queryKey: ['achievements', 'mine', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await gamificationClient.getUserAchievements(userId) as { achievements?: Achievement[] };
      return (response?.achievements || []) as Achievement[];
    },
    enabled: !!userId
  });

  // Claim achievement reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!userId) throw new Error('User ID is required');
      return await gamificationClient.claimAchievementReward(userId, achievementId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to claim reward');
    }
  });

  // Check achievements mutation
  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await gamificationClient.checkAchievements(userId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      const responseData = data as { newlyUnlocked?: Achievement[] };
      if (responseData?.newlyUnlocked && responseData.newlyUnlocked.length > 0) {
        // You could show a notification here
        console.log('🎉 New achievements unlocked:', responseData.newlyUnlocked);
      }
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to check achievements');
    }
  });

  // Computed values
  const unlockedAchievements = userAchievements || [];
  const unclaimedRewards = unlockedAchievements.filter(a => !a.rewardClaimed).length;
  const achievementsByCategory = allAchievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>) || {};

  return {
    // Data
    allAchievements,
    userAchievements,
    unlockedAchievements,
    achievementsByCategory,
    unclaimedRewards,
    error,

    // Loading states
    isLoading: isLoadingAll || isLoadingMine,

    // Actions
    claimReward: claimRewardMutation.mutate,
    isClaiming: claimRewardMutation.isPending,
    checkAchievements: checkAchievementsMutation.mutate,
    isChecking: checkAchievementsMutation.isPending,

    // Helpers
    isUnlocked: (achievementId: string) => {
      return unlockedAchievements.some(a => a.id === achievementId);
    },
    getProgress: (achievementName: string) => {
      const achievement = unlockedAchievements.find(a => a.name === achievementName);
      return achievement ? 100 : 0; // Binary: unlocked or not
    }
  };
}

export default useAchievements;
