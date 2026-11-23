import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { danusService, type DanusDashboard as DanusDashboardType, type UnitPerformanceReport, type ProfitLossReport } from '../../services/danusService';

// Helper function to calculate bar height safely
const getBarHeight = (value: number, data: any[], type: 'income' | 'expense'): number => {
  if (!data || data.length === 0) return 0;
  const maxValue = Math.max(...data.map((item: any) => item[type] || 0));
  if (maxValue === 0) return 0;
  return (value / maxValue) * 200;
};

const DanusDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DanusDashboardType | null>(null);
  const [unitPerformance, setUnitPerformance] = useState<UnitPerformanceReport[]>([]);
  const [profitLossData, setProfitLossData] = useState<ProfitLossReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUnitPerformance();
    fetchProfitLoss();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await danusService.getDashboard(dateRange);
      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error('Dashboard API returned error:', response.message);
        // Set default data jika API error
        setDashboardData({
          summary: {
            total_income: 0,
            total_expense: 0,
            net_profit: 0,
            total_units: 0,
            active_units: 0,
            pending_transactions: 0,
            profit_margin: 0
          },
          recent_transactions: [],
          unit_performance: [],
          monthly_trend: [],
          trends: {
            income: { value: 0, isPositive: true },
            expense: { value: 0, isPositive: true },
            profit: { value: 0, isPositive: true }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data jika connection error
      setDashboardData({
        summary: {
          total_income: 0,
          total_expense: 0,
          net_profit: 0,
          total_units: 0,
          active_units: 0,
          pending_transactions: 0
        },
        recent_transactions: [],
        unit_performance: [],
        trends: {
          income: { value: 0, isPositive: true },
          expense: { value: 0, isPositive: true },
          profit: { value: 0, isPositive: true }
        }
      });
    }
  };

  const fetchUnitPerformance = async () => {
    try {
      const response = await danusService.getUnitPerformanceReport(dateRange);
      if (response.success) {
        setUnitPerformance(response.data);
      } else {
        setUnitPerformance([]);
      }
    } catch (error) {
      console.error('Error fetching unit performance:', error);
      setUnitPerformance([]);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      const response = await danusService.getProfitLossReport(dateRange);
      if (response.success) {
        setProfitLossData(response.data);
      } else {
        setProfitLossData(null);
      }
    } catch (error) {
      console.error('Error fetching profit loss data:', error);
      setProfitLossData(null);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [dashboardData, unitPerformance, profitLossData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }> = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <ArrowTrendingUpIcon className={`h-4 w-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
                    <span className="ml-1">{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Kosong</h3>
          <p className="text-gray-500">Belum ada data untuk ditampilkan. Mulai dengan menambahkan unit usaha dan transaksi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard DANUS</h1>
            <p className="text-gray-600">Manajemen Dana Usaha</p>
          </div>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(dashboardData.summary.total_income)}
          icon={ArrowTrendingUpIcon}
          color="text-green-600"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(dashboardData.summary.total_expense)}
          icon={ArrowTrendingDownIcon}
          color="text-red-600"
        />
        <StatCard
          title="Laba Bersih"
          value={formatCurrency(dashboardData.summary.net_profit)}
          icon={CurrencyDollarIcon}
          color={dashboardData.summary.net_profit >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Margin Laba"
          value={`${(dashboardData.summary.profit_margin || 0).toFixed(1)}%`}
          icon={ChartBarIcon}
          color={dashboardData.summary.profit_margin >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Menunggu Persetujuan"
          value={dashboardData.summary.pending_approvals}
          icon={ClockIcon}
          color="text-yellow-600"
        />
        <StatCard
          title="Unit Aktif"
          value={dashboardData.summary.active_units}
          icon={BuildingOfficeIcon}
          color="text-blue-600"
        />
        <StatCard
          title="Total Unit"
          value={dashboardData.summary.active_units + (dashboardData.summary.active_units * 0.2)}
          icon={BuildingOfficeIcon}
          color="text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Performance */}
        <ChartCard title="Performa Unit Usaha">
          <div className="space-y-4">
            {(unitPerformance || []).slice(0, 5).map((unit) => (
              <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{unit.name}</div>
                  <div className="text-sm text-gray-500">{unit.type}</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    unit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(unit.net_profit)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(unit.profit_margin || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Transactions */}
        <ChartCard title="Transaksi Terbaru">
          <div className="space-y-3">
            {(dashboardData.recent_transactions || []).slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 truncate max-w-xs">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.business_unit?.name} • {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.status_label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Monthly Trend Chart */}
      <ChartCard title="Trend Bulanan">
        <div className="h-64 flex items-end justify-between space-x-2">
          {(dashboardData.monthly_trend || []).map((month) => (
            <div key={month.month} className="flex flex-col items-center space-y-2 flex-1">
              <div className="w-full flex flex-col space-y-1">
                <div 
                  className="bg-green-500 rounded-t"
                  style={{ height: `${getBarHeight(month.income, dashboardData.monthly_trend || [], 'income')}px` }}
                  title={`Pemasukan: ${formatCurrency(month.income)}`}
                ></div>
                <div 
                  className="bg-red-500 rounded-b"
                  style={{ height: `${getBarHeight(month.expense, dashboardData.monthly_trend || [], 'expense')}px` }}
                  title={`Pengeluaran: ${formatCurrency(month.expense)}`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {month.month_label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Pemasukan</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Pengeluaran</span>
          </div>
        </div>
      </ChartCard>

      {/* Profit Loss Summary */}
      {profitLossData && (
        <ChartCard title="Ringkasan Laba Rugi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pemasukan per Unit</h4>
              <div className="space-y-2">
                {(profitLossData?.income_breakdown || []).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.unit_name}</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pengeluaran per Unit</h4>
              <div className="space-y-2">
                {(profitLossData?.expense_breakdown || []).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.unit_name}</span>
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default DanusDashboard;
