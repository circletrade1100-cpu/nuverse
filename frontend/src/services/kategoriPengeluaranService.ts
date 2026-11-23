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
export interface KategoriPengeluaran {
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

export interface KategoriPengeluaranFormData {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
}

// API Response interface
interface ApiKategoriPengeluaran {
  id: number;
  name: string;
  code: string;
  type: 'expense';
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KategoriPengeluaranListResponse {
  success: boolean;
  data: ApiKategoriPengeluaran[];
}

export interface KategoriPengeluaranResponse {
  success: boolean;
  data: ApiKategoriPengeluaran;
  message?: string;
}

// Helper function to convert API data to frontend format
const convertApiToFrontend = (apiData: ApiKategoriPengeluaran): KategoriPengeluaran => ({
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

export const kategoriPengeluaranService = {
  // Get all kategori pengeluaran
  async getAll(): Promise<{ success: boolean; data: KategoriPengeluaran[]; }> {
    const response = await api.get('/master-data/kategori-pengeluaran.php');
    const apiResponse: KategoriPengeluaranListResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: apiResponse.data.map(convertApiToFrontend)
    };
  },

  // Get single kategori pengeluaran
  async getById(id: string): Promise<{ success: boolean; data: KategoriPengeluaran; message?: string; }> {
    const response = await api.get(`/master-data/kategori-pengeluaran.php?id=${id}`);
    const apiResponse: KategoriPengeluaranResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Create new kategori pengeluaran
  async create(data: KategoriPengeluaranFormData): Promise<{ success: boolean; data: KategoriPengeluaran; message?: string; }> {
    const response = await api.post('/master-data/kategori-pengeluaran.php', data);
    const apiResponse: KategoriPengeluaranResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Update kategori pengeluaran
  async update(id: string, data: KategoriPengeluaranFormData): Promise<{ success: boolean; data: KategoriPengeluaran; message?: string; }> {
    const response = await api.put(`/master-data/kategori-pengeluaran.php?id=${id}`, data);
    const apiResponse: KategoriPengeluaranResponse = response.data;
    
    return {
      success: apiResponse.success,
      data: convertApiToFrontend(apiResponse.data),
      message: apiResponse.message
    };
  },

  // Delete kategori pengeluaran
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/master-data/kategori-pengeluaran.php?id=${id}`);
    return response.data;
  }
};

export default kategoriPengeluaranService;
