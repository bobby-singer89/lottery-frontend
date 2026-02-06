import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { AchievementProgress } from '../types/gamification';

// ... (остальной код)

export function useAchievements(userId?: string) {
  const queryClient = useQueryClient();

  // Get all achievements with user's progress
  const { data: achievementsData, isLoading: isLoadingAchievements, error: achievementsError } = useQuery({
    queryKey: ['gamification', 'achievements', userId],
    // ИСПРАВЛЕНИЕ: Используем правильное имя
    queryFn: gamificationApi.getAchievements,
    enabled: !!userId,
  });

  const achievements = achievementsData?.achievements || [];

  // Get specific achievement progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['gamification', 'achievementProgress', userId],
    // ИСПРАВЛЕНИЕ: Передаем аргумент, которого не хватало
    queryFn: () => gamificationApi.getAchievementProgress('some-default-id'), // Вам нужно будет решить, какой ID здесь использовать
    enabled: false, // Пока отключаем, так как логика не ясна
  });

  const achievementProgress = progressData?.progress || [];

  // Claim achievement mutation
  const { mutate: claimAchievement, isPending: isClaiming } = useMutation({
    mutationFn: (achievementId: string) => gamificationApi.claimAchievement(achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'achievements', userId] });
    },
  });

  // ИСПРАВЛЕНИЕ: Безопасный доступ и явный тип
  const unlockedAchievements = achievements.filter(p => p.unlockedAt);
  const lockedAchievements = achievements.filter(p => !p.unlockedAt);

  return {
    allAchievements: achievements,
    unlockedAchievements,
    lockedAchievements,
    achievementProgress,
    isLoading: isLoadingAchievements || isLoadingProgress,
    isClaiming,
    error: achievementsError,
    claimAchievement,
  };
}
