/**
 * Authentication-related TypeScript types
 */

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  auth_date?: number;
  hash?: string;
}

export interface User {
  id: number;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  tonWallet?: string;
  level: string;
  experience: number;
  referralCode: string;
  isAdmin?: boolean;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresAt?: number;
}

export interface LoginCredentials {
  telegramUser: TelegramUser;
}

export interface TokenPayload {
  userId: number;
  telegramId: number;
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
