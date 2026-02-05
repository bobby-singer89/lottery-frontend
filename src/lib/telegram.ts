/**
 * Enhanced Telegram Web App initialization utilities
 */

import type { TelegramUser } from '../types/auth';
import { validateTelegramUser, isAuthDataRecent } from './auth/validation';

export interface TelegramWebAppUser extends TelegramUser {
  auth_date?: number;
  hash?: string;
}

export interface TelegramWebAppData {
  user: TelegramWebAppUser | null;
  authDate: number | null;
  hash: string | null;
  isValid: boolean;
  queryId?: string;
}

/**
 * Initialize Telegram Web App and extract user data
 */
export function initTelegramWebApp(): TelegramWebAppData | null {
  const tg = window.Telegram?.WebApp;

  if (!tg) {
    console.warn('Telegram WebApp not available');
    return null;
  }

  try {
    // Initialize the WebApp
    tg.ready();
    tg.expand();

    // Extract user data
    const user = tg.initDataUnsafe?.user;
    const authDate = tg.initDataUnsafe?.auth_date;
    const hash = tg.initDataUnsafe?.hash;
    const queryId = tg.initDataUnsafe?.query_id;

    // Validate user data
    const isValidUser = user ? validateTelegramUser(user) : false;
    const isRecentAuth = authDate ? isAuthDataRecent(authDate) : false;

    return {
      user: user ? { ...user, auth_date: authDate, hash } : null,
      authDate: authDate || null,
      hash: hash || null,
      queryId,
      isValid: isValidUser && isRecentAuth && !!hash,
    };
  } catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    return null;
  }
}

/**
 * Show Telegram WebApp main button
 */
export function showMainButton(text: string, onClick: () => void): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.MainButton) {
    return;
  }

  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.onClick(onClick);
}

/**
 * Hide Telegram WebApp main button
 */
export function hideMainButton(): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.MainButton) {
    return;
  }

  tg.MainButton.hide();
}

/**
 * Show Telegram WebApp back button
 */
export function showBackButton(onClick: () => void): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.BackButton) {
    return;
  }

  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
}

/**
 * Hide Telegram WebApp back button
 */
export function hideBackButton(): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.BackButton) {
    return;
  }

  tg.BackButton.hide();
}

/**
 * Close Telegram WebApp
 */
export function closeTelegramWebApp(): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg) {
    return;
  }

  tg.close();
}

/**
 * Send haptic feedback
 */
export function sendHapticFeedback(
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'
): void {
  const tg = window.Telegram?.WebApp;
  
  if (!tg?.HapticFeedback) {
    return;
  }

  if (type === 'impact' && style && ['light', 'medium', 'heavy', 'rigid', 'soft'].includes(style)) {
    tg.HapticFeedback.impactOccurred(style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
  } else if (type === 'notification' && style && ['error', 'success', 'warning'].includes(style)) {
    tg.HapticFeedback.notificationOccurred(style as 'error' | 'success' | 'warning');
  } else if (type === 'selection') {
    tg.HapticFeedback.selectionChanged();
  }
}

/**
 * Check if running in Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return !!window.Telegram?.WebApp;
}

/**
 * Get Telegram WebApp version
 */
export function getTelegramWebAppVersion(): string | null {
  const tg = window.Telegram?.WebApp;
  return tg ? (tg as any).version || null : null;
}

/**
 * Check if feature is available in current Telegram version
 */
export function isTelegramFeatureAvailable(feature: string): boolean {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    return false;
  }

  // Check for specific features
  switch (feature) {
    case 'MainButton':
      return !!tg.MainButton;
    case 'BackButton':
      return !!tg.BackButton;
    case 'HapticFeedback':
      return !!tg.HapticFeedback;
    default:
      return false;
  }
}
