import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { Achievement } from '../types/gamification';

export function useAchievements(userId?: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: gamificationApi.getMyAchievements,
    enabled: !!userId,
  });

  const { mutate: claimAchievement, isPending: isClaiming } = useMutation({
    mutationFn: (achievementId: string) => gamificationApi.claimAchievement(achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  const achievements = data?.achievements || [];

  // ИСПРАВЛЕНО: Теперь это будет работать, так как unlockedAt есть в типе
  const unlockedAchievements = achievements.filter((a: Achievement) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a: Achievement) => !a.unlockedAt);

  return {
    allAchievements: achievements,
    unlockedAchievements,
    lockedAchievements,
    isLoading,
    isClaiming,
    error: error as Error | null,
    claimAchievement,
  };
}
