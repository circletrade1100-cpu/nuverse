import { phpApiMethods } from './api';

// Types untuk Overtime
export interface Overtime {
  id: number;
  id_guru: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  durasi: number;
  jenis: string;
  deskripsi: string;
  status: 'pending' | 'approved' | 'rejected';
  tarif: number;
  total: number;
  supervisor: string | null;
  disetujui_oleh: number | null;
  tanggal_disetujui: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  guru?: {
    id: number;
    nama_lengkap: string;
    nip: string;
    unit_sekolah_id?: number;
    jabatan?: {
      id: number;
      nama: string;
    };
    unit_sekolah?: {
      id: number;
      kode: string;
      nama: string;
      jenjang: string;
    };
    unitSekolah?: {
      id: number;
      kode: string;
      nama: string;
      jenjang: string;
    };
  };
  approver?: {
    id: number;
    name: string;
  };
}

export interface OvertimeStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_jam: number;
  total_pendapatan: number;
  bulan_ini: number;
  tahun_ini: number;
}

export interface OvertimeFormData {
  id_guru: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  jenis: string;
  deskripsi: string;
  tarif?: number;
  supervisor?: string;
}

export interface OvertimeApiResponse {
  success: boolean;
  message: string;
  data: Overtime | Overtime[] | OvertimeStatistics | any;
  errors?: Record<string, string[]>;
}

export interface OvertimePaginatedResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Overtime[];
    total: number;
    per_page: number;
    last_page: number;
  };
}

// Service functions untuk Overtime Guru
export const overtimeService = {
  /**
   * Mengambil data overtime milik guru yang sedang login
   */
  async getMyOvertime(params?: {
    status?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<OvertimePaginatedResponse> {
    try {
      console.log('🔄 Fetching my overtime data...');
      
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `/guru-auth/overtime/my-overtime${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await phpApiMethods.get<OvertimePaginatedResponse>(url);
      
      console.log('✅ My overtime data fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching my overtime:', error);
      throw error;
    }
  },

  /**
   * Mengambil statistik overtime
   */
  async getStatistics(id_guru?: number): Promise<OvertimeApiResponse> {
    try {
      console.log('🔄 Fetching overtime statistics...');
      
      const url = id_guru 
        ? `/guru-auth/overtime/statistics?id_guru=${id_guru}`
        : '/guru-auth/overtime/statistics';
      
      const response = await phpApiMethods.get<OvertimeApiResponse>(url);
      
      console.log('✅ Overtime statistics fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching overtime statistics:', error);
      throw error;
    }
  },

  /**
   * Mengambil detail overtime berdasarkan ID
   */
  async getOvertimeById(id: number): Promise<OvertimeApiResponse> {
    try {
      console.log(`🔄 Fetching overtime detail for ID: ${id}...`);
      
      const response = await phpApiMethods.get<OvertimeApiResponse>(`/guru-auth/overtime/${id}`);
      
      console.log('✅ Overtime detail fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching overtime detail:', error);
      throw error;
    }
  },

  /**
   * Membuat pengajuan overtime baru
   */
  async createOvertime(data: OvertimeFormData): Promise<OvertimeApiResponse> {
    try {
      console.log('🔄 Creating overtime request...', data);
      
      const response = await phpApiMethods.post<OvertimeApiResponse>(
        '/guru-auth/overtime',
        data
      );
      
      console.log('✅ Overtime request created successfully');
      return response;
    } catch (error) {
      console.error('❌ Error creating overtime request:', error);
      throw error;
    }
  },

  /**
   * Mengupdate pengajuan overtime (hanya yang status pending)
   */
  async updateOvertime(id: number, data: Partial<OvertimeFormData>): Promise<OvertimeApiResponse> {
    try {
      console.log(`🔄 Updating overtime ID: ${id}...`, data);
      
      const response = await phpApiMethods.put<OvertimeApiResponse>(
        `/guru-auth/overtime/${id}`,
        data
      );
      
      console.log('✅ Overtime updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Error updating overtime:', error);
      throw error;
    }
  },

  /**
   * Menghapus pengajuan overtime (hanya yang status pending)
   */
  async deleteOvertime(id: number): Promise<OvertimeApiResponse> {
    try {
      console.log(`🔄 Deleting overtime ID: ${id}...`);
      
      const response = await phpApiMethods.delete<OvertimeApiResponse>(
        `/guru-auth/overtime/${id}`
      );
      
      console.log('✅ Overtime deleted successfully');
      return response;
    } catch (error) {
      console.error('❌ Error deleting overtime:', error);
      throw error;
    }
  },

  /**
   * Menyetujui pengajuan overtime (untuk admin/supervisor)
   */
  async approveOvertime(id: number): Promise<OvertimeApiResponse> {
    try {
      console.log(`🔄 Approving overtime ID: ${id}...`);
      
      const response = await phpApiMethods.put<OvertimeApiResponse>(
        `/guru-auth/overtime/${id}/approve`,
        {}
      );
      
      console.log('✅ Overtime approved successfully');
      return response;
    } catch (error) {
      console.error('❌ Error approving overtime:', error);
      throw error;
    }
  },

  /**
   * Menolak pengajuan overtime (untuk admin/supervisor)
   */
  async rejectOvertime(id: number): Promise<OvertimeApiResponse> {
    try {
      console.log(`🔄 Rejecting overtime ID: ${id}...`);
      
      const response = await phpApiMethods.put<OvertimeApiResponse>(
        `/guru-auth/overtime/${id}/reject`,
        {}
      );
      
      console.log('✅ Overtime rejected successfully');
      return response;
    } catch (error) {
      console.error('❌ Error rejecting overtime:', error);
      throw error;
    }
  },

  /**
   * Mengambil semua data overtime dengan filter (untuk admin)
   */
  async getAllOvertime(params?: {
    status?: string;
    id_guru?: number;
    jenis?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
    page?: number;
  }): Promise<OvertimePaginatedResponse> {
    try {
      console.log('🔄 Fetching all overtime data...');
      
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

      const url = `/guru-auth/overtime${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await phpApiMethods.get<OvertimePaginatedResponse>(url);
      
      console.log('✅ All overtime data fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Error fetching all overtime:', error);
      throw error;
    }
  },
};

export default overtimeService;

