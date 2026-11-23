import React, { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { lpjService } from '../../services/lpjService';
import type { LPJDashboardData } from '../../types/lpj';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const LPJDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<LPJDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await lpjService.getDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Error loading LPJ dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-500 py-8">Tidak ada data tersedia</div>;
  }

  const { total_lpj, status_summary, approval_rate, recent_lpjs } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard LPJ</h2>
        <p className="text-gray-600 mt-1">Laporan Pertanggung Jawaban</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total LPJ"
          value={total_lpj}
          icon={DocumentTextIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Approval Rate"
          value={`${approval_rate.toFixed(1)}%`}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Draft"
          value={status_summary.draft || 0}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Finalized"
          value={status_summary.finalized || 0}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
      </div>

      {recent_lpjs.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">LPJ Terbaru</h3>
          <div className="space-y-3">
            {recent_lpjs.map((lpj) => (
              <div key={lpj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{lpj.title}</p>
                  <p className="text-sm text-gray-500">
                    {lpj.academic_year?.year} - {lpj.periode_type}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lpj.status === 'finalized' ? 'bg-green-100 text-green-800' :
                  lpj.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  lpj.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lpj.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LPJDashboard;

