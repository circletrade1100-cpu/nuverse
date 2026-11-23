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
  DocumentChartBarIcon
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

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      posted: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'receipt':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pendapatan */}
          <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25">
                      <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3 flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      +12.5%
                      <ArrowUpIcon className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-slate-500 mt-1">vs bulan lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Beban */}
          <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                      <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3 flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      +5.2%
                      <ArrowUpIcon className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Beban</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalExpense)}</p>
                  <p className="text-xs text-slate-500 mt-1">vs bulan lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Laba Bersih */}
          <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3 flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      +8.3%
                      <ArrowUpIcon className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Laba Bersih</p>
                  <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {formatCurrency(stats.netIncome)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">vs bulan lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Saldo Kas */}
          <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/30"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-500/25">
                      <BanknotesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3 flex items-center text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      +3.7%
                      <ArrowUpIcon className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Saldo Kas</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.cashBalance)}</p>
                  <p className="text-xs text-slate-500 mt-1">vs bulan lalu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Piutang */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CurrencyDollarIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-600">Piutang</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.accountsReceivable)}</p>
              </div>
            </div>
          </div>

          {/* Hutang */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-600">Hutang</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.accountsPayable)}</p>
              </div>
            </div>
          </div>

          {/* Total Jurnal */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentChartBarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-600">Total Jurnal</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{stats.journalEntriesCount}</p>
              </div>
            </div>
          </div>

          {/* Jurnal Belum Posted */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-600">Jurnal Belum Posted</span>
                </div>
                <p className="text-xl font-bold text-red-600">{stats.unpostedEntries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Lihat Semua
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                        <p className="text-sm font-semibold text-slate-700 mt-0.5">{formatCurrency(activity.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(activity.status)}
                      <span className="text-sm text-slate-500 whitespace-nowrap">{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Belum ada aktivitas</p>
                <p className="text-sm text-slate-400 mt-1">Aktivitas terbaru akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-5 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button className="w-full group flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl text-blue-700 font-medium transition-all duration-200 border border-blue-100 hover:border-blue-200">
                <DocumentTextIcon className="h-4 w-4 mr-3" />
                <span>Buat Jurnal Baru</span>
              </button>
              <button className="w-full group flex items-center px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl text-green-700 font-medium transition-all duration-200 border border-green-100 hover:border-green-200">
                <ChartBarIcon className="h-4 w-4 mr-3" />
                <span>Lihat Laporan Keuangan</span>
              </button>
              <button className="w-full group flex items-center px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl text-purple-700 font-medium transition-all duration-200 border border-purple-100 hover:border-purple-200">
                <CalculatorIcon className="h-4 w-4 mr-3" />
                <span>Trial Balance</span>
              </button>
            </div>
          </div>

          {/* Notifikasi */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-5 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
              Notifikasi
            </h4>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-amber-900">
                    {stats.unpostedEntries} jurnal belum di-post
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">Segera posting jurnal yang pending</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    Periode akuntansi Januari 2025 masih terbuka
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">Tutup periode setelah semua jurnal complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rasio Keuangan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-5 flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2 text-emerald-600" />
              Rasio Keuangan
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Expense Ratio</span>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-slate-900 mr-2">86.7%</span>
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Revenue Growth</span>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-green-600 mr-2">+12.5%</span>
                  <ArrowUpIcon className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Cash Coverage</span>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-slate-900 mr-2">2.8 bulan</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
