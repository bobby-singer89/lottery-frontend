import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { Quest, UserQuest } from '../types/gamification';
import { useState } from 'react';

/**
 * Hook for quests with filtered quest lists and claim functionality
 */
export function useQuests(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get all available quests
  const { data: allQuestsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['gamification', 'quests', 'all'],
    queryFn: async () => {
      const response = await gamificationApi.getQuests();
      return response;
    },
  });

  // Get user's quests
  const { data: myQuestsData, isLoading: isLoadingMine } = useQuery({
    queryKey: ['gamification', 'quests', 'mine', userId],
    queryFn: async () => {
      const response = await gamificationApi.getMyQuests();
      return response;
    },
    enabled: !!userId
  });

  const allQuests = allQuestsData?.quests || [];
  const myQuests = myQuestsData?.quests || [];

  // Claim quest reward mutation
  const claimQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await gamificationApi.claimQuest(questId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'quests'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'rewards'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to claim quest reward');
    }
  });

  // Filtered quest lists
  const dailyQuests = myQuests.filter(q => q.quest.type === 'daily');
  const weeklyQuests = myQuests.filter(q => q.quest.type === 'weekly');
  const monthlyQuests = myQuests.filter(q => q.quest.type === 'monthly');
  const onetimeQuests = myQuests.filter(q => q.quest.type === 'onetime');

  // Claimable quests (completed but not claimed)
  const claimableQuests = myQuests.filter(q => q.completed && !q.claimed);

  return {
    // Data
    allQuests,
    myQuests,
    dailyQuests,
    weeklyQuests,
    monthlyQuests,
    onetimeQuests,
    claimableQuests,
    error,

    // Loading states
    isLoading: isLoadingAll || isLoadingMine,

    // Actions
    claimQuest: claimQuestMutation.mutate,
    isClaiming: claimQuestMutation.isPending,
  };
}

export default useQuests;
