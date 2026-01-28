import { apiClient } from './client';

export interface BuyTicketRequest {
  selectedNumbers: number[];
  txHash: string;
  walletAddress: string;
}

export interface Ticket {
  id: string;
  numbers: number[];
  purchasedAt: string;
  status: 'active' | 'won' | 'lost' | 'pending';
  drawId?: string;
  drawDate?: string;
  prizeAmount?: number;
  ticketNumber?: string;
}

export interface LotteryInfo {
  id: string;
  slug: string;
  name: string;
  description?: string;
  numbersToSelect: number;
  numbersPool: number;
  ticketPrice: number;
  lotteryWallet: string;
  currentJackpot: number;
  prizeStructure: Record<string, number | string>;
  isActive: boolean;
}

export interface NextDraw {
  id: string;
  scheduledAt: string;
  status: string;
}

class LotteryClient {
  /**
   * Buy a lottery ticket
   */
  async buyTicket(slug: string, request: BuyTicketRequest): Promise<Ticket> {
    const response = await apiClient.buyTicket(
      slug,
      request.selectedNumbers,
      request.txHash
    );
    return response.ticket;
  }

  /**
   * Get user's tickets for a lottery
   */
  async getMyTickets(slug: string, page = 1, limit = 20): Promise<{ tickets: Ticket[]; pagination: any }> {
    const response = await apiClient.getMyTickets(slug, page, limit);
    return {
      tickets: response.tickets,
      pagination: response.pagination
    };
  }

  /**
   * Get lottery information
   */
  async getLotteryInfo(slug: string): Promise<{ lottery: LotteryInfo; nextDraw: NextDraw }> {
    const response = await apiClient.getLotteryInfo(slug);
    return {
      lottery: response.lottery,
      nextDraw: response.nextDraw
    };
  }
}

export const lotteryClient = new LotteryClient();
