import api from './api';

export interface Transaction {
  id: number;
  unit_kerja_id: number;
  funding_source_id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  transaction_date: string;
  reference_number: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  unit_kerja?: any;
  funding_source?: any;
  creator?: any;
}

export interface TeacherAttendanceDocument {
  id: number;
  teacher_id: number;
  attendance_date: string;
  document_type: 'sick_leave' | 'permit' | 'other';
  document_file: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  teacher?: any;
  approver?: any;
}

export interface ExpenseDocument {
  id: number;
  unit_kerja_id: number;
  expense_date: string;
  amount: number;
  description?: string;
  vendor_name: string;
  document_type: 'fpu' | 'receipt' | 'invoice' | 'other';
  document_file: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  unit_kerja?: any;
  approver?: any;
}

const divisiUnitService = {
  // Master Data APIs
  getDivisions: () => 
    api.get('/master-data/divisions'),
  
  getFundingSources: () => 
    api.get('/rapbs/funding-sources?per_page=100'),
  
  getTeachersList: () => 
    api.get('/master-data/guru?per_page=1000'),
  
  // Transaction APIs
  getTransactions: (params?: any) => 
    api.get('/division/transactions', { params }),
  
  getIncomeTransactions: (params?: any) => 
    api.get('/division/transactions/income', { params }),
  
  getExpenseTransactions: (params?: any) => 
    api.get('/division/transactions/expense', { params }),
  
  createTransaction: (data: Partial<Transaction>) => 
    api.post('/division/transactions', data),
  
  updateTransaction: (id: number, data: Partial<Transaction>) => 
    api.put(`/division/transactions/${id}`, data),
  
  deleteTransaction: (id: number) => 
    api.delete(`/division/transactions/${id}`),
  
  // Report APIs
  getSummary: (params?: any) => 
    api.get('/division/reports/summary', { params }),
  
  getFundingBreakdown: (params?: any) => 
    api.get('/division/reports/funding-breakdown', { params }),
  
  getExpenseAnalysis: (params?: any) => 
    api.get('/division/reports/expense-analysis', { params }),
  
  // Teacher Attendance APIs
  uploadAttendanceDocument: (formData: FormData) => 
    api.post('/division/attendance/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getAttendanceDocuments: (params?: any) => 
    api.get('/division/attendance/documents', { params }),
  
  approveAttendanceDocument: (id: number, notes?: string) => 
    api.put(`/division/attendance/documents/${id}/approve`, { notes }),
  
  rejectAttendanceDocument: (id: number, notes: string) => 
    api.put(`/division/attendance/documents/${id}/reject`, { notes }),
  
  getTeachers: (params?: any) => 
    api.get('/division/attendance/teachers', { params }),
  
  inputAttendance: (data: any) => 
    api.post('/division/attendance/input', data),
  
  getAttendanceReport: (params?: any) => 
    api.get('/division/attendance/report', { params }),
  
  // Expense Document APIs
  uploadExpenseDocument: (formData: FormData) => 
    api.post('/division/expense/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getExpenseDocuments: (params?: any) => 
    api.get('/division/expense/documents', { params }),
  
  approveExpenseDocument: (id: number, notes?: string) => 
    api.put(`/division/expense/documents/${id}/approve`, { notes }),
  
  rejectExpenseDocument: (id: number, notes: string) => 
    api.put(`/division/expense/documents/${id}/reject`, { notes }),
  
  getExpenseSummary: (params?: any) => 
    api.get('/division/expense/summary', { params }),
  
  getExpenseReport: (params?: any) => 
    api.get('/division/expense/report', { params }),
  
  inputExpense: (data: any) => 
    api.post('/division/expense/input', data),
};

export default divisiUnitService;

