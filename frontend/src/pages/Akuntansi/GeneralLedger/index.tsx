import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

interface GeneralLedgerEntry {
  id: number;
  date: string;
  journal_number: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AccountSummary {
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  entries: GeneralLedgerEntry[];
}

const GeneralLedger: React.FC = () => {
  const [accountsData, setAccountsData] = useState<AccountSummary[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [periodFrom, setPeriodFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [periodTo, setPeriodTo] = useState(new Date().toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGeneralLedger();
  }, [periodFrom, periodTo]);

  const fetchGeneralLedger = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await accountingService.getGeneralLedger(periodFrom, periodTo);
      
      // Mock data for demo
      setTimeout(() => {
        const mockData: AccountSummary[] = [
          {
            account_code: '1110',
            account_name: 'Kas',
            account_type: 'asset',
            opening_balance: 100000000,
            total_debit: 350000000,
            total_credit: 325000000,
            closing_balance: 125000000,
            entries: [
              {
                id: 1,
                date: '2025-01-01',
                journal_number: 'JE-2025-001',
                description: 'Saldo Awal',
                reference: 'Opening Balance',
                debit: 100000000,
                credit: 0,
                balance: 100000000
              },
              {
                id: 2,
                date: '2025-01-15',
                journal_number: 'JE-2025-002',
                description: 'Penerimaan SPP Januari',
                reference: 'TU-001',
                debit: 25000000,
                credit: 0,
                balance: 125000000
              },
              {
                id: 3,
                date: '2025-01-15',
                journal_number: 'JE-2025-003',
                description: 'Pembayaran Gaji Guru',
                reference: 'PAY-001',
                debit: 0,
                credit: 45000000,
                balance: 80000000
              },
              {
                id: 4,
                date: '2025-01-20',
                journal_number: 'JE-2025-004',
                description: 'Penerimaan Dana BOS',
                reference: 'TU-002',
                debit: 50000000,
                credit: 0,
                balance: 130000000
              }
            ]
          },
          {
            account_code: '1120',
            account_name: 'Bank BCA',
            account_type: 'asset',
            opening_balance: 75000000,
            total_debit: 125000000,
            total_credit: 115000000,
            closing_balance: 85000000,
            entries: [
              {
                id: 5,
                date: '2025-01-01',
                journal_number: 'JE-2025-001',
                description: 'Saldo Awal',
                reference: 'Opening Balance',
                debit: 75000000,
                credit: 0,
                balance: 75000000
              },
              {
                id: 6,
                date: '2025-01-10',
                journal_number: 'JE-2025-005',
                description: 'Transfer dari Kas',
                reference: 'TRF-001',
                debit: 25000000,
                credit: 0,
                balance: 100000000
              },
              {
                id: 7,
                date: '2025-01-18',
                journal_number: 'JE-2025-006',
                description: 'Pembayaran Listrik',
                reference: 'TU-003',
                debit: 0,
                credit: 15000000,
                balance: 85000000
              }
            ]
          },
          {
            account_code: '4110',
            account_name: 'Pendapatan SPP',
            account_type: 'revenue',
            opening_balance: 0,
            total_debit: 0,
            total_credit: 450000000,
            closing_balance: 450000000,
            entries: [
              {
                id: 8,
                date: '2025-01-15',
                journal_number: 'JE-2025-002',
                description: 'Penerimaan SPP Januari',
                reference: 'TU-001',
                debit: 0,
                credit: 25000000,
                balance: 25000000
              },
              {
                id: 9,
                date: '2025-01-20',
                journal_number: 'JE-2025-007',
                description: 'Penerimaan SPP Februari',
                reference: 'TU-004',
                debit: 0,
                credit: 30000000,
                balance: 55000000
              }
            ]
          },
          {
            account_code: '5110',
            account_name: 'Beban Gaji Guru',
            account_type: 'expense',
            opening_balance: 0,
            total_debit: 285000000,
            total_credit: 0,
            closing_balance: 285000000,
            entries: [
              {
                id: 10,
                date: '2025-01-15',
                journal_number: 'JE-2025-003',
                description: 'Pembayaran Gaji Guru Januari',
                reference: 'PAY-001',
                debit: 45000000,
                credit: 0,
                balance: 45000000
              },
              {
                id: 11,
                date: '2025-01-30',
                journal_number: 'JE-2025-008',
                description: 'Tunjangan Guru Januari',
                reference: 'PAY-002',
                debit: 15000000,
                credit: 0,
                balance: 60000000
              }
            ]
          }
        ];

        setAccountsData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching general ledger:', error);
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

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'text-blue-600',
      liability: 'text-red-600',
      equity: 'text-purple-600',
      revenue: 'text-green-600',
      expense: 'text-orange-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      asset: 'Aset',
      liability: 'Kewajiban',
      equity: 'Modal',
      revenue: 'Pendapatan',
      expense: 'Beban'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredAccounts = accountsData.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || account.account_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting general ledger as ${format}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
  };

  const getTotalStats = () => {
    const totalAssets = accountsData
      .filter(acc => acc.account_type === 'asset')
      .reduce((sum, acc) => sum + acc.closing_balance, 0);
    
    const totalLiabilities = accountsData
      .filter(acc => acc.account_type === 'liability')
      .reduce((sum, acc) => sum + acc.closing_balance, 0);
    
    const totalRevenue = accountsData
      .filter(acc => acc.account_type === 'revenue')
      .reduce((sum, acc) => sum + acc.closing_balance, 0);
    
    const totalExpense = accountsData
      .filter(acc => acc.account_type === 'expense')
      .reduce((sum, acc) => sum + acc.closing_balance, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalRevenue,
      totalExpense,
      netIncome: totalRevenue - totalExpense
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center space-y-4">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-80 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4">
            <ChartBarIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent mb-3">
            General Ledger
          </h1>
          <p className="text-lg text-gray-600 mb-6">Buku besar dan detail transaksi per akun</p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Aset</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAssets)}</p>
                <p className="text-xs text-gray-500 mt-1">Saldo Akhir</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kewajiban</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalLiabilities)}</p>
                <p className="text-xs text-gray-500 mt-1">Saldo Akhir</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">Saldo Akhir</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Beban</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalExpense)}</p>
                <p className="text-xs text-gray-500 mt-1">Saldo Akhir</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
                <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(stats.netIncome))}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stats.netIncome >= 0 ? 'Profit' : 'Loss'}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <PresentationChartLineIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filter & Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              {/* Period Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Periode:</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    className="block px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    value={periodFrom}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                  />
                  <span className="text-sm text-gray-500 font-medium">sampai</span>
                  <input
                    type="date"
                    className="block px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors duration-200"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2.5 border rounded-lg font-medium text-sm transition-all duration-200 ${
                    showFilters 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                </button>
                {(selectedType !== 'all' || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2.5 border border-red-300 bg-red-50 text-red-700 rounded-lg font-medium text-sm hover:bg-red-100 transition-all duration-200 shadow-sm"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cari Akun</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-sm transition-all duration-200"
                        placeholder="Masukkan kode atau nama akun..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Akun</label>
                    <select
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white text-sm transition-all duration-200"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">Semua Tipe Akun</option>
                      <option value="asset">💰 Aset</option>
                      <option value="liability">📊 Kewajiban</option>
                      <option value="equity">🏛️ Modal</option>
                      <option value="revenue">📈 Pendapatan</option>
                      <option value="expense">💸 Beban</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modern Accounts List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daftar Akun</h3>
                    <p className="text-sm text-gray-500">{filteredAccounts.length} akun ditemukan</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <div
                      key={account.account_code}
                      className={`p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 group ${
                        selectedAccount?.account_code === account.account_code 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500 shadow-sm' 
                          : ''
                      }`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-white transition-colors duration-200">
                              {account.account_code}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.account_type)} bg-opacity-10`}>
                              {getAccountTypeLabel(account.account_type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium mb-1 group-hover:text-gray-900 transition-colors duration-200">
                            {account.account_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Transaksi: {account.entries.length}</span>
                            <span>•</span>
                            <span className={account.closing_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {account.closing_balance >= 0 ? 'Positif' : 'Negatif'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {formatCurrency(Math.abs(account.closing_balance))}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Saldo Akhir
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChartBarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada akun</h3>
                    <p className="text-sm text-gray-500">
                      {searchTerm || selectedType !== 'all' 
                        ? 'Tidak ada akun yang sesuai dengan filter yang dipilih' 
                        : 'Belum ada data akun yang tersedia'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Account Detail */}
          <div className="lg:col-span-2">
            {selectedAccount ? (
              <div className="space-y-8">
                {/* Enhanced Account Summary */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4">
                        <div className={`h-12 w-12 bg-gradient-to-br ${
                          selectedAccount.account_type === 'asset' ? 'from-blue-100 to-blue-200' :
                          selectedAccount.account_type === 'liability' ? 'from-red-100 to-red-200' :
                          selectedAccount.account_type === 'equity' ? 'from-purple-100 to-purple-200' :
                          selectedAccount.account_type === 'revenue' ? 'from-green-100 to-green-200' :
                          'from-orange-100 to-orange-200'
                        } rounded-xl flex items-center justify-center`}>
                          <span className={`text-lg font-bold ${getAccountTypeColor(selectedAccount.account_type)}`}>
                            {selectedAccount.account_code.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {selectedAccount.account_code} - {selectedAccount.account_name}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getAccountTypeColor(selectedAccount.account_type)} bg-opacity-10`}>
                              {getAccountTypeLabel(selectedAccount.account_type)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {selectedAccount.entries.length} transaksi
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatCurrency(selectedAccount.opening_balance)}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Saldo Awal</div>
                        <div className="text-xs text-gray-500 mt-1">Per periode</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                        <div className="text-2xl font-bold text-green-700 mb-1">
                          {formatCurrency(selectedAccount.total_debit)}
                        </div>
                        <div className="text-sm font-medium text-green-600">Total Debit</div>
                        <div className="text-xs text-gray-500 mt-1">Masuk</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                        <div className="text-2xl font-bold text-red-700 mb-1">
                          {formatCurrency(selectedAccount.total_credit)}
                        </div>
                        <div className="text-sm font-medium text-red-600">Total Credit</div>
                        <div className="text-xs text-gray-500 mt-1">Keluar</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                        <div className="text-2xl font-bold text-blue-700 mb-1">
                          {formatCurrency(Math.abs(selectedAccount.closing_balance))}
                        </div>
                        <div className="text-sm font-medium text-blue-600">Saldo Akhir</div>
                        <div className={`text-xs mt-1 ${selectedAccount.closing_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedAccount.closing_balance >= 0 ? 'Positif' : 'Negatif'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern Transactions Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                        <PresentationChartLineIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Detail Transaksi</h3>
                        <p className="text-sm text-gray-500">Riwayat mutasi akun</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Jurnal
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Deskripsi
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Debit
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Credit
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Saldo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {selectedAccount.entries.length > 0 ? (
                          selectedAccount.entries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 group-hover:text-blue-900">
                                <div className="font-medium">
                                  {new Date(entry.date).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">{entry.journal_number}</div>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1 group-hover:bg-blue-100">
                                  {entry.reference}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 group-hover:text-blue-900 font-medium">
                                  {entry.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`text-sm font-semibold ${entry.debit > 0 ? 'text-green-600 bg-green-50 px-2 py-1 rounded-md' : 'text-gray-400'}`}>
                                  {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`text-sm font-semibold ${entry.credit > 0 ? 'text-red-600 bg-red-50 px-2 py-1 rounded-md' : 'text-gray-400'}`}>
                                  {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-md group-hover:bg-blue-100">
                                  {formatCurrency(Math.abs(entry.balance))}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PresentationChartLineIcon className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
                              <p className="text-sm text-gray-500">Tidak ada transaksi untuk periode yang dipilih</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-16 text-center text-gray-500">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ChartBarIcon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Pilih Akun</h3>
                  <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Pilih salah satu akun dari daftar di sebelah kiri untuk melihat detail transaksi dan ringkasan keuangan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedger;
