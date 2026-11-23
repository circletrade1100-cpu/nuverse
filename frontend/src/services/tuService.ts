import { apiMethods, handleApiError } from './api';
import type { PaginatedResponse } from './api';
import { AxiosError } from 'axios';

// TU Dashboard Types
export interface TUDashboardData {
  income: {
    today: number;
    monthly: number;
  };
  expense: {
    today: number;
    monthly: number;
  };
  cash_balance: number;
  pending_approvals: number;
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
}

// Transaction Types
export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  type: 'income' | 'expense';
  title: string;
  description?: string;
  amount: number;
  transaction_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: number;
  approved_at?: string;
  approval_notes?: string;
  receipt_file?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
    code: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
  };
  approved_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  /** Relasi approver (nama key bisa bervariasi tergantung serialisasi API) */
  approvedBy?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface TransactionFormData {
  category_id: number;
  title: string;
  description?: string;
  amount: number;
  transaction_date: string;
  receipt_file?: File;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  category_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  period?: 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  unit_id?: string;
  start_date?: string;
  end_date?: string;
  month?: string;
  category?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  code: string;
  type: 'income' | 'expense';
  description?: string;
  is_active: boolean;
  icon?: string;
  color?: string;
}

// Attendance Types
export interface AttendanceLog {
  id: number;
  user_id: number;
  check_in?: string;
  check_out?: string;
  location?: string;
  ip_address?: string;
  status: 'present' | 'late' | 'absent' | 'sick' | 'leave';
  notes?: string;
  work_hours?: number;
  is_overtime: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  sick_days: number;
  leave_days: number;
  total_work_hours: number;
  average_work_hours: number;
}

export interface MyAttendanceResponse {
  attendances: AttendanceLog[];
  statistics: AttendanceStats;
  today_attendance?: AttendanceLog;
  can_check_in: boolean;
  can_check_out: boolean;
  period: string;
}

// SPP Reminder Types
export interface SPPReminder {
  id: number;
  student_name: string;
  class: string;
  student_number?: string;
  bill_type: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  period_month?: number;
  period_year?: number;
  status: string;
  days_overdue?: number;
  months_overdue?: number;
  days_until_due?: number;
  parent_contact?: string;
  reminder_type: 'overdue' | 'upcoming' | 'future';
  created_at?: string;
  updated_at?: string;
}

// Summary Types
export interface CashflowSummary {
  period: string;
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  income_by_category: Array<{
    name: string;
    color?: string;
    total: number;
  }>;
  expense_by_category: Array<{
    name: string;
    color?: string;
    total: number;
  }>;
}

class TUService {
  /**
   * Get TU Dashboard summary
   */
  async getDashboard(): Promise<TUDashboardData> {
    try {
      return await apiMethods.get<TUDashboardData>('/tu/dashboard');
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get income summary
   */
  async getIncomeSummary(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<{
    transactions: Transaction[];
    total: number;
    by_category: Array<{ category: string; total: number; count: number }>;
    period: string;
  }> {
    try {
      return await apiMethods.get('/tu/income-summary', { period });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<{
    transactions: Transaction[];
    total: number;
    by_category: Array<{ category: string; total: number; count: number }>;
    period: string;
  }> {
    try {
      return await apiMethods.get('/tu/expense-summary', { period });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get SPP reminders
   */
  async getSPPReminders(filters: { dateFrom?: string; dateTo?: string; page?: number; perPage?: number } = {}): Promise<{data: SPPReminder[], pagination: any}> {
    try {
      const params: Record<string, any> = {};
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      if (filters.page) params.page = filters.page.toString();
      if (filters.perPage) params.per_page = filters.perPage.toString();
      
      return await apiMethods.get('/tu/spp-reminders', params);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get approval notifications (pending transactions)
   */
  async getApprovalNotifications(): Promise<Transaction[]> {
    try {
      return await apiMethods.get<Transaction[]>('/tu/approval-notifications');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get approval notifications');
    }
  }

  /**
   * Get attendance status
   */
  async getAttendanceStatus(): Promise<{
    total_present: number;
    total_late: number;
    total_absent: number;
    attendance_list: AttendanceLog[];
  }> {
    try {
      return await apiMethods.get('/tu/attendance-status');
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  // === CASHFLOW MANAGEMENT ===

  /**
   * Get income transactions
   */
  async getIncomeTransactions(filters: TransactionFilters = {}, page = 1, perPage = 15): Promise<PaginatedResponse<Transaction>> {
    try {
      const params: Record<string, any> = {
        ...filters,
        page: page.toString(),
        per_page: perPage.toString()
      };
      
      return await apiMethods.get<PaginatedResponse<Transaction>>('/tu/cashflow/income', params);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Create income transaction
   */
  async createIncomeTransaction(transactionData: TransactionFormData): Promise<Transaction> {
    try {
      if (transactionData.receipt_file) {
        // Handle FormData for file uploads
        const formData = new FormData();
        Object.entries(transactionData).forEach(([key, value]) => {
          if (key === 'receipt_file' && value instanceof File) {
            formData.append(key, value);
          } else if (key === 'metadata' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        });
        
        return await apiMethods.upload<Transaction>('/tu/cashflow/income', formData);
      } else {
        return await apiMethods.post<Transaction>('/tu/cashflow/income', transactionData);
      }
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get expense transactions
   */
  async getExpenseTransactions(filters: TransactionFilters = {}, page = 1, perPage = 15): Promise<PaginatedResponse<Transaction>> {
    try {
      const params: Record<string, any> = {
        ...filters,
        page: page.toString(),
        per_page: perPage.toString()
      };
      
      return await apiMethods.get<PaginatedResponse<Transaction>>('/tu/cashflow/expense', params);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Create expense transaction
   */
  async createExpenseTransaction(transactionData: TransactionFormData): Promise<Transaction> {
    try {
      console.log('📤 createExpenseTransaction called with:', transactionData);
      
      if (transactionData.receipt_file) {
        // Handle FormData for file uploads
        const formData = new FormData();
        Object.entries(transactionData).forEach(([key, value]) => {
          if (key === 'receipt_file' && value instanceof File) {
            formData.append(key, value);
            console.log(`  ✓ Added file: ${value.name}`);
          } else if (key === 'metadata' && typeof value === 'object' && value !== null) {
            const metadataStr = JSON.stringify(value);
            formData.append(key, metadataStr);
            console.log(`  ✓ Added metadata:`, value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
            console.log(`  ✓ Added ${key}: ${value}`);
          }
        });
        
        console.log('📤 Sending FormData to /tu/cashflow/expense');
        const result = await apiMethods.upload<Transaction>('/tu/cashflow/expense', formData);
        console.log('✅ Response received:', result);
        return result;
      } else {
        // No file upload - send as JSON
        const jsonData = {
          ...transactionData,
          metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : undefined
        };
        console.log('📤 Sending JSON to /tu/cashflow/expense:', jsonData);
        const result = await apiMethods.post<Transaction>('/tu/cashflow/expense', jsonData);
        console.log('✅ Response received:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Error in createExpenseTransaction:', error);
      if (error instanceof AxiosError) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get cashflow summary
   */
  async getCashflowSummary(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<CashflowSummary> {
    try {
      return await apiMethods.get<CashflowSummary>('/tu/cashflow/summary', { period });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Approve transaction
   */
  async approveTransaction(id: number, approvalNotes?: string): Promise<Transaction> {
    try {
      return await apiMethods.put<Transaction>(`/tu/cashflow/transactions/${id}/approve`, {
        approval_notes: approvalNotes,
      });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Reject transaction
   */
  async rejectTransaction(id: number, approvalNotes: string): Promise<Transaction> {
    try {
      return await apiMethods.put<Transaction>(`/tu/cashflow/transactions/${id}/reject`, {
        approval_notes: approvalNotes,
      });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(id: number, transactionData: TransactionFormData): Promise<Transaction> {
    try {
      console.log('📤 updateTransaction called', { id, transactionData });
      
      if (transactionData.receipt_file) {
        // Handle FormData for file uploads
        const formData = new FormData();
        Object.entries(transactionData).forEach(([key, value]) => {
          if (key === 'receipt_file' && value instanceof File) {
            formData.append(key, value);
            console.log(`  ✓ Added file: ${value.name}`);
          } else if (key === 'metadata' && typeof value === 'object' && value !== null) {
            const metadataStr = JSON.stringify(value);
            formData.append(key, metadataStr);
            console.log(`  ✓ Added metadata:`, value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
            console.log(`  ✓ Added ${key}: ${value}`);
          }
        });
        
        console.log(`📤 Sending FormData PUT to /tu/cashflow/transactions/${id}`);
        const result = await apiMethods.upload<Transaction>(`/tu/cashflow/transactions/${id}`, formData, 'put');
        console.log('✅ Response received:', result);
        return result;
      } else {
        // No file upload - send as JSON
        const jsonData = {
          ...transactionData,
          metadata: transactionData.metadata ? JSON.stringify(transactionData.metadata) : undefined
        };
        console.log(`📤 Sending JSON PUT to /tu/cashflow/transactions/${id}:`, jsonData);
        const result = await apiMethods.put<Transaction>(`/tu/cashflow/transactions/${id}`, jsonData);
        console.log('✅ Response received:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Error in updateTransaction:', error);
      if (error instanceof AxiosError) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        if (error.response?.status === 404) {
          throw new Error('Transaction not found');
        }
      }
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log('🗑️ deleteTransaction called', { id });
      await apiMethods.delete<void>(`/tu/cashflow/transactions/${id}`);
      console.log('✅ Transaction deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteTransaction:', error);
      if (error instanceof AxiosError) {
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  // === ATTENDANCE MANAGEMENT ===

  /**
   * Get attendance logs
   */
  async getAttendanceLogs(filters: {
    user_id?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  } = {}, page = 1, perPage = 15): Promise<PaginatedResponse<AttendanceLog>> {
    try {
      const params: Record<string, any> = {
        ...filters,
        page: page.toString(),
        per_page: perPage.toString()
      };
      
      return await apiMethods.get<PaginatedResponse<AttendanceLog>>('/tu/attendance', params);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Check in attendance
   */
  async checkIn(location?: string, notes?: string): Promise<AttendanceLog> {
    try {
      return await apiMethods.post<AttendanceLog>('/tu/attendance/check-in', {
        location,
        notes,
      });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Check out attendance
   */
  async checkOut(notes?: string): Promise<AttendanceLog> {
    try {
      return await apiMethods.post<AttendanceLog>('/tu/attendance/check-out', {
        notes,
      });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get attendance report
   */
  async getAttendanceReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    userId?: number
  ): Promise<{
    attendances: AttendanceLog[];
    statistics: AttendanceStats;
    period: string;
  }> {
    try {
      const params: any = { period };
      if (userId) params.user_id = userId;
      
      return await apiMethods.get('/tu/attendance/report', params);
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  /**
   * Get my attendance
   */
  async getMyAttendance(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<MyAttendanceResponse> {
    try {
      return await apiMethods.get<MyAttendanceResponse>('/tu/attendance/my-attendance', { period });
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  }

  // === REPORT METHODS ===

  /**
   * Get report data for ReportTU
   */
  async getReportData(filters: {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    unit_id?: string;
    start_date?: string;
    end_date?: string;
    category?: string;
  } = {}): Promise<{
    totals: {
      total_income: number;
      total_expense: number;
      net_balance: number;
      current_balance: number;
    };
    chart_data: Array<{
      period: string;
      pemasukan: number;
      pengeluaran: number;
      saldo: number;
    }>;
    transactions: Array<{
      id: number;
      tanggal: string;
      kategori: string;
      deskripsi: string;
      pemasukan: number;
      pengeluaran: number;
      unit: string;
      unit_sekolah_id?: number | null;
      status: string;
      dibayar_oleh: string;
        payment_method?: string | null;
        payment_method_label?: string | null;
    }>;
  }> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching report data with filters:', filters);

      // Use the new dedicated report endpoint
      const response = await apiMethods.get<{
        totals: {
          total_income: number;
          total_expense: number;
          net_balance: number;
          current_balance: number;
        };
        chart_data: Array<{
          period: string;
          pemasukan: number;
          pengeluaran: number;
          saldo: number;
        }>;
        transactions: Array<{
          id: number;
          tanggal: string;
          jam_dibuat?: string | null;
          created_at_full?: string | null;
          kategori: string;
          deskripsi: string;
          pemasukan: number;
          pengeluaran: number;
          unit: string;
          unit_sekolah_id?: number | null;
          status: string;
          dibayar_oleh: string;
          nomor_kwitansi?: string | null;
          kelas_siswa?: string | null;
          payment_method?: string | null;
          payment_method_label?: string | null;
          metode_pembayaran?: string | null;
          metode_pembayaran_label?: string | null;
        }>;
      }>('/tu/report-data', filters);

      console.log('Report data received from API:', response);
      return response;
    } catch (error) {
      console.error('Error getting report data:', error);
      throw new Error(handleApiError(error as AxiosError));
    }
  }


  // === HELPER METHODS ===

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  /**
   * Format datetime for display
   */
  formatDateTime(datetime: string): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(datetime));
  }
}

export const tuService = new TUService();
export default tuService;
