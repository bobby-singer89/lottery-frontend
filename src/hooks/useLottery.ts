/**
 * Hook for fetching a single lottery's details
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';

export interface LotteryDetails {
  id: string;
  slug: string;
  name: string;
  description?: string;
  rules?: string;
  numbersToSelect: number;
  numbersPool: number;
  ticketPrice: number;
  currentJackpot: number;
  prizeStructure: Record<string, number | string>;
  isActive: boolean;
  currency: 'TON' | 'USDT';
  lotteryWallet: string;
}

export interface NextDraw {
  id: string;
  scheduledAt: string;
  status: string;
  drawNumber?: number;
}

interface LotteryResponse {
  success: boolean;
  lottery: LotteryDetails;
  nextDraw: NextDraw;
}

export function useLottery(slug: string) {
  return useQuery<LotteryResponse>({
    queryKey: ['lottery', slug],
    queryFn: async () => {
      const response = await apiClient.getLotteryInfo(slug);
      return response;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}
