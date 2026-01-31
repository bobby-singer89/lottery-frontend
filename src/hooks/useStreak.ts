import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationClient } from '../lib/api/gamificationClient';
import type { StreakInfo } from '../lib/api/gamificationClient';
import { useState } from 'react';

/**
 * Hook for streak system functionality
 */
export function useStreak(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get current streak
  const { data: streak, isLoading } = useQuery({
    queryKey: ['streak', 'current', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await gamificationClient.getCurrentStreak(userId) as { streak?: StreakInfo };
      return (response?.streak || null) as StreakInfo | null;
    },
    enabled: !!userId,
    refetchInterval: 60000 // Refetch every minute to update canCheckIn status
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return await gamificationClient.checkIn(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to check in');
    }
  });

  // Computed values
  const canCheckIn = streak?.canCheckIn || false;
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalCheckIns = streak?.totalCheckIns || 0;

  // Helper to calculate next milestone
  const getNextMilestone = () => {
    const milestones = [3, 7, 14, 30, 100];
    return milestones.find(m => m > currentStreak) || null;
  };

  // Helper to calculate progress to next milestone
  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    if (!nextMilestone) return 100;
    return (currentStreak / nextMilestone) * 100;
  };

  return {
    // Data
    streak,
    currentStreak,
    longestStreak,
    totalCheckIns,
    canCheckIn,
    error,

    // Loading states
    isLoading,

    // Actions
    checkIn: checkInMutation.mutate,
    isCheckingIn: checkInMutation.isPending,

    // Helpers
    getNextMilestone,
    getMilestoneProgress,
    isOnStreak: currentStreak > 0
  };
}

export default useStreak;
