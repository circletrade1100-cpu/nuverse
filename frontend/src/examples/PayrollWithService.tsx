import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Wallet,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { guruPayrollService } from '../services/guruPayrollService';
import type { PayrollData, PayrollHistoryItem } from '../services/guruPayrollService';

const PayrollWithService: React.FC = () => {
  const [showSalary, setShowSalary] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [activeTab, setActiveTab] = useState('overview');
  
  // State untuk data dari backend
  const [payrollData, setPayrollData] = useState<any>(null);
  const [riwayatGaji, setRiwayatGaji] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // TODO: Ini harus diambil dari context atau props yang berisi guruId
  // Untuk sementara menggunakan hardcoded guruId = 1
  const guruId = 1;

  // Fetch data dari backend menggunakan guruPayrollService
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Starting to fetch payroll data...');
        
        // Menggunakan service untuk mengambil data lengkap
        const { payrollData: rawPayrollData, historyData: rawHistoryData } = 
          await guruPayrollService.getGuruPayrollWithHistory(guruId);
        
        // Format data untuk UI
        const formattedPayrollData = rawPayrollData 
          ? guruPayrollService.formatPayrollForUI(rawPayrollData)
          : null;
        
        const formattedHistoryData = guruPayrollService.formatHistoryForUI(rawHistoryData);
        
        setPayrollData(formattedPayrollData);
        setRiwayatGaji(formattedHistoryData);
        
        console.log('✅ Payroll data loaded successfully');
      } catch (err) {
        console.error('❌ Error fetching payroll data:', err);
        setError(err instanceof Error ? err.message : 'Gagal mengambil data payroll');
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [guruId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dibayar': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Proses': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data payroll...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!payrollData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600">Belum ada data payroll untuk guru ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white text-xl font-semibold">Payroll</h1>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Salary Card */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-sm">Gaji Bulan Ini</p>
              <div className="flex items-center space-x-3">
                <span className="text-white text-2xl font-bold">
                  {showSalary ? formatCurrency(payrollData.netSalary) : '••••••••'}
                </span>
                <button 
                  onClick={() => setShowSalary(!showSalary)}
                  className="w-6 h-6 text-white/80 hover:text-white transition-colors"
                >
                  {showSalary ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-green-200">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+2.4%</span>
              </div>
              <p className="text-green-100 text-xs">vs bulan lalu</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-green-200 text-xs">Gaji Pokok</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.gajiPokok) : '••••••'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-200 text-xs">Tunjangan</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.totalTunjangan) : '••••••'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-200 text-xs">Potongan</p>
              <p className="text-white text-sm font-semibold">
                {showSalary ? formatCurrency(payrollData.totalPotongan) : '••••••'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-1 shadow-sm mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'detail' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Detail Gaji
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-center rounded-xl transition-colors ${
                activeTab === 'history' 
                  ? 'bg-green-600 text-white font-semibold' 
                  : 'text-gray-600'
              }`}
            >
              Riwayat
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Download Slip</p>
                    <p className="text-xs text-gray-600">Slip gaji bulan ini</p>
                  </div>
                </button>
                <button className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Grafik Gaji</p>
                    <p className="text-xs text-gray-600">Analisis tahunan</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">Total Diterima</p>
                <p className="text-xl font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.netSalary) : '••••••••'}
                </p>
                <p className="text-green-600 text-xs mt-1">+2.4% dari bulan lalu</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-gray-600 text-sm">Total Potongan</p>
                <p className="text-xl font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.totalPotongan) : '••••••••'}
                </p>
                <p className="text-red-500 text-xs mt-1">-1.2% dari bulan lalu</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Status Pembayaran</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gaji {payrollData.periode.bulan} {payrollData.periode.tahun}</p>
                      <p className="text-sm text-gray-600">Dibayar pada {new Date(payrollData.created_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {showSalary ? formatCurrency(payrollData.netSalary) : '••••••••'}
                    </p>
                    <p className="text-xs text-green-600">Transfer Bank</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'detail' && (
          <>
            {/* Gaji Pokok */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Gaji Pokok</h3>
                <span className="text-lg font-bold text-gray-800">
                  {showSalary ? formatCurrency(payrollData.gajiPokok) : '••••••••'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>

            {/* Tunjangan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Tunjangan</h3>
                <span className="text-lg font-bold text-green-600">
                  +{showSalary ? formatCurrency(payrollData.totalTunjangan) : '••••••••'}
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(payrollData.tunjangan).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-800">
                      {showSalary ? formatCurrency(value as number) : '••••••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potongan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Potongan</h3>
                <span className="text-lg font-bold text-red-600">
                  -{showSalary ? formatCurrency(payrollData.totalPotongan) : '••••••••'}
                </span>
              </div>
              <div className="space-y-3">
                {Object.entries(payrollData.potongan).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-800">
                      {showSalary ? formatCurrency(value as number) : '••••••'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Gaji Diterima</p>
                  <p className="text-white text-2xl font-bold">
                    {showSalary ? formatCurrency(payrollData.netSalary) : '••••••••••'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            {/* Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  {riwayatGaji.map((item) => (
                    <option key={item.id} value={`${item.periode_tahun}-${item.periode_bulan}`}>
                      {item.bulan}
                    </option>
                  ))}
                </select>
                <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium">
                  Filter
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Riwayat Gaji</h3>
              <div className="space-y-3">
                {riwayatGaji.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.bulan}</p>
                        <p className="text-sm text-gray-600">{item.tanggal}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500">{item.metode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {showSalary ? formatCurrency(item.gaji) : '••••••••'}
                      </p>
                      <button className="text-green-600 text-sm font-medium mt-1 flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PayrollWithService;
