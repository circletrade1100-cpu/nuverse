import { api } from './api';
import type {
  LPJ,
  LPJDocument,
  LPJNote,
  LPJSummary,
  LPJFormData,
  LPJDashboardData,
} from '../types/lpj';

class LPJService {
  // Dashboard
  async getDashboard(params?: {
    academic_year_id?: number;
  }): Promise<{ success: boolean; data: LPJDashboardData }> {
    try {
      const response = await api.get('/lpj/dashboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching LPJ dashboard:', error);
      return {
        success: false,
        data: {
          total_lpj: 0,
          status_summary: {},
          periode_type_summary: {},
          approval_rate: 0,
          recent_lpjs: [],
          lpj_trend: [],
        },
      };
    }
  }

  // LPJ CRUD
  async getLPJs(params?: {
    search?: string;
    academic_year_id?: number;
    unit_kerja_id?: number;
    status?: string;
    periode_type?: 'semester' | 'tahunan';
    per_page?: number;
    page?: number;
  }) {
    const response = await api.get('/lpj', { params });
    return response.data;
  }

  async getLPJ(id: number) {
    const response = await api.get(`/lpj/${id}`);
    return response.data;
  }

  async createLPJ(data: LPJFormData) {
    const response = await api.post('/lpj', data);
    return response.data;
  }

  async updateLPJ(id: number, data: Partial<LPJFormData>) {
    const response = await api.put(`/lpj/${id}`, data);
    return response.data;
  }

  async deleteLPJ(id: number) {
    const response = await api.delete(`/lpj/${id}`);
    return response.data;
  }

  // Approval Workflow
  async submitLPJ(id: number) {
    const response = await api.put(`/lpj/${id}/submit`);
    return response.data;
  }

  async approveByPrincipal(id: number) {
    const response = await api.put(`/lpj/${id}/approve-by-principal`);
    return response.data;
  }

  async approveByDirpen(id: number) {
    const response = await api.put(`/lpj/${id}/approve-by-dirpen`);
    return response.data;
  }

  async approveByDirector(id: number) {
    const response = await api.put(`/lpj/${id}/approve-by-director`);
    return response.data;
  }

  async rejectLPJ(id: number, data: {
    rejection_notes: string;
    rejection_level: 'principal' | 'dirpen' | 'director';
  }) {
    const response = await api.put(`/lpj/${id}/reject`, data);
    return response.data;
  }

  async finalizeLPJ(id: number) {
    const response = await api.put(`/lpj/${id}/finalize`);
    return response.data;
  }

  // Summary
  async getSummary(id: number): Promise<{ success: boolean; data: LPJSummary }> {
    const response = await api.get(`/lpj/${id}/summary`);
    return response.data;
  }

  // Documents
  async uploadDocument(id: number, file: File, documentType: 'cover_letter' | 'legal_doc' | 'photo' | 'other') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    const response = await api.post(`/lpj/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id: number, documentId: number) {
    const response = await api.delete(`/lpj/${id}/documents/${documentId}`);
    return response.data;
  }

  // Notes
  async addNote(id: number, data: {
    note_type: 'summary' | 'issue' | 'achievement' | 'recommendation';
    title: string;
    content: string;
  }) {
    const response = await api.post(`/lpj/${id}/notes`, data);
    return response.data;
  }

  // Get available RAPBS plans for LPJ
  async getAvailablePlans(academicYearId: number) {
    try {
      const response = await api.get('/lpj/available-plans', {
        params: { academic_year_id: academicYearId }
      });
      console.log('API Response for available plans:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getAvailablePlans service:', error);
      console.error('Error response:', error?.response?.data);
      throw error;
    }
  }
}

export const lpjService = new LPJService();

