import React, { useState, useEffect } from 'react';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';

interface ReportCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
  >
    <div className="flex items-center mb-4">
      <div className="text-3xl mr-3">{icon}</div>
      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {title}
      </h4>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
      Lihat Laporan
      <svg
        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
);

const RAPBSReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    academic_year_id: '',
    start_date: '',
    end_date: '',
  });

  const loadReport = async (reportType: string) => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'plan-vs-realization':
          response = await rapbsService.getPlanVsRealization(filters);
          break;
        case 'realization-summary':
          response = await rapbsService.getRealizationSummary(filters);
          break;
        case 'variance-analysis':
          response = await rapbsService.getVarianceAnalysis(filters);
          break;
        case 'performance':
          response = await rapbsService.getPerformanceReport(filters);
          break;
        default:
          return;
      }
      
      if (response.success) {
        setReportData(response.data);
        setSelectedReport(reportType);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (reportType: string) => {
    try {
      let blob;
      switch (reportType) {
        case 'summary':
          blob = await rapbsService.printSummary(filters);
          break;
        case 'detailed':
          blob = await rapbsService.printDetailed(filters);
          break;
        default:
          return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-rapbs-${reportType}-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Gagal mencetak laporan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!reportData) {
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedReport === 'plan-vs-realization' && 'Laporan Rencana vs Realisasi'}
              {selectedReport === 'realization-summary' && 'Ringkasan Realisasi'}
              {selectedReport === 'variance-analysis' && 'Analisis Varians'}
              {selectedReport === 'performance' && 'Laporan Performa'}
            </h3>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali
          </button>
        </div>

        {/* Report Data */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  if (selectedReport) {
    return (
      <div className="space-y-6">
        {renderReportContent()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Laporan RAPBS</h2>
        <p className="text-gray-600 mt-1">Pilih jenis laporan yang ingin Anda lihat</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Laporan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            placeholder="Dari Tanggal"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            placeholder="Sampai Tanggal"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setFilters({ academic_year_id: '', start_date: '', end_date: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Rencana vs Realisasi"
          description="Bandingkan rencana anggaran dengan realisasi aktual"
          icon="📊"
          onClick={() => loadReport('plan-vs-realization')}
        />
        <ReportCard
          title="Ringkasan Realisasi"
          description="Ringkasan lengkap realisasi anggaran"
          icon="📈"
          onClick={() => loadReport('realization-summary')}
        />
        <ReportCard
          title="Analisis Varians"
          description="Analisis perbedaan antara rencana dan realisasi"
          icon="📉"
          onClick={() => loadReport('variance-analysis')}
        />
        <ReportCard
          title="Laporan Performa"
          description="Evaluasi performa penggunaan anggaran"
          icon="🎯"
          onClick={() => loadReport('performance')}
        />
        <ReportCard
          title="Cetak Ringkasan"
          description="Download laporan ringkasan dalam format PDF"
          icon="🖨️"
          onClick={() => handlePrint('summary')}
        />
        <ReportCard
          title="Cetak Detail"
          description="Download laporan lengkap dalam format PDF"
          icon="📄"
          onClick={() => handlePrint('detailed')}
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Statistik Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Rencana</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Realisasi</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Tingkat Utilisasi</p>
            <p className="text-2xl font-bold">-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAPBSReports;

