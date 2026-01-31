import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationClient } from '../lib/api/gamificationClient';
import type { Quest } from '../lib/api/gamificationClient';
import { useState } from 'react';

/**
 * Hook for quest system functionality
 */
export function useQuests(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get available quests
  const { data: availableQuests, isLoading: isLoadingAvailable } = useQuery({
    queryKey: ['quests', 'available', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await gamificationClient.getAvailableQuests(userId) as { quests?: Quest[] };
      return (response?.quests || []) as Quest[];
    },
    enabled: !!userId
  });

  // Get user's quests
  const { data: userQuests, isLoading: isLoadingMine } = useQuery({
    queryKey: ['quests', 'mine', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await gamificationClient.getUserQuests(userId) as { quests?: Quest[] };
      return (response?.quests || []) as Quest[];
    },
    enabled: !!userId
  });

  // Claim quest reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (questId: string) => {
      if (!userId) throw new Error('User ID is required');
      return await gamificationClient.claimQuestReward(userId, questId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to claim reward');
    }
  });

  // Computed values
  const activeQuests = userQuests?.filter(q => !q.isCompleted) || [];
  const completedQuests = userQuests?.filter(q => q.isCompleted && !q.rewardClaimed) || [];
  const dailyQuests = availableQuests?.filter(q => q.type === 'daily') || [];
  const weeklyQuests = availableQuests?.filter(q => q.type === 'weekly') || [];
  const monthlyQuests = availableQuests?.filter(q => q.type === 'monthly') || [];

  return {
    // Data
    availableQuests,
    userQuests,
    activeQuests,
    completedQuests,
    dailyQuests,
    weeklyQuests,
    monthlyQuests,
    error,

    // Loading states
    isLoading: isLoadingAvailable || isLoadingMine,

    // Actions
    claimReward: claimRewardMutation.mutate,
    isClaiming: claimRewardMutation.isPending,

    // Helpers
    getQuestProgress: (questId: string) => {
      const quest = userQuests?.find(q => q.id === questId);
      return quest ? (quest.progress / quest.target) * 100 : 0;
    }
  };
}

export default useQuests;
