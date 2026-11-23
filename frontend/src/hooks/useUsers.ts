import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import type { UserWithProfile } from '../services/userService';
import type { UserFormData, UserFilters } from '../types/user';
import type { PaginatedResponse } from '../services/api';
import toast from 'react-hot-toast';

interface UseUsersReturn {
  users: UserWithProfile[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  filters: Partial<UserFilters>;
  setFilters: (filters: Partial<UserFilters>) => void;
  setPage: (page: number) => void;
  refreshUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<UserFormData>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  uploadAvatar: (id: string, file: File) => Promise<boolean>;
}

export const useUsers = (initialPerPage = 15): UseUsersReturn => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: initialPerPage,
    total: 0,
  });
  const [filters, setFilters] = useState<Partial<UserFilters>>({});

  const fetchUsers = useCallback(async (page = 1, currentFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: PaginatedResponse<UserWithProfile> = await userService.getUsers(
        currentFilters,
        page,
        pagination.perPage
      );
      
      setUsers(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        perPage: response.per_page,
        total: response.total,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data pengguna';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.perPage]);

  // Initial load
  useEffect(() => {
    fetchUsers(1, filters);
  }, []);

  // Reload when filters change
  useEffect(() => {
    fetchUsers(1, filters);
  }, [filters]);

  const setPage = useCallback((page: number) => {
    fetchUsers(page, filters);
  }, [fetchUsers, filters]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers(pagination.currentPage, filters);
  }, [fetchUsers, pagination.currentPage, filters]);

  const handleFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const createUser = useCallback(async (userData: UserFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      await userService.createUser(userData);
      toast.success('Pengguna berhasil dibuat');
      await refreshUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat pengguna';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (id: string, userData: Partial<UserFormData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      await userService.updateUser(id, userData);
      toast.success('Pengguna berhasil diupdate');
      await refreshUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate pengguna';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsers]);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await userService.deleteUser(id);
      toast.success('Pengguna berhasil dihapus');
      await refreshUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus pengguna';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsers]);

  const uploadAvatar = useCallback(async (id: string, file: File): Promise<boolean> => {
    try {
      setIsLoading(true);
      await userService.uploadAvatar(id, file);
      toast.success('Avatar berhasil diupload');
      await refreshUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload avatar';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsers]);

  return {
    users,
    isLoading,
    error,
    pagination,
    filters,
    setFilters: handleFilters,
    setPage,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
  };
};

export default useUsers;
