import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Real Telegram WebApp
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
    } else if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      // DEV MODE: Mock Telegram data
      console.log('🔧 DEV MODE: Using mock Telegram user');
      
      const mockUser: TelegramUser = {
        id: 432735601,
        first_name: 'Yury',
        last_name: 'Gorbenko',
        username: 'GorbenkoYury',
        photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yury'
      };
      
      const mockWebApp: TelegramWebApp = {
        initData: '',
        initDataUnsafe: {
          user: mockUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: 'mock_dev_hash_' + Date.now()
        },
        ready: () => console.log('Mock WebApp ready'),
        expand: () => console.log('Mock WebApp expanded'),
        close: () => console.log('Mock WebApp closed'),
        MainButton: {
          text: '',
          color: '#000',
          textColor: '#fff',
          isVisible: false,
          isActive: false,
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          setText: (_text: string) => {},
          onClick: (_callback: () => void) => {},
          offClick: (_callback: () => void) => {}
        },
        BackButton: {
          isVisible: false,
          show: () => {},
          hide: () => {},
          onClick: (_callback: () => void) => {},
          offClick: (_callback: () => void) => {}
        },
        HapticFeedback: {
          impactOccurred: (_style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {},
          notificationOccurred: (_type: 'error' | 'success' | 'warning') => {},
          selectionChanged: () => {}
        }
      };
      
      setWebApp(mockWebApp);
      setUser(mockUser);
    }
  }, []);

  return {
    webApp,
    user,
    isReady: !!webApp,
  };
}
