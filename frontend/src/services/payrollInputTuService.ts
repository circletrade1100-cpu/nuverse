import { apiMethods } from './api';

export interface PayrollInputTu {
  id: number;
  guru_id: number;
  unit_sekolah_id: number;
  periode_bulan: string;
  periode_tahun: string;
  bimbel: number;
  proyek: number;
  eskul: number;
  pramuka: number;
  t_muka_pengganti_gaji_pokok: number;
  t_muka_pengganti_potongan: number;
  insentif_lain: number;
  potongan_lain: number;
  status: 'Draft' | 'Submitted' | 'Approved';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  guru?: {
    id: number;
    nama_lengkap: string;
    nip: string;
    jabatan?: {
      id: number;
      nama: string;
    };
  };
  unit_sekolah?: {
    id: number;
    nama: string;
    jenjang: string;
  };
}

export interface PayrollInputTuFormData {
  guru_id: number;
  unit_sekolah_id: number;
  periode_bulan: string;
  periode_tahun: string;
  bimbel?: number;
  proyek?: number;
  eskul?: number;
  pramuka?: number;
  t_muka_pengganti_gaji_pokok?: number;
  t_muka_pengganti_potongan?: number;
  insentif_lain?: number;
  potongan_lain?: number;
  status?: 'Draft' | 'Submitted' | 'Approved';
}

export interface PayrollInputTuFilters {
  unit_sekolah_id?: number;
  periode_bulan?: string;
  periode_tahun?: string;
  status?: 'Draft' | 'Submitted' | 'Approved';
}

export interface GuruOption {
  id: number;
  nama_lengkap: string;
  nip: string;
  jabatan?: {
    id: number;
    nama: string;
  };
  bimbel?: number;
  ekskul?: number;
  proyek?: number;
  pramuka?: number;
  t_muka_pengganti?: number | string;
}

class PayrollInputTuService {
  /**
   * Get all payroll input TU data
   */
  async getAll(filters?: PayrollInputTuFilters): Promise<{ status: string; data: PayrollInputTu[] }> {
    try {
      const params: any = {};
      if (filters?.unit_sekolah_id) params.unit_sekolah_id = filters.unit_sekolah_id;
      if (filters?.periode_bulan) params.periode_bulan = filters.periode_bulan;
      if (filters?.periode_tahun) params.periode_tahun = filters.periode_tahun;
      if (filters?.status) params.status = filters.status;

      const response = await apiMethods.get<{ status: string; data: PayrollInputTu[] }>(
        '/master-data/payroll-input-tu',
        params
      );
      
      // Handle response - apiMethods.get returns data directly, but our API returns {status, data}
      if (response && typeof response === 'object' && 'data' in response) {
        return response as { status: string; data: PayrollInputTu[] };
      }
      
      // If response is array directly, wrap it
      if (Array.isArray(response)) {
        return { status: 'success', data: response };
      }
      
      // Default fallback
      return { status: 'success', data: [] };
    } catch (error: any) {
      console.error('Error fetching payroll input TU:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil data input payroll TU');
    }
  }

  /**
   * Get single payroll input TU by ID
   */
  async getById(id: number): Promise<{ status: string; data: PayrollInputTu }> {
    try {
      const response = await apiMethods.get<{ status: string; data: PayrollInputTu }>(
        `/master-data/payroll-input-tu/${id}`
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching payroll input TU by ID:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil data input payroll TU');
    }
  }

  /**
   * Create new payroll input TU
   */
  async create(data: PayrollInputTuFormData): Promise<{ status: string; message: string; data: PayrollInputTu }> {
    try {
      const response = await apiMethods.post<{ status: string; message: string; data: PayrollInputTu }>(
        '/master-data/payroll-input-tu',
        data
      );
      return response;
    } catch (error: any) {
      console.error('Error creating payroll input TU:', error);
      if (error.response?.data?.errors) {
        throw new Error(JSON.stringify(error.response.data.errors));
      }
      throw new Error(error.response?.data?.message || 'Gagal menyimpan data input payroll TU');
    }
  }

  /**
   * Update payroll input TU
   */
  async update(id: number, data: Partial<PayrollInputTuFormData>): Promise<{ status: string; message: string; data: PayrollInputTu }> {
    try {
      const response = await apiMethods.put<{ status: string; message: string; data: PayrollInputTu }>(
        `/master-data/payroll-input-tu/${id}`,
        data
      );
      return response;
    } catch (error: any) {
      console.error('Error updating payroll input TU:', error);
      if (error.response?.data?.errors) {
        throw new Error(JSON.stringify(error.response.data.errors));
      }
      throw new Error(error.response?.data?.message || 'Gagal memperbarui data input payroll TU');
    }
  }

  /**
   * Delete payroll input TU
   */
  async delete(id: number): Promise<{ status: string; message: string }> {
    try {
      const response = await apiMethods.delete<{ status: string; message: string }>(
        `/master-data/payroll-input-tu/${id}`
      );
      return response;
    } catch (error: any) {
      console.error('Error deleting payroll input TU:', error);
      throw new Error(error.response?.data?.message || 'Gagal menghapus data input payroll TU');
    }
  }

  /**
   * Bulk create payroll input TU
   */
  async bulkCreate(data: PayrollInputTuFormData[]): Promise<{
    created: number;
    skipped: number;
    failed: number;
    created_data: PayrollInputTu[];
    skipped_data: any[];
  }> {
    try {
      const response = await apiMethods.post<{
        created: number;
        skipped: number;
        failed: number;
        created_data: PayrollInputTu[];
        skipped_data: any[];
      }>(
        '/master-data/payroll-input-tu/bulk',
        { data }
      );
      return response;
    } catch (error: any) {
      console.error('Error bulk creating payroll input TU:', error);
      if (error.response?.data?.errors) {
        throw new Error(JSON.stringify(error.response.data.errors));
      }
      throw new Error(error.response?.data?.message || 'Gagal melakukan bulk create input payroll TU');
    }
  }

  /**
   * Get list of gurus by unit sekolah
   */
  async getGurusByUnit(unit_sekolah_id: number): Promise<{ status: string; data: GuruOption[] }> {
    try {
      const response = await apiMethods.get<{ status: string; data: GuruOption[] }>(
        '/master-data/payroll-input-tu/gurus-by-unit',
        { unit_sekolah_id }
      );
      
      // Handle response
      if (response && typeof response === 'object' && 'data' in response) {
        return response as { status: string; data: GuruOption[] };
      }
      
      // If response is array directly, wrap it
      if (Array.isArray(response)) {
        return { status: 'success', data: response };
      }
      
      // Default fallback
      return { status: 'success', data: [] };
    } catch (error: any) {
      console.error('Error fetching gurus by unit:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil data guru');
    }
  }
}

export const payrollInputTuService = new PayrollInputTuService();

