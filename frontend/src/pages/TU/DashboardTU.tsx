import React, { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import TULayout from '../../components/TU/TULayout';
import { useTUDashboard, useAttendance, useSPPReminders } from '../../hooks/useTU';

interface SPPReminder {
  id: number;
  student_name: string;
  class: string;
  student_number?: string;
  bill_type: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  period_month?: number;
  period_year?: number;
  status: string;
  days_overdue?: number;
  months_overdue?: number;
  days_until_due?: number;
  parent_contact?: string;
  reminder_type: 'overdue' | 'upcoming' | 'future';
  created_at?: string;
  updated_at?: string;
}

interface AttendanceRecord {
  id: string;
  employeeName: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'late' | 'absent' | 'sick' | 'leave';
  location: string;
}

const DashboardTU: React.FC = () => {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // API hooks
  const {
    dashboardData,
    isLoading: isLoadingDashboard,
    refreshDashboard
  } = useTUDashboard();

  const {
    attendanceLogs,
    myAttendance,
    isLoading: isLoadingAttendance,
    fetchMyAttendance
  } = useAttendance();

  const {
    reminders: sppRemindersData,
    pagination,
    isLoading: isLoadingSPP,
    refreshReminders: refreshSPP
  } = useSPPReminders();

  // Load data on component mount
  useEffect(() => {
    refreshDashboard();
    fetchMyAttendance('daily');
    refreshSPP();
  }, [refreshDashboard, fetchMyAttendance, refreshSPP]);

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filtering
    const filters: { dateFrom?: string; dateTo?: string; page?: number; perPage?: number } = {
      page: 1,
      perPage: 10
    };
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    refreshSPP(filters);
  };

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    refreshSPP({ page: 1, perPage: 10 });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const filters: { dateFrom?: string; dateTo?: string; page?: number; perPage?: number } = {
      page,
      perPage: 10
    };
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    refreshSPP(filters);
  };

  // Extract data from API response atau use defaults
  const todayIncome = dashboardData?.income?.today || 0;
  const todayExpense = dashboardData?.expense?.today || 0;
  const cashBalance = dashboardData?.cash_balance || 0;
  const pendingApprovals = dashboardData?.pending_approvals || 0;
  const attendanceToday = {
    present: dashboardData?.attendance?.present || 0,
    total: dashboardData?.attendance?.total || 0
  };

  // Use real data from API or fallback to empty arrays
  const sppReminders: SPPReminder[] = sppRemindersData || [];
  const todayAttendance: AttendanceRecord[] = attendanceLogs?.map((attendance: any) => ({
    id: attendance.id.toString(),
    employeeName: attendance.user?.name || 'Unknown',
    checkIn: attendance.check_in ? new Date(attendance.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '',
    checkOut: attendance.check_out ? new Date(attendance.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : undefined,
    status: attendance.status as 'present' | 'late' | 'absent' | 'sick' | 'leave',
    location: attendance.location || 'Kantor TU'
  })) || [];

  const stats = [
    {
      title: 'Total Pemasukan Hari Ini',
      value: `Rp ${todayIncome.toLocaleString('id-ID')}`,
      icon: ArrowUpIcon,
      change: '+12%',
      changeType: 'increase',
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Jumlah Pengeluaran',
      value: `Rp ${todayExpense.toLocaleString('id-ID')}`,
      icon: ArrowDownIcon,
      change: '+5%',
      changeType: 'increase',
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Saldo Kas',
      value: `Rp ${cashBalance.toLocaleString('id-ID')}`,
      icon: BanknotesIcon,
      change: 'Total',
      changeType: 'neutral',
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Status Absensi TU Hari Ini',
      value: `${attendanceToday.present}/${attendanceToday.total}`,
      icon: UsersIcon,
      change: '90%',
      changeType: 'neutral',
      gradient: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  // Loading component
  if (isLoadingDashboard) {
    return (
      <TULayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard TU Analytics</h1>
            <p className="text-slate-600 mt-1">Monitoring real-time keuangan dan operasional Tata Usaha</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TULayout>
    );
  }

  return (
    <TULayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard TU Analytics</h1>
            <p className="text-slate-600 mt-1">Monitoring real-time keuangan dan operasional Tata Usaha</p>
          </div>
          <button
            onClick={() => {
              refreshDashboard();
              fetchMyAttendance('daily');
              refreshSPP();
            }}
            disabled={isLoadingDashboard || isLoadingAttendance || isLoadingSPP}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
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

      {/* Reminder Tagihan - Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Reminder Tagihan Siswa</h2>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600">
              {sppReminders.filter(r => r.reminder_type === 'overdue').length} Jatuh Tempo
              {sppReminders.filter(r => r.reminder_type === 'upcoming').length > 0 && (
                <span className="text-blue-600 ml-2">
                  | {sppReminders.filter(r => r.reminder_type === 'upcoming').length} Mendatang
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter Tanggal:</span>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Dari:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Ke:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFilterChange}
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Filter
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-1.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {sppReminders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Siswa</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Kelas</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Tagihan</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Dibayar</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Sisa</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Jatuh Tempo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {sppReminders.map((reminder) => (
                  <tr key={reminder.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{reminder.student_name}</p>
                        <p className="text-xs text-slate-500">{reminder.student_number}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {reminder.class}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-800">
                        Rp {reminder.total_amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-600 font-medium">
                        Rp {reminder.paid_amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-bold ${
                        reminder.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Rp {reminder.remaining_amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-700">
                        {new Date(reminder.due_date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reminder.reminder_type === 'overdue' 
                          ? 'bg-red-100 text-red-800'
                          : reminder.reminder_type === 'upcoming'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {reminder.reminder_type === 'overdue' ? 'Jatuh Tempo' :
                         reminder.reminder_type === 'upcoming' ? 'Mendatang' : 'Normal'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-slate-600">
                        {reminder.reminder_type === 'overdue' && (
                          <span className="text-red-600">
                            {reminder.months_overdue || 1} bulan tertunggak ({reminder.days_overdue} hari)
                          </span>
                        )}
                        {reminder.reminder_type === 'upcoming' && (
                          <span className="text-amber-600">
                            Jatuh tempo dalam {reminder.days_until_due} hari
                          </span>
                        )}
                        {reminder.reminder_type === 'future' && (
                          <span className="text-green-600">
                            Masih normal
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg font-medium">Tidak ada data tagihan SPP</p>
              <p className="text-sm text-slate-400 mt-1">
                {dateFrom || dateTo ? 'Coba ubah filter tanggal atau reset filter' : 'Semua pembayaran sudah lunas!'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} data
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pagination.has_prev
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                Sebelumnya
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.current_page;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {pagination.total_pages > 5 && (
                  <>
                    <span className="px-2 text-slate-400">...</span>
                    <button
                      onClick={() => handlePageChange(pagination.total_pages)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pagination.current_page === pagination.total_pages
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pagination.total_pages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pagination.has_next
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Absensi TU Hari Ini */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Status Absensi TU Hari Ini</h2>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600">{attendanceToday.present}/{attendanceToday.total} Hadir</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingAttendance ? (
            // Loading skeleton for attendance
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </div>
              </div>
            ))
          ) : todayAttendance.length > 0 ? (
            todayAttendance.map((attendance) => (
              <div key={attendance.id} className={`p-4 rounded-xl border-2 ${
                attendance.status === 'present' ? 'bg-green-50 border-green-200' :
                attendance.status === 'late' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-800">{attendance.employeeName}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attendance.status === 'present' ? 'bg-green-100 text-green-700' :
                    attendance.status === 'late' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {attendance.status === 'present' ? 'Hadir' :
                     attendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Masuk: {attendance.checkIn || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{attendance.location}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-slate-600">Belum ada data absensi hari ini</p>
              <p className="text-sm text-slate-400">Data akan muncul setelah karyawan melakukan check-in</p>
            </div>
          )}
        </div>
              </div>
      </div>
    </TULayout>
  );
};

export default DashboardTU;
