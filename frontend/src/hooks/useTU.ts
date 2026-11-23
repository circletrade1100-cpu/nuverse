import { useState, useEffect, useCallback } from 'react';
import { tuService } from '../services/tuService';
import type { TUDashboardData, Transaction, TransactionFormData, AttendanceLog, MyAttendanceResponse, SPPReminder } from '../services/tuService';
import type { PaginatedResponse } from '../services/api';
import toast from 'react-hot-toast';

// Dashboard hook
export const useTUDashboard = () => {
  const [dashboardData, setDashboardData] = useState<TUDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tuService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard: fetchDashboard,
  };
};

// Transactions hook
export const useTransactions = (type: 'income' | 'expense') => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });
  const [filters, setFilters] = useState<any>({});

  const fetchTransactions = useCallback(async (page = 1, currentFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: PaginatedResponse<Transaction> = type === 'income' 
        ? await tuService.getIncomeTransactions(currentFilters, page, pagination.perPage)
        : await tuService.getExpenseTransactions(currentFilters, page, pagination.perPage);
      
      console.log(`📥 ${type} transactions API response:`, response);
      
      // apiMethods.get already unwraps response.data.data, so response is PaginatedResponse
      // Structure: { data: Transaction[], current_page, last_page, per_page, total }
      const transactionsData: Transaction[] = Array.isArray(response.data) ? response.data : [];
      const paginationData = {
        currentPage: response.current_page || 1,
        lastPage: response.last_page || 1,
        perPage: response.per_page || pagination.perPage,
        total: response.total || 0,
      };
      
      console.log(`✅ Parsed ${type} transactions:`, transactionsData.length, 'pagination:', paginationData);
      
      setTransactions(transactionsData);
      setPagination(paginationData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat transaksi';
      console.error(`❌ Error fetching ${type} transactions:`, err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [type, filters, pagination.perPage]);

  useEffect(() => {
    fetchTransactions(1, filters);
  }, []);

  useEffect(() => {
    fetchTransactions(1, filters);
  }, [filters]);

  const setPage = useCallback((page: number) => {
    fetchTransactions(page, filters);
  }, [fetchTransactions, filters]);

  const refreshTransactions = useCallback(
    async (options?: { resetToFirstPage?: boolean }) => {
      const page = options?.resetToFirstPage ? 1 : pagination.currentPage;
      await fetchTransactions(page, filters);
    },
    [fetchTransactions, pagination.currentPage, filters]
  );

  const createTransaction = useCallback(async (transactionData: TransactionFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (type === 'income') {
        await tuService.createIncomeTransaction(transactionData);
      } else {
        await tuService.createExpenseTransaction(transactionData);
      }
      toast.success(`Transaksi ${type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil dibuat`);
      await refreshTransactions({ resetToFirstPage: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat transaksi';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [type, refreshTransactions]);

  const approveTransaction = useCallback(async (id: number, notes?: string): Promise<boolean> => {
    try {
      await tuService.approveTransaction(id, notes);
      toast.success('Transaksi berhasil disetujui');
      await refreshTransactions({ resetToFirstPage: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyetujui transaksi';
      toast.error(errorMessage);
      return false;
    }
  }, [refreshTransactions]);

  const rejectTransaction = useCallback(async (id: number, notes: string): Promise<boolean> => {
    try {
      await tuService.rejectTransaction(id, notes);
      toast.success('Transaksi berhasil ditolak');
      await refreshTransactions({ resetToFirstPage: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menolak transaksi';
      toast.error(errorMessage);
      return false;
    }
  }, [refreshTransactions]);

  const updateTransaction = useCallback(async (id: number, data: TransactionFormData): Promise<boolean> => {
    try {
      await tuService.updateTransaction(id, data);
      toast.success('Transaksi berhasil diupdate');
      await refreshTransactions({ resetToFirstPage: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate transaksi';
      toast.error(errorMessage);
      return false;
    }
  }, [refreshTransactions]);

  const deleteTransaction = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tuService.deleteTransaction(id);
      toast.success('Transaksi berhasil dihapus');
      await refreshTransactions({ resetToFirstPage: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus transaksi';
      toast.error(errorMessage);
      return false;
    }
  }, [refreshTransactions]);

  return {
    transactions,
    isLoading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    refreshTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    approveTransaction,
    rejectTransaction,
  };
};

// Attendance hook
export const useAttendance = () => {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [myAttendance, setMyAttendance] = useState<MyAttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyAttendance = useCallback(async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tuService.getMyAttendance(period);
      setMyAttendance(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data absensi';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (location?: string, notes?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await tuService.checkIn(location, notes);
      toast.success('Check-in berhasil');
      await fetchMyAttendance();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal check-in';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyAttendance]);

  const checkOut = useCallback(async (notes?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await tuService.checkOut(notes);
      toast.success('Check-out berhasil');
      await fetchMyAttendance();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal check-out';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyAttendance]);

  const fetchAttendanceReport = useCallback(async (
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    userId?: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tuService.getAttendanceReport(period, userId);
      setAttendanceLogs(data.attendances);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat laporan absensi';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    attendanceLogs,
    myAttendance,
    isLoading,
    error,
    fetchMyAttendance,
    checkIn,
    checkOut,
    fetchAttendanceReport,
  };
};

// Cashflow summary hook
export const useCashflowSummary = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (currentPeriod = period) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tuService.getCashflowSummary(currentPeriod);
      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat ringkasan cashflow';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refreshSummary: fetchSummary,
  };
};

// SPP Reminders hook
export const useSPPReminders = () => {
  const [reminders, setReminders] = useState<SPPReminder[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = useCallback(async (filters: { dateFrom?: string; dateTo?: string; page?: number; perPage?: number } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await tuService.getSPPReminders(filters);
      setReminders(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat reminder SPP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    pagination,
    isLoading,
    error,
    refreshReminders: fetchReminders,
  };
};

// Approval notifications hook
export const useApprovalNotifications = () => {
  const [notifications, setNotifications] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tuService.getApprovalNotifications();
      setNotifications(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat notifikasi approval';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refreshNotifications: fetchNotifications,
  };
};
