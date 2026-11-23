import { api } from './api';

// Business Unit Types
export interface BusinessUnit {
  id: number;
  name: string;
  type: 'catering' | 'swimming_pool' | 'canteen' | 'other';
  manager_id?: number;
  status: 'active' | 'inactive';
  description?: string;
  monthly_budget?: number;
  created_at: string;
  updated_at: string;
  manager?: {
    id: number;
    name: string;
    email: string;
  };
  type_label?: string;
  status_label?: string;
  total_income?: number;
  total_expense?: number;
  net_profit?: number;
  profit_margin?: number;
}

export interface BusinessUnitFormData {
  name: string;
  type: 'catering' | 'swimming_pool' | 'canteen' | 'other';
  manager_id?: number;
  status: 'active' | 'inactive';
  description?: string;
  monthly_budget?: number;
}

// Form data interface for UI (with Indonesian status)
export interface BusinessUnitFormDataUI {
  name: string;
  type: 'catering' | 'swimming_pool' | 'canteen' | 'other';
  manager_id?: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
  monthly_budget?: number;
}

// Transaction Types
export interface BusinessTransaction {
  id: number;
  business_unit_id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  payment_method: 'cash' | 'transfer' | 'card';
  reference_number?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  business_unit?: BusinessUnit;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  approver?: {
    id: number;
    name: string;
    email: string;
  };
  transaction_type_label?: string;
  payment_method_label?: string;
  status_label?: string;
  status_color?: string;
}

export interface BusinessTransactionFormData {
  business_unit_id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  payment_method: 'cash' | 'transfer' | 'card';
  reference_number?: string;
  notes?: string;
}

// Dashboard Types
export interface DanusDashboard {
  summary: {
    total_income: number;
    total_expense: number;
    net_profit: number;
    profit_margin: number;
    pending_approvals: number;
    active_units: number;
  };
  unit_performance: Array<{
    id: number;
    name: string;
    type: string;
    total_income: number;
    total_expense: number;
    net_profit: number;
    profit_margin: number;
    transaction_count: number;
  }>;
  recent_transactions: BusinessTransaction[];
  monthly_trend: Array<{
    month: string;
    month_label: string;
    income: number;
    expense: number;
  }>;
}

export interface ProfitLossReport {
  summary: {
    total_income: number;
    total_expense: number;
    net_profit: number;
    profit_margin: number;
  };
  income_breakdown: Array<{
    unit_name: string;
    amount: number;
  }>;
  expense_breakdown: Array<{
    unit_name: string;
    amount: number;
  }>;
}

export interface UnitPerformanceReport {
  id: number;
  name: string;
  type: string;
  manager: string;
  status: string;
  monthly_budget?: number;
  total_income: number;
  total_expense: number;
  net_profit: number;
  profit_margin: number;
  budget_utilization: number;
  transaction_count: number;
  efficiency_score: number;
}

// API Service Class
class DanusService {
  // Business Units
  async getBusinessUnits(params?: {
    search?: string;
    type?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }) {
    console.log('🔄 DanusService.getBusinessUnits called with params:', params);
    console.log('🔑 API base URL:', api.defaults.baseURL);
    console.log('🔑 API headers:', api.defaults.headers);
    
    try {
      const response = await api.get('/danus/business-units', { params });
      console.log('📡 Raw API response:', response);
      console.log('📡 Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ DanusService API error:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  }

  async getBusinessUnit(id: number) {
    const response = await api.get(`/danus/business-units/${id}`);
    return response.data;
  }

  async createBusinessUnit(data: BusinessUnitFormData) {
    const response = await api.post('/danus/business-units', data);
    return response.data;
  }

  async updateBusinessUnit(id: number, data: Partial<BusinessUnitFormData>) {
    const response = await api.put(`/danus/business-units/${id}`, data);
    return response.data;
  }

  async deleteBusinessUnit(id: number) {
    const response = await api.delete(`/danus/business-units/${id}`);
    return response.data;
  }

  async getBusinessUnitPerformance(id: number, params?: {
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get(`/danus/business-units/${id}/performance`, { params });
    return response.data;
  }

  async getManagers() {
    try {
      const response = await api.get('/danus/danus-managers');
      return response.data;
    } catch (error) {
      console.error('Error fetching managers data:', error);
      return { success: false, data: [] };
    }
  }

  async getBusinessUnitTypes() {
    try {
      const response = await api.get('/danus/danus-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching types data:', error);
      return { success: false, data: [] };
    }
  }

  // Business Transactions
  async getTransactions(params?: {
    search?: string;
    business_unit_id?: number;
    transaction_type?: 'income' | 'expense';
    status?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/danus/transactions', { params });
    return response.data;
  }

  async getTransaction(id: number) {
    const response = await api.get(`/danus/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: BusinessTransactionFormData) {
    const response = await api.post('/danus/transactions', data);
    return response.data;
  }

  async updateTransaction(id: number, data: Partial<BusinessTransactionFormData>) {
    const response = await api.put(`/danus/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number) {
    const response = await api.delete(`/danus/transactions/${id}`);
    return response.data;
  }

  async approveTransaction(id: number) {
    const response = await api.put(`/danus/transactions/${id}/approve`);
    return response.data;
  }

  async rejectTransaction(id: number, notes: string) {
    const response = await api.put(`/danus/transactions/${id}/reject`, { notes });
    return response.data;
  }

  async completeTransaction(id: number) {
    const response = await api.put(`/danus/transactions/${id}/complete`);
    return response.data;
  }

  async getIncomeTransactions(params?: {
    business_unit_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/danus/transactions/income', { params });
    return response.data;
  }

  async getExpenseTransactions(params?: {
    business_unit_id?: number;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/danus/transactions/expense', { params });
    return response.data;
  }

  async getPendingTransactions(params?: {
    business_unit_id?: number;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/danus/transactions/pending', { params });
    return response.data;
  }

  // Dashboard & Reports
  async getDashboard(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: DanusDashboard }> {
    try {
      const response = await api.get('/danus/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        data: {
          summary: {
            total_income: 0,
            total_expense: 0,
            net_profit: 0,
            profit_margin: 0,
            pending_approvals: 0,
            active_units: 0
          },
          recent_transactions: [],
          unit_performance: [],
          monthly_trend: [],
          trends: {
            income: { value: 0, isPositive: true },
            expense: { value: 0, isPositive: false },
            profit: { value: 0, isPositive: true }
          },
          income_breakdown: [],
          expense_breakdown: []
        }
      };
    }
  }

  async getProfitLossReport(params?: {
    start_date?: string;
    end_date?: string;
    business_unit_id?: number;
  }): Promise<{ success: boolean; data: ProfitLossReport }> {
    try {
      const response = await api.get('/danus/profit-loss', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching profit loss data:', error);
      return {
        success: false,
        data: {
          summary: {
            total_income: 0,
            total_expense: 0,
            net_profit: 0,
            profit_margin: 0
          },
          income_breakdown: [],
          expense_breakdown: []
        }
      };
    }
  }

  async getUnitPerformanceReport(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: UnitPerformanceReport[] }> {
    try {
      const response = await api.get('/danus/unit-performance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching unit performance data:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  async getSummary(params?: {
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/danus/summary', { params });
    return response.data;
  }
}

// Export service instance
export const danusService = new DanusService();

// Re-export types for external use
export type {
  BusinessUnit,
  BusinessUnitFormData,
  BusinessTransaction,
  BusinessTransactionFormData,
  DanusDashboard,
  ProfitLossReport,
  UnitPerformanceReport,
};
