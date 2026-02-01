import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '../services/gamificationApi';
import type { StreakInfo, CheckInResult } from '../types/gamification';
import { useState } from 'react';

/**
 * Hook for streak data and check-in functionality
 */
export function useStreak(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);

  // Get current streak
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['gamification', 'streak', userId],
    queryFn: async () => {
      const response = await gamificationApi.getStreak();
      return response;
    },
    enabled: !!userId,
    refetchInterval: 60000 // Refetch every minute to update canCheckIn status
  });

  const streak = streakData?.streak || null;

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await gamificationApi.checkIn();
      return response;
    },
    onSuccess: (data) => {
      // Store check-in result for UI feedback
      setCheckInResult(data.result);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['gamification', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['gamification', 'quests'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to check in');
      setCheckInResult(null);
    }
  });

  // Computed values
  const canCheckIn = streak?.canCheckIn || false;
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalCheckIns = streak?.totalCheckIns || 0;
  const lastCheckIn = streak?.lastCheckIn || null;
  const nextMilestone = streak?.nextMilestone || null;

  return {
    // Data
    streak,
    currentStreak,
    longestStreak,
    totalCheckIns,
    lastCheckIn,
    nextMilestone,
    canCheckIn,
    error,
    checkInResult,

    // Loading states
    isLoading,

    // Actions
    checkIn: checkInMutation.mutate,
    isCheckingIn: checkInMutation.isPending,
    
    // Helper to clear check-in result
    clearCheckInResult: () => setCheckInResult(null),
  };
}

export default useStreak;
