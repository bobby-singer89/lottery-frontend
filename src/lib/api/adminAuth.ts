/**
 * Get API base URL and ensure it ends with /api
 */
const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://lottery-backend-gm4j.onrender.com';
  
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  // Ensure /api suffix
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export interface AdminLoginRequest {
  telegramId: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    isAdmin: boolean;
    role: string;
  };
}

/**
 * Admin login function
 * 
 * SECURITY NOTE: This is a temporary implementation that accepts any password.
 * The actual authentication is based on the Telegram ID being in the AdminUser table.
 * 
 * TODO: Implement proper password validation in the backend and frontend.
 * For production use, this should be replaced with proper password hashing and verification.
 */
export async function adminLogin(telegramId: string, _password: string): Promise<AdminLoginResponse> {
  try {
    // Validate telegramId format (must be numeric)
    if (!/^\d+$/.test(telegramId)) {
      throw new Error('Telegram ID must be a numeric value');
    }

    // Step 1: Call Telegram auth endpoint with admin's telegramId
    const authResponse = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: telegramId,
        // NOTE: Password is not currently validated by the backend
        // Authentication is based on telegramId being in AdminUser table
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json().catch(() => ({ error: 'Authentication failed' }));
      throw new Error(error.error || 'Invalid Telegram ID or authentication failed');
    }

    const authData = await authResponse.json();

    // Step 2: Verify admin status
    const adminCheckResponse = await fetch(`${API_BASE_URL}/admin/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!adminCheckResponse.ok) {
      throw new Error('Admin verification failed');
    }

    const adminCheckData = await adminCheckResponse.json();

    if (!adminCheckData.success || !adminCheckData.isAdmin) {
      throw new Error('Access denied: User is not an administrator');
    }

    // Step 3: Store token (using auth_token for consistency with regular auth)
    localStorage.setItem('auth_token', authData.token);

    return {
      success: true,
      token: authData.token,
      user: {
        ...authData.user,
        isAdmin: true,
        role: adminCheckData.role || 'admin',
      },
    };
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}

/**
 * Admin logout function
 */
export function adminLogout(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Check if user is currently logged in as admin
 */
export function isAdminLoggedIn(): boolean {
  return !!localStorage.getItem('auth_token');
}
