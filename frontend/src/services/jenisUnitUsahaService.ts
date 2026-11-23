import axios from 'axios';
import { API_BASE_URL } from './api';

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
  } else {
    // For testing without authentication
    console.warn('⚠️ No auth token found, making request without authentication');
  }
  return config;
});

// Interfaces
export interface JenisUnitUsaha {
  id: number;
  kode_unit_usaha: string;
  nama_jenis_unit_usaha: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface JenisUnitUsahaFormData {
  kode_unit_usaha: string;
  nama_jenis_unit_usaha: string;
  status: 'active' | 'inactive';
}

export interface JenisUnitUsahaResponse {
  success: boolean;
  data: JenisUnitUsaha;
  message?: string;
}

export interface JenisUnitUsahaListResponse {
  success: boolean;
  data: {
    data: JenisUnitUsaha[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface JenisUnitUsahaDropdownResponse {
  success: boolean;
  data: {
    id: number;
    kode_unit_usaha: string;
    nama_jenis_unit_usaha: string;
  }[];
}

// API functions
export const jenisUnitUsahaService = {
  // Get all jenis unit usaha with pagination
  async getAll(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }): Promise<JenisUnitUsahaListResponse> {
    console.log('🔄 Fetching jenis unit usaha with params:', params);
    console.log('🔑 Token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
    
    try {
      const response = await api.get('/master-data/jenis-unit-usaha', { params });
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },

  // Get single jenis unit usaha
  async getById(id: number): Promise<JenisUnitUsahaResponse> {
    const response = await api.get(`/master-data/jenis-unit-usaha/${id}`);
    return response.data;
  },

  // Create new jenis unit usaha
  async create(data: JenisUnitUsahaFormData): Promise<JenisUnitUsahaResponse> {
    const response = await api.post('/master-data/jenis-unit-usaha', data);
    return response.data;
  },

  // Update jenis unit usaha
  async update(id: number, data: Partial<JenisUnitUsahaFormData>): Promise<JenisUnitUsahaResponse> {
    const response = await api.put(`/master-data/jenis-unit-usaha/${id}`, data);
    return response.data;
  },

  // Delete jenis unit usaha
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/master-data/jenis-unit-usaha/${id}`);
    return response.data;
  },

  // Get all jenis unit usaha for dropdown
  async getAllForDropdown(): Promise<JenisUnitUsahaDropdownResponse> {
    try {
      const response = await api.get('/master-data/jenis-unit-usaha/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching jenis unit usaha dropdown:', error);
      return {
        success: false,
        message: 'Failed to fetch jenis unit usaha data',
        data: []
      };
    }
  }
};

export default jenisUnitUsahaService;
