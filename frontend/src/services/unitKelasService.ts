import api from './api';
import type { UnitKelas, UnitKelasFormData } from '../types/masterData';

interface UnitKelasApiData {
  id: string;
  kode: string;
  nama: string;
  tingkat: number;
  kapasitas: number;
  wali_kelas?: string;
  unit_sekolah_id?: string | number;
  unit_sekolah?: {
    id: string;
    nama: string;
    jenjang: string;
  };
  status: 'Aktif' | 'Tidak Aktif';
  created_at: string;
  updated_at: string;
}

interface UnitKelasListResponse {
  success: boolean;
  data: {
    data: UnitKelasApiData[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  message: string;
}

interface UnitKelasResponse {
  success: boolean;
  data: UnitKelasApiData;
  message: string;
}

export interface UnitKelasFilters {
  search?: string;
  status?: string;
  tingkat?: string;
  unit_sekolah_id?: string;
  page?: number;
  per_page?: number;
}

const convertApiToFrontend = (apiData: UnitKelasApiData): UnitKelas => ({
  id: apiData.id,
  kode: apiData.kode,
  nama: apiData.nama,
  tingkat: apiData.tingkat.toString(),
  kapasitas: apiData.kapasitas,
  waliKelas: apiData.wali_kelas || '',
  unitSekolah: apiData.unit_sekolah?.nama || '',
  unitSekolahId: apiData.unit_sekolah_id ? String(apiData.unit_sekolah_id) : '',
  status: apiData.status,
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at
});


export const unitKelasService = {
  // Get all unit kelas with filters
  async getAll(filters: UnitKelasFilters = {}): Promise<{ success: boolean; data: { data: UnitKelas[]; current_page: number; last_page: number; per_page: number; total: number; } }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.tingkat) params.append('tingkat', filters.tingkat);
    if (filters.unit_sekolah_id) params.append('unit_sekolah_id', filters.unit_sekolah_id);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    
    // Add timestamp to prevent caching
    params.append('_t', Date.now().toString());
    
    const response = await api.get(`/master-data/unit-kelas?${params.toString()}`);
    const apiResponse: UnitKelasListResponse = response.data;
    
    // Convert API data to frontend format
    return {
      success: apiResponse.success,
      data: {
        ...apiResponse.data,
        data: apiResponse.data.data.map(convertApiToFrontend)
      }
    };
  },

  // Get unit kelas by unit sekolah (for dropdown)
  async getByUnitSekolah(unitSekolahId: string): Promise<UnitKelas[]> {
    try {
      console.log('Fetching unit kelas for unit sekolah ID:', unitSekolahId);
      const response = await api.get(`/master-data/unit-kelas?unit_sekolah_id=${unitSekolahId}&per_page=100`);
      console.log('Unit Kelas API Response:', response.data);
      
      const apiResponse: UnitKelasListResponse = response.data;
      
      if (apiResponse.success && apiResponse.data?.data) {
        const converted = apiResponse.data.data.map(convertApiToFrontend);
        console.log('Converted unit kelas:', converted);
        return converted;
      }
      console.warn('No unit kelas data found');
      return [];
    } catch (error) {
      console.error('Error fetching unit kelas by unit sekolah:', error);
      return [];
    }
  },

  // Get single unit kelas
  async getById(id: string): Promise<{ success: boolean; data: UnitKelas; message?: string; }> {
    const response = await api.get(`/master-data/unit-kelas/${id}`);
    const apiResponse: UnitKelasResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Create new unit kelas
  async create(data: UnitKelasFormData): Promise<{ success: boolean; data: UnitKelas; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      tingkat: parseInt(data.tingkat),
      kapasitas: data.kapasitas,
      wali_kelas: data.waliKelas || null,
      unit_sekolah_id: data.unitSekolahId,
      status: data.status
    };
    
    const response = await api.post('/master-data/unit-kelas', apiData);
    const apiResponse: UnitKelasResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Update unit kelas
  async update(id: string, data: UnitKelasFormData): Promise<{ success: boolean; data: UnitKelas; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      tingkat: parseInt(data.tingkat),
      kapasitas: data.kapasitas,
      wali_kelas: data.waliKelas || null,
      unit_sekolah_id: data.unitSekolahId,
      status: data.status
    };
    
    const response = await api.put(`/master-data/unit-kelas/${id}`, apiData);
    const apiResponse: UnitKelasResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Delete unit kelas
  async delete(id: string): Promise<{ success: boolean; message?: string; }> {
    const response = await api.delete(`/master-data/unit-kelas/${id}`);
    return response.data;
  }
};

export default unitKelasService;
