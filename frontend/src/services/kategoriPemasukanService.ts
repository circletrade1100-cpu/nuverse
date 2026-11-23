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
  }
  return config;
});

// Types
export interface KategoriPemasukan {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KategoriPemasukanFormData {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

// API Response interface
interface ApiKategoriPemasukan {
  id: number;
  name: string;
  code: string;
  type: 'income';
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KategoriPemasukanListResponse {
  success: boolean;
  data: ApiKategoriPemasukan[];
}

export interface KategoriPemasukanResponse {
  success: boolean;
  data: ApiKategoriPemasukan;
  message?: string;
}

// Helper function to convert API data to frontend format
const convertApiToFrontend = (apiData: ApiKategoriPemasukan): KategoriPemasukan => ({
  id: apiData.id.toString(),
  name: apiData.name,
  code: apiData.code,
  description: apiData.description,
  icon: apiData.icon,
  color: apiData.color,
  is_active: apiData.is_active,
  created_at: apiData.created_at,
  updated_at: apiData.updated_at
});

export const kategoriPemasukanService = {
  // Get all kategori pemasukan
  async getAll(): Promise<{ success: boolean; data: KategoriPemasukan[]; }> {
    const response = await api.get('/master-data/kategori-pemasukan');
    const apiResponse: KategoriPemasukanListResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: apiResponse.data.map(convertApiToFrontend)
    };
  },

  // Get single kategori pemasukan
  async getById(id: string): Promise<{ success: boolean; data: KategoriPemasukan; message?: string; }> {
    const response = await api.get(`/master-data/kategori-pemasukan/${id}`);
    const apiResponse: KategoriPemasukanResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Create new kategori pemasukan
  async create(data: KategoriPemasukanFormData): Promise<{ success: boolean; data: KategoriPemasukan; message?: string; }> {
    const response = await api.post('/master-data/kategori-pemasukan', data);
    const apiResponse: KategoriPemasukanResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Update kategori pemasukan
  async update(id: string, data: KategoriPemasukanFormData): Promise<{ success: boolean; data: KategoriPemasukan; message?: string; }> {
    const response = await api.put(`/master-data/kategori-pemasukan/${id}`, data);
    const apiResponse: KategoriPemasukanResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Delete kategori pemasukan
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/master-data/kategori-pemasukan/${id}`);
    return response.data;
  }
};

export default kategoriPemasukanService;
