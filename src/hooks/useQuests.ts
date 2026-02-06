import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { UserQuest } from '../types/gamification';

// ... (остальной код хука)

export function useQuests(userId?: string) {
  const queryClient = useQueryClient();

  // Get user's quests
  const { data: questsData, isLoading: isLoadingQuests, error: questsError } = useQuery({
    queryKey: ['gamification', 'quests', userId],
    // ИСПРАВЛЕНИЕ: Используем правильное имя функции
    queryFn: gamificationApi.getQuests,
    enabled: !!userId
  });

  const quests = questsData?.quests || [];

  // Claim quest mutation
  const { mutate: claimQuest, isPending: isClaiming } = useMutation({
    mutationFn: (questId: string) => gamificationApi.claimQuest(questId),
    onSuccess: () => {
      // Invalidate quests query to refetch data
      queryClient.invalidateQueries({ queryKey: ['gamification', 'quests', userId] });
      // Можно добавить и другие инвалидации, например, баланс пользователя
    }
  });
  
  // ИСПРАВЛЕНИЕ: Добавляем явные типы и безопасный доступ к данным
  const dailyQuests = quests.filter((q: UserQuest) => q.quest.type === 'daily');
  const specialQuests = quests.filter((q: UserQuest) => q.quest.type === 'special');
  const onetimeQuests = quests.filter((q: UserQuest) => q.quest.type === 'onetime');

  const completedCount = quests.filter((q: UserQuest) => q.completed && !q.claimed).length;

  return {
    // Data
    allQuests: quests,
    dailyQuests,
    specialQuests,
    onetimeQuests,
    completedCount,

    // Loading states
    isLoading: isLoadingQuests,
    isClaiming,
    error: questsError,
    
    // Actions
    claimQuest,
  };
}
