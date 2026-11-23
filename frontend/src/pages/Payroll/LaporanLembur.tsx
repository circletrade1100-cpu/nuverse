import React, { useState, useEffect } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Table from '../../components/common/UI/Table';
import adminOvertimeService, { 
  type LaporanLemburAbsensi, 
  type RingkasanBulanan 
} from '../../services/adminOvertimeService';
import {
  ClockIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  FunnelIcon,
  ChartBarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const LaporanLembur: React.FC = () => {
  const [laporanDetail, setLaporanDetail] = useState<LaporanLemburAbsensi[]>([]);
  const [ringkasanBulanan, setRingkasanBulanan] = useState<RingkasanBulanan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current month and year
  const now = new Date();
  const currentPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const [selectedPeriode, setSelectedPeriode] = useState(currentPeriode);
  const [selectedDivisi, setSelectedDivisi] = useState('');
  const [viewMode, setViewMode] = useState<'summary' | 'detail'>('detail');

  // Fetch overtime data
  useEffect(() => {
    fetchOvertimeData();
  }, [selectedPeriode]);

  const fetchOvertimeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate start and end date from selected periode
      const [year, month] = selectedPeriode.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      console.log('📅 Fetching periode:', { startDate, endDate });
      
      // Fetch laporan lembur dengan parameter backend
      const response = await adminOvertimeService.getLaporanLembur({
        start_date: startDate,
        end_date: endDate
      });

      console.log('📦 Service response:', response);

      if (response.success && response.data) {
        const laporanData = Array.isArray(response.data) ? response.data : [];
        console.log('✅ Setting laporan detail:', laporanData.length, 'items');
        console.log('📋 Sample laporan data:', laporanData.slice(0, 2));
        
        // Verify data structure
        if (laporanData.length > 0) {
          console.log('🔍 Data structure check:', {
            nama: laporanData[0].nama,
            divisi: laporanData[0].divisi,
            totalJamLembur: laporanData[0].totalJamLembur,
            jamLemburWeekday: laporanData[0].jamLemburWeekday,
            jamLemburWeekend: laporanData[0].jamLemburWeekend,
            jamLemburHoliday: laporanData[0].jamLemburHoliday
          });
        }
        
        setLaporanDetail(laporanData);
        
        // Generate ringkasan bulanan
        if (laporanData.length > 0) {
          const ringkasan = await adminOvertimeService.getRingkasanBulanan(
            selectedPeriode,
            laporanData
          );
          console.log('📊 Setting ringkasan:', ringkasan.length, 'divisi');
          setRingkasanBulanan(ringkasan);
        } else {
          console.log('ℹ️ No data, skipping ringkasan');
          setRingkasanBulanan([]);
        }
      } else {
        console.warn('⚠️ Response not success or no data');
        setLaporanDetail([]);
        setRingkasanBulanan([]);
      }
    } catch (err: any) {
      console.error('Error fetching overtime data:', err);
      setError(err.message || 'Gagal mengambil data lembur');
      setLaporanDetail([]);
      setRingkasanBulanan([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter with safe check
  const filteredLaporanDetail = laporanDetail.filter(laporan => {
    if (!laporan) return false;
    const matchesDivisi = !selectedDivisi || laporan.divisi === selectedDivisi;
    return matchesDivisi;
  });
  
  // Debug: Log when data changes
  React.useEffect(() => {
    console.log('📊 laporanDetail updated:', laporanDetail.length, 'items');
    console.log('🔍 filteredLaporanDetail:', filteredLaporanDetail.length, 'items');
  }, [laporanDetail, filteredLaporanDetail]);

  const filteredRingkasan = ringkasanBulanan.filter(ringkasan => {
    if (!ringkasan) return false;
    const matchesPeriode = ringkasan.periode === selectedPeriode;
    const matchesDivisi = !selectedDivisi || ringkasan.divisi === selectedDivisi;
    return matchesPeriode && matchesDivisi;
  });

  // Calculate stats with safe check
  const totalStats = filteredLaporanDetail.reduce((acc, curr) => {
    if (!curr) return acc;
    return {
      totalKaryawan: acc.totalKaryawan + 1,
      totalJamLembur: acc.totalJamLembur + (curr.totalJamLembur || 0),
      totalGajiLembur: acc.totalGajiLembur + (curr.gajiLembur || 0),
      totalPotonganAbsensi: acc.totalPotonganAbsensi + (curr.potonganAbsensi || 0),
      rataRataKehadiran: acc.rataRataKehadiran + (curr.persentaseKehadiran || 0),
      totalTerlambat: acc.totalTerlambat + (curr.terlambat || 0),
      totalAbsensi: acc.totalAbsensi + (curr.hariAlfa || 0) + (curr.hariIzin || 0) + (curr.hariSakit || 0)
    };
  }, {
    totalKaryawan: 0,
    totalJamLembur: 0,
    totalGajiLembur: 0,
    totalPotonganAbsensi: 0,
    rataRataKehadiran: 0,
    totalTerlambat: 0,
    totalAbsensi: 0
  });

  if (totalStats.totalKaryawan > 0) {
    totalStats.rataRataKehadiran = totalStats.rataRataKehadiran / totalStats.totalKaryawan;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPeriode = (periode: string) => {
    const [year, month] = periode.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const detailColumns = [
    {
      key: 'karyawan',
      header: 'Karyawan',
      render: (_: any, laporan: LaporanLemburAbsensi) => {
        if (!laporan) return <div>-</div>;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{laporan.nama || '-'}</div>
              <div className="text-sm text-slate-600">NIP: {laporan.nip || '-'}</div>
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                {laporan.jabatan || '-'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'divisi',
      header: 'Unit Sekolah',
      render: (_: any, laporan: LaporanLemburAbsensi) => {
        if (!laporan) return <div>-</div>;
        
        // Debug log
        console.log('🏫 Rendering divisi for:', laporan.nama, '- Divisi value:', laporan.divisi);
        
        const divisiText = laporan.divisi || 'N/A';
        
        return (
          <div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm font-medium text-blue-700">
                {divisiText}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'totalJamLembur',
      header: 'Total Jam Lembur',
      render: (_: any, laporan: LaporanLemburAbsensi) => {
        if (!laporan) return <div>-</div>;
        const total = laporan.totalJamLembur || 0;
        return (
          <div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {total} <span className="text-lg">Jam</span>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {(laporan.jamLemburWeekday || 0) > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Weekday: {laporan.jamLemburWeekday}h
                  </span>
                )}
                {(laporan.jamLemburWeekend || 0) > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Weekend: {laporan.jamLemburWeekend}h
                  </span>
                )}
                {(laporan.jamLemburHoliday || 0) > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    Holiday: {laporan.jamLemburHoliday}h
                  </span>
                )}
                {total === 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Tidak ada lembur
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Periode: {formatPeriode(selectedPeriode)}
              </div>
            </div>
          </div>
        );
      }
    }
  ];

  const summaryColumns = [
    {
      key: 'divisi',
      header: 'Divisi',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div>
            <div className="font-medium text-slate-900">{ringkasan.divisi || '-'}</div>
            <div className="text-sm text-slate-500">{ringkasan.totalKaryawan || 0} karyawan</div>
          </div>
        );
      }
    },
    {
      key: 'kehadiran',
      header: 'Rata-rata Kehadiran',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        const rataRata = ringkasan.rataRataKehadiran || 0;
        return (
          <div className="text-center">
            <div className={`text-lg font-bold ${
              rataRata >= 95 ? 'text-green-600' :
              rataRata >= 90 ? 'text-blue-600' :
              rataRata >= 80 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {rataRata.toFixed(1)}%
            </div>
          </div>
        );
      }
    },
    {
      key: 'jamLembur',
      header: 'Total Jam Lembur',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div className="text-center font-semibold text-amber-600">
            {ringkasan.totalJamLembur || 0}h
          </div>
        );
      }
    },
    {
      key: 'gajiLembur',
      header: 'Total Gaji Lembur',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div className="text-right font-semibold text-amber-600">
            {formatCurrency(ringkasan.totalGajiLembur || 0)}
          </div>
        );
      }
    },
    {
      key: 'potongan',
      header: 'Total Potongan',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div className="text-right font-semibold text-red-600">
            {formatCurrency(ringkasan.totalPotonganAbsensi || 0)}
          </div>
        );
      }
    },
    {
      key: 'teladan',
      header: 'Karyawan Teladan',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div className="text-sm">
            <div className="font-medium text-green-600">{ringkasan.karyawanTeladan || '-'}</div>
            <div className="text-xs text-slate-500">Terbaik</div>
          </div>
        );
      }
    },
    {
      key: 'peringatan',
      header: 'Perlu Perhatian',
      render: (_: any, ringkasan: RingkasanBulanan) => {
        if (!ringkasan) return <div>-</div>;
        return (
          <div className="text-sm">
            <div className="font-medium text-red-600">{ringkasan.karyawanPeringatan || '-'}</div>
            <div className="text-xs text-slate-500">Perlu pembinaan</div>
          </div>
        );
      }
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-600">Memuat data lembur...</p>
            </div>
          </Card>
        )}

        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Laporan Lembur & Absensi</h3>
                <p className="text-sm text-slate-600">Analisis kehadiran dan overtime karyawan</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Grafik Trend
              </Button>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print Laporan
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rata-rata Kehadiran</p>
                <p className={`text-2xl font-bold ${
                  totalStats.rataRataKehadiran >= 95 ? 'text-green-600' :
                  totalStats.rataRataKehadiran >= 90 ? 'text-blue-600' :
                  totalStats.rataRataKehadiran >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {totalStats.rataRataKehadiran.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">{totalStats.totalKaryawan} karyawan</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Jam Lembur</p>
                <p className="text-2xl font-bold text-amber-600">{totalStats.totalJamLembur}h</p>
                <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Gaji Lembur</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(totalStats.totalGajiLembur)}</p>
                <p className="text-xs text-slate-500 mt-1">Kompensasi overtime</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-amber-600">💰</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Potongan</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalStats.totalPotonganAbsensi)}</p>
                <p className="text-xs text-slate-500 mt-1">Sanksi absensi</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & View Toggle */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <FunnelIcon className="w-5 h-5 text-slate-400" />
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={loading}
              >
                {/* Generate last 12 months */}
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const value = `${year}-${month}`;
                  return (
                    <option key={value} value={value}>
                      {formatPeriode(value)}
                    </option>
                  );
                })}
              </select>
              
              <select
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={loading}
              >
                <option value="">Semua Divisi</option>
                {/* Get unique divisions from data */}
                {Array.from(new Set(laporanDetail.map(l => l.divisi))).map(divisi => (
                  <option key={divisi} value={divisi}>{divisi}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('detail')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'detail' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Detail Karyawan
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'summary' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Ringkasan Divisi
              </button>
            </div>
          </div>
        </Card>

        {/* Main Table */}
        <Card>
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {viewMode === 'detail' ? 'Laporan Detail Karyawan' : 'Ringkasan Per Divisi'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Periode: {formatPeriode(selectedPeriode)}
                  {selectedDivisi && ` • Divisi: ${selectedDivisi}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">{formatPeriode(selectedPeriode)}</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredLaporanDetail.length === 0 && viewMode === 'detail' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClockIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">Tidak ada data lembur</p>
              <p className="text-sm text-slate-500 mt-2">Belum ada data lembur untuk periode yang dipilih</p>
            </div>
          ) : filteredRingkasan.length === 0 && viewMode === 'summary' ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ChartBarIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">Tidak ada ringkasan</p>
              <p className="text-sm text-slate-500 mt-2">Belum ada data untuk membuat ringkasan</p>
            </div>
          ) : (
            <Table
              data={viewMode === 'detail' ? filteredLaporanDetail : filteredRingkasan}
              columns={viewMode === 'detail' ? detailColumns : summaryColumns}
            />
          )}
        </Card>

        {/* Performance Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Karyawan Berprestasi</h4>
                <p className="text-sm text-slate-600">Kehadiran terbaik bulan ini</p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredLaporanDetail.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Belum ada data karyawan
                </div>
              ) : filteredLaporanDetail
                .filter(k => k && k.persentaseKehadiran >= 95)
                .slice(0, 3)
                .map(karyawan => karyawan && (
                  <div key={karyawan.nip || Math.random()} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">{karyawan.nama || '-'}</div>
                      <div className="text-sm text-slate-500">{karyawan.divisi || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{karyawan.persentaseKehadiran?.toFixed(1) || '0'}%</div>
                      <div className="text-xs text-slate-500">{karyawan.totalJamLembur || 0}h lembur</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Perlu Perhatian</h4>
                <p className="text-sm text-slate-600">Karyawan dengan masalah kehadiran</p>
              </div>
            </div>
            <div className="space-y-3">
              {filteredLaporanDetail.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm">
                  Belum ada data karyawan
                </div>
              ) : filteredLaporanDetail
                .filter(k => k && (k.persentaseKehadiran < 90 || k.terlambat > 2))
                .slice(0, 3)
                .map(karyawan => karyawan && (
                  <div key={karyawan.nip || Math.random()} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">{karyawan.nama || '-'}</div>
                      <div className="text-sm text-slate-500">{karyawan.divisi || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{karyawan.persentaseKehadiran?.toFixed(1) || '0'}%</div>
                      <div className="text-xs text-slate-500">Terlambat {karyawan.terlambat || 0}x</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </PayrollLayout>
  );
};

export default LaporanLembur;
