/**
 * Hook for fetching the list of all lotteries
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, type Lottery } from '../lib/api/client';

interface LotteriesResponse {
  success: boolean;
  lotteries: Lottery[];
}

export function useLotteries() {
  return useQuery<LotteriesResponse>({
    queryKey: ['lotteries'],
    queryFn: async () => {
      const response = await apiClient.getLotteryList();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export type { Lottery };
