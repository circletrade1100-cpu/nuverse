import oneSignalService from './oneSignalService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token: string;
  };
  errors?: any;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile?: any;
  roles?: any[];
}

class AuthService {
  private baseURL = 'https://nurverse.id';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        console.log('✅ Login successful, token stored:', data.data.token.substring(0, 20) + '...');
        
        // Set OneSignal External User ID
        try {
          await oneSignalService.setExternalUserId(data.data.user.id);
          
          // Set tags untuk segmentasi (opsional)
          const tags: Record<string, string> = {
            email: data.data.user.email || '',
            name: data.data.user.name || '',
          };
          
          // Tambahkan role jika ada
          if (data.data.user.roles && data.data.user.roles.length > 0) {
            tags.role = data.data.user.roles[0].name || 'user';
          }
          
          await oneSignalService.sendTags(tags);
          console.log('✅ OneSignal user ID set:', data.data.user.id);
        } catch (error) {
          console.error('⚠️ OneSignal setup error (non-critical):', error);
        }
      } else {
        console.error('❌ Login failed:', data);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghubungi server',
      };
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: true, message: 'Already logged out' };
      }

      const response = await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // Clear stored data regardless of response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
        console.log('✅ OneSignal user ID removed');
      } catch (error) {
        console.error('⚠️ OneSignal logout error (non-critical):', error);
      }

      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear stored data even if request fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
      } catch (osError) {
        console.error('⚠️ OneSignal logout error (non-critical):', osError);
      }
      
      return { success: true, message: 'Logged out locally' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseURL}/api/auth/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserData(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghubungi server',
      };
    }
  }
}

export const authService = new AuthService();
export type { LoginCredentials, AuthResponse, User };