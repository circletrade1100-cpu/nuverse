import { api } from './api';
import type {
  AcademicYear,
  ActivityCategory,
  FundingSource,
  RAPBSPlan,
  BudgetBreakdown,
  RAPBSDocument,
  RAPBSRealization,
  RealizationDocument,
  ActivityNote,
  DashboardData,
  PlanFormData,
  RealizationFormData,
} from '../types/rapbs';

// API Service Class
class RAPBSService {
  // Dashboard
  async getDashboard(params?: {
    academic_year_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: DashboardData }> {
    try {
      const response = await api.get('/rapbs/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching RAPBS dashboard:', error);
      return {
        success: false,
        data: {
          budget_summary: {
            total_budget: 0,
            total_realization: 0,
            remaining_budget: 0,
            utilization_rate: 0,
          },
          funding_sources: [],
          category_breakdown: [],
        },
      };
    }
  }

  // Master Data - Academic Years
  async getAcademicYears(params?: {
    search?: string;
    status?: 'active' | 'inactive';
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/rapbs/academic-years', { params });
    return response.data;
  }

  async getAcademicYear(id: number) {
    const response = await api.get(`/rapbs/academic-years/${id}`);
    return response.data;
  }

  async createAcademicYear(data: Partial<AcademicYear>) {
    const response = await api.post('/rapbs/academic-years', data);
    return response.data;
  }

  async updateAcademicYear(id: number, data: Partial<AcademicYear>) {
    const response = await api.put(`/rapbs/academic-years/${id}`, data);
    return response.data;
  }

  async deleteAcademicYear(id: number) {
    const response = await api.delete(`/rapbs/academic-years/${id}`);
    return response.data;
  }

  // Master Data - Activity Categories
  async getActivityCategories(params?: {
    search?: string;
    budget_type?: 'income' | 'expense';
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/rapbs/activity-categories', { params });
    return response.data;
  }

  async getActivityCategory(id: number) {
    const response = await api.get(`/rapbs/activity-categories/${id}`);
    return response.data;
  }

  async createActivityCategory(data: Partial<ActivityCategory>) {
    const response = await api.post('/rapbs/activity-categories', data);
    return response.data;
  }

  async updateActivityCategory(id: number, data: Partial<ActivityCategory>) {
    const response = await api.put(`/rapbs/activity-categories/${id}`, data);
    return response.data;
  }

  async deleteActivityCategory(id: number) {
    const response = await api.delete(`/rapbs/activity-categories/${id}`);
    return response.data;
  }

  // Master Data - Funding Sources
  async getFundingSources(params?: {
    search?: string;
    type?: 'bos' | 'spp' | 'donation' | 'other';
    status?: 'active' | 'inactive';
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/rapbs/funding-sources', { params });
    return response.data;
  }

  async getFundingSource(id: number) {
    const response = await api.get(`/rapbs/funding-sources/${id}`);
    return response.data;
  }

  async createFundingSource(data: Partial<FundingSource>) {
    const response = await api.post('/rapbs/funding-sources', data);
    return response.data;
  }

  async updateFundingSource(id: number, data: Partial<FundingSource>) {
    const response = await api.put(`/rapbs/funding-sources/${id}`, data);
    return response.data;
  }

  async deleteFundingSource(id: number) {
    const response = await api.delete(`/rapbs/funding-sources/${id}`);
    return response.data;
  }

  // RAPBS Plans
  async getPlans(params?: {
    search?: string;
    academic_year_id?: number;
    activity_category_id?: number;
    funding_source_id?: number;
    status?: 'draft' | 'submitted' | 'approved' | 'rejected';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    unit_kerja_id?: number;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/rapbs/plans', { params });
    return response.data;
  }

  async getPlan(id: number) {
    const response = await api.get(`/rapbs/plans/${id}`);
    return response.data;
  }

  async createPlan(data: PlanFormData, files?: File[]) {
    if (files && files.length > 0) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      files.forEach((file) => {
        formData.append('proposal_files[]', file);
      });
      
      const response = await api.post('/rapbs/plans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.post('/rapbs/plans', data);
      return response.data;
    }
  }

  async updatePlan(id: number, data: Partial<PlanFormData>, files?: File[]) {
    if (files && files.length > 0) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      files.forEach((file) => {
        formData.append('proposal_files[]', file);
      });
      formData.append('_method', 'PUT');
      
      const response = await api.post(`/rapbs/plans/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await api.put(`/rapbs/plans/${id}`, data);
      return response.data;
    }
  }

  async deletePlan(id: number) {
    const response = await api.delete(`/rapbs/plans/${id}`);
    return response.data;
  }

  async submitPlan(id: number) {
    const response = await api.put(`/rapbs/plans/${id}/submit`);
    return response.data;
  }

  // Multi-Level Approval
  async approveByPrincipal(id: number) {
    const response = await api.put(`/rapbs/plans/${id}/approve-by-principal`);
    return response.data;
  }

  async approveByDirpen(id: number) {
    const response = await api.put(`/rapbs/plans/${id}/approve-by-dirpen`);
    return response.data;
  }

  async approveByDirector(id: number) {
    const response = await api.put(`/rapbs/plans/${id}/approve-by-director`);
    return response.data;
  }

  // Multi-Level Rejection
  async rejectByPrincipal(id: number, notes: string) {
    const response = await api.put(`/rapbs/plans/${id}/reject-by-principal`, { notes });
    return response.data;
  }

  async rejectByDirpen(id: number, notes: string) {
    const response = await api.put(`/rapbs/plans/${id}/reject-by-dirpen`, { notes });
    return response.data;
  }

  async rejectByDirector(id: number, notes: string) {
    const response = await api.put(`/rapbs/plans/${id}/reject-by-director`, { notes });
    return response.data;
  }

  // Backward compatibility (deprecated)
  async approvePlan(id: number) {
    const response = await api.put(`/rapbs/plans/${id}/approve`);
    return response.data;
  }

  async rejectPlan(id: number, notes: string) {
    const response = await api.put(`/rapbs/plans/${id}/reject`, { notes });
    return response.data;
  }

  // Budget Breakdowns
  async getBreakdown(planId: number) {
    const response = await api.get(`/rapbs/plans/${planId}/breakdown`);
    return response.data;
  }

  async createBreakdown(planId: number, data: Partial<BudgetBreakdown>) {
    const response = await api.post(`/rapbs/plans/${planId}/breakdown`, data);
    return response.data;
  }

  async updateBreakdown(planId: number, breakdownId: number, data: Partial<BudgetBreakdown>) {
    const response = await api.put(`/rapbs/plans/${planId}/breakdown/${breakdownId}`, data);
    return response.data;
  }

  async deleteBreakdown(planId: number, breakdownId: number) {
    const response = await api.delete(`/rapbs/plans/${planId}/breakdown/${breakdownId}`);
    return response.data;
  }

  // Documents
  async uploadDocument(planId: number, formData: FormData) {
    const response = await api.post(`/rapbs/plans/${planId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(planId: number, documentId: number) {
    const response = await api.delete(`/rapbs/plans/${planId}/documents/${documentId}`);
    return response.data;
  }

  async getDocuments(planId: number) {
    const response = await api.get(`/rapbs/plans/${planId}/documents`);
    return response.data;
  }

  // Realizations
  async getRealizations(params?: {
    search?: string;
    rapbs_plan_id?: number;
    start_date?: string;
    end_date?: string;
    payment_method?: 'cash' | 'transfer' | 'check';
    unit_kerja_id?: number;
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/rapbs/realizations', { params });
    return response.data;
  }

  async getRealization(id: number) {
    const response = await api.get(`/rapbs/realizations/${id}`);
    return response.data;
  }

  async createRealization(data: RealizationFormData) {
    const response = await api.post('/rapbs/realizations', data);
    return response.data;
  }

  async createRealizationWithFiles(formData: FormData) {
    const response = await api.post('/rapbs/realizations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateRealization(id: number, data: Partial<RealizationFormData>) {
    const response = await api.put(`/rapbs/realizations/${id}`, data);
    return response.data;
  }

  async deleteRealization(id: number) {
    const response = await api.delete(`/rapbs/realizations/${id}`);
    return response.data;
  }

  // Submit realization for approval
  async submitRealization(id: number) {
    const response = await api.put(`/rapbs/realizations/${id}/submit`);
    return response.data;
  }

  // Multi-Level Approval for Realizations (mengikuti alur Rencana RAPBS)
  async approveRealizationByPrincipal(id: number) {
    const response = await api.put(`/rapbs/realizations/${id}/approve-by-principal`);
    return response.data;
  }

  async approveRealizationByDirpen(id: number) {
    const response = await api.put(`/rapbs/realizations/${id}/approve-by-dirpen`);
    return response.data;
  }

  async approveRealizationByDirector(id: number) {
    const response = await api.put(`/rapbs/realizations/${id}/approve-by-director`);
    return response.data;
  }

  // Multi-Level Rejection for Realizations
  async rejectRealizationByPrincipal(id: number, notes: string) {
    const response = await api.put(`/rapbs/realizations/${id}/reject-by-principal`, { notes });
    return response.data;
  }

  async rejectRealizationByDirpen(id: number, notes: string) {
    const response = await api.put(`/rapbs/realizations/${id}/reject-by-dirpen`, { notes });
    return response.data;
  }

  async rejectRealizationByDirector(id: number, notes: string) {
    const response = await api.put(`/rapbs/realizations/${id}/reject-by-director`, { notes });
    return response.data;
  }

  // Backward compatibility (deprecated)
  async approveRealization(id: number, notes?: string) {
    const response = await api.put(`/rapbs/realizations/${id}/approve`, { notes });
    return response.data;
  }

  async rejectRealization(id: number, notes: string) {
    const response = await api.put(`/rapbs/realizations/${id}/reject`, { notes });
    return response.data;
  }

  // Realization Documents
  async uploadRealizationDocument(realizationId: number, formData: FormData) {
    const response = await api.post(`/rapbs/realizations/${realizationId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async validateRealizationDocument(realizationId: number, documentId: number, status: 'validated' | 'rejected', notes?: string) {
    const response = await api.put(`/rapbs/realizations/${realizationId}/documents/${documentId}/validate`, {
      status,
      notes,
    });
    return response.data;
  }

  async getRealizationDocuments(realizationId: number) {
    const response = await api.get(`/rapbs/realizations/${realizationId}/documents`);
    return response.data;
  }

  // Activity Notes
  async getNotes(planId: number) {
    const response = await api.get(`/rapbs/plans/${planId}/notes`);
    return response.data;
  }

  async createNote(planId: number, data: Partial<ActivityNote>) {
    const response = await api.post(`/rapbs/plans/${planId}/notes`, data);
    return response.data;
  }

  async updateNote(planId: number, noteId: number, data: Partial<ActivityNote>) {
    const response = await api.put(`/rapbs/plans/${planId}/notes/${noteId}`, data);
    return response.data;
  }

  async deleteNote(planId: number, noteId: number) {
    const response = await api.delete(`/rapbs/plans/${planId}/notes/${noteId}`);
    return response.data;
  }

  // Reports
  async getPlanReport(params?: {
    academic_year_id?: number;
    activity_category_id?: number;
    funding_source_id?: number;
    status?: string;
  }) {
    const response = await api.get('/rapbs/plans/report', { params });
    return response.data;
  }

  async getRealizationReport(params?: {
    rapbs_plan_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/rapbs/reports/realization', { params });
    return response.data;
  }

  async getRealizationSummary(params?: {
    academic_year_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/rapbs/reports/realization/summary', { params });
    return response.data;
  }

  async getPlanVsRealization(params?: {
    academic_year_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/rapbs/reports/plan-vs-realization', { params });
    return response.data;
  }

  async getVarianceAnalysis(params?: {
    academic_year_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/rapbs/reports/variance-analysis', { params });
    return response.data;
  }

  async getPerformanceReport(params?: {
    academic_year_id?: number;
  }) {
    const response = await api.get('/rapbs/reports/performance', { params });
    return response.data;
  }

  // Print
  async printPlan(id: number) {
    const response = await api.get(`/rapbs/print/plan/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async printSummary(params?: {
    academic_year_id?: number;
  }) {
    const response = await api.get('/rapbs/print/summary', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async printDetailed(params?: {
    academic_year_id?: number;
  }) {
    const response = await api.get('/rapbs/print/detailed', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

// Export service instance
export const rapbsService = new RAPBSService();

// Re-export types for external use
export type {
  AcademicYear,
  ActivityCategory,
  FundingSource,
  RAPBSPlan,
  BudgetBreakdown,
  RAPBSDocument,
  RAPBSRealization,
  RealizationDocument,
  ActivityNote,
  DashboardData,
  PlanFormData,
  RealizationFormData,
};

