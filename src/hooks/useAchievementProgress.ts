import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';

/**
 * Hook for fetching individual achievement progress
 * Used for tracking specific achievement progress in real-time
 */
export function useAchievementProgress(achievementId?: string) {
  return useQuery({
    queryKey: ['achievement-progress', achievementId],
    queryFn: async () => {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      
      // Get all progress and filter for specific achievement
      const response = await gamificationApi.getAchievementProgress();
      const progress = response.progress || [];
      
      // Find specific achievement progress
      const specificProgress = progress.find(
        p => p.achievement.id === achievementId || p.achievement.slug === achievementId
      );
      
      if (!specificProgress) {
        throw new Error('Achievement not found');
      }
      
      return specificProgress;
    },
    enabled: !!achievementId,
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for real-time updates
    refetchInterval: 60 * 1000, // Auto-refresh every minute when active
  });
}

export default useAchievementProgress;
