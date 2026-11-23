import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  DocumentChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/20/solid';

interface DashboardStats {
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  journalEntriesCount: number;
  unpostedEntries: number;
}

interface RecentActivity {
  id: number;
  type: 'journal' | 'payment' | 'receipt';
  description: string;
  amount: number;
  date: string;
  status: 'posted' | 'draft' | 'pending';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpense: 0,
    netIncome: 0,
    cashBalance: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    journalEntriesCount: 0,
    unpostedEntries: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const response = await accountingService.getDashboard();
      
      // Mock data for now
      setTimeout(() => {
        setStats({
          totalRevenue: 750000000,
          totalExpense: 650000000,
          netIncome: 100000000,
          cashBalance: 125000000,
          accountsReceivable: 50000000,
          accountsPayable: 25000000,
          journalEntriesCount: 156,
          unpostedEntries: 8
        });

        setRecentActivities([
          {
            id: 1,
            type: 'journal',
            description: 'Jurnal Pembayaran Gaji Guru',
            amount: 45000000,
            date: '2025-01-15',
            status: 'posted'
          },
          {
            id: 2,
            type: 'receipt',
            description: 'Penerimaan SPP Januari',
            amount: 25000000,
            date: '2025-01-15',
            status: 'posted'
          },
          {
            id: 3,
            type: 'payment',
            description: 'Pembayaran Listrik',
            amount: 3500000,
            date: '2025-01-14',
            status: 'draft'
          },
          {
            id: 4,
            type: 'journal',
            description: 'Jurnal Penyesuaian Persediaan',
            amount: 2000000,
            date: '2025-01-14',
            status: 'pending'
          }
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-700 bg-clip-text text-transparent">
                Dashboard Akuntansi
              </h1>
              <div className="flex items-center mt-3 space-x-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1.5" />
                  <span>Periode: Januari 2025</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1.5" />
                  <span>Update terakhir: {new Date().toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm">
                <EyeIcon className="w-4 h-4 mr-2" />
                Lihat Laporan
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25">
                <PlusIcon className="w-4 h-4 mr-2" />
                Buat Jurnal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Main Dashboard Cards - 3 columns, 2 rows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Aktivitas Terakhir */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terakhir</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 ml-2">
                          13:52
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-600 font-medium">
                    {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">05</p>
                  <p className="text-sm text-slate-500">Okt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tagihan Mendatang */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Tagihan Mendatang</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">SI.2022.08.00010</p>
                    <p className="text-xs text-slate-500">Jatuh tempo piutang, Toko Chikaka</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">SI.2022.08.00015</p>
                    <p className="text-xs text-slate-500">Jatuh tempo piutang, Toko H. Markaya</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">SI.2022.08.00010</p>
                    <p className="text-xs text-slate-500">Jatuh tempo piutang, Toko Makmur</p>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-600 font-medium">Kamis</p>
                  <p className="text-2xl font-bold text-slate-900">06</p>
                  <p className="text-sm text-slate-500">Okt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Aset Saat Ini */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Aset saat ini</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600 mb-1">Per Hari ini</p>
                <p className="text-sm text-slate-600 mb-2">Total</p>
                <p className="text-3xl font-bold text-slate-900">Rp 194.258.000</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">10%</span>
                  </div>
                  <p className="text-xs text-slate-500">Dibanding Bulan lalu</p>
                  <p className="text-sm font-medium text-slate-700">Rp 193.148.333</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-green-600">20%</span>
                  </div>
                  <p className="text-xs text-slate-500">Dibanding Tahun lalu</p>
                  <p className="text-sm font-medium text-slate-700">Rp 184.222.301</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Arus Kas Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Arus Kas</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Rentang Seminggu terakhir</p>
              </div>
              {/* Cash Flow Chart */}
              <div className="relative h-32 mb-4">
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
                  {[
                    { in: 40, out: 20, net: 20 },
                    { in: 60, out: 30, net: 30 },
                    { in: 45, out: 35, net: 10 },
                    { in: 70, out: 25, net: 45 },
                    { in: 55, out: 40, net: 15 },
                    { in: 80, out: 20, net: 60 },
                    { in: 65, out: 30, net: 35 }
                  ].map((data, index) => (
                    <div key={index} className="flex flex-col items-center w-8">
                      <div className="flex flex-col space-y-0.5">
                        <div className="w-6 bg-green-400 rounded-t" style={{ height: `${data.in * 0.8}px` }}></div>
                        <div className="w-6 bg-red-400" style={{ height: `${data.out * 0.8}px` }}></div>
                        <div className="w-6 bg-blue-400 rounded-b" style={{ height: `${data.net * 0.8}px` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{5 + index} Des</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded mr-1"></div>
                  <span className="text-slate-600">Kas Masuk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
                  <span className="text-slate-600">Kas Keluar</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded mr-1"></div>
                  <span className="text-slate-600">Kas Bersih</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Grafik Pendapatan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Grafik Pendapatan</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">Rentang Seminggu terakhir</p>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">8 Des</p>
                  <p className="text-sm text-slate-600">Rp. 10.250.000</p>
                </div>
              </div>
              {/* Revenue Line Chart */}
              <div className="relative h-24 mb-4">
                <svg className="w-full h-full" viewBox="0 0 280 80">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="20,60 60,50 100,40 140,35 180,30 220,20 260,15"
                  />
                  {[
                    { x: 20, y: 60 },
                    { x: 60, y: 50 },
                    { x: 100, y: 40 },
                    { x: 140, y: 35 },
                    { x: 180, y: 30 },
                    { x: 220, y: 20 },
                    { x: 260, y: 15 }
                  ].map((point, index) => (
                    <circle key={index} cx={point.x} cy={point.y} r="3" fill="#3B82F6" />
                  ))}
                </svg>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>5 Des</span>
                <span>6 Des</span>
                <span>7 Des</span>
                <span>8 Des</span>
                <span>9 Des</span>
                <span>10 Des</span>
                <span>11 Des</span>
              </div>
            </div>
          </div>

          {/* Card 6: Pendapatan per Hari */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Pendapatan per Hari</h3>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">18 Okt 2021</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-green-600">Rp 5.550.069</p>
                <p className="text-sm text-slate-600 mt-1">Total</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Jumlah Transaksi</span>
                  <span className="font-semibold text-slate-900">50 kali</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Jenis Pembayaran</span>
                  <span className="font-semibold text-slate-900">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Jumlah Siswa</span>
                  <span className="font-semibold text-slate-900">150</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section - Similar layout from original */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Faktur Terlewat */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Faktur Terlewat</h3>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-red-600 mb-1">Rp 1.500.000</p>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="text-xs text-slate-500">Rp. 500.000 tertunggak</p>
              </div>
              
              {/* Modern Progress Bars */}
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">1-7 Hari</span>
                    <span className="text-sm font-bold text-yellow-600">Rp 500.000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full shadow-sm" style={{ width: '33%' }}></div>
                  </div>
                </div>
                
                <div className="bg-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">8-30 Hari</span>
                    <span className="text-sm font-bold text-orange-600">Rp 500.000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full shadow-sm" style={{ width: '33%' }}></div>
                  </div>
                </div>
                
                <div className="bg-slate-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">&gt; 30 Hari</span>
                    <span className="text-sm font-bold text-red-600">Rp 500.000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full shadow-sm" style={{ width: '34%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-700">12 faktur belum dilunas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Laba/Rugi Tahun Ini */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Laba/Rugi Tahun Ini</h3>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">Rentang 1 Jan - 17 Okt 2022</span>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                {/* Modern Donut Chart */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#F1F5F9" strokeWidth="8"/>
                    
                    {/* Pendapatan - 60% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientPendapatan)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="131.9 88"
                      strokeDashoffset="0"
                      className="drop-shadow-sm"
                    />
                    
                    {/* HPP - 25% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientHPP)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="55 165"
                      strokeDashoffset="-131.9"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Pengeluaran - 15% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientPengeluaran)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="33 187"
                      strokeDashoffset="-186.9"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="gradientPendapatan" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981"/>
                        <stop offset="100%" stopColor="#059669"/>
                      </linearGradient>
                      <linearGradient id="gradientHPP" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B"/>
                        <stop offset="100%" stopColor="#D97706"/>
                      </linearGradient>
                      <linearGradient id="gradientPengeluaran" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EF4444"/>
                        <stop offset="100%" stopColor="#DC2626"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">60%</p>
                      <p className="text-xs text-slate-500">Profit</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend dengan design modern */}
              <div className="space-y-3">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Pendapatan</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">30%</span>
                      </div>
                    </div>
                    <span className="font-bold text-green-700">Rp 780.000.000</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Nilai HPP</span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">-5%</span>
                      </div>
                    </div>
                    <span className="font-bold text-amber-700">Rp 300.000.000</span>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Pengeluaran</span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">-3%</span>
                      </div>
                    </div>
                    <span className="font-bold text-red-700">Rp 35.000.000</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900">Laba</span>
                    <p className="text-xs text-slate-500">(Dibanding 1 Jan - 17 Okt 2021)</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">Rp 445.000.000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Beban Perusahaan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Beban Perusahaan</h3>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">Rentang Bulan ini</span>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                {/* Modern Donut Chart for Expenses */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#F1F5F9" strokeWidth="8"/>
                    
                    {/* Gaji & Benefits - 50% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientGaji)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="110 110"
                      strokeDashoffset="0"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Operasional - 30% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientOps)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="66 154"
                      strokeDashoffset="-110"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Utilitas - 15% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientUtilitas)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="33 187"
                      strokeDashoffset="-176"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Lainnya - 5% */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="35" 
                      fill="none" 
                      stroke="url(#gradientLainnya)" 
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="11 209"
                      strokeDashoffset="-209"
                      className="drop-shadow-sm"
                    />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="gradientGaji" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06B6D4"/>
                        <stop offset="100%" stopColor="#0891B2"/>
                      </linearGradient>
                      <linearGradient id="gradientOps" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B"/>
                        <stop offset="100%" stopColor="#D97706"/>
                      </linearGradient>
                      <linearGradient id="gradientUtilitas" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6"/>
                        <stop offset="100%" stopColor="#2563EB"/>
                      </linearGradient>
                      <linearGradient id="gradientLainnya" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EF4444"/>
                        <stop offset="100%" stopColor="#DC2626"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">89%</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-red-600 mb-1">Rp 445.000.000</p>
                <p className="text-sm text-slate-600">Beban</p>
              </div>
              
              {/* Legend dengan design modern */}
              <div className="space-y-3">
                <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Gaji & Tunjangan</span>
                        <span className="text-xs text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full ml-2">0%</span>
                      </div>
                    </div>
                    <span className="font-bold text-cyan-700">Rp 200.000.000</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Operasional</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">-2%</span>
                      </div>
                    </div>
                    <span className="font-bold text-amber-700">Rp 150.000.000</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Utilitas</span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">-3%</span>
                      </div>
                    </div>
                    <span className="font-bold text-blue-700">Rp 70.000.000</span>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-3"></div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">Beban Lainnya</span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full ml-2">-3%</span>
                      </div>
                    </div>
                    <span className="font-bold text-red-700">Rp 25.000.000</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-6 text-center bg-slate-50 rounded-lg p-2">(Dibanding 1 Jan - 17 Okt 2021)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
