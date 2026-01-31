import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationClient } from '../lib/api/gamificationClient';
import { useEffect, useState } from 'react';

/**
 * Hook for referral system functionality
 */
export function useReferral(userId?: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get referral code
  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['referral', 'code', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await gamificationClient.getReferralCode(userId) as { code?: string };
      return response?.code || null;
    },
    enabled: !!userId
  });

  // Get referral stats
  const { data: referralStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['referral', 'stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await gamificationClient.getReferralStats(userId) as { stats?: any };
      return response?.stats || null;
    },
    enabled: !!userId
  });

  // Get referral tree
  const { data: referralTree, isLoading: isLoadingTree } = useQuery({
    queryKey: ['referral', 'tree', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await gamificationClient.getReferralTree(userId) as { tree?: any };
      return response?.tree || null;
    },
    enabled: !!userId
  });

  // Apply referral code mutation
  const applyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!userId) throw new Error('User ID is required');
      return await gamificationClient.applyReferralCode(userId, code);
    },
    onSuccess: () => {
      // Invalidate referral queries
      queryClient.invalidateQueries({ queryKey: ['referral'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || 'Failed to apply referral code');
    }
  });

  // Clear error when userId changes
  useEffect(() => {
    setError(null);
  }, [userId]);

  return {
    // Data
    referralCode,
    referralStats,
    referralTree,
    error,

    // Loading states
    isLoading: isLoadingCode || isLoadingStats,
    isLoadingTree,

    // Actions
    applyCode: applyCodeMutation.mutate,
    isApplying: applyCodeMutation.isPending,

    // Helpers
    getReferralLink: (baseUrl?: string) => {
      if (!referralCode) return null;
      const base = baseUrl || window.location.origin;
      return `${base}?ref=${referralCode}`;
    }
  };
}

export default useReferral;
