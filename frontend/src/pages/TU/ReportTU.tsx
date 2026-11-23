import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  EyeIcon,
  Bars3BottomLeftIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import TULayout from '../../components/TU/TULayout';
import { unitSekolahService } from '../../services/unitSekolahService';
import { kategoriPemasukanService } from '../../services/kategoriPemasukanService';
import type { KategoriPemasukan } from '../../services/kategoriPemasukanService';
import { useReportTU } from '../../hooks/useReportTU';
import type { UnitSekolah } from '../../types/masterData';
import * as XLSX from 'xlsx';

/** Label dropdown unit — selaras dengan master DB / metadata transaksi TU. */
function formatUnitSekolahDropdownLabel(nama: string): string {
  const t = (nama || '').trim();
  if (t === 'Tata Usaha') return 'TU Islam Annur';
  /** Nama master SDIT ditampilkan sebagai SD (unit pendidikan). */
  if (t === 'SDIT') return 'SD';
  return t;
}

function normalizeUnitNamaForReportFilter(nama: string): string {
  return (nama || '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** Unit administrasi/yayasan — tidak ditampilkan di filter Laporan TU (bukan unit jenjang siswa). */
const REPORT_TU_EXCLUDED_UNIT_NAMES_LOWER = new Set([
  'divisi',
  'tu islam annur',
  'tata usaha',
  'yayasan',
]);

/** Cadangan: kode master (stabil walau nama diubah). DIV001, TU001, YYS = Yayasan. */
const REPORT_TU_EXCLUDED_UNIT_KODE_UPPER = new Set(['DIV001', 'TU001', 'YYS']);

function isExcludedFromReportTuUnitFilter(unit: UnitSekolah): boolean {
  if (REPORT_TU_EXCLUDED_UNIT_KODE_UPPER.has((unit.kode || '').trim().toUpperCase())) {
    return true;
  }
  return REPORT_TU_EXCLUDED_UNIT_NAMES_LOWER.has(normalizeUnitNamaForReportFilter(unit.nama));
}

// Types
interface ReportData {
  period: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  unit?: string;
}

interface TransactionSummary {
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
  nomor_kwitansi?: string | null;
  kelas_siswa?: string | null;
  metode_pembayaran?: string | null;
  metode_pembayaran_label?: string | null;
  payment_method?: string | null;
  payment_method_label?: string | null;
}

const ReportTU: React.FC = () => {
  // States
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unitSekolahList, setUnitSekolahList] = useState<UnitSekolah[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriPemasukan[]>([]);
  const [kategoriLoading, setKategoriLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Use the new report hook
  const {
    reportData: apiReportData,
    isLoading,
    error,
    fetchReportData
  } = useReportTU();
  
  // Convert API data to chart format
  const reportData: ReportData[] = apiReportData?.chart_data || [];
  const transactionSummary: TransactionSummary[] = apiReportData?.transactions || [];
  
  // Pagination calculations
  const totalItems = transactionSummary.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactionSummary.slice(startIndex, endIndex);

  // Load unit sekolah data (tanpa Divisi / TU / Yayasan — tidak relevan untuk filter per unit siswa)
  useEffect(() => {
    const loadUnitSekolah = async () => {
      try {
        const units = await unitSekolahService.getAllForDropdown();
        setUnitSekolahList(units.filter((u) => !isExcludedFromReportTuUnitFilter(u)));
      } catch (error) {
        console.error('Error loading unit sekolah:', error);
      }
    };
    loadUnitSekolah();
  }, []);

  // Jika unit terpilih tidak ada lagi di daftar (mis. setelah filter), kembali ke Semua Unit
  useEffect(() => {
    if (selectedUnit === 'all') return;
    const exists = unitSekolahList.some((u) => u.id === selectedUnit);
    if (!exists) setSelectedUnit('all');
  }, [unitSekolahList, selectedUnit]);

  useEffect(() => {
    const loadKategoriPemasukan = async () => {
      setKategoriLoading(true);
      try {
        const response = await kategoriPemasukanService.getAll();
        if (response.success) {
          setKategoriList(response.data.filter(kategori => kategori.is_active));
        }
      } catch (error) {
        console.error('Error loading kategori pemasukan:', error);
      } finally {
        setKategoriLoading(false);
      }
    };

    loadKategoriPemasukan();
  }, []);

  // Load real data based on filters
  const loadReportData = useCallback(async () => {
    const filters: {
      period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
      unit_id?: string;
      category?: string;
      start_date?: string;
      end_date?: string;
    } = {
      period: timeFilter,
    };

    if (timeFilter === 'custom') {
      filters.start_date = startDate;
      filters.end_date = endDate;
    }
    
    // Add unit_id filter if not 'all'
    if (selectedUnit && selectedUnit !== 'all') {
      filters.unit_id = String(selectedUnit);
    }
    
    // Add category filter if not 'all'
    if (selectedCategory && selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }
    
    console.log('loadReportData called with filters:', filters);
    try {
      await fetchReportData(filters);
      console.log('fetchReportData completed successfully');
    } catch (error) {
      console.error('loadReportData error:', error);
    }
  }, [timeFilter, selectedUnit, selectedCategory, fetchReportData]);

  // Load data when filters change (including on mount)
  useEffect(() => {
    console.log('ReportTU filter change:', { 
      timeFilter, 
      selectedUnit,
      selectedCategory
    });
    setCurrentPage(1); // Reset to first page when filters change
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, selectedUnit, selectedCategory, startDate, endDate]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate statistics from API data
  const totalPemasukan = apiReportData?.totals.total_income || 0;
  const totalPengeluaran = apiReportData?.totals.total_expense || 0;
  const netBalance = apiReportData?.totals.net_balance || 0;
  const currentBalance = apiReportData?.totals.current_balance || 0;

  // Debug log for data received
  console.log('ReportTU render data:', {
    apiReportData,
    totalPemasukan,
    totalPengeluaran,
    chartDataLength: reportData.length,
    transactionCount: transactionSummary.length,
    error
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    // Handle NaN, undefined, or null values
    if (isNaN(amount) || amount === null || amount === undefined) {
      return 'Rp 0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodDisplay = (
    rawMethod?: string | null,
    providedLabel?: string | null
  ): { label: string; className: string } => {
    const normalized = (rawMethod || providedLabel || '').toLowerCase();
    const label = providedLabel || (() => {
      if (normalized.includes('cash') || normalized === 'tunai') {
        return 'Tunai';
      }
      if (normalized.includes('qris')) {
        return 'QRIS';
      }
      if (
        normalized.includes('transfer') ||
        normalized.includes('bank') ||
        normalized.includes('bca') ||
        normalized.includes('bni') ||
        normalized.includes('bri') ||
        normalized.includes('mandiri')
      ) {
        return 'Transfer';
      }
      if (normalized.includes('card') || normalized.includes('debit') || normalized.includes('kartu')) {
        return 'Kartu';
      }
      return rawMethod || 'Tunai';
    })();

    if (label.toLowerCase().includes('tunai') || normalized.includes('cash')) {
      return { label, className: 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700' };
    }

    if (label.toLowerCase().includes('transfer')) {
      return { label, className: 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700' };
    }

    if (label.toLowerCase().includes('qris')) {
      return { label, className: 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700' };
    }

    if (label.toLowerCase().includes('kartu') || label.toLowerCase().includes('card') || label.toLowerCase().includes('debit')) {
      return { label, className: 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700' };
    }

    return { label, className: 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700' };
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!transactionSummary || transactionSummary.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Get selected unit name if specific unit is selected
    const selectedUnitData = selectedUnit !== 'all'
      ? unitSekolahList.find(unit => unit.id.toString() === selectedUnit)
      : null;

    const selectedUnitName =
      selectedUnit === 'all'
        ? 'Semua Unit'
        : formatUnitSekolahDropdownLabel(selectedUnitData?.nama?.trim() || 'Semua Unit');

    // Prepare Excel data
    const excelData: any[] = [];

    // Header Section
    excelData.push(['LAPORAN KEUANGAN TU']);
    excelData.push([]);
    
    const periodText = timeFilter === 'daily' ? 'Harian' : 
                      timeFilter === 'weekly' ? 'Mingguan' : 
                      timeFilter === 'monthly' ? 'Bulanan' : 
                      timeFilter === 'yearly' ? 'Tahunan' : 
                      `Rentang ${startDate} s/d ${endDate}`;
    
    excelData.push([`Periode: ${periodText}`]);
    excelData.push([`Unit: ${selectedUnitName}`]);
    excelData.push([]);

    // Table Header (matching data table structure)
    excelData.push([
      'Tanggal',
      'Jam Dibuat',
      'Dibayar Oleh',
      'Unit',
      'Nomor Kwitansi',
      'Kelas Siswa',
      'Kategori',
      'Deskripsi',
      'Pemasukan',
      'Pengeluaran',
      'Metode Pembayaran',
      'Status'
    ]);

    // Table Data
    let totalPemasukanExcel = 0;
    let totalPengeluaranExcel = 0;

    const pemasukanColumnIndex = 8;
    const pengeluaranColumnIndex = 9;

    transactionSummary.forEach((transaction) => {
      const pemasukan = Number(transaction.pemasukan) || 0;
      const pengeluaran = Number(transaction.pengeluaran) || 0;
      totalPemasukanExcel += pemasukan;
      totalPengeluaranExcel += pengeluaran;

      const statusText = transaction.status === 'approved' || transaction.status === 'completed' ? 'Selesai' :
                         transaction.status === 'pending' ? 'Pending' : 'Ditolak';

      const paymentInfo = getPaymentMethodDisplay(
        transaction.metode_pembayaran ?? transaction.payment_method,
        transaction.metode_pembayaran_label ?? transaction.payment_method_label
      );

      const jamDibuat = transaction.jam_dibuat
        || (transaction.created_at_full
          ? new Date(transaction.created_at_full).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : '');

      excelData.push([
        new Date(transaction.tanggal).toLocaleDateString('id-ID'),
        jamDibuat,
        transaction.dibayar_oleh || '-',
        transaction.unit,
        transaction.nomor_kwitansi || '-',
        transaction.kelas_siswa || '-',
        transaction.kategori,
        transaction.deskripsi || '-',
        pemasukan,
        pengeluaran,
        paymentInfo.label,
        statusText
      ]);
    });

    // Empty row before totals
    excelData.push([]);

    // Totals Row - ensure numbers are properly typed
    excelData.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      Number(totalPemasukanExcel),
      Number(totalPengeluaranExcel),
      '',
      ''
    ]);

    // Saldo Row - calculate correctly as number
    const saldo = Number(totalPemasukanExcel) - Number(totalPengeluaranExcel);
    excelData.push([
      'SALDO',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      Number(saldo),
      '',
      ''
    ]);

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // Calculate row numbers (0-indexed for XLSX)
    const headerRowIdx = 5; // Header row index (row 6 in Excel)
    const firstDataRowIdx = headerRowIdx + 1; // First data row index
    const lastDataRowIdx = headerRowIdx + transactionSummary.length; // Last data row index
    const emptyRowIdx = lastDataRowIdx + 1; // Empty row index
    const totalRowIdx = emptyRowIdx + 1; // Total row index
    const saldoRowIdx = totalRowIdx + 1; // Saldo row index
    
    // Set number format and ensure numeric type for all currency cells
    for (let rowIdx = firstDataRowIdx; rowIdx <= lastDataRowIdx; rowIdx++) {
      // Pemasukan column
      const pemasukanCellAddr = XLSX.utils.encode_cell({ r: rowIdx, c: pemasukanColumnIndex });
      if (worksheet[pemasukanCellAddr] !== undefined) {
        const value = Number(worksheet[pemasukanCellAddr].v);
        worksheet[pemasukanCellAddr] = {
          t: 'n', // Number type
          v: value, // Numeric value
          z: '#,##0' // Number format with thousands separator
        };
      }
      
      // Pengeluaran column
      const pengeluaranCellAddr = XLSX.utils.encode_cell({ r: rowIdx, c: pengeluaranColumnIndex });
      if (worksheet[pengeluaranCellAddr] !== undefined) {
        const value = Number(worksheet[pengeluaranCellAddr].v);
        worksheet[pengeluaranCellAddr] = {
          t: 'n', // Number type
          v: value, // Numeric value
          z: '#,##0' // Number format with thousands separator
        };
      }
    }
    
    // Set total row cells as numbers
    const totalPemasukanAddr = XLSX.utils.encode_cell({ r: totalRowIdx, c: pemasukanColumnIndex });
    const totalPengeluaranAddr = XLSX.utils.encode_cell({ r: totalRowIdx, c: pengeluaranColumnIndex });
    
    worksheet[totalPemasukanAddr] = {
      t: 'n', // Number type
      v: Number(totalPemasukanExcel), // Total as number
      z: '#,##0' // Number format
    };
    
    worksheet[totalPengeluaranAddr] = {
      t: 'n', // Number type
      v: Number(totalPengeluaranExcel), // Total as number
      z: '#,##0' // Number format
    };
    
    // Set saldo row cell as number
    const saldoAddr = XLSX.utils.encode_cell({ r: saldoRowIdx, c: pengeluaranColumnIndex });
    worksheet[saldoAddr] = {
      t: 'n', // Number type
      v: Number(saldo), // Saldo = Total Pemasukan - Total Pengeluaran
      z: '#,##0' // Number format
    };

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Tanggal
      { wch: 10 }, // Jam Dibuat
      { wch: 22 }, // Dibayar Oleh
      { wch: 18 }, // Unit
      { wch: 20 }, // Nomor Kwitansi
      { wch: 18 }, // Kelas Siswa
      { wch: 18 }, // Kategori
      { wch: 40 }, // Deskripsi
      { wch: 18 }, // Pemasukan
      { wch: 18 }, // Pengeluaran
      { wch: 20 }, // Metode Pembayaran
      { wch: 12 }  // Status
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const sheetName = selectedUnitName.replace(/[\\\/\?\*\[\]:]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename
    const date = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const unitNameForFile = selectedUnitName.replace(/[\\\/\?\*\[\]:]/g, '_').replace(/\s+/g, '_');
    const filename = selectedUnit !== 'all'
      ? `Laporan_TU_${unitNameForFile}_${periodText}_${date}.xlsx`
      : `Laporan_TU_Semua_Unit_${periodText}_${date}.xlsx`;

    // Write and download
    XLSX.writeFile(workbook, filename);
  };

  const handleExportSingleTransaction = (transaction: TransactionSummary) => {
    const paymentInfo = getPaymentMethodDisplay(
      transaction.metode_pembayaran ?? transaction.payment_method,
      transaction.metode_pembayaran_label ?? transaction.payment_method_label
    );

    const jamDibuat = transaction.jam_dibuat
      || (transaction.created_at_full
        ? new Date(transaction.created_at_full).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : '');

    const data = [
      ['DETAIL TRANSAKSI TU'],
      [],
      ['Nomor Kwitansi', transaction.nomor_kwitansi || '-'],
      ['Tanggal', new Date(transaction.tanggal).toLocaleDateString('id-ID')],
      ['Jam Dibuat', jamDibuat || '-'],
      ['Kategori', transaction.kategori],
      ['Deskripsi', transaction.deskripsi || '-'],
      ['Kelas Siswa', transaction.kelas_siswa || '-'],
      ['Metode Pembayaran', paymentInfo.label],
      ['Dibayar Oleh', transaction.dibayar_oleh || '-'],
      ['Unit', transaction.unit],
      ['Status', transaction.status === 'approved' || transaction.status === 'completed' ? 'Selesai' :
        transaction.status === 'pending' ? 'Pending' : 'Ditolak'],
      [],
      ['Pemasukan', Number(transaction.pemasukan) || 0],
      ['Pengeluaran', Number(transaction.pengeluaran) || 0],
      ['Saldo', (Number(transaction.pemasukan) || 0) - (Number(transaction.pengeluaran) || 0)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const pemasukanAddr = XLSX.utils.encode_cell({ r: data.length - 3, c: 1 });
    const pengeluaranAddr = XLSX.utils.encode_cell({ r: data.length - 2, c: 1 });
    const saldoAddr = XLSX.utils.encode_cell({ r: data.length - 1, c: 1 });

    [pemasukanAddr, pengeluaranAddr, saldoAddr].forEach((addr) => {
      if (worksheet[addr]) {
        worksheet[addr] = {
          t: 'n',
          v: Number(worksheet[addr].v),
          z: '#,##0'
        };
      }
    });

    worksheet['!cols'] = [
      { wch: 22 },
      { wch: 35 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi');

    const date = new Date().toISOString().split('T')[0];
    const filename = `Report_TU_${transaction.nomor_kwitansi || transaction.id}_${date}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // Chart colors
  const chartColors = {
    pemasukan: '#10b981', // emerald-500
    pengeluaran: '#ef4444', // red-500
    saldo: '#3b82f6' // blue-500
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'pemasukan' ? 'Pemasukan' : 
                 entry.dataKey === 'pengeluaran' ? 'Pengeluaran' : 'Saldo'}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <TULayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <PresentationChartLineIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Report TU</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadReportData()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isLoading || !transactionSummary || transactionSummary.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FunnelIcon className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-800">Filter Laporan:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Time Filter */}
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 font-medium"
                >
                  <option value="monthly">Bulanan (Bulan Ini)</option>
                  <option value="daily">Harian (Hari Ini)</option>
                  <option value="weekly">Mingguan (Minggu Ini)</option>
                  <option value="yearly">Tahunan (Tahun Ini)</option>
                  <option value="custom">📅 Rentang Tanggal...</option>
                </select>
              </div>

              {/* Custom Date Range Picker */}
              {timeFilter === 'custom' && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 w-36"
                    />
                    <span className="text-slate-400 text-xs px-1">s/d</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 w-36"
                    />
                  </div>
                  <button
                    onClick={() => loadReportData()}
                    className="p-2 transition-all duration-200 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 flex items-center justify-center group"
                    title="Terapkan Filter"
                  >
                    <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              )}

              {/* Kategori Pemasukan Filter */}
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={kategoriLoading}
                  className={`px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 ${
                    kategoriLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="all">Semua Kategori Pemasukan</option>
                  {kategoriList.map((kategori) => (
                    <option key={kategori.id} value={kategori.name}>
                      {kategori.name}
                    </option>
                  ))}
                </select>
                {kategoriLoading && (
                  <span className="text-xs text-slate-500">Memuat...</span>
                )}
              </div>

              {/* Unit Filter */}
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                >
                  <option value="all">Semua Unit Sekolah</option>
                  {unitSekolahList.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {formatUnitSekolahDropdownLabel(unit.nama)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Report Data</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => loadReportData()} 
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Debug Info (temporary) */}
        {import.meta.env.DEV && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-xs">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>API Data: {apiReportData ? 'Available' : 'None'}</p>
            <p>Chart Data: {reportData.length} items</p>
            <p>Transactions: {transactionSummary.length} items</p>
            <p>Totals: Income={totalPemasukan}, Expense={totalPengeluaran}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Pemasukan',
              value: formatCurrency(totalPemasukan),
              icon: ArrowTrendingUpIcon,
              change: '',
              changeType: 'increase',
              gradient: 'from-emerald-500 to-green-600',
              bgColor: 'bg-emerald-50',
              iconColor: 'text-emerald-600'
            },
            {
              title: 'Total Pengeluaran',
              value: formatCurrency(totalPengeluaran),
              icon: ArrowTrendingDownIcon,
              change: '',
              changeType: 'increase',
              gradient: 'from-red-500 to-rose-600',
              bgColor: 'bg-red-50',
              iconColor: 'text-red-600'
            },
            {
              title: 'Net Balance',
              value: formatCurrency(netBalance),
              icon: CurrencyDollarIcon,
              change: totalPemasukan > 0 ? 
                (netBalance > 0 ? '+' + ((netBalance / totalPemasukan) * 100).toFixed(1) + '%' : 
                 '-' + Math.abs((netBalance / totalPemasukan) * 100).toFixed(1) + '%') : 
                '0%',
              changeType: netBalance > 0 ? 'increase' : 'decrease',
              gradient: netBalance > 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600',
              bgColor: netBalance > 0 ? 'bg-blue-50' : 'bg-orange-50',
              iconColor: netBalance > 0 ? 'text-blue-600' : 'text-orange-600'
            },
            {
              title: 'Saldo Saat Ini',
              value: formatCurrency(currentBalance),
              icon: Bars3BottomLeftIcon,
              change: 'Current',
              changeType: 'neutral',
              gradient: 'from-purple-500 to-indigo-600',
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600'
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-7 h-7 ${stat.iconColor}`} />
                    </div>
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                      stat.changeType === 'increase' ? 'bg-emerald-50 border border-emerald-200' :
                      stat.changeType === 'decrease' ? 'bg-red-50 border border-red-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <span className={`text-xs font-semibold ${
                        stat.changeType === 'increase' ? 'text-emerald-700' :
                        stat.changeType === 'decrease' ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 tracking-wide uppercase">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart - Pemasukan vs Pengeluaran */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Pemasukan vs Pengeluaran</h3>
                  <p className="text-sm text-slate-600">Perbandingan cashflow per periode</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Pemasukan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Pengeluaran</span>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="pemasukan" 
                      fill={chartColors.pemasukan}
                      radius={[4, 4, 0, 0]}
                      name="Pemasukan"
                    />
                    <Bar 
                      dataKey="pengeluaran" 
                      fill={chartColors.pengeluaran}
                      radius={[4, 4, 0, 0]}
                      name="Pengeluaran"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Line Chart - Trend Saldo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PresentationChartLineIcon className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Trend Saldo</h3>
                  <p className="text-sm text-slate-600">Perkembangan saldo dari waktu ke waktu</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-slate-600">Saldo</span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="saldo" 
                      stroke={chartColors.saldo}
                      strokeWidth={3}
                      dot={{ fill: chartColors.saldo, strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: chartColors.saldo }}
                      name="Saldo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bars3BottomLeftIcon className="w-6 h-6 text-slate-500" />
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detail Transaksi</h3>
                <p className="text-sm text-slate-600">Rincian transaksi berdasarkan filter yang dipilih</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                <FunnelIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isLoading || !transactionSummary || transactionSummary.length === 0}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Excel"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="sticky left-0 z-30 text-left py-3 px-4 font-semibold text-slate-700 text-sm bg-slate-50 whitespace-nowrap w-[120px] min-w-[120px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                      Tanggal
                    </th>
                    <th className="sticky left-[120px] z-30 text-left py-3 px-4 font-semibold text-slate-700 text-sm bg-slate-50 whitespace-nowrap w-[92px] min-w-[92px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                      Jam Dibuat
                    </th>
                    <th className="sticky left-[212px] z-30 text-left py-3 px-4 font-semibold text-slate-700 text-sm bg-slate-50 whitespace-nowrap min-w-[220px] w-[240px] max-w-[280px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                      Dibayar Oleh
                    </th>
                    <th className="sticky left-[452px] z-30 text-left py-3 px-4 font-semibold text-slate-700 text-sm bg-slate-50 whitespace-nowrap min-w-[140px] w-[150px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                      Unit
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Nomor Kwitansi</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Kelas Siswa</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Kategori</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Deskripsi</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-sm">Pemasukan</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 text-sm">Pengeluaran</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Metode Pembayaran</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Aksi</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 text-sm">Export Laporan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 z-20 py-3 px-4 text-sm text-slate-700 bg-white group-hover:bg-slate-50 whitespace-nowrap w-[120px] min-w-[120px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="sticky left-[120px] z-20 py-3 px-4 text-sm text-slate-600 whitespace-nowrap bg-white group-hover:bg-slate-50 w-[92px] min-w-[92px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                        {transaction.jam_dibuat
                          ? transaction.jam_dibuat
                          : transaction.created_at_full
                            ? new Date(transaction.created_at_full).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                      </td>
                      <td className="sticky left-[212px] z-20 py-3 px-4 text-sm text-slate-700 bg-white group-hover:bg-slate-50 min-w-[220px] w-[240px] max-w-[280px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                        {transaction.dibayar_oleh || '-'}
                      </td>
                      <td className="sticky left-[452px] z-20 py-3 px-4 text-sm text-slate-700 bg-white group-hover:bg-slate-50 whitespace-nowrap min-w-[140px] w-[150px] shadow-[1px_0_0_0_rgb(226_232_240)]">
                        {transaction.unit}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap font-mono">
                        {transaction.nomor_kwitansi || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">
                        {transaction.kelas_siswa || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {transaction.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700 max-w-48 truncate">
                        {transaction.deskripsi}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {transaction.pemasukan > 0 ? (
                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(transaction.pemasukan)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {transaction.pengeluaran > 0 ? (
                          <span className="font-semibold text-red-600">
                            {formatCurrency(transaction.pengeluaran)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {(() => {
                          const paymentInfo = getPaymentMethodDisplay(
                            transaction.metode_pembayaran ?? transaction.payment_method,
                            transaction.metode_pembayaran_label ?? transaction.payment_method_label
                          );
                          return (
                            <span className={paymentInfo.className}>
                              {paymentInfo.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'approved' || transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status === 'approved' || transaction.status === 'completed' ? 'Selesai' :
                           transaction.status === 'pending' ? 'Pending' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleExportSingleTransaction(transaction)}
                          className="p-1 hover:bg-emerald-100 text-emerald-600 rounded transition-colors"
                          title="Export transaksi"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalItems > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} transaksi
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 border rounded-lg transition-colors text-sm ${
                    currentPage === 1 
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-lg transition-colors text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 border rounded-lg transition-colors text-sm ${
                    currentPage === totalPages 
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TULayout>
  );
};

// Helper extension for Date.prototype.getWeek()
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default ReportTU;
