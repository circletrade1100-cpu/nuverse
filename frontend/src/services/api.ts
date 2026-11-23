import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Base API configuration - use production URL for both dev and prod
const API_BASE_URL = 'https://nurverse.id/api';

// Export API_BASE_URL for use in other services
export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Token management
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem('auth_token'),
  
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },
  
  hasToken: (): boolean => !!localStorage.getItem('auth_token'),
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    console.log('🔑 Token check:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      url: config.url,
      method: config.method?.toUpperCase()
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request headers');
    } else {
      console.warn('⚠️ No token found for request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // TEMPORARILY DISABLED - preventing auto redirect during migration to PHP endpoints
    // if (error.response?.status === 401) {
    //   // Token expired or invalid
    //   tokenManager.removeToken();
    //   window.location.href = '/login';
    // }
    console.warn('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const apiError = error.response.data as ApiResponse;
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.errors) {
      // Return first validation error
      const firstError = Object.values(apiError.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : 'Validation error';
    }
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Generic API methods
export const apiMethods = {
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await api.get<ApiResponse<T>>(url, { params });
    return response.data.data as T;
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await api.put<ApiResponse<T>>(url, data);
    return response.data.data as T;
  },

  async delete<T>(url: string): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data.data as T;
  },

  async upload<T>(url: string, formData: FormData, method: 'post' | 'put' = 'post'): Promise<T> {
    const response = method === 'put' 
      ? await api.put<ApiResponse<T>>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      : await api.post<ApiResponse<T>>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    return response.data.data as T;
  },
};

// Helper for authenticated PHP endpoint calls
export const phpApiMethods = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token');
    }

    const url = new URL(`https://nurverse.id/api${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    console.log('🔄 PHP API Call:', url.toString());
    console.log('🔑 Using token:', token.substring(0, 20) + '...');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'API request failed');
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      console.error('❌ API Response not successful:', responseData);
      throw new Error(responseData.message || 'API request failed');
    }
    
    console.log('✅ API Success:', responseData);
    return responseData.data;
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`https://nurverse.id/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      const error = new Error(responseData.message || 'API request failed') as Error & {
        status?: number;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      if (responseData.errors) {
        error.errors = responseData.errors;
      }
      throw error;
    }
    
    return responseData.data;
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`https://nurverse.id/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      const error = new Error(responseData.message || 'API request failed') as Error & {
        status?: number;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      if (responseData.errors) {
        error.errors = responseData.errors;
      }
      throw error;
    }
    
    return responseData.data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`https://nurverse.id/api${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      const error = new Error(responseData.message || 'API request failed') as Error & {
        status?: number;
        errors?: Record<string, string[]>;
      };
      error.status = response.status;
      if (responseData.errors) {
        error.errors = responseData.errors;
      }
      throw error;
    }
    
    return responseData.data;
  }
};

export default api;
