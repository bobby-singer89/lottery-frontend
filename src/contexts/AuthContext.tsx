import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api/client';
import { useTelegram } from '../lib/telegram/useTelegram';

interface User {
  id: number;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  tonWallet?: string;
  level: string;
  experience: number;
  referralCode: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser } = useTelegram();

  useEffect(() => {
    // Auto-login if Telegram user available
    if (telegramUser && !user) {
      login();
    } else {
      setIsLoading(false);
    }
  }, [telegramUser]);

  const login = async () => {
    if (!telegramUser) {
      throw new Error('Telegram user not available');
    }

    try {
      setIsLoading(true);
      const response = await apiClient.loginTelegram(telegramUser);
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

  const connectWallet = async (address: string) => {
    try {
      const response = await apiClient.connectWallet(address);
      setUser(response.user);
    } catch (error) {
      console.error('Connect wallet failed:', error);
      throw error;
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
