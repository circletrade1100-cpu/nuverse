import api from './api';

// ==================== CHART OF ACCOUNTS ====================

export interface ChartOfAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id?: number;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
}

export interface ChartOfAccountsParams {
  page?: number;
  per_page?: number;
  account_type?: string;
  is_active?: boolean;
  search?: string;
}

export const getChartOfAccounts = async (params?: ChartOfAccountsParams) => {
  const response = await api.get('/accounting/chart-of-accounts', { params });
  return response.data;
};

export const getChartOfAccount = async (id: number) => {
  const response = await api.get(`/accounting/chart-of-accounts/${id}`);
  return response.data;
};

export const createChartOfAccount = async (data: Partial<ChartOfAccount>) => {
  const response = await api.post('/accounting/chart-of-accounts', data);
  return response.data;
};

export const updateChartOfAccount = async (id: number, data: Partial<ChartOfAccount>) => {
  const response = await api.put(`/accounting/chart-of-accounts/${id}`, data);
  return response.data;
};

export const deleteChartOfAccount = async (id: number) => {
  const response = await api.delete(`/accounting/chart-of-accounts/${id}`);
  return response.data;
};

// ==================== JOURNAL ENTRIES ====================

export interface JournalDetail {
  id?: number;
  journal_entry_id?: number;
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  account?: ChartOfAccount;
}

export interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  reference_number?: string;
  description?: string;
  entry_type: 'automatic' | 'manual' | 'adjustment' | 'reversing';
  source_module?: string;
  source_id?: number;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'void';
  posted_by?: number;
  posted_at?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
  details?: JournalDetail[];
  creator?: any;
  poster?: any;
}

export interface JournalEntriesParams {
  page?: number;
  per_page?: number;
  status?: string;
  entry_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const getJournalEntries = async (params?: JournalEntriesParams) => {
  const response = await api.get('/accounting/journal-entries', { params });
  return response.data;
};

export const getJournalEntry = async (id: number) => {
  const response = await api.get(`/accounting/journal-entries/${id}`);
  return response.data;
};

export const createJournalEntry = async (data: {
  entry_date: string;
  reference_number?: string;
  description?: string;
  entry_type: string;
  source_module?: string;
  source_id?: number;
  details: JournalDetail[];
}) => {
  const response = await api.post('/accounting/journal-entries', data);
  return response.data;
};

export const updateJournalEntry = async (id: number, data: Partial<JournalEntry>) => {
  const response = await api.put(`/accounting/journal-entries/${id}`, data);
  return response.data;
};

export const deleteJournalEntry = async (id: number) => {
  const response = await api.delete(`/accounting/journal-entries/${id}`);
  return response.data;
};

export const postJournalEntry = async (id: number) => {
  const response = await api.post(`/accounting/journal-entries/${id}/post`);
  return response.data;
};

export const voidJournalEntry = async (id: number) => {
  const response = await api.post(`/accounting/journal-entries/${id}/void`);
  return response.data;
};

// ==================== BANK ACCOUNTS ====================

export interface BankAccount {
  id: number;
  account_number: string;
  account_name: string;
  bank_name?: string;
  account_type: 'cash' | 'bank' | 'investment';
  currency: string;
  opening_balance: number;
  current_balance: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  transactions?: BankTransaction[];
}

export interface BankAccountsParams {
  page?: number;
  per_page?: number;
  account_type?: string;
  status?: string;
  search?: string;
}

export const getBankAccounts = async (params?: BankAccountsParams) => {
  const response = await api.get('/accounting/bank-accounts', { params });
  return response.data;
};

export const getBankAccount = async (id: number) => {
  const response = await api.get(`/accounting/bank-accounts/${id}`);
  return response.data;
};

export const createBankAccount = async (data: Partial<BankAccount>) => {
  const response = await api.post('/accounting/bank-accounts', data);
  return response.data;
};

export const updateBankAccount = async (id: number, data: Partial<BankAccount>) => {
  const response = await api.put(`/accounting/bank-accounts/${id}`, data);
  return response.data;
};

export const deleteBankAccount = async (id: number) => {
  const response = await api.delete(`/accounting/bank-accounts/${id}`);
  return response.data;
};

// ==================== BANK TRANSACTIONS ====================

export interface BankTransaction {
  id: number;
  bank_account_id: number;
  transaction_date: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'adjustment';
  reference_number?: string;
  description?: string;
  amount: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_by?: number;
  created_at: string;
  updated_at: string;
  bankAccount?: BankAccount;
  creator?: any;
}

export interface BankTransactionsParams {
  page?: number;
  per_page?: number;
  bank_account_id?: number;
  transaction_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const getBankTransactions = async (params?: BankTransactionsParams) => {
  const response = await api.get('/accounting/bank-transactions', { params });
  return response.data;
};

export const getBankTransaction = async (id: number) => {
  const response = await api.get(`/accounting/bank-transactions/${id}`);
  return response.data;
};

export const createBankTransaction = async (data: Partial<BankTransaction>) => {
  const response = await api.post('/accounting/bank-transactions', data);
  return response.data;
};

export const updateBankTransaction = async (id: number, data: Partial<BankTransaction>) => {
  const response = await api.put(`/accounting/bank-transactions/${id}`, data);
  return response.data;
};

export const deleteBankTransaction = async (id: number) => {
  const response = await api.delete(`/accounting/bank-transactions/${id}`);
  return response.data;
};

// ==================== FISCAL YEARS ====================

export interface FiscalYear {
  id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_by?: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  closedBy?: any;
}

export interface FiscalYearsParams {
  page?: number;
  per_page?: number;
  is_closed?: boolean;
}

export const getFiscalYears = async (params?: FiscalYearsParams) => {
  const response = await api.get('/accounting/fiscal-years', { params });
  return response.data;
};

export const getFiscalYear = async (id: number) => {
  const response = await api.get(`/accounting/fiscal-years/${id}`);
  return response.data;
};

export const createFiscalYear = async (data: Partial<FiscalYear>) => {
  const response = await api.post('/accounting/fiscal-years', data);
  return response.data;
};

export const updateFiscalYear = async (id: number, data: Partial<FiscalYear>) => {
  const response = await api.put(`/accounting/fiscal-years/${id}`, data);
  return response.data;
};

export const deleteFiscalYear = async (id: number) => {
  const response = await api.delete(`/accounting/fiscal-years/${id}`);
  return response.data;
};

export const closeFiscalYear = async (id: number) => {
  const response = await api.post(`/accounting/fiscal-years/${id}/close`);
  return response.data;
};

export default {
  // Chart of Accounts
  getChartOfAccounts,
  getChartOfAccount,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
  
  // Journal Entries
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  
  // Bank Accounts
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  
  // Bank Transactions
  getBankTransactions,
  getBankTransaction,
  createBankTransaction,
  updateBankTransaction,
  deleteBankTransaction,
  
  // Fiscal Years
  getFiscalYears,
  getFiscalYear,
  createFiscalYear,
  updateFiscalYear,
  deleteFiscalYear,
  closeFiscalYear,
};

