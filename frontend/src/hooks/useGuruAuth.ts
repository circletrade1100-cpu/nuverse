import { useState, useEffect, useCallback } from 'react';
import { guruAuthService, type GuruProfile } from '../services/guruAuthService';

interface UseGuruAuthReturn {
  guru: GuruProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshGuru: () => Promise<void>;
}

export const useGuruAuth = (): UseGuruAuthReturn => {
  const [guru, setGuru] = useState<GuruProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!guru;

  const refreshGuru = useCallback(async () => {
    try {
      setIsLoading(true);
      const guruData = await guruAuthService.getProfile();
      setGuru(guruData);
    } catch (error) {
      console.error('Error refreshing guru:', error);
      setGuru(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await guruAuthService.login(credentials);
      
      if (response.success && response.data) {
        setGuru(response.data.guru);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan saat login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await guruAuthService.logout();
      setGuru(null);
    } catch (error) {
      console.error('Logout error:', error);
      setGuru(null);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (guruAuthService.isAuthenticated()) {
        // Try to get guru data from localStorage first
        const storedGuru = guruAuthService.getGuruData();
        if (storedGuru) {
          setGuru(storedGuru);
          setIsLoading(false);
        } else {
          // If no stored data, fetch from API
          await refreshGuru();
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshGuru]);

  return {
    guru,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshGuru,
  };
};

