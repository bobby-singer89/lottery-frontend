import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api/client';
import { useTelegram } from '../lib/telegram/useTelegram';
import { isMockAuthEnabled } from '../lib/utils/env';
import { TokenManager } from '../lib/auth/token';
import type { User, TelegramUser } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => Promise<void>;
  loginWithTelegram: (telegramUser: TelegramUser) => Promise<boolean>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser, webApp } = useTelegram();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenManager.getToken();
      
      if (token && !TokenManager.isTokenExpired(token)) {
        // Token exists and is valid - restore user session
        console.log('✅ Valid token found - restoring session');
        apiClient.setToken(token);
        
        try {
          // Fetch user profile to restore user state
          const profile = await apiClient.getProfile();
          if (profile.success && profile.user) {
            setUser(profile.user);
            console.log('✅ User session restored:', profile.user.username || profile.user.firstName);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Clear invalid token
          TokenManager.clearAll();
          apiClient.clearToken();
        }
      } else if (token) {
        // Token exists but is expired
        console.log('⚠️ Token expired - clearing');
        TokenManager.clearAll();
        apiClient.clearToken();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto-login with Telegram user when available
  useEffect(() => {
    const attemptTelegramLogin = async () => {
      // Only auto-login if:
      // 1. We have a Telegram user from the WebApp
      // 2. We're not already authenticated
      // 3. We're not currently loading
      if (telegramUser && webApp && !user && !isLoading) {
        console.log('🔄 Attempting Telegram auto-login for:', telegramUser.username || telegramUser.first_name);
        
        try {
          const response = await apiClient.loginTelegram({
            id: telegramUser.id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            photo_url: telegramUser.photo_url,
            auth_date: webApp.initDataUnsafe?.auth_date,
            hash: webApp.initDataUnsafe?.hash,
          });
          
          if (response.success && response.token) {
            TokenManager.setToken(response.token);
            apiClient.setToken(response.token);
            setUser(response.user);
            console.log('✅ Auto-login successful:', response.user.username || response.user.firstName);
          }
        } catch (error) {
          console.error('❌ Auto-login failed:', error);
        }
      }
    };

    attemptTelegramLogin();
  }, [telegramUser, webApp, user, isLoading]);

  const login = useCallback(async () => {
    if (!telegramUser || !webApp) {
      console.warn('⚠️ Cannot login - Telegram user or WebApp not available');
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
      
      if (response.success && response.token) {
        TokenManager.setToken(response.token);
        apiClient.setToken(response.token);
        setUser(response.user);
        console.log('✅ Login successful:', response.user.username || response.user.firstName);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [telegramUser, webApp]);

  const logout = () => {
    TokenManager.clearAll();
    apiClient.clearToken();
    setUser(null);
  };

  const refreshToken = useCallback(async () => {
    const currentToken = TokenManager.getToken();
    
    if (!currentToken || TokenManager.isTokenExpired(currentToken)) {
      logout();
      return;
    }

    try {
      // For now, we don't have a refresh endpoint, so just verify the token is still valid
      // In the future, this should call the /auth/refresh endpoint
      const profile = await apiClient.getProfile();
      if (profile.success && profile.user) {
        setUser(profile.user);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, []);

  // Monitor token expiration
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = TokenManager.getToken();
      
      if (token && TokenManager.willExpireSoon(token)) {
        refreshToken();
      } else if (token && TokenManager.isTokenExpired(token)) {
        logout();
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

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
    console.log('🔐 loginWithTelegram called for:', telegramUser.username || telegramUser.first_name);
    
    // If mock auth is enabled, bypass API validation
    if (isMockAuthEnabled()) {
      console.log('🔧 MOCK LOGIN: Bypassing API validation');
      const mockUser: User = {
        id: telegramUser.id,
        telegramId: telegramUser.id,
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        level: '1',
        experience: 0,
        referralCode: 'MOCK' + telegramUser.id,
        isAdmin: false,
      };
      
      // Set mock token with proper structure
      const mockToken = 'mock_token_' + crypto.randomUUID();
      TokenManager.setToken(mockToken);
      localStorage.setItem('user_id', String(telegramUser.id));
      apiClient.setToken(mockToken);
      
      setUser(mockUser);
      console.log('✅ Mock login successful:', mockUser.username || mockUser.firstName);
      return true;
    }
    
    // Production: Real API call for Telegram auth
    try {
      console.log('🌐 Calling API for Telegram authentication');
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
        TokenManager.setToken(response.token);
        apiClient.setToken(response.token);
        setUser(response.user);
        console.log('✅ API login successful:', response.user.username || response.user.firstName);
        return true;
      }
      
      console.warn('⚠️ API login failed - no token in response');
      return false;
    } catch (error) {
      console.error('❌ Telegram auth failed:', error);
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
        refreshToken,
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
