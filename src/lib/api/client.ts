import { getApiBaseUrl } from '../utils/env';
import type { PurchasedTicket } from '../../services/ticketApi';

const API_BASE_URL = getApiBaseUrl();

interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface Lottery {
  id: string;
  slug: string;
  name: string;
  currency: string;
  ticketPrice: number;
  jackpot: number;
  featured: boolean;
}

export interface Draw {
  id: string;
  lotteryId: string;
  drawNumber: number;
  scheduledAt: string;
  status: string;
  ticketSalesOpen: boolean;
  ticketSalesClosedAt?: string;
  dataFinalized?: boolean;
  dataFinalizedAt?: string;
  seedHash?: string;
  winningNumbers?: number[];
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async loginTelegram(telegramUser: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date?: number;
    hash?: string;
  }) {
    return this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({
        id: telegramUser.id.toString(),
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        auth_date: telegramUser.auth_date,
        hash: telegramUser.hash,
      }),
    });
  }

  async connectWallet(tonWallet: string, telegramData?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  }) {
    return this.request<{ success: boolean; user: any }>('/auth/connect-wallet', {
      method: 'POST',
      body: JSON.stringify({ tonWallet, ...telegramData }),
    });
  }

  // Lottery endpoints
  async getLotteryList() {
    return this.request<{
      success: boolean;
      lotteries: any[];
    }>('/lottery/list');
  }

  async getLotteryInfo(slug: string) {
    return this.request<{
      success: boolean;
      lottery: any;
      nextDraw: any;
    }>(`/lottery/${slug}/info`);
  }

  async buyTicket(slug: string, numbers: number[], txHash: string) {
    return this.request<{
      success: boolean;
      ticket: any;
    }>(`/lottery/${slug}/buy-ticket`, {
      method: 'POST',
      body: JSON.stringify({ numbers, txHash }),
    });
  }

  async getMyTickets(slug: string, page = 1, limit = 20) {
    return this.request<{
      success: boolean;
      tickets: PurchasedTicket[];
      pagination: PaginationResponse;
    }>(`/lottery/${slug}/my-tickets?page=${page}&limit=${limit}`);
  }

  async getAllMyTickets(lotterySlug?: string, page = 1, limit = 20) {
    const params = lotterySlug ? `?lotterySlug=${lotterySlug}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return this.request<{
      success: boolean;
      tickets: PurchasedTicket[];
      pagination: PaginationResponse;
    }>(`/tickets/my-tickets${params}`);
  }

  // Draws endpoints
  async getCurrentDraw() {
    return this.request<{
      success: boolean;
      draw: any;
    }>('/draws/current');
  }

  // User endpoints
  async getProfile() {
    return this.request<{
      success: boolean;
      user: any;
    }>('/user/profile');
  }

  async updateProfile(data: any) {
    return this.request<{
      success: boolean;
      user: any;
    }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Public endpoints
  async getLotteries(currency?: 'TON' | 'USDT') {
    try {
      const params = new URLSearchParams();
      if (currency) {
        params.append('currency', currency);
      }
      
      // Correct API URL with /api prefix
      const response = await fetch(
        `${this.baseURL}/api/public/lotteries?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.warn(`API returned ${response.status}, using mock data`);
        return this.getMockLotteries(currency);
      }
      
      const data = await response.json();
      
      // If API returns empty lotteries, use mock
      if (!data.lotteries || data.lotteries.length === 0) {
        console.warn('API returned empty lotteries, using mock data');
        return this.getMockLotteries(currency);
      }
      
      return data;
      
    } catch (error) {
      console.error('API error, using mock data:', error);
      return this.getMockLotteries(currency);
    }
  }

  async getExchangeRate(from: string, to: string): Promise<{ rate: number; success: boolean }> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/public/exchange-rates/${from}/${to}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        console.warn('Exchange rate API failed, using mock rate');
        return { rate: 5.2, success: true };
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Exchange rate error, using mock:', error);
      return { rate: 5.2, success: true };
    }
  }

  // Add mock data method
  private getMockLotteries(currency?: 'TON' | 'USDT') {
    console.log('🎲 Using mock lottery data');
    
    const allMockLotteries = [
      // TON Lotteries
      {
        id: 1,
        name: 'Mega Jackpot',
        slug: 'mega-jackpot',
        currency: 'TON',
        jackpot: 10000,
        ticketPrice: 10,
        maxTickets: 1234,
        soldTickets: 856,
        drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Largest TON jackpot - win up to 10,000 TON!',
        featured: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Weekend Special',
        slug: 'weekend-special',
        currency: 'TON',
        jackpot: 5075,
        ticketPrice: 5,
        maxTickets: 856,
        soldTickets: 432,
        drawDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Weekend lottery with guaranteed prizes',
        featured: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Daily Draw',
        slug: 'daily-draw',
        currency: 'TON',
        jackpot: 2000,
        ticketPrice: 2,
        maxTickets: 432,
        soldTickets: 189,
        drawDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        description: 'Quick daily lottery with instant results',
        featured: false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // USDT Lotteries
      {
        id: 4,
        name: 'USDT Mega Pool',
        slug: 'usdt-mega-pool',
        currency: 'USDT',
        jackpot: 52000,
        ticketPrice: 52,
        maxTickets: 800,
        soldTickets: 543,
        drawDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Massive USDT prize pool - stable and secure!',
        featured: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'USDT Weekend',
        slug: 'usdt-weekend',
        currency: 'USDT',
        jackpot: 26390,
        ticketPrice: 26,
        maxTickets: 650,
        soldTickets: 378,
        drawDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Weekend USDT lottery with guaranteed payouts',
        featured: true,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 6,
        name: 'USDT Quick Draw',
        slug: 'usdt-quick-draw',
        currency: 'USDT',
        jackpot: 10400,
        ticketPrice: 10,
        maxTickets: 520,
        soldTickets: 267,
        drawDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        description: 'Fast USDT lottery with instant results',
        featured: false,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Filter by currency if specified
    let filteredLotteries = allMockLotteries;
    if (currency) {
      filteredLotteries = allMockLotteries.filter(l => l.currency === currency);
    }

    return {
      success: true,
      lotteries: filteredLotteries,
      _isMock: true,
    };
  }

  // Swap endpoints
  async getSwapQuote(from: string, to: string, amount: number) {
    return this.request<{ success: boolean; quote: any }>(
      `/swap/quote?from=${from}&to=${to}&amount=${amount}`
    );
  }

  async buildSwapTransaction(params: {
    from: string;
    to: string;
    amount: number;
    userWallet: string;
    slippage?: number;
  }) {
    return this.request<{
      success: boolean;
      transaction: any;
      quote: any;
      minOutput: string;
      estimatedGas: string;
    }>('/swap/build-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  }

  async getSupportedTokens() {
    return this.request<{ success: boolean; tokens: any[] }>('/swap/tokens');
  }

  async getSwapRate(from: string, to: string) {
    return this.request<{ success: boolean; rate: number }>(
      `/swap/rate/${from}/${to}`
    );
  }

  async getCurrentDrawForLottery(lotterySlug: string) {
    return this.request<{ 
      success: boolean;
      draw: Draw | null
    }>(`/public/lottery/${lotterySlug}/current-draw`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
