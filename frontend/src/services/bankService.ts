import { phpApiMethods } from './api';
import type { Bank, BankFormData } from '../types/masterData';

interface ApiBank {
  id: number;
  nama_bank: string;
  nomor_rekening: string;
  created_at: string;
  updated_at: string;
}

interface BankListPayload {
  data: ApiBank[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const convertApiToFrontend = (apiBank: ApiBank): Bank => ({
  id: apiBank.id.toString(),
  namaBank: apiBank.nama_bank,
  nomorRekening: apiBank.nomor_rekening,
  createdAt: apiBank.created_at,
  updatedAt: apiBank.updated_at,
});

export interface BankFilters {
  search?: string;
  page?: number;
  per_page?: number;
  paginate?: boolean;
}

export const bankService = {
  async getAll(filters: BankFilters = {}): Promise<{
    success: boolean;
    data: {
      data: Bank[];
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const params: Record<string, string> = {};

    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page.toString();
    if (filters.per_page) params.per_page = filters.per_page.toString();
    if (filters.paginate === false) params.paginate = '0';

    const response = await phpApiMethods.get<BankListPayload>('/master-data/bank', params);

    // When pagination disabled, backend returns an array instead of object
    if (Array.isArray(response)) {
      const banks = response.map(convertApiToFrontend);
      return {
        success: true,
        data: {
          data: banks,
          current_page: 1,
          last_page: 1,
          per_page: banks.length,
          total: banks.length,
        },
      };
    }

    return {
      success: true,
      data: {
        ...response,
        data: response.data.map(convertApiToFrontend),
      },
    };
  },

  async getById(id: string): Promise<{ success: boolean; data: Bank }> {
    const response = await phpApiMethods.get<ApiBank>(`/master-data/bank/${id}`);
    return {
      success: true,
      data: convertApiToFrontend(response),
    };
  },

  async create(payload: BankFormData): Promise<{ success: boolean; data: Bank; message?: string }> {
    const apiPayload = {
      nama_bank: payload.namaBank,
      nomor_rekening: payload.nomorRekening,
    };

    const response = await phpApiMethods.post<ApiBank>('/master-data/bank', apiPayload);
    return {
      success: true,
      data: convertApiToFrontend(response),
      message: 'Bank berhasil ditambahkan',
    };
  },

  async update(id: string, payload: BankFormData): Promise<{ success: boolean; data: Bank; message?: string }> {
    const apiPayload = {
      nama_bank: payload.namaBank,
      nomor_rekening: payload.nomorRekening,
    };

    const response = await phpApiMethods.put<ApiBank>(`/master-data/bank/${id}`, apiPayload);
    return {
      success: true,
      data: convertApiToFrontend(response),
      message: 'Bank berhasil diperbarui',
    };
  },

  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    await phpApiMethods.delete(`/master-data/bank/${id}`);
    return {
      success: true,
      message: 'Bank berhasil dihapus',
    };
  },
};

export default bankService;

