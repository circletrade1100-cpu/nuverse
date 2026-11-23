import axios from 'axios';
import { API_BASE_URL } from './api';
import type { UnitKerja, UnitKerjaFormData } from '../types/masterData';


// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Response interface (snake_case from backend)
interface ApiUnitKerja {
  id: number;
  kode: string;
  nama: string;
  deskripsi?: string;
  status: 'Aktif' | 'Tidak Aktif';
  unit_sekolah_id?: number;
  created_at: string;
  updated_at: string;
}

export interface UnitKerjaListResponse {
  success: boolean;
  data: {
    data: ApiUnitKerja[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UnitKerjaResponse {
  success: boolean;
  data: ApiUnitKerja;
  message?: string;
}

// Helper function to convert API data to frontend format
const convertApiToFrontend = (apiData: ApiUnitKerja): UnitKerja => ({
  id: apiData.id.toString(),
  kode: apiData.kode,
  nama: apiData.nama,
  deskripsi: apiData.deskripsi,
  status: apiData.status,
  unitSekolahId: apiData.unit_sekolah_id?.toString(),
  createdAt: apiData.created_at,
  updatedAt: apiData.updated_at
});

export interface UnitKerjaFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const unitKerjaService = {
  // Get all unit kerja with filters
  async getAll(filters: UnitKerjaFilters = {}): Promise<{ success: boolean; data: { data: UnitKerja[]; current_page: number; last_page: number; per_page: number; total: number; } }> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/master-data/unit-kerja?${params.toString()}`);
    const apiResponse: UnitKerjaListResponse = response.data;
    
    // Convert API data to frontend format
    return {
      success: apiResponse.success,
      data: {
        ...apiResponse.data,
        data: apiResponse.data.data.map(convertApiToFrontend)
      }
    };
  },

  // Get single unit kerja
  async getById(id: string): Promise<{ success: boolean; data: UnitKerja; message?: string; }> {
    const response = await api.get(`/master-data/unit-kerja/${id}`);
    const apiResponse: UnitKerjaResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Create new unit kerja
  async create(data: UnitKerjaFormData): Promise<{ success: boolean; data: UnitKerja; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      deskripsi: data.deskripsi,
      status: data.status,
      unit_sekolah_id: data.unitSekolahId || null
    };
    
    const response = await api.post('/master-data/unit-kerja', apiData);
    const apiResponse: UnitKerjaResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Update unit kerja
  async update(id: string, data: UnitKerjaFormData): Promise<{ success: boolean; data: UnitKerja; message?: string; }> {
    // Convert frontend data to API format
    const apiData = {
      kode: data.kode,
      nama: data.nama,
      deskripsi: data.deskripsi,
      status: data.status,
      unit_sekolah_id: data.unitSekolahId || null
    };
    
    const response = await api.put(`/master-data/unit-kerja/${id}`, apiData);
    const apiResponse: UnitKerjaResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Delete unit kerja
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/master-data/unit-kerja/${id}`);
    return response.data;
  }
};

export default unitKerjaService;
