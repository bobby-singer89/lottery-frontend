import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api/client';
import { useTelegram } from '../lib/telegram/useTelegram';
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

// Debug Component - Shows in top-right corner during development
function AuthDebugComponent() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext)!;
  const { user: telegramUser } = useTelegram();
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  console.log('🔍 AUTH DEBUG Component Rendering');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'red',
      padding: '10px',
      zIndex: 9999,
      color: 'white',
      fontSize: '12px',
      fontFamily: 'monospace',
      borderRadius: '0 0 0 8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      minWidth: '250px'
    }}>
      <h3 style={{ margin: '0 0 8px 0' }}>🔍 AUTH DEBUG</h3>
      <p style={{ margin: '2px 0' }}>Component Loaded: <strong>YES</strong></p>
      <p style={{ margin: '2px 0' }}>isAuthenticated: {isAuthenticated ? '✅ true' : '❌ false'}</p>
      <p style={{ margin: '2px 0' }}>isLoading: {isLoading ? '⏳ true' : '✅ false'}</p>
      <p style={{ margin: '2px 0' }}>User: {user ? `✅ ${user.username || user.firstName}` : '❌ null'}</p>
      <p style={{ margin: '2px 0' }}>User ID: {user?.id || 'N/A'}</p>
      <p style={{ margin: '2px 0' }}>Telegram User: {telegramUser ? '✅ YES' : '❌ NO'}</p>
      <p style={{ margin: '2px 0', fontSize: '10px', opacity: 0.8 }}>
        Token: {TokenManager.getToken() ? '✅ EXISTS' : '❌ NONE'}
      </p>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔄 AuthProvider mounted');
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser, webApp } = useTelegram();

  // Helper function to perform Telegram login
  const performTelegramLogin = useCallback(async (tgUser: typeof telegramUser, tgWebApp: typeof webApp) => {
    if (!tgUser || !tgWebApp) {
      return null;
    }

    const response = await apiClient.loginTelegram({
      id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      photo_url: tgUser.photo_url,
      auth_date: tgWebApp.initDataUnsafe?.auth_date,
      hash: tgWebApp.initDataUnsafe?.hash,
    });
    
    if (response.success && response.token) {
      TokenManager.setToken(response.token);
      apiClient.setToken(response.token);
      apiClient.setUser(response.user);
      setUser(response.user);
      // Store user ID for gamification API
      localStorage.setItem('user_id', response.user.id.toString());
      if (response.user.telegramId) {
        localStorage.setItem('telegram_id', response.user.telegramId.toString());
      }
      return response.user;
    }
    
    return null;
  }, []);

  // Emergency auth bypass for development
  useEffect(() => {
    if (import.meta.env.DEV && !user && !isLoading) {
      const bypassAuth = localStorage.getItem('dev_auth_bypass');
      if (bypassAuth === 'true') {
        console.log('🔓 DEV MODE: Auth bypass enabled');
        const DEV_USER_ID = 999999; // Mock user ID for development testing
        const devUser: User = {
          id: DEV_USER_ID,
          telegramId: DEV_USER_ID,
          username: 'dev_user',
          firstName: 'Dev',
          lastName: 'User',
          level: '1',
          experience: 0,
          referralCode: 'DEV999',
        };
        setUser(devUser);
        apiClient.setUser(devUser);
        console.log('✅ DEV MODE: Mock user set:', devUser);
      }
    }
  }, [user, isLoading]);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
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
            // Store user ID for gamification API
            localStorage.setItem('user_id', profile.user.id.toString());
            if (profile.user.telegramId) {
              localStorage.setItem('telegram_id', profile.user.telegramId.toString());
            }
            console.log('✅ User session restored:', profile.user.username || profile.user.firstName);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to restore session - API error:', errorMessage);
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
      // Debug: Log current auth state
      console.log('🔍 AUTH DEBUG:');
      console.log('telegramUser:', telegramUser);
      console.log('webApp:', webApp);
      console.log('user:', user);
      console.log('isLoading:', isLoading);
      console.log('isAuthenticated:', !!user);
      
      // Only auto-login if:
      // 1. We have a Telegram user from the WebApp
      // 2. We're not already authenticated
      // 3. We're not currently loading
      if (telegramUser && webApp && !user && !isLoading) {
        console.log('🔄 Attempting Telegram auto-login for:', telegramUser.username || telegramUser.first_name);
        
        // Validate auth date is recent (within 24 hours) before making API call
        // This prevents unnecessary API calls with stale data
        const authDate = webApp.initDataUnsafe?.auth_date;
        if (authDate) {
          const now = Math.floor(Date.now() / 1000);
          const oneDay = 24 * 60 * 60;
          const isRecent = (now - authDate) < oneDay;
          
          if (!isRecent) {
            console.warn('⚠️ Auth data is too old (>24 hours) - skipping auto-login');
            return;
          }
        } else {
          console.warn('⚠️ No auth_date available - skipping auto-login');
          return;
        }
        
        try {
          const loggedInUser = await performTelegramLogin(telegramUser, webApp);
          if (loggedInUser) {
            console.log('✅ Auto-login successful:', loggedInUser.username || loggedInUser.firstName);
          } else {
            console.warn('⚠️ Auto-login failed - no user returned');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Auto-login failed:', errorMessage);
        }
      }
    };

    attemptTelegramLogin();
  }, [telegramUser, webApp, user, isLoading, performTelegramLogin]);

  const login = useCallback(async () => {
    if (!telegramUser || !webApp) {
      console.warn('⚠️ Cannot login - Telegram user or WebApp not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const loggedInUser = await performTelegramLogin(telegramUser, webApp);
      if (loggedInUser) {
        console.log('✅ Manual login successful:', loggedInUser.username || loggedInUser.firstName);
      } else {
        console.warn('⚠️ Manual login failed - no user returned');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Manual login failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [telegramUser, webApp, performTelegramLogin]);

  const logout = () => {
    TokenManager.clearAll();
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('telegram_id');
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
      // Store user ID for gamification API
      localStorage.setItem('user_id', response.user.id.toString());
      if (response.user.telegramId) {
        localStorage.setItem('telegram_id', response.user.telegramId.toString());
      }
    } catch (error) {
      console.error('Connect wallet failed:', error);
      throw error;
    }
  }, [telegramUser]);

  const loginWithTelegram = async (telegramUser: TelegramUser): Promise<boolean> => {
    console.log('🔐 loginWithTelegram called for:', telegramUser.username || telegramUser.first_name);
    
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
        apiClient.setUser(response.user);
        setUser(response.user);
        // Store user ID for gamification API
        localStorage.setItem('user_id', response.user.id.toString());
        if (response.user.telegramId) {
          localStorage.setItem('telegram_id', response.user.telegramId.toString());
        }
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

  // Only log auth status in development mode
  if (import.meta.env.DEV) {
    console.log('🔍 AUTH STATUS CHECK:');
    console.log('- Component mounted: true');
    console.log('- isAuthenticated:', !!user);
    console.log('- isLoading:', isLoading);
    console.log('- user:', user);
  }
  
  return (
    <>
      <AuthDebugComponent />
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
    </>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
