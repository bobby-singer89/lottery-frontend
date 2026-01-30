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
  async getLotteries() {
    return this.request<{ 
      success: boolean;
      lotteries: Lottery[] 
    }>('/public/lotteries');
  }

  async getExchangeRate(from: string, to: string) {
    return this.request<{ 
      success: boolean;
      rate: number 
    }>(`/public/exchange-rates/${from}/${to}`);
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

  async getAllLotteries() {
    return this.request<{ 
      success: boolean; 
      lotteries: any[]; 
      exchangeRate: number;
    }>('/public/lotteries/all');
  }

  async getUserBalance(walletAddress: string) {
    return this.request<{ 
      success: boolean; 
      balances: { TON: number; USDT: number }; 
    }>(`/user/balance/${walletAddress}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
