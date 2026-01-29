const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lottery-backend-gm4j.onrender.com/api';

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
 * For now, accepts any password and calls the Telegram auth endpoint
 * followed by admin check
 */
export async function adminLogin(telegramId: string, _password: string): Promise<AdminLoginResponse> {
  try {
    // Step 1: Call Telegram auth endpoint with admin's telegramId
    const authResponse = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: telegramId,
        // For now, we're accepting any password
        // The backend will authenticate based on telegramId being in AdminUser table
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Authentication failed');
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
      throw new Error('User is not an admin');
    }

    // Step 3: Store admin token separately
    localStorage.setItem('admin_token', authData.token);
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
  localStorage.removeItem('admin_token');
  localStorage.removeItem('auth_token');
}

/**
 * Check if user is currently logged in as admin
 */
export function isAdminLoggedIn(): boolean {
  return !!localStorage.getItem('admin_token');
}
