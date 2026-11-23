import { tokenManager } from './api';
import oneSignalService from './oneSignalService';

// Types for Student Authentication
export interface StudentLoginCredentials {
  nisn: string;
  password: string;
}

export interface StudentProfile {
  id: number;
  nama_lengkap: string;
  nama_panggilan: string;
  nisn: string;
  email: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  umur: number;
  nama_ibu: string;
  nama_ayah: string;
  nomor_hp: string;
  alamat: string;
  unit_sekolah: string;
  unit_kelas: string;
  avatar: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAuthResponse {
  success: boolean;
  message: string;
  data?: {
    student: StudentProfile;
    token: string;
  };
  errors?: Record<string, string[]>;
}

export interface StudentUpdateProfileData {
  nama_lengkap?: string;
  nama_panggilan?: string;
  email?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  nama_ibu?: string;
  nama_ayah?: string;
  nomor_hp?: string;
  alamat?: string;
}

export interface StudentChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface StudentForgotPasswordData {
  email: string;
}

class StudentAuthService {
  private baseURL = 'https://nurverse.id/api';

  /**
   * Login siswa menggunakan NISN dan password
   */
  async login(credentials: StudentLoginCredentials): Promise<StudentAuthResponse> {
    try {
      console.log('🔄 Student Login attempt:', { nisn: credentials.nisn });

      const response = await fetch(`${this.baseURL}/student-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📡 Student Login response:', { status: response.status, success: data.success });

      if (response.ok && data.success) {
        // Store token and student data
        tokenManager.setToken(data.data.token);
        localStorage.setItem('student_data', JSON.stringify(data.data.student));
        console.log('✅ Student login successful, token stored');
        
        // Set OneSignal External User ID untuk Student
        try {
          await oneSignalService.setExternalUserId(`student_${data.data.student.id}`);
          
          // Set tags untuk segmentasi
          const tags: Record<string, string> = {
            user_type: 'student',
            student_id: data.data.student.id.toString(),
            nama: data.data.student.nama_lengkap || '',
            nisn: data.data.student.nisn || '',
            status: data.data.student.status || '',
          };
          
          // Tambahkan unit sekolah jika ada
          if (data.data.student.unit_sekolah) {
            tags.unit_sekolah = data.data.student.unit_sekolah;
          }
          
          // Tambahkan unit kelas jika ada
          if (data.data.student.unit_kelas) {
            tags.unit_kelas = data.data.student.unit_kelas;
          }
          
          await oneSignalService.sendTags(tags);
          console.log('✅ OneSignal user ID set for student:', data.data.student.id);
          
          // Auto-request notification permission (untuk mobile)
          setTimeout(async () => {
            try {
              const granted = await oneSignalService.requestPermission();
              if (granted) {
                console.log('✅ Notification permission granted for parent');
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
        console.error('❌ Student login failed:', data);
      }

      return data;
    } catch (error) {
      console.error('Student login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Get profile siswa yang sedang login
   */
  async getProfile(): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update stored student data
        localStorage.setItem('student_data', JSON.stringify(data.data));
        console.log('✅ Student profile fetched successfully');
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data ? { student: data.data, token } : undefined,
      };
    } catch (error) {
      console.error('Get student profile error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Get biodata siswa (alias for profile)
   */
  async getBiodata(): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/biodata`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('student_data', JSON.stringify(data.data));
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data ? { student: data.data, token } : undefined,
      };
    } catch (error) {
      console.error('Get student biodata error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Update profile siswa
   */
  async updateProfile(profileData: StudentUpdateProfileData): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update stored student data
        localStorage.setItem('student_data', JSON.stringify(data.data));
        console.log('✅ Student profile updated successfully');
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data ? { student: data.data, token } : undefined,
        errors: data.errors,
      };
    } catch (error) {
      console.error('Update student profile error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Upload avatar siswa
   */
  async uploadAvatar(file: File): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseURL}/student-auth/avatar`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Student avatar uploaded successfully');
      }

      return data;
    } catch (error) {
      console.error('Upload student avatar error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Delete avatar siswa
   */
  async deleteAvatar(): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/avatar`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete student avatar error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: StudentChangePasswordData): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Change student password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Logout siswa dari device saat ini
   */
  async logout(): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear token and student data
        tokenManager.removeToken();
        localStorage.removeItem('student_data');
        console.log('✅ Student logout successful');
        
        // Remove OneSignal External User ID
        try {
          await oneSignalService.removeExternalUserId();
          console.log('✅ OneSignal user ID removed for student');
        } catch (error) {
          console.error('⚠️ OneSignal logout error (non-critical):', error);
        }
      }

      return data;
    } catch (error) {
      console.error('Logout student error:', error);
      // Still clear local data even if API call fails
      tokenManager.removeToken();
      localStorage.removeItem('student_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
      } catch (osError) {
        console.error('⚠️ OneSignal logout error (non-critical):', osError);
      }
      
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Logout siswa dari semua device
   */
  async logoutAll(): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear token and student data
        tokenManager.removeToken();
        localStorage.removeItem('student_data');
        console.log('✅ Student logout from all devices successful');
        
        // Remove OneSignal External User ID
        try {
          await oneSignalService.removeExternalUserId();
          console.log('✅ OneSignal user ID removed for student (all devices)');
        } catch (error) {
          console.error('⚠️ OneSignal logout error (non-critical):', error);
        }
      }

      return data;
    } catch (error) {
      console.error('Logout all student error:', error);
      // Still clear local data even if API call fails
      tokenManager.removeToken();
      localStorage.removeItem('student_data');
      
      // Remove OneSignal External User ID
      try {
        await oneSignalService.removeExternalUserId();
      } catch (osError) {
        console.error('⚠️ OneSignal logout error (non-critical):', osError);
      }
      
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Forgot password - kirim reset link
   */
  async forgotPassword(data: StudentForgotPasswordData): Promise<StudentAuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/student-auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Get student data by ID (untuk parent/admin)
   */
  async getStudentById(id: number): Promise<StudentAuthResponse> {
    try {
      const token = tokenManager.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login kembali.',
        };
      }

      const response = await fetch(`${this.baseURL}/student-auth/student/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      return {
        success: data.success,
        message: data.message,
        data: data.data ? { student: data.data, token } : undefined,
      };
    } catch (error) {
      console.error('Get student by ID error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      };
    }
  }

  /**
   * Get stored student data
   */
  getStoredStudentData(): StudentProfile | null {
    const data = localStorage.getItem('student_data');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Check if student is logged in
   */
  isLoggedIn(): boolean {
    return !!tokenManager.getToken() && !!this.getStoredStudentData();
  }
}

// Export singleton instance
export const studentAuthService = new StudentAuthService();
export default studentAuthService;

