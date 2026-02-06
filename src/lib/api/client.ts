import { getApiBaseUrl } from '../utils/env';
import type { PurchasedTicket } from '../../services/ticketApi';
import { parseApiError } from './errors';
import { TokenManager } from '../auth/token';
import type { User } from '../../types/auth';

const API_BASE_URL = getApiBaseUrl();
const DEFAULT_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

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
  private timeout: number = DEFAULT_TIMEOUT;
  private user: User | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Initialize token from TokenManager
    this.token = TokenManager.getToken();
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser) as User;
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.token = token;
    TokenManager.setToken(token);
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return this.token || TokenManager.getToken();
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.token = null;
    this.user = null;
    TokenManager.clearAll();
    localStorage.removeItem('auth_user');
  }

  /**
   * Set current user
   */
  setUser(user: User): void {
    this.user = user;
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Legacy method name - kept for backward compatibility
   */
  setToken(token: string) {
    this.setAuthToken(token);
  }

  clearToken() {
    this.clearAuthToken();
  }

  /**
   * Make authenticated API request with timeout and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      };

      // Add x-user-id for gamification endpoints
      if (endpoint.includes('/gamification')) {
        const user = this.getCurrentUser();
        if (user?.id) {
          headers['x-user-id'] = user.id.toString();
        }
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = parseApiError(errorData, response.status);
        throw error;
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw parseApiError(new Error('Request timeout'), 408);
      }
      
      throw parseApiError(error);
    }
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
    const requestBody = {
      id: telegramUser.id.toString(),
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      photo_url: telegramUser.photo_url,
      auth_date: telegramUser.auth_date,
      hash: telegramUser.hash,
    };
    
    const response = await this.request<{
      success: boolean;
      token: string;
      user: any;
    }>('/api/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // Store user for future API calls
    if (response.success && response.user) {
      this.setUser(response.user);
    }
    
    return response;
  }

  async connectWallet(tonWallet: string, telegramData?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  }) {
    const response = await this.request<{ success: boolean; user: any }>('/api/auth/connect-wallet', {
      method: 'POST',
      body: JSON.stringify({ tonWallet, ...telegramData }),
    });
    
    // Store user for future API calls
    if (response.success && response.user) {
      this.setUser(response.user);
    }
    
    return response;
  }

  // Lottery endpoints
  async getLotteryList() {
    return this.request<{
      success: boolean;
      lotteries: any[];
    }>('/api/lottery/list');
  }

  async getLotteryInfo(slug: string) {
    return this.request<{
      success: boolean;
      lottery: any;
      nextDraw: any;
    }>(`/api/lottery/${slug}/info`);
  }

  async buyTicket(slug: string, numbers: number[], txHash: string) {
    return this.request<{
      success: boolean;
      ticket: any;
    }>(`/api/lottery/${slug}/buy-ticket`, {
      method: 'POST',
      body: JSON.stringify({ numbers, txHash }),
    });
  }

  async getMyTickets(slug: string, page = 1, limit = 20) {
    return this.request<{
      success: boolean;
      tickets: PurchasedTicket[];
      pagination: PaginationResponse;
    }>(`/api/lottery/${slug}/my-tickets?page=${page}&limit=${limit}`);
  }

  async getAllMyTickets(lotterySlug?: string, page = 1, limit = 20) {
    const params = lotterySlug ? `?lotterySlug=${lotterySlug}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return this.request<{
      success: boolean;
      tickets: PurchasedTicket[];
      pagination: PaginationResponse;
    }>(`/api/tickets/my-tickets${params}`);
  }

  // Draws endpoints
  async getCurrentDraw() {
    return this.request<{
      success: boolean;
      draw: any;
    }>('/api/draws/current');
  }

  // User endpoints
  async getProfile() {
    const response = await this.request<{
      success: boolean;
      user: any;
    }>('/api/user/profile');
    
    // Store user for future API calls
    if (response.success && response.user) {
      this.setUser(response.user);
    }
    
    return response;
  }

  async updateProfile(data: any) {
    return this.request<{
      success: boolean;
      user: any;
    }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request<{
      success: boolean;
      stats: {
        userId: string;
        totalTicketsBought: number;
        totalSpent: {
          ton: number;
          usdt: number;
        };
        totalWins: number;
        totalWinnings: {
          ton: number;
          usdt: number;
        };
        currentBalance: {
          ton: number;
          usdt: number;
        };
        winRate: number;
        favoriteNumbers: number[];
        memberSince: string;
        lastActivity: string;
        currentStreak: number;
        bestStreak: number;
      };
    }>('/api/user/stats');
  }

  async getUserHistory(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.lotteryId) params.append('lotteryId', filters.lotteryId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/user/history?${queryString}` : '/api/user/history';
    
    return this.request<{
      success: boolean;
      history: Array<{
        id: string;
        type: 'purchase' | 'win';
        lotteryId: string;
        lotteryName: string;
        amount: number;
        currency: 'TON' | 'USDT';
        numbers: number[];
        status: 'completed' | 'pending' | 'paid';
        createdAt: string;
        txHash: string;
        prize?: number;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(endpoint);
  }

  // Public endpoints
  async getLotteries() {
    try {
      const response = await fetch(`${this.baseURL}/api/public/lotteries`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure lotteries array exists
      if (!data.lotteries) {
        console.warn('API returned no lotteries array');
        return { lotteries: [], success: true };
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch lotteries:', error);
      // Return empty array instead of throwing
      return { lotteries: [], success: false, error: (error as Error).message };
    }
  }

  async getExchangeRate(from: string, to: string) {
    return this.request<{ 
      success: boolean;
      rate: number 
    }>(`/api/public/exchange-rates/${from}/${to}`);
  }

  // Swap endpoints
  async getSwapQuote(from: string, to: string, amount: number) {
    return this.request<{ success: boolean; quote: any }>(
      `/api/swap/quote?from=${from}&to=${to}&amount=${amount}`
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
    }>('/api/swap/build-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  }

  async getSupportedTokens() {
    return this.request<{ success: boolean; tokens: any[] }>('/api/swap/tokens');
  }

  async getSwapRate(from: string, to: string) {
    return this.request<{ success: boolean; rate: number }>(
      `/api/swap/rate/${from}/${to}`
    );
  }

  async getCurrentDrawForLottery(lotterySlug: string) {
    return this.request<{ 
      success: boolean;
      draw: Draw | null
    }>(`/api/public/lottery/${lotterySlug}/current-draw`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
