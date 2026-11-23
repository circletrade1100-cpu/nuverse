import { phpApiMethods } from './api';

// Types untuk Cuti
export interface Cuti {
  id: number;
  id_guru: number;
  jenis: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi: number;
  status: 'pending' | 'approved' | 'rejected';
  alasan: string;
  tanggal_disetujui: string | null;
  pengganti: string | null;
  disetujui_oleh: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  guru?: {
    id: number;
    nama_lengkap: string;
    nip: string;
    jabatan?: {
      id: number;
      nama: string;
    };
  };
  approver?: {
    id: number;
    name: string;
  };
}

export interface CutiStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_hari: number;
}

export interface CutiFormData {
  jenis: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  pengganti?: string;
}

export interface CutiApiResponse {
  success: boolean;
  message: string;
  data: Cuti | Cuti[] | CutiStatistics | any;
  errors?: Record<string, string[]>;
}

export interface CutiPaginatedResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Cuti[];
    total: number;
    per_page: number;
    last_page: number;
  };
}

// Service functions untuk Cuti Guru
export const cutiService = {
  /**
   * Mengambil data cuti milik guru yang sedang login
   */
  async getMyCuti(params?: {
    status?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<CutiPaginatedResponse> {
    try {
      console.log('🔄 Fetching my cuti data...');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `/guru-auth/cuti/my-cuti${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await phpApiMethods.get<CutiPaginatedResponse>(url);
      
      console.log('✅ My cuti data fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching my cuti:', error);
      throw error;
    }
  },

  /**
   * Mengambil statistik cuti guru yang sedang login
   */
  async getStatistics(year?: number): Promise<CutiStatistics> {
    try {
      console.log('🔄 Fetching cuti statistics...');
      
      const queryParams = year ? `?year=${year}` : '';
      const response = await phpApiMethods.get<CutiStatistics>(
        `/guru-auth/cuti/statistics${queryParams}`
      );
      
      console.log('✅ Cuti statistics fetched successfully:', response);
      return response; // phpApiMethods.get sudah return response.data
    } catch (error) {
      console.error('❌ Error fetching cuti statistics:', error);
      throw error;
    }
  },

  /**
   * Mengambil semua data cuti dengan filter
   */
  async getAllCuti(params?: {
    status?: string;
    id_guru?: number;
    jenis?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<CutiPaginatedResponse> {
    try {
      console.log('🔄 Fetching all cuti data...');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.id_guru) queryParams.append('id_guru', params.id_guru.toString());
      if (params?.jenis) queryParams.append('jenis', params.jenis);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `/guru-auth/cuti${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await phpApiMethods.get<CutiPaginatedResponse>(url);
      
      console.log('✅ All cuti data fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching all cuti:', error);
      throw error;
    }
  },

  /**
   * Mengambil detail data cuti berdasarkan ID
   */
  async getCutiById(id: number): Promise<Cuti> {
    try {
      console.log(`🔄 Fetching cuti detail for ID: ${id}`);
      
      const response = await phpApiMethods.get<Cuti>(
        `/guru-auth/cuti/${id}`
      );
      
      console.log('✅ Cuti detail fetched successfully:', response);
      return response; // phpApiMethods.get sudah return response.data
    } catch (error) {
      console.error('❌ Error fetching cuti detail:', error);
      throw error;
    }
  },

  /**
   * Membuat pengajuan cuti baru
   */
  async createCuti(cutiData: CutiFormData): Promise<Cuti> {
    try {
      console.log('🔄 Creating new cuti request...', cutiData);
      
      const response = await phpApiMethods.post<Cuti>(
        '/guru-auth/cuti',
        cutiData
      );
      
      console.log('✅ Cuti created successfully:', response);
      return response; // phpApiMethods.post sudah return response.data
    } catch (error) {
      console.error('❌ Error creating cuti:', error);
      throw error;
    }
  },

  /**
   * Update data cuti (hanya jika status masih pending)
   */
  async updateCuti(id: number, cutiData: CutiFormData): Promise<Cuti> {
    try {
      console.log(`🔄 Updating cuti ID: ${id}`, cutiData);
      
      const response = await phpApiMethods.put<Cuti>(
        `/guru-auth/cuti/${id}`,
        cutiData
      );
      
      console.log('✅ Cuti updated successfully:', response);
      return response; // phpApiMethods.put sudah return response.data
    } catch (error) {
      console.error('❌ Error updating cuti:', error);
      throw error;
    }
  },

  /**
   * Hapus data cuti (hanya jika status masih pending)
   */
  async deleteCuti(id: number): Promise<boolean> {
    try {
      console.log(`🔄 Deleting cuti ID: ${id}`);
      
      await phpApiMethods.delete<any>(
        `/guru-auth/cuti/${id}`
      );
      
      console.log('✅ Cuti deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting cuti:', error);
      throw error;
    }
  },

  /**
   * Approve cuti (untuk admin/kepala sekolah)
   */
  async approveCuti(id: number, pengganti?: string): Promise<Cuti> {
    try {
      console.log(`🔄 Approving cuti ID: ${id}`);
      
      const response = await phpApiMethods.put<Cuti>(
        `/guru-auth/cuti/${id}/approve`,
        pengganti ? { pengganti } : {}
      );
      
      console.log('✅ Cuti approved successfully:', response);
      return response; // phpApiMethods.put sudah return response.data
    } catch (error) {
      console.error('❌ Error approving cuti:', error);
      throw error;
    }
  },

  /**
   * Reject cuti (untuk admin/kepala sekolah)
   */
  async rejectCuti(id: number): Promise<Cuti> {
    try {
      console.log(`🔄 Rejecting cuti ID: ${id}`);
      
      const response = await phpApiMethods.put<Cuti>(
        `/guru-auth/cuti/${id}/reject`,
        {}
      );
      
      console.log('✅ Cuti rejected successfully:', response);
      return response; // phpApiMethods.put sudah return response.data
    } catch (error) {
      console.error('❌ Error rejecting cuti:', error);
      throw error;
    }
  },

  /**
   * Format data cuti untuk UI
   */
  formatCutiForUI(cuti: Cuti) {
    return {
      id: cuti.id,
      jenis: cuti.jenis,
      tanggalMulai: cuti.tanggal_mulai,
      tanggalSelesai: cuti.tanggal_selesai,
      durasi: cuti.durasi,
      status: cuti.status,
      alasan: cuti.alasan,
      disetujui: cuti.tanggal_disetujui || '-',
      pengganti: cuti.pengganti || '-',
      guru: cuti.guru,
      approver: cuti.approver
    };
  },

  /**
   * Format list cuti untuk UI
   */
  formatCutiListForUI(cutiList: Cuti[]) {
    return cutiList.map(cuti => this.formatCutiForUI(cuti));
  },

  /**
   * Admin: Mengambil semua data cuti dengan filter
   */
  async getAllCutiAdmin(params?: {
    status?: string;
    id_guru?: number;
    jenis?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<CutiPaginatedResponse> {
    try {
      console.log('🔄 Fetching all cuti data for admin...');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.id_guru) queryParams.append('id_guru', params.id_guru.toString());
      if (params?.jenis) queryParams.append('jenis', params.jenis);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `/cuti-management${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await phpApiMethods.get<CutiPaginatedResponse>(url);
      
      console.log('✅ All cuti data for admin fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching all cuti for admin:', error);
      throw error;
    }
  },

  /**
   * Admin: Mengambil statistik semua cuti
   */
  async getStatisticsAdmin(year?: number): Promise<CutiStatistics> {
    try {
      console.log('🔄 Fetching cuti statistics for admin...');
      
      const queryParams = year ? `?year=${year}` : '';
      const response = await phpApiMethods.get<CutiStatistics>(
        `/cuti-management/statistics${queryParams}`
      );
      
      console.log('✅ Cuti statistics for admin fetched successfully:', response);
      return response; // phpApiMethods.get sudah return response.data
    } catch (error) {
      console.error('❌ Error fetching cuti statistics for admin:', error);
      throw error;
    }
  },

  /**
   * Admin: Approve cuti
   */
  async approveCutiAdmin(id: number, pengganti?: string): Promise<Cuti> {
    try {
      console.log(`🔄 Approving cuti ID: ${id} (Admin)`);
      
      const response = await phpApiMethods.put<Cuti>(
        `/cuti-management/${id}/approve`,
        pengganti ? { pengganti } : {}
      );
      
      console.log('✅ Cuti approved successfully (Admin):', response);
      return response; // phpApiMethods.put sudah return response.data
    } catch (error) {
      console.error('❌ Error approving cuti (Admin):', error);
      throw error;
    }
  },

  /**
   * Admin: Reject cuti
   */
  async rejectCutiAdmin(id: number): Promise<Cuti> {
    try {
      console.log(`🔄 Rejecting cuti ID: ${id} (Admin)`);
      
      const response = await phpApiMethods.put<Cuti>(
        `/cuti-management/${id}/reject`,
        {}
      );
      
      console.log('✅ Cuti rejected successfully (Admin):', response);
      return response; // phpApiMethods.put sudah return response.data
    } catch (error) {
      console.error('❌ Error rejecting cuti (Admin):', error);
      throw error;
    }
  }
};

export default cutiService;

