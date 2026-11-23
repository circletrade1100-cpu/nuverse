import api from './api';
import type { UnitSekolah, UnitSekolahFormData } from '../types/masterData';

// API Response interface (snake_case from backend)
interface ApiUnitSekolah {
  id: number;
  kode: string;
  nama: string;
  jenjang: 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK';
  deskripsi?: string;
  kepala_sekolah?: string;
  alamat?: string;
  telepon?: string;
  status: 'Aktif' | 'Tidak Aktif';
  created_at: string;
  updated_at: string;
}

export interface UnitSekolahListResponse {
  success: boolean;
  data: {
    data: ApiUnitSekolah[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UnitSekolahResponse {
  success: boolean;
  data: ApiUnitSekolah;
  message: string;
}

export interface UnitSekolahFilters {
  search?: string;
  status?: string;
  jenjang?: string;
  page?: number;
  per_page?: number;
}

// Helper function to convert API data to frontend format
const convertApiToFrontend = (apiData: ApiUnitSekolah): UnitSekolah => ({
  id: apiData.id.toString(),
  kode: apiData.kode,
  nama: apiData.nama,
  jenjang: apiData.jenjang,
  alamat: apiData.alamat || '',
  kepalaSekolah: apiData.kepala_sekolah,
  status: apiData.status,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at
});

export const unitSekolahService = {
  // Get all unit sekolah with filters
  async getAll(filters: UnitSekolahFilters = {}): Promise<{ success: boolean; data: { data: UnitSekolah[]; current_page: number; last_page: number; per_page: number; total: number; } }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.jenjang) params.append('jenjang', filters.jenjang);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    
    const response = await api.get(`/master-data/unit-sekolah?${params.toString()}`);
    const apiResponse: UnitSekolahListResponse = response.data;
    
    // Convert API data to frontend format
    return {
      success: apiResponse.success,
      data: {
        ...apiResponse.data,
        data: apiResponse.data.data.map(convertApiToFrontend)
      }
    };
  },

  // Get all unit sekolah for dropdown (simple version)
  async getAllForDropdown(): Promise<UnitSekolah[]> {
    try {
      // Filter hanya yang status Aktif untuk dropdown
      const response = await api.get('/master-data/unit-sekolah?status=Aktif&per_page=100');
      const apiResponse: UnitSekolahListResponse = response.data;
      
      if (apiResponse.success) {
        return apiResponse.data.data.map(convertApiToFrontend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching unit sekolah:', error);
      return [];
    }
  },

  // Get single unit sekolah
  async getById(id: string): Promise<{ success: boolean; data: UnitSekolah; message?: string; }> {
    const response = await api.get(`/master-data/unit-sekolah/${id}`);
    const apiResponse: UnitSekolahResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Create new unit sekolah
  async create(data: UnitSekolahFormData): Promise<{ success: boolean; data: UnitSekolah; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      jenjang: data.jenjang,
      alamat: data.alamat,
      kepala_sekolah: data.kepalaSekolah || null,
      status: data.status
    };
    
    const response = await api.post('/master-data/unit-sekolah', apiData);
    const apiResponse: UnitSekolahResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Update unit sekolah
  async update(id: string, data: UnitSekolahFormData): Promise<{ success: boolean; data: UnitSekolah; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      jenjang: data.jenjang,
      alamat: data.alamat || null,
      kepala_sekolah: data.kepalaSekolah || null,
      status: data.status
    };
    
    const response = await api.put(`/master-data/unit-sekolah?id=${id}`, apiData);
    const apiResponse: UnitSekolahResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Delete unit sekolah
  async delete(id: string): Promise<{ success: boolean; message?: string; }> {
    const response = await api.delete(`/master-data/unit-sekolah?id=${id}`);
    return response.data;
  }
};

export default unitSekolahService;
