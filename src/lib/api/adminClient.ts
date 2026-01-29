const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lottery-backend-gm4j.onrender.com/api';

interface AdminStats {
  totalUsers: number;
  totalTickets: number;
  totalRevenue: number;
  activeLotteries: number;
  recentActivity: any[];
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface UserFilters extends PaginationParams {
  search?: string;
  level?: string;
  walletConnected?: boolean;
}

interface TicketFilters extends PaginationParams {
  lotteryId?: number;
  userId?: number;
  status?: 'active' | 'won' | 'lost';
  ticketId?: string;
}

class AdminApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || 'Admin API request failed');
    }

    return response.json();
  }

  // Check if current user is admin
  async checkAdminStatus() {
    return this.request<{
      success: boolean;
      isAdmin: boolean;
      role?: string;
    }>('/admin/check');
  }

  // Dashboard statistics
  async getStats() {
    return this.request<{
      success: boolean;
      stats: AdminStats;
    }>('/admin/stats');
  }

  // User management
  async getUsers(filters?: UserFilters) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.walletConnected !== undefined) {
      params.append('walletConnected', filters.walletConnected.toString());
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      success: boolean;
      users: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/admin/users${query}`);
  }

  async getUserDetails(id: number) {
    return this.request<{
      success: boolean;
      user: any;
    }>(`/admin/users/${id}`);
  }

  // Lottery management
  async getLotteries() {
    return this.request<{
      success: boolean;
      lotteries: any[];
    }>('/admin/lotteries');
  }

  async updateLottery(id: number, data: any) {
    return this.request<{
      success: boolean;
      lottery: any;
    }>(`/admin/lotteries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createLottery(data: any) {
    return this.request<{
      success: boolean;
      lottery: any;
    }>('/admin/lotteries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Draw management
  async getDraws(filters?: PaginationParams) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      success: boolean;
      draws: any[];
      pagination?: any;
    }>(`/admin/draws${query}`);
  }

  async createDraw(data: any) {
    return this.request<{
      success: boolean;
      draw: any;
    }>('/admin/draws', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async executeDraw(id: number) {
    return this.request<{
      success: boolean;
      draw: any;
      winners: any[];
    }>(`/admin/draws/${id}/execute`, {
      method: 'POST',
    });
  }

  // Ticket management
  async getTickets(filters?: TicketFilters) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.lotteryId) params.append('lotteryId', filters.lotteryId.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ticketId) params.append('ticketId', filters.ticketId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      success: boolean;
      tickets: any[];
      pagination: any;
    }>(`/admin/tickets${query}`);
  }

  // Notifications
  async sendNotification(data: {
    message: string;
    userId?: number;
    broadcast?: boolean;
  }) {
    return this.request<{
      success: boolean;
      notification: any;
    }>('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNotifications(filters?: PaginationParams) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      success: boolean;
      notifications: any[];
      pagination?: any;
    }>(`/admin/notifications${query}`);
  }
}

export const adminApiClient = new AdminApiClient(API_BASE_URL);
