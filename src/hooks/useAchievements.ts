import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { Achievement } from '../types/gamification';

export function useAchievements() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getMyAchievements(),
  });

  const { mutate: claimAchievement, isPending: isClaiming } = useMutation({
    mutationFn: (achievementId: string) => gamificationApi.claimAchievement(achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['gamificationProfile'] });
    },
  });

  // Добавляем проверку на data.achievements
  const achievements = data?.achievements || [];

  // ИСПРАВЛЕНИЕ: Добавляем unlockedAt к типу Achievement, т.к. API его возвращ��ет
  const unlockedAchievements = achievements.filter((a: Achievement & { unlockedAt: string | null }) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a: Achievement & { unlockedAt: string | null }) => !a.unlockedAt);

  return {
    allAchievements: achievements,
    unlockedAchievements,
    lockedAchievements,
    // ИСПРАВЛЕНИЕ: Возвращаем achievementProgress как пустой массив-заглушку. 
    // Его логика была в другом хуке.
    achievementProgress: [], 
    isLoading,
    isClaiming,
    error: error as Error | null,
    claimAchievement,
  };
}
