/**
 * Hook for fetching the list of all lotteries
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';

export interface Lottery {
  id: string;
  slug: string;
  name: string;
  description?: string;
  active: boolean;
  prizePool: number;
  ticketPrice: number;
  drawDate: string;
  participants: number;
  currency: 'TON' | 'USDT';
  featured?: boolean;
}

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
