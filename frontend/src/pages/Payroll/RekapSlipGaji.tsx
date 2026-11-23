import React, { useState, useEffect } from 'react';
import PayrollLayout from '../../components/Payroll/PayrollLayout';
import Card from '../../components/common/UI/Card';
import Button from '../../components/common/UI/Button';
import Table from '../../components/common/UI/Table';
import {
  ChartBarIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  UsersIcon,
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface RekapGaji {
  periode: string;
  totalKaryawan: number;
  totalGajiPokok: number;
  totalTunjangan: number;
  totalLembur: number;
  totalPendapatan: number;
  totalPotongan: number;
  totalGajiDibayar: number;
  rataRataGaji: number;
  status: 'Draft' | 'Final' | 'Dibayar';
}

interface DetailKaryawan {
  nip: string;
  nama: string;
  divisi: string;
  gajiPokok: number;
  totalTunjangan: number;
  gajiLembur: number;
  totalPotongan: number;
  gajiDiterima: number;
  periode?: string;
}

const RekapSlipGaji: React.FC = () => {
  const [rekapData, setRekapData] = useState<RekapGaji[]>([]);
  const [detailKaryawan, setDetailKaryawan] = useState<DetailKaryawan[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDetailPeriode, setSelectedDetailPeriode] = useState('');
  const [showSetupPayrollModal, setShowSetupPayrollModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availablePeriodes, setAvailablePeriodes] = useState<string[]>([]);

  // Fetch data payroll dari backend
  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/payroll`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        // Group data by periode
        const groupedByPeriode: { [key: string]: any[] } = {};
        const allDetailKaryawan: DetailKaryawan[] = [];
        
        // Mapping nama bulan Indonesia ke nomor bulan
        const monthMap: { [key: string]: string } = {
          'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
          'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
          'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };
        
        data.forEach((item: any) => {
          let periode = '';
          if (item.periode_bulan && item.periode_tahun) {
            const monthNum = monthMap[item.periode_bulan];
            if (monthNum) {
              periode = `${item.periode_tahun}-${monthNum}`;
            }
          }
            
          if (periode) {
            if (!groupedByPeriode[periode]) {
              groupedByPeriode[periode] = [];
            }
            groupedByPeriode[periode].push(item);
            
            // Prepare detail karyawan data
            allDetailKaryawan.push({
              nip: item.guru?.nip || item.nip || '',
              nama: item.guru?.nama_lengkap || item.nama_lengkap || '',
              divisi: item.guru?.unit_sekolah?.nama || item.unit_sekolah_nama || '',
              gajiPokok: Number(item.gaji_pokok) || 0,
              totalTunjangan: (Number(item.jabatan) || 0) + (Number(item.masa_kerja) || 0) + 
                              (Number(item.wali_kelas) || 0) + (Number(item.koordinator) || 0) + 
                              (Number(item.tatap_muka) || 0) + (Number(item.t_muka_pengganti) || 0) +
                              (Number(item.tunj_keluarga) || 0) + (Number(item.transport1) || 0) + 
                              (Number(item.transport2) || 0) + (Number(item.makan) || 0) +
                              (Number(item.jamsostek) || 0) + (Number(item.pramuka) || 0) +
                              (Number(item.tunj_lain) || 0) + (Number(item.ekskul) || 0) +
                              (Number(item.bpjs) || 0) + (Number(item.bimbel) || 0) +
                              (Number(item.insentif_peng_pramuka) || 0) + (Number(item.insentif_peng_ekskul) || 0) +
                              (Number(item.insentif_peng_proyek) || 0) + (Number(item.total_transport) || 0),
              gajiLembur: Number(item.overtime) || 0,
              totalPotongan: Number(item.total_potongan) || 0,
              gajiDiterima: Number(item.gaji_bersih) || 0,
              periode: periode
            });
          }
        });
        
        // Create rekap data from grouped data
        const rekapArray: RekapGaji[] = Object.keys(groupedByPeriode)
          .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)
          .map(periode => {
            const items = groupedByPeriode[periode];
            const totalKaryawan = items.length;
            const totalGajiPokok = items.reduce((sum, item) => sum + (Number(item.gaji_pokok) || 0), 0);
            const totalTunjangan = items.reduce((sum, item) => {
              return sum + 
                (Number(item.jabatan) || 0) + (Number(item.masa_kerja) || 0) + 
                (Number(item.wali_kelas) || 0) + (Number(item.koordinator) || 0) + 
                (Number(item.tatap_muka) || 0) + (Number(item.t_muka_pengganti) || 0) +
                (Number(item.tunj_keluarga) || 0) + (Number(item.transport1) || 0) + 
                (Number(item.transport2) || 0) + (Number(item.makan) || 0) +
                (Number(item.jamsostek) || 0) + (Number(item.pramuka) || 0) +
                (Number(item.tunj_lain) || 0) + (Number(item.ekskul) || 0) +
                (Number(item.bpjs) || 0) + (Number(item.bimbel) || 0) +
                (Number(item.insentif_peng_pramuka) || 0) + (Number(item.insentif_peng_ekskul) || 0) +
                (Number(item.insentif_peng_proyek) || 0) + (Number(item.total_transport) || 0);
            }, 0);
            const totalLembur = items.reduce((sum, item) => sum + (Number(item.overtime) || 0), 0);
            const totalPendapatan = items.reduce((sum, item) => sum + (Number(item.total_gaji) || 0), 0);
            const totalPotongan = items.reduce((sum, item) => sum + (Number(item.total_potongan) || 0), 0);
            const totalGajiDibayar = items.reduce((sum, item) => sum + (Number(item.gaji_bersih) || 0), 0);
            const rataRataGaji = totalKaryawan > 0 ? totalGajiDibayar / totalKaryawan : 0;
            
            // Determine status based on items
            let status: 'Draft' | 'Final' | 'Dibayar' = 'Draft';
            const allDibayar = items.every(item => item.status === 'Dibayar');
            const anyDibayar = items.some(item => item.status === 'Dibayar');
            if (allDibayar) {
              status = 'Dibayar';
            } else if (anyDibayar) {
              status = 'Draft';
            }
            
            return {
              periode,
              totalKaryawan,
              totalGajiPokok,
              totalTunjangan,
              totalLembur,
              totalPendapatan,
              totalPotongan,
              totalGajiDibayar,
              rataRataGaji,
              status
            };
          });
        
        setRekapData(rekapArray);
        setDetailKaryawan(allDetailKaryawan);
        setAvailablePeriodes(Object.keys(groupedByPeriode).sort((a, b) => b.localeCompare(a)));
      } else {
        console.warn('Unexpected data structure:', data);
        setRekapData([]);
        setDetailKaryawan([]);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setRekapData([]);
      setDetailKaryawan([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data saat component mount
  useEffect(() => {
    fetchPayrollData();
  }, []);

  const filteredRekap = rekapData.filter(rekap => {
    const matchesPeriode = !selectedPeriode || rekap.periode === selectedPeriode;
    return matchesPeriode;
  });

  const filteredDetail = detailKaryawan.filter(detail => {
    const matchesSearch = detail.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         detail.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriode = !selectedDetailPeriode || detail.periode === selectedDetailPeriode;
    return matchesSearch && matchesPeriode;
  });

  // Calculate trends
  const currentMonth = rekapData[0];
  const previousMonth = rekapData[1];
  const gajiTrend = currentMonth && previousMonth 
    ? ((currentMonth.totalGajiDibayar - previousMonth.totalGajiDibayar) / previousMonth.totalGajiDibayar) * 100
    : 0;

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

  const getStatusBadge = (status: RekapGaji['status']) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'Final': 'bg-blue-100 text-blue-800 border-blue-200',
      'Dibayar': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const rekapColumns = [
    {
      key: 'periode',
      header: 'Periode',
      render: (_: any, rekap: RekapGaji) => (
        <div>
          <div className="font-medium text-slate-900">{formatPeriode(rekap.periode)}</div>
          <div className="text-sm text-slate-500">{rekap.totalKaryawan} karyawan</div>
        </div>
      )
    },
    {
      key: 'pendapatan',
      header: 'Total Pendapatan',
      render: (_: any, rekap: RekapGaji) => (
        <div className="text-sm">
          <div className="font-medium text-slate-900">{formatCurrency(rekap.totalPendapatan)}</div>
          <div className="text-xs text-slate-500">
            Pokok: {formatCurrency(rekap.totalGajiPokok)}
          </div>
          <div className="text-xs text-slate-500">
            Tunjangan: {formatCurrency(rekap.totalTunjangan)}
          </div>
        </div>
      )
    },
    {
      key: 'lembur',
      header: 'Total Lembur',
      render: (_: any, rekap: RekapGaji) => (
        <div className="font-medium text-amber-600 text-center">
          {formatCurrency(rekap.totalLembur)}
        </div>
      )
    },
    {
      key: 'potongan',
      header: 'Total Potongan',
      render: (_: any, rekap: RekapGaji) => (
        <div className="font-medium text-red-600 text-center">
          {formatCurrency(rekap.totalPotongan)}
        </div>
      )
    },
    {
      key: 'dibayar',
      header: 'Total Dibayar',
      render: (_: any, rekap: RekapGaji) => (
        <div>
          <div className="font-semibold text-green-600">{formatCurrency(rekap.totalGajiDibayar)}</div>
          <div className="text-xs text-slate-500">
            Rata-rata: {formatCurrency(rekap.rataRataGaji)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, rekap: RekapGaji) => getStatusBadge(rekap.status)
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (_: any, rekap: RekapGaji) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDetailPeriode(rekap.periode);
              setShowDetail(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download Excel"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const detailColumns = [
    {
      key: 'employee',
      header: 'Karyawan',
      render: (_: any, detail: DetailKaryawan) => (
        <div>
          <div className="font-medium text-slate-900">{detail.nama}</div>
          <div className="text-sm text-slate-500">{detail.nip} • {detail.divisi}</div>
        </div>
      )
    },
    {
      key: 'gajiPokok',
      header: 'Gaji Pokok',
      render: (_: any, detail: DetailKaryawan) => (
        <div className="font-medium text-slate-900 text-right">
          {formatCurrency(detail.gajiPokok)}
        </div>
      )
    },
    {
      key: 'tunjangan',
      header: 'Total Tunjangan',
      render: (_: any, detail: DetailKaryawan) => (
        <div className="font-medium text-blue-600 text-right">
          {formatCurrency(detail.totalTunjangan)}
        </div>
      )
    },
    {
      key: 'lembur',
      header: 'Lembur',
      render: (_: any, detail: DetailKaryawan) => (
        <div className="font-medium text-amber-600 text-right">
          {formatCurrency(detail.gajiLembur)}
        </div>
      )
    },
    {
      key: 'potongan',
      header: 'Potongan',
      render: (_: any, detail: DetailKaryawan) => (
        <div className="font-medium text-red-600 text-right">
          {formatCurrency(detail.totalPotongan)}
        </div>
      )
    },
    {
      key: 'diterima',
      header: 'Gaji Diterima',
      render: (_: any, detail: DetailKaryawan) => (
        <div className="font-semibold text-green-600 text-right">
          {formatCurrency(detail.gajiDiterima)}
        </div>
      )
    }
  ];

  return (
    <PayrollLayout>
      <div className="space-y-6">
        
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Rekapitulasi Slip Gaji</h1>
                <p className="text-blue-100 text-lg">Analisis komprehensif dan ringkasan penggajian bulanan</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <PresentationChartLineIcon className="w-4 h-4" />
                    <span>Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentChartBarIcon className="w-4 h-4" />
                    <span>Export Ready</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 transition-all duration-300">
                <PresentationChartLineIcon className="w-5 h-5 mr-2" />
                Lihat Grafik
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg">
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Excel
              </Button>
             
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Gaji Bulan Ini</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : currentMonth ? formatCurrency(currentMonth.totalGajiDibayar) : 'Rp 0'}
                </p>
                {!loading && gajiTrend !== 0 && (
                  <div className={`flex items-center gap-1 mt-2 ${gajiTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gajiTrend > 0 ? (
                      <ArrowUpIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">
                      {Math.abs(gajiTrend).toFixed(1)}% vs bulan lalu
                    </span>
                  </div>
                )}
              </div>
              <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center">
                <BanknotesIcon className="w-8 h-8 text-blue-700" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Karyawan</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                    </span>
                  ) : currentMonth ? currentMonth.totalKaryawan : '0'}
                </p>
                <p className="text-sm text-green-600 mt-1 font-medium">Karyawan aktif</p>
              </div>
              <div className="w-14 h-14 bg-green-200 rounded-2xl flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-green-700" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Rata-rata Gaji</p>
                <p className="text-2xl font-bold text-amber-900 mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : currentMonth ? formatCurrency(currentMonth.rataRataGaji) : 'Rp 0'}
                </p>
                <p className="text-sm text-amber-600 mt-1 font-medium">Per karyawan</p>
              </div>
              <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-amber-700" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Total Lembur</p>
                <p className="text-2xl font-bold text-orange-900 mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                      Loading...
                    </span>
                  ) : currentMonth ? formatCurrency(currentMonth.totalLembur) : 'Rp 0'}
                </p>
                <p className="text-sm text-orange-600 mt-1 font-medium">Bulan ini</p>
              </div>
              <div className="w-14 h-14 bg-orange-200 rounded-2xl flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-orange-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Modern Navigation Tabs */}
        <Card className="p-6 bg-white shadow-sm border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
              <button
                onClick={() => setShowDetail(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  !showDetail 
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                    : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <ChartBarIcon className="w-5 h-5 mr-2 inline" />
                Rekapitulasi Bulanan
              </button>
              <button
                onClick={() => setShowDetail(true)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  showDetail 
                    ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                    : 'bg-transparent text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2 inline" />
                Detail Per Karyawan
              </button>
            </div>
            
            <div className="text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Data terupdate otomatis
              </span>
            </div>
          </div>
        </Card>

        {!showDetail ? (
          <>
            {/* Modern Filters for Rekap */}
            <Card className="p-6 bg-white shadow-sm border-0">
              <div className="flex items-center gap-3 mb-4">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Filter Periode</h3>
                <Button 
                  className="ml-auto bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm"
                  onClick={() => setSelectedPeriode('')}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Periode</label>
                  <select
                    value={selectedPeriode}
                    onChange={(e) => setSelectedPeriode(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-200"
                  >
                    <option value="">Semua Periode</option>
                    {availablePeriodes.map(periode => (
                      <option key={periode} value={periode}>
                        {formatPeriode(periode)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Modern Rekap Table */}
            <Card className="overflow-hidden shadow-lg border-0">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Rekapitulasi Bulanan</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Ringkasan penggajian per periode - <span className="font-semibold text-blue-600">{filteredRekap.length}</span> periode
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Data terintegrasi</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 font-medium">Memuat data rekapitulasi...</p>
                    </div>
                  </div>
                ) : filteredRekap.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <DocumentChartBarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">Belum ada data rekapitulasi</p>
                      <p className="text-sm text-slate-500 mt-2">Data akan muncul setelah ada slip gaji yang dibuat</p>
                    </div>
                  </div>
                ) : (
                  <Table
                    data={filteredRekap}
                    columns={rekapColumns}
                  />
                )}
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* Modern Filters for Detail */}
            <Card className="p-6 bg-white shadow-sm border-0">
              <div className="flex items-center gap-3 mb-4">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Filter & Pencarian Detail</h3>
                <Button 
                  className="ml-auto bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDetailPeriode('');
                  }}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cari Karyawan</label>
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" style={{top: 'calc(50% + 12px)'}} />
                  <input
                    type="text"
                    placeholder="Nama atau NIP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Periode</label>
                  <select
                    value={selectedDetailPeriode}
                    onChange={(e) => setSelectedDetailPeriode(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-200"
                  >
                    <option value="">Semua Periode</option>
                    {availablePeriodes.map(periode => (
                      <option key={periode} value={periode}>
                        {formatPeriode(periode)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Modern Detail Table */}
            <Card className="overflow-hidden shadow-lg border-0">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Detail Gaji Per Karyawan
                      {selectedDetailPeriode && (
                        <span className="text-blue-600"> - {formatPeriode(selectedDetailPeriode)}</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Rincian gaji setiap karyawan - <span className="font-semibold text-blue-600">{filteredDetail.length}</span> karyawan
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Live data</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 font-medium">Memuat detail karyawan...</p>
                    </div>
                  </div>
                ) : filteredDetail.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">Tidak ada data karyawan</p>
                      <p className="text-sm text-slate-500 mt-2">Coba ubah filter atau periode yang dipilih</p>
                    </div>
                  </div>
                ) : (
                  <Table
                    data={filteredDetail}
                    columns={detailColumns}
                  />
                )}
              </div>
            </Card>
          </>
        )}

        {/* Setup Payroll Modal */}
        {showSetupPayrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4">
              <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                ⚙️ Setup Payroll
              </h2>
              <p className="text-gray-700 mb-6 text-center">
                Modal Setup Payroll telah dibuka dengan sukses!
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowSetupPayrollModal(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    console.log('Setup Payroll clicked!');
                    setShowSetupPayrollModal(false);
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Konfigurasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PayrollLayout>
  );
};

export default RekapSlipGaji;
