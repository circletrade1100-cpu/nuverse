import { api, apiMethods, phpApiMethods, handleApiError } from './api';
import type { PaginatedResponse } from './api';
import { AxiosError } from 'axios';
import type { User, UserFormData, UserFilters } from '../types/user';

// Extended types for API
export interface UserWithProfile {
  id: string;
  name: string;
  email: string;
  profile?: {
    nip?: string;
    jabatan?: string;
    unit_kerja?: string;
    unit_sekolah?: string;
    status?: 'Aktif' | 'Non-Aktif' | 'Pensiun';
    tmt?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenjang_pendidikan?: string;
    jurusan?: string;
    status_pernikahan?: 'Menikah' | 'Belum Menikah' | 'Janda/Duda';
    tugas_tambahan?: string;
    mapel_diampu?: string[];
    jam_mengajar?: number;
    avatar?: string;
    alamat?: string;
    no_telepon?: string;
    kontak_darurat?: string;
    telepon_darurat?: string;
  };
  roles?: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  module?: string;
  is_active: boolean;
}

class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters: Partial<UserFilters> = {}, page = 1, perPage = 15): Promise<PaginatedResponse<UserWithProfile>> {
    try {
      const params = {
        ...filters,
        page,
        per_page: perPage,
      };
      
      const response = await api.get<{ success: boolean; data: PaginatedResponse<UserWithProfile> }>('/users', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<UserWithProfile> {
    try {
      return await apiMethods.get<UserWithProfile>(`/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: UserFormData): Promise<UserWithProfile> {
    try {
      const payload = {
        name: userData.namaLengkap,
        email: userData.email,
        password: userData.password,
        nip: userData.nip || undefined,
        jabatan: userData.jabatan || undefined,
        unit_kerja: userData.unitKerja || undefined,
        unit_sekolah: (userData as any).unitSekolah || undefined,
        status: userData.status || 'Aktif',
        tmt: userData.tmt || undefined,
        tempat_lahir: userData.tempatLahir || undefined,
        tanggal_lahir: userData.tanggalLahir || undefined,
        jenjang_pendidikan: userData.jenjangPendidikan || undefined,
        jurusan: userData.jurusan || undefined,
        status_pernikahan: userData.statusPernikahan || undefined,
        tugas_tambahan: userData.tugasTambahan || undefined,
        mapel_diampu: userData.mapelDiampu ? userData.mapelDiampu.split(',').map(m => m.trim()) : undefined,
        jam_mengajar: userData.jamMengajar ? parseInt(userData.jamMengajar) : undefined,
        role_ids: (userData as any).role ? [parseInt((userData as any).role)] : undefined, // Add role assignment
      };

      return await apiMethods.post<UserWithProfile>('/users', payload);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, userData: Partial<UserFormData>): Promise<UserWithProfile> {
    try {
      const payload: any = {};
      
      if (userData.namaLengkap) payload.name = userData.namaLengkap;
      if (userData.email) payload.email = userData.email;
      if (userData.password) payload.password = userData.password;
      if (userData.nip) payload.nip = userData.nip;
      if (userData.jabatan) payload.jabatan = userData.jabatan;
      if (userData.unitKerja) payload.unit_kerja = userData.unitKerja;
      if ((userData as any).unitSekolah) payload.unit_sekolah = (userData as any).unitSekolah;
      if (userData.status) payload.status = userData.status;
      if (userData.tmt) payload.tmt = userData.tmt;
      if (userData.tempatLahir) payload.tempat_lahir = userData.tempatLahir;
      if (userData.tanggalLahir) payload.tanggal_lahir = userData.tanggalLahir;
      if (userData.jenjangPendidikan) payload.jenjang_pendidikan = userData.jenjangPendidikan;
      if (userData.jurusan) payload.jurusan = userData.jurusan;
      if (userData.statusPernikahan) payload.status_pernikahan = userData.statusPernikahan;
      if (userData.tugasTambahan) payload.tugas_tambahan = userData.tugasTambahan;
      if (userData.mapelDiampu) payload.mapel_diampu = userData.mapelDiampu.split(',').map(m => m.trim());
      if (userData.jamMengajar) payload.jam_mengajar = parseInt(userData.jamMengajar);

      return await apiMethods.put<UserWithProfile>(`/users/${id}`, payload);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await apiMethods.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(id: string, file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return await apiMethods.upload<{ avatar_url: string }>(`/users/${id}/avatar`, formData);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(id: string): Promise<UserWithProfile['profile']> {
    try {
      return await apiMethods.get<UserWithProfile['profile']>(`/users/${id}/profile`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: string, profileData: Partial<UserWithProfile['profile']>): Promise<UserWithProfile['profile']> {
    try {
      return await apiMethods.put<UserWithProfile['profile']>(`/users/${id}/profile`, profileData);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          data: Role[];
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: number;
          to: number;
        };
      }>('/roles');
      
      if (response.data.success) {
        return response.data.data.data;
      }
      
      throw new Error('Failed to fetch roles');
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
    try {
      return await apiMethods.post<Role>('/roles', roleData);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Update role
   */
  async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
    try {
      return await apiMethods.put<Role>(`/roles/${id}`, roleData);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    try {
      await apiMethods.delete(`/roles/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      return await phpApiMethods.get<Permission[]>('/permissions.php');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get permissions');
    }
  }

  /**
   * Convert backend user to frontend format
   */
  convertToFrontendUser(backendUser: UserWithProfile): User & { role?: string } {
    // Debug: Log struktur data backend
    console.log('Backend user structure:', {
      id: backendUser.id,
      name: backendUser.name,
      roles: backendUser.roles,
      profile: backendUser.profile
    });
    
    // Get role display name from the first role
    const primaryRole = backendUser.roles && backendUser.roles.length > 0 
      ? backendUser.roles[0].display_name 
      : '';

    console.log('Primary role extracted:', primaryRole);

    const convertedUser = {
      id: backendUser.id,
      namaLengkap: backendUser.name,
      email: backendUser.email || '',
      jabatan: backendUser.profile?.jabatan || '',
      nip: backendUser.profile?.nip || '',
      status: backendUser.profile?.status || 'Aktif',
      tmt: backendUser.profile?.tmt || '',
      unitKerja: backendUser.profile?.unit_kerja || '',
      unitSekolah: backendUser.profile?.unit_sekolah || '',
      masaKerja: this.calculateMasaKerja(backendUser.profile?.tmt),
      tempatLahir: backendUser.profile?.tempat_lahir || '',
      tanggalLahir: backendUser.profile?.tanggal_lahir || '',
      pendidikan: {
        jenjang: backendUser.profile?.jenjang_pendidikan || '',
        jurusan: backendUser.profile?.jurusan || '',
      },
      statusPernikahan: backendUser.profile?.status_pernikahan || 'Belum Menikah',
      tugasTambahan: backendUser.profile?.tugas_tambahan,
      mapelDiampu: backendUser.profile?.mapel_diampu,
      jamMengajar: backendUser.profile?.jam_mengajar,
      noTelepon: backendUser.profile?.no_telepon || '',
      avatar: backendUser.profile?.avatar,
      role: primaryRole, // Add role information
    };
    
    console.log('Converted user:', convertedUser);
    return convertedUser;
  }

  /**
   * Calculate masa kerja from TMT date
   */
  private calculateMasaKerja(tmt?: string): string {
    if (!tmt) return '';
    
    const tmtDate = new Date(tmt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - tmtDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    return `${years} tahun ${months} bulan`;
  }
}

export const userService = new UserService();
export default userService;
