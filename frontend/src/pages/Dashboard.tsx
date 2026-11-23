import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ChartBarIcon,
  BellIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { studentService } from '../services/studentService';
// import UserDebug from '../components/Debug/UserDebug'; // Removed after debugging

const Dashboard: React.FC = () => {
  const [studentStats, setStudentStats] = useState({
    TK: 0,
    SD: 0,
    SMP: 0,
    SMA: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        setIsLoading(true);
        const stats = await studentService.getStatistics();
        setStudentStats(stats.by_unit_sekolah);
      } catch (error) {
        console.error('Error fetching student statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentStats();
  }, []);

  const stats = [
    {
      title: 'Jumlah Siswa TKIT',
      value: isLoading ? '...' : studentStats.TK.toString(),
      icon: AcademicCapIcon,
      change: '',
      changeType: 'neutral',
      subtitle: 'Total siswa TKIT',
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Jumlah Siswa SDIT', 
      value: isLoading ? '...' : studentStats.SD.toString(),
      icon: AcademicCapIcon,
      change: '',
      changeType: 'neutral',
      subtitle: 'Total siswa SDIT',
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Jumlah Siswa SMPIT',
      value: isLoading ? '...' : studentStats.SMP.toString(),
      icon: AcademicCapIcon,
      change: '',
      changeType: 'neutral',
      subtitle: 'Total siswa SMPIT',
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Jumlah Siswa SMAIT',
      value: isLoading ? '...' : studentStats.SMA.toString(),
      icon: AcademicCapIcon,
      change: '',
      changeType: 'neutral',
      subtitle: 'Total siswa SMAIT',
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ];


  const quickActions = [
    { name: 'Input Transaksi', icon: CurrencyDollarIcon, color: 'bg-blue-500' },
    { name: 'Lihat Laporan', icon: ChartBarIcon, color: 'bg-emerald-500' },
    { name: 'Kelola User', icon: UsersIcon, color: 'bg-purple-500' },
    { name: 'Notifikasi', icon: BellIcon, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 space-y-8">
        {/* Debug Component removed after successful testing */}
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600 mt-1">Selamat datang di Sistem Manajemen Sekolah Annur</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-outline btn-sm border-slate-300 text-slate-600 hover:bg-slate-100">
              <ClockIcon className="w-4 h-4" />
              Hari ini
            </button>
            <button className="btn btn-primary btn-sm">
              <EyeIcon className="w-4 h-4" />
              Lihat Semua
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-7 h-7 ${stat.iconColor}`} />
                    </div>
                    {stat.change && (
                      <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                        stat.changeType === 'increase' ? 'bg-emerald-50 border border-emerald-200' :
                        stat.changeType === 'decrease' ? 'bg-red-50 border border-red-200' :
                        stat.changeType === 'warning' ? 'bg-amber-50 border border-amber-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}>
                        {stat.changeType === 'increase' && <ArrowUpIcon className="w-3.5 h-3.5 text-emerald-600" />}
                        {stat.changeType === 'decrease' && <ArrowDownIcon className="w-3.5 h-3.5 text-red-600" />}
                        <span className={`text-xs font-semibold ${
                          stat.changeType === 'increase' ? 'text-emerald-700' :
                          stat.changeType === 'decrease' ? 'text-red-700' :
                          stat.changeType === 'warning' ? 'text-amber-700' :
                          'text-blue-700'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600 tracking-wide uppercase">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.subtitle}</p>
                  </div>
                </div>

                {/* Subtle border glow on hover */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  stat.changeType === 'increase' ? 'ring-1 ring-emerald-200' :
                  stat.changeType === 'decrease' ? 'ring-1 ring-red-200' :
                  stat.changeType === 'warning' ? 'ring-1 ring-amber-200' :
                  'ring-1 ring-blue-200'
                }`}></div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Aksi Cepat</h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button key={index} className="group flex flex-col items-center gap-4 p-6 rounded-2xl hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-slate-200">
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    );
};

export default Dashboard;

