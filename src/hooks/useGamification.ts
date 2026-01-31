import { useQuery } from '@tanstack/react-query';
import { gamificationClient } from '../lib/api/gamificationClient';
import type { UserProfile } from '../lib/api/gamificationClient';

/**
 * Main hook for gamification profile and leaderboard
 */
export function useGamification(userId?: string) {
  // Get complete gamification profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['gamification', 'profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await gamificationClient.getProfile(userId) as { profile?: UserProfile };
      return response?.profile || null;
    },
    enabled: !!userId
  });

  // Get leaderboard
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['gamification', 'leaderboard'],
    queryFn: async () => {
      const response = await gamificationClient.getLeaderboard('level', 10, userId) as { leaderboard?: unknown[] };
      return response?.leaderboard || [];
    }
  });

  // Computed values
  const userLevel = profile?.level || 1;
  const userXp = profile?.xp || 0;
  const nextLevelXp = profile?.nextLevelXp || 100;
  const levelProgress = (userXp / nextLevelXp) * 100;

  return {
    // Profile data
    profile,
    userLevel,
    userXp,
    nextLevelXp,
    levelProgress,

    // Leaderboard
    leaderboard,

    // Loading states
    isLoading: isLoadingProfile || isLoadingLeaderboard,
    isLoadingProfile,
    isLoadingLeaderboard
  };
}

export default useGamification;
