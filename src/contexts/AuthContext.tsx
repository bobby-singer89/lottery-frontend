import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api/client';
import { useTelegram } from '../lib/telegram/useTelegram';
import type { TelegramUser } from '../components/TelegramLoginWidget/TelegramLoginWidget';

interface User {
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
  loginWithTelegram: (telegramUser: TelegramUser) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser, webApp } = useTelegram();

  useEffect(() => {
    // Auto-login if Telegram user and webApp are available
    if (telegramUser && webApp && !user) {
      login();
    } else {
      setIsLoading(false);
    }
  }, [telegramUser, webApp, user]);

  const login = async () => {
    if (!telegramUser || !webApp) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.loginTelegram({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        auth_date: webApp.initDataUnsafe?.auth_date,
        hash: webApp.initDataUnsafe?.hash,
      });
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const connectWallet = useCallback(async (address: string) => {
    try {
      // Include Telegram profile data when connecting wallet
      const telegramData = telegramUser ? {
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
      } : undefined;
      
      const response = await apiClient.connectWallet(address, telegramData);
      setUser(response.user);
    } catch (error) {
      console.error('Connect wallet failed:', error);
      throw error;
    }
  }, [telegramUser]);

  const loginWithTelegram = async (telegramUser: TelegramUser): Promise<boolean> => {
    try {
      const response = await apiClient.loginTelegram({
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        auth_date: telegramUser.auth_date,
        hash: telegramUser.hash,
      });
      
      if (response.success && response.token) {
        apiClient.setToken(response.token);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Telegram auth failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        connectWallet,
        loginWithTelegram,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
