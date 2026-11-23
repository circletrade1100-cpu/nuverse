import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface CashFlowItem {
  id: number;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  type: 'operating' | 'investing' | 'financing';
}

interface CashFlowData {
  operating: CashFlowItem[];
  investing: CashFlowItem[];
  financing: CashFlowItem[];
  period: {
    from: string;
    to: string;
  };
}

const CashFlow: React.FC = () => {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-31');

  useEffect(() => {
    fetchCashFlowData();
  }, [dateFrom, dateTo]);

  const fetchCashFlowData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await accountingService.getCashFlowStatement(dateFrom, dateTo);
      
      // Mock data for demo
      setTimeout(() => {
        const mockData: CashFlowData = {
          operating: [
            {
              id: 1,
              category: 'Penerimaan dari Aktivitas Operasi',
              description: 'Penerimaan SPP Siswa',
              amount: 750000000,
              type: 'operating'
            },
            {
              id: 2,
              category: 'Penerimaan dari Aktivitas Operasi',
              description: 'Penerimaan Uang Gedung',
              amount: 125000000,
              type: 'operating'
            },
            {
              id: 3,
              category: 'Penerimaan dari Aktivitas Operasi',
              description: 'Penerimaan Dana BOS',
              amount: 500000000,
              type: 'operating'
            },
            {
              id: 4,
              category: 'Pengeluaran untuk Aktivitas Operasi',
              description: 'Pembayaran Gaji Guru dan Karyawan',
              amount: -850000000,
              type: 'operating'
            },
            {
              id: 5,
              category: 'Pengeluaran untuk Aktivitas Operasi',
              description: 'Biaya Operasional Sekolah',
              amount: -200000000,
              type: 'operating'
            },
            {
              id: 6,
              category: 'Pengeluaran untuk Aktivitas Operasi',
              description: 'Biaya Administrasi',
              amount: -75000000,
              type: 'operating'
            }
          ],
          investing: [
            {
              id: 7,
              category: 'Pengeluaran untuk Aktivitas Investasi',
              description: 'Pembelian Peralatan Komputer',
              amount: -150000000,
              type: 'investing'
            },
            {
              id: 8,
              category: 'Pengeluaran untuk Aktivitas Investasi',
              description: 'Renovasi Gedung Sekolah',
              amount: -300000000,
              type: 'investing'
            },
            {
              id: 9,
              category: 'Penerimaan dari Aktivitas Investasi',
              description: 'Penjualan Aset Tidak Terpakai',
              amount: 25000000,
              type: 'investing'
            }
          ],
          financing: [
            {
              id: 10,
              category: 'Penerimaan dari Aktivitas Pendanaan',
              description: 'Hibah dari Yayasan',
              amount: 200000000,
              type: 'financing'
            },
            {
              id: 11,
              category: 'Pengeluaran untuk Aktivitas Pendanaan',
              description: 'Pembayaran Pinjaman Bank',
              amount: -100000000,
              type: 'financing'
            }
          ],
          period: {
            from: dateFrom,
            to: dateTo
          }
        };

        setCashFlowData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching cash flow data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const calculateOperatingCashFlow = () => {
    if (!cashFlowData) return 0;
    return cashFlowData.operating.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateInvestingCashFlow = () => {
    if (!cashFlowData) return 0;
    return cashFlowData.investing.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateFinancingCashFlow = () => {
    if (!cashFlowData) return 0;
    return cashFlowData.financing.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateNetCashFlow = () => {
    return calculateOperatingCashFlow() + calculateInvestingCashFlow() + calculateFinancingCashFlow();
  };

  const renderCashFlowSection = (title: string, items: CashFlowItem[], icon: React.ReactNode, bgColor: string) => {
    const sectionTotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden`}>
        <div className={`px-6 py-4 ${bgColor} border-b border-slate-200/60`}>
          <div className="flex items-center">
            <div className="flex items-center">
              {icon}
              <h3 className="text-lg font-semibold text-slate-900 ml-2">{title}</h3>
            </div>
            <div className="ml-auto">
              <span className={`text-lg font-bold ${sectionTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {sectionTotal >= 0 ? '+' : ''}{formatCurrency(sectionTotal)}
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.description}</p>
                  {item.subcategory && (
                    <p className="text-xs text-slate-500 mt-1">{item.subcategory}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="bg-white p-6 rounded-2xl">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cashFlowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="px-6 py-8">
          <div className="text-center py-12">
            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Data arus kas tidak tersedia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-700 bg-clip-text text-transparent">
                Laporan Arus Kas
              </h1>
              <p className="mt-1 text-slate-600 font-medium">
                Periode: {new Date(cashFlowData.period.from).toLocaleDateString('id-ID')} - {new Date(cashFlowData.period.to).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Period Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Filter Periode
            </h3>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dari Tanggal</label>
                <input
                  type="date"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sampai Tanggal</label>
                <input
                  type="date"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Operating Cash Flow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                    <CurrencyDollarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Arus Kas Operasi</p>
                <p className={`text-xl font-bold ${calculateOperatingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateOperatingCashFlow())}
                </p>
              </div>
            </div>
          </div>

          {/* Investing Cash Flow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-500/25">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Arus Kas Investasi</p>
                <p className={`text-xl font-bold ${calculateInvestingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateInvestingCashFlow())}
                </p>
              </div>
            </div>
          </div>

          {/* Financing Cash Flow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg shadow-orange-500/25">
                    <BanknotesIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Arus Kas Pendanaan</p>
                <p className={`text-xl font-bold ${calculateFinancingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateFinancingCashFlow())}
                </p>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <div className={`p-2.5 rounded-xl shadow-lg ${
                    calculateNetCashFlow() >= 0 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25' 
                      : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25'
                  }`}>
                    {calculateNetCashFlow() >= 0 ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">Arus Kas Bersih</p>
                <p className={`text-xl font-bold ${calculateNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateNetCashFlow())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Sections */}
        <div className="space-y-8">
          {/* Operating Activities */}
          {renderCashFlowSection(
            'Arus Kas dari Aktivitas Operasi',
            cashFlowData.operating,
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
            'bg-gradient-to-r from-blue-50 to-indigo-50/30'
          )}

          {/* Investing Activities */}
          {renderCashFlowSection(
            'Arus Kas dari Aktivitas Investasi',
            cashFlowData.investing,
            <ChartBarIcon className="h-6 w-6 text-purple-600" />,
            'bg-gradient-to-r from-purple-50 to-violet-50/30'
          )}

          {/* Financing Activities */}
          {renderCashFlowSection(
            'Arus Kas dari Aktivitas Pendanaan',
            cashFlowData.financing,
            <BanknotesIcon className="h-6 w-6 text-orange-600" />,
            'bg-gradient-to-r from-orange-50 to-amber-50/30'
          )}

          {/* Net Cash Flow Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50/30 border-b border-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <DocumentChartBarIcon className="h-6 w-6 text-slate-600 mr-2" />
                Ringkasan Arus Kas
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Arus Kas dari Aktivitas Operasi</span>
                  <span className={`font-semibold ${calculateOperatingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateOperatingCashFlow())}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Arus Kas dari Aktivitas Investasi</span>
                  <span className={`font-semibold ${calculateInvestingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateInvestingCashFlow())}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Arus Kas dari Aktivitas Pendanaan</span>
                  <span className={`font-semibold ${calculateFinancingCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateFinancingCashFlow())}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-slate-50 px-4 rounded-xl">
                  <span className="text-base font-bold text-slate-900">Kenaikan (Penurunan) Kas Bersih</span>
                  <span className={`text-lg font-bold ${calculateNetCashFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculateNetCashFlow())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
