import { phpApiMethods, tokenManager } from './api';
import oneSignalService from './oneSignalService';
//import type { AxiosError } from 'axios';

// Types for Guru Authentication
export interface GuruLoginCredentials {
  username: string;
  password: string;
}

export interface GuruProfile {
  id: number;
  nama_lengkap: string;
  nip: string;
  email: string;
  status: string;
  tmt: string;
  masa_kerja: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenjang_pendidikan: string;
  jurusan: string;
  status_pernikahan: string;
  tugas_tambahan: string;
  mapel_diampu: string;
  jam_mengajar: number;
  no_telepon: string;
  alamat: string;
  avatar: string;
  username: string;
  jabatan: any;
  unit_sekolah: any;
  created_at: string;
  updated_at: string;
}

export interface GuruAuthResponse {
  success: boolean;
  message: string;
  data?: {
    guru: GuruProfile;
    token: string;
  };
  errors?: Record<string, string[]>;
}

export interface GuruUpdateProfileData {
  nama_lengkap?: string;
  email?: string;
  no_telepon?: string;
  alamat?: string;
  password?: string;
  password_confirmation?: string;
}

export interface GuruChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface GuruForgotPasswordData {
  email: string;
}

class GuruAuthService {
  private baseURL = 'https://nurverse.id/api';

  /**
   * Login guru menggunakan username dan password
   */
  async login(credentials: GuruLoginCredentials): Promise<GuruAuthResponse> {
    try {
      console.log('🔄 Guru Login attempt:', { username: credentials.username });

      const response = await fetch(`${this.baseURL}/guru-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📡 Guru Login response:', { status: response.status, success: data.success });

      if (response.ok && data.success) {
        // Store token and guru data
        tokenManager.setToken(data.data.token);
        localStorage.setItem('guru_data', JSON.stringify(data.data.guru));
        console.log('✅ Guru login successful, token stored:', data.data.token.substring(0, 20) + '...');
        
        // Set OneSignal External User ID untuk Guru
        try {
          await oneSignalService.setExternalUserId(`guru_${data.data.guru.id}`);
          
          // Set tags untuk segmentasi
          const tags: Record<string, string> = {
            user_type: 'guru',
            guru_id: data.data.guru.id.toString(),
            nama: data.data.guru.nama_lengkap || '',
            nip: data.data.guru.nip || '',
            status: data.data.guru.status || '',
          };
          
          // Tambahkan unit sekolah jika ada
          if (data.data.guru.unit_sekolah) {
            tags.unit_sekolah = data.data.guru.unit_sekolah.nama || '';
          }
          
          // Tambahkan jabatan jika ada
          if (data.data.guru.jabatan) {
            tags.jabatan = data.data.guru.jabatan.nama || '';
          }
          
          await oneSignalService.sendTags(tags);
          console.log('✅ OneSignal user ID set for guru:', data.data.guru.id);
          
          // Auto-request notification permission (untuk mobile)
          setTimeout(async () => {
            try {
              const granted = await oneSignalService.requestPermission();
              if (granted) {
                console.log('✅ Notification permission granted');
              } else {
                console.log('ℹ️ Notification permission not granted yet');
              }
            } catch (permError) {
              console.log('ℹ️ Permission prompt deferred or blocked:', permError);
            }
          }, 2000); // Delay 2 detik setelah login
        } catch (error) {
          console.error('⚠️ OneSignal setup error (non-critical):', error);
        }
      } else {
        console.error('❌ Guru login failed:', data);
      }

      return data;
    } catch (error) {
      console.error('Guru login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghubungi server',
      };
    }
  }

  /**
   * Get profile guru yang sedang login
   */
  async getProfile(): Promise<GuruProfile | null> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        console.warn('⚠️ No authentication token found for profile request');
        return null;
      }

      console.log('🔄 Getting guru profile...');
      const profile = await phpApiMethods.get<GuruProfile>('/guru-auth/profile');
      console.log('✅ Guru profile retrieved successfully');
      
      return profile;
    } catch (error) {
      console.error('Get guru profile error:', error);
      return null;
    }
  }

  /**
   * Update profile guru
   */
  async updateProfile(profileData: GuruUpdateProfileData): Promise<GuruProfile | null> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Updating guru profile...');
      const updatedProfile = await phpApiMethods.put<GuruProfile>('/guru-auth/profile', profileData);
      
      // Update stored guru data
      localStorage.setItem('guru_data', JSON.stringify(updatedProfile));
      console.log('✅ Guru profile updated successfully');
      
      return updatedProfile;
    } catch (error) {
      console.error('Update guru profile error:', error);
      throw error;
    }
  }

  /**
   * Logout guru
   */
  async logout(): Promise<GuruAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return { success: true, message: 'Already logged out' };
      }

      console.log('🔄 Logging out guru...');
      const response = await fetch(`${this.baseURL}/guru-auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('📡 Guru logout response:', { status: response.status, success: data.success });

      // Clear stored data regardless of response
      tokenManager.removeToken();
      localStorage.removeItem('guru_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
        console.log('✅ OneSignal user ID removed for guru');
      } catch (error) {
        console.error('⚠️ OneSignal logout error (non-critical):', error);
      }

      return data;
    } catch (error) {
      console.error('Guru logout error:', error);
      // Clear stored data even if request fails
      tokenManager.removeToken();
      localStorage.removeItem('guru_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
      } catch (osError) {
        console.error('⚠️ OneSignal logout error (non-critical):', osError);
      }
      
      return { success: true, message: 'Logged out locally' };
    }
  }

  /**
   * Logout dari semua device
   */
  async logoutAll(): Promise<GuruAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return { success: true, message: 'Already logged out' };
      }

      console.log('🔄 Logging out guru from all devices...');
      const response = await fetch(`${this.baseURL}/guru-auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('📡 Guru logout all response:', { status: response.status, success: data.success });

      // Clear stored data regardless of response
      tokenManager.removeToken();
      localStorage.removeItem('guru_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
        console.log('✅ OneSignal user ID removed for guru (all devices)');
      } catch (error) {
        console.error('⚠️ OneSignal logout error (non-critical):', error);
      }

      return data;
    } catch (error) {
      console.error('Guru logout all error:', error);
      // Clear stored data even if request fails
      tokenManager.removeToken();
      localStorage.removeItem('guru_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
      } catch (osError) {
        console.error('⚠️ OneSignal logout error (non-critical):', osError);
      }
      
      return { success: true, message: 'Logged out locally' };
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: GuruChangePasswordData): Promise<GuruAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Changing guru password...');
      const response = await fetch(`${this.baseURL}/guru-auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      console.log('📡 Change password response:', { status: response.status, success: data.success });

      return data;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat mengubah password',
      };
    }
  }

  /**
   * Forgot password - send reset link
   */
  async forgotPassword(forgotData: GuruForgotPasswordData): Promise<GuruAuthResponse> {
    try {
      console.log('🔄 Sending forgot password request...');
      const response = await fetch(`${this.baseURL}/guru-auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(forgotData),
      });

      const data = await response.json();
      console.log('📡 Forgot password response:', { status: response.status, success: data.success });

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghubungi server',
      };
    }
  }

  /**
   * Get stored guru data from localStorage
   */
  getGuruData(): GuruProfile | null {
    const guruData = localStorage.getItem('guru_data');
    return guruData ? JSON.parse(guruData) : null;
  }

  /**
   * Check if guru is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.hasToken();
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return tokenManager.getToken();
  }

  /**
   * Clear all stored authentication data
   */
  clearAuthData(): void {
    tokenManager.removeToken();
    localStorage.removeItem('guru_data');
  }
}

export const guruAuthService = new GuruAuthService();
export default guruAuthService;
