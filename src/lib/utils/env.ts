/**
 * Environment utility functions for checking development/production mode
 * and mock authentication status.
 */

/**
 * Check if mock authentication should be enabled
 * Works in dev mode OR when VITE_ENABLE_MOCK_AUTH=true
 * 
 * This allows enabling mock auth on Vercel production for testing
 * by setting the VITE_ENABLE_MOCK_AUTH environment variable.
 */
export function isMockAuthEnabled(): boolean {
  return (
    import.meta.env.DEV || 
    import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true'
  );
}

/**
 * Check if DevTools should be visible
 * Uses same logic as mock auth - visible when mock auth is enabled
 */
export function isDevToolsEnabled(): boolean {
  return isMockAuthEnabled();
}
