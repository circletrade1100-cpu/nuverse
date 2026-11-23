import { useState, useCallback } from 'react';
import { tuService } from '../services/tuService';

interface ReportFilters {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  unit_id?: string;
  start_date?: string;
  end_date?: string;
  category?: string;
}

interface ReportData {
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
    payment_method?: string | null;
    payment_method_label?: string | null;
    nomor_kwitansi?: string | null;
    kelas_siswa?: string | null;
  }>;
}

export const useReportTU = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async (filters: ReportFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching report data with filters:', filters);
      const data = await tuService.getReportData(filters);
      console.log('Report data received:', data);
      setReportData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report data';
      setError(errorMessage);
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshReport = useCallback((filters: ReportFilters = {}) => {
    return fetchReportData(filters);
  }, [fetchReportData]);

  return {
    reportData,
    isLoading,
    error,
    fetchReportData,
    refreshReport
  };
};

export default useReportTU;
