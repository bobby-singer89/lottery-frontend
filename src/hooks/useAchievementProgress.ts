import { useQuery } from '@tanstack/react-query';
import { useAchievements } from './useAchievements';

/**
 * Hook for fetching individual achievement progress
 * Leverages shared achievements data to avoid redundant API calls
 * 
 * @param achievementId - Achievement ID or slug to track
 * @param userId - Optional user ID for fetching achievements
 */
export function useAchievementProgress(achievementId?: string, userId?: string) {
  // Use the shared achievements hook to avoid redundant API calls
  const { progress, isLoading: isLoadingAll } = useAchievements(userId);
  
  return useQuery({
    queryKey: ['achievement-progress', achievementId],
    queryFn: () => {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      
      // Find specific achievement progress from shared data
      const specificProgress = progress.find(
        p => p.achievement.id === achievementId || p.achievement.slug === achievementId
      );
      
      if (!specificProgress) {
        throw new Error('Achievement not found');
      }
      
      return specificProgress;
    },
    enabled: !!achievementId && !isLoadingAll && progress.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - align with main achievements hook
    refetchOnWindowFocus: true, // Refresh when user returns to page
    // Since this uses data from useAchievements, it will automatically update
    // when the parent query updates
  });
}

export default useAchievementProgress;
