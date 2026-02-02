import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';

/**
 * Main hook for gamification profile data with level, xp, progress calculation
 */
export function useGamification(userId?: string) {
  // Get complete gamification profile
  const { data: profileData, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ['gamification', 'profile', userId],
    queryFn: async () => {
      const response = await gamificationApi.getProfile();
      return response;
    },
    enabled: !!userId
  });

  const profile = profileData?.profile || null;

  // Computed values
  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const xpToNextLevel = profile?.xpToNextLevel || 100;
  const totalXp = profile?.totalXp || 0;
  const progress = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  return {
    // Profile data
    profile,
    level,
    xp,
    xpToNextLevel,
    totalXp,
    progress,

    // VIP status
    vipStatus: profile?.vipStatus || 'none',

    // Stats
    totalTickets: profile?.totalTickets || 0,
    totalWins: profile?.totalWins || 0,
    totalWinnings: profile?.totalWinnings || 0,

    // Loading states
    isLoading: isLoadingProfile,
    error: error as Error | null,
  };
}

export default useGamification;
