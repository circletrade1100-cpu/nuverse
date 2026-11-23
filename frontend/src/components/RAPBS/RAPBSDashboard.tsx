import React, { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';
import type { DashboardData } from '../../types/rapbs';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const RAPBSDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rapbsService.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Tidak ada data tersedia
      </div>
    );
  }

  const { budget_summary, funding_sources, category_breakdown } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard RAPBS</h2>
        <p className="text-gray-600 mt-1">Monitoring anggaran dan realisasi keuangan sekolah</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Anggaran"
          value={formatCurrency(budget_summary.total_budget)}
          icon={BanknotesIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Realisasi"
          value={formatCurrency(budget_summary.total_realization)}
          subtitle={formatPercent(budget_summary.utilization_rate)}
          icon={ChartBarIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Sisa Anggaran"
          value={formatCurrency(budget_summary.remaining_budget)}
          icon={BanknotesIcon}
          color="bg-orange-500"
        />
        <StatCard
          title="Tingkat Utilisasi"
          value={formatPercent(budget_summary.utilization_rate)}
          subtitle={`${formatCurrency(budget_summary.total_realization)} dari ${formatCurrency(budget_summary.total_budget)}`}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Sources */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sumber Dana</h3>
          <div className="space-y-4">
            {funding_sources.map((source, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{source.source}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPercent(source.percentage)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Anggaran: {formatCurrency(source.budget)}</span>
                  <span>Realisasi: {formatCurrency(source.realization)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Kategori</h3>
          <div className="space-y-4">
            {category_breakdown.map((category, index) => {
              const percentage = category.budget > 0 ? (category.realization / category.budget) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercent(percentage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Anggaran: {formatCurrency(category.budget)}</span>
                    <span>Realisasi: {formatCurrency(category.realization)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budget Utilization Chart */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tingkat Penggunaan Anggaran</h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Realisasi
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {formatPercent(budget_summary.utilization_rate)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${budget_summary.utilization_rate}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                budget_summary.utilization_rate >= 90
                  ? 'bg-red-500'
                  : budget_summary.utilization_rate >= 70
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAPBSDashboard;

