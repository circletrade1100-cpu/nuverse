import { phpApiMethods } from './api';
import type { Jabatan, JabatanFormData } from '../types/masterData';

// Re-export for external usage
export type { Jabatan, JabatanFormData } from '../types/masterData';

export interface JabatanFilters {
  search?: string;
  status?: 'Aktif' | 'Tidak Aktif';
  level?: number;
  page?: number;
  per_page?: number;
}

// API Response interface (snake_case from backend)
interface ApiJabatan {
  id: number;
  kode: string;
  nama: string;
  level: number;
  deskripsi?: string;
  gaji_pokok: number;
  tunjangan: number;
  status: 'Aktif' | 'Tidak Aktif';
  created_at: string;
  updated_at: string;
}

// Removed unused interfaces

// Convert API data to frontend format
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const convertApiToFrontend = (apiJabatan: ApiJabatan): Jabatan => ({
  id: apiJabatan.id.toString(),
  kode: apiJabatan.kode,
  nama: apiJabatan.nama,
  level: apiJabatan.level,
  deskripsi: apiJabatan.deskripsi,
  gajiPokok: toNumber(apiJabatan.gaji_pokok),
  tunjangan: toNumber(apiJabatan.tunjangan),
  status: apiJabatan.status,
  createdAt: apiJabatan.created_at,
  updatedAt: apiJabatan.updated_at,
});

export const jabatanService = {
  // Get all jabatan with filters
  async getAll(filters: JabatanFilters = {}): Promise<{ success: boolean; data: { data: Jabatan[]; current_page: number; last_page: number; per_page: number; total: number; } }> {
    try {
      const params: Record<string, any> = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.level) params.level = filters.level.toString();
      if (filters.page) params.page = filters.page.toString();
      if (filters.per_page) params.per_page = filters.per_page.toString();

      const response = await phpApiMethods.get<{ data: ApiJabatan[]; current_page: number; last_page: number; per_page: number; total: number }>('/master-data/jabatan', params);
      
      // Convert API data to frontend format
      return {
        success: true,
        data: {
          ...response,
          data: response.data.map(convertApiToFrontend)
        }
      };
    } catch (error) {
      console.error('Error fetching jabatan:', error);
      throw error;
    }
  },

  // Get single jabatan
  async getById(id: string): Promise<{ success: boolean; data: Jabatan; message?: string; }> {
    try {
      const response = await phpApiMethods.get<ApiJabatan>(`/master-data/jabatan/${id}`);
      
      return {
        success: true,
        data: convertApiToFrontend(response),
        message: 'Jabatan retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching jabatan:', error);
      throw error;
    }
  },

  // Create new jabatan
  async create(data: JabatanFormData): Promise<{ success: boolean; data: Jabatan; message?: string; }> {
    try {
      // Convert frontend data to API format
      const apiData = {
        kode: data.kode,
        nama: data.nama,
        level: data.level,
        deskripsi: data.deskripsi,
        gaji_pokok: data.gajiPokok,
        tunjangan: data.tunjangan,
        status: data.status,
      };
      
      const response = await phpApiMethods.post<ApiJabatan>('/master-data/jabatan', apiData);
      
      return {
        success: true,
        data: convertApiToFrontend(response),
        message: 'Jabatan created successfully'
      };
    } catch (error) {
      console.error('Error creating jabatan:', error);
      throw error;
    }
  },

  // Update jabatan
  async update(id: string, data: JabatanFormData): Promise<{ success: boolean; data: Jabatan; message?: string; }> {
    try {
      // Convert frontend data to API format
      const apiData = {
        kode: data.kode,
        nama: data.nama,
        level: data.level,
        deskripsi: data.deskripsi,
        gaji_pokok: data.gajiPokok,
        tunjangan: data.tunjangan,
        status: data.status,
      };
      
      const response = await phpApiMethods.put<ApiJabatan>(`/master-data/jabatan/${id}`, apiData);
      
      return {
        success: true,
        data: convertApiToFrontend(response),
        message: 'Jabatan updated successfully'
      };
    } catch (error) {
      console.error('Error updating jabatan:', error);
      throw error;
    }
  },

  // Delete jabatan
  async delete(id: string): Promise<{ success: boolean; message?: string; }> {
    try {
      await phpApiMethods.delete(`/master-data/jabatan/${id}`);
      
      return {
        success: true,
        message: 'Jabatan deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting jabatan:', error);
      throw error;
    }
  }
};
