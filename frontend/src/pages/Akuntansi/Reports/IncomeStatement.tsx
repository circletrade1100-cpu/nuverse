import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentArrowDownIcon, 
  PrinterIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface IncomeStatementItem {
  account_code: string;
  account_name: string;
  level: number;
  is_header: boolean;
  amount: number;
  children?: IncomeStatementItem[];
}

interface IncomeStatementData {
  revenues: IncomeStatementItem[];
  expenses: IncomeStatementItem[];
  total_revenue: number;
  total_expense: number;
  gross_profit: number;
  net_income: number;
  period_from: string;
  period_to: string;
}

const IncomeStatement: React.FC = () => {
  const [incomeStatementData, setIncomeStatementData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFrom, setPeriodFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [periodTo, setPeriodTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchIncomeStatement();
  }, [periodFrom, periodTo]);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await accountingService.getIncomeStatement(periodFrom, periodTo);
      
      // Mock data for demo
      setTimeout(() => {
        const mockData: IncomeStatementData = {
          revenues: [
            {
              account_code: '4000',
              account_name: 'PENDAPATAN',
              level: 1,
              is_header: true,
              amount: 0,
              children: [
                {
                  account_code: '4100',
                  account_name: 'PENDAPATAN OPERASIONAL',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '4110',
                      account_name: 'Pendapatan SPP',
                      level: 3,
                      is_header: false,
                      amount: 450000000
                    },
                    {
                      account_code: '4120',
                      account_name: 'Pendapatan Ekstrakurikuler',
                      level: 3,
                      is_header: false,
                      amount: 85000000
                    },
                    {
                      account_code: '4130',
                      account_name: 'Pendapatan Kegiatan',
                      level: 3,
                      is_header: false,
                      amount: 65000000
                    },
                    {
                      account_code: '4140',
                      account_name: 'Pendapatan Seragam',
                      level: 3,
                      is_header: false,
                      amount: 35000000
                    }
                  ]
                },
                {
                  account_code: '4200',
                  account_name: 'PENDAPATAN NON-OPERASIONAL',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '4210',
                      account_name: 'Pendapatan Dana BOS',
                      level: 3,
                      is_header: false,
                      amount: 125000000
                    },
                    {
                      account_code: '4220',
                      account_name: 'Pendapatan Sumbangan',
                      level: 3,
                      is_header: false,
                      amount: 45000000
                    },
                    {
                      account_code: '4230',
                      account_name: 'Pendapatan Lain-lain',
                      level: 3,
                      is_header: false,
                      amount: 15000000
                    }
                  ]
                }
              ]
            }
          ],
          expenses: [
            {
              account_code: '5000',
              account_name: 'BEBAN',
              level: 1,
              is_header: true,
              amount: 0,
              children: [
                {
                  account_code: '5100',
                  account_name: 'BEBAN OPERASIONAL',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '5110',
                      account_name: 'Beban Gaji Guru',
                      level: 3,
                      is_header: false,
                      amount: 285000000
                    },
                    {
                      account_code: '5120',
                      account_name: 'Beban Gaji Staff',
                      level: 3,
                      is_header: false,
                      amount: 95000000
                    },
                    {
                      account_code: '5130',
                      account_name: 'Beban Tunjangan',
                      level: 3,
                      is_header: false,
                      amount: 65000000
                    },
                    {
                      account_code: '5140',
                      account_name: 'Beban Listrik',
                      level: 3,
                      is_header: false,
                      amount: 25000000
                    },
                    {
                      account_code: '5150',
                      account_name: 'Beban Air',
                      level: 3,
                      is_header: false,
                      amount: 8000000
                    },
                    {
                      account_code: '5160',
                      account_name: 'Beban Telepon & Internet',
                      level: 3,
                      is_header: false,
                      amount: 12000000
                    },
                    {
                      account_code: '5170',
                      account_name: 'Beban Alat Tulis Kantor',
                      level: 3,
                      is_header: false,
                      amount: 15000000
                    },
                    {
                      account_code: '5180',
                      account_name: 'Beban Pemeliharaan',
                      level: 3,
                      is_header: false,
                      amount: 35000000
                    }
                  ]
                },
                {
                  account_code: '5200',
                  account_name: 'BEBAN NON-OPERASIONAL',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '5210',
                      account_name: 'Beban Bunga',
                      level: 3,
                      is_header: false,
                      amount: 18000000
                    },
                    {
                      account_code: '5220',
                      account_name: 'Beban Administrasi Bank',
                      level: 3,
                      is_header: false,
                      amount: 2500000
                    },
                    {
                      account_code: '5230',
                      account_name: 'Beban Lain-lain',
                      level: 3,
                      is_header: false,
                      amount: 8500000
                    }
                  ]
                }
              ]
            }
          ],
          total_revenue: 820000000,
          total_expense: 569000000,
          gross_profit: 635000000, // Operating revenue - operating expenses
          net_income: 251000000,
          period_from: periodFrom,
          period_to: periodTo
        };

        setIncomeStatementData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching income statement:', error);
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

  const calculateSubtotal = (items: IncomeStatementItem[]): number => {
    return items.reduce((sum, item) => {
      if (item.children) {
        return sum + calculateSubtotal(item.children);
      }
      return sum + item.amount;
    }, 0);
  };

  const renderIncomeStatementSection = (items: IncomeStatementItem[], level = 0) => {
    return items.map((item, index) => (
      <React.Fragment key={`${item.account_code}-${index}`}>
        <tr className={item.is_header ? 'bg-gray-50' : ''}>
          <td className="px-6 py-2 whitespace-nowrap">
            <div 
              className={`text-sm ${item.is_header ? 'font-bold' : ''}`}
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {item.account_code}
            </div>
          </td>
          <td className="px-6 py-2">
            <div 
              className={`text-sm ${item.is_header ? 'font-bold text-gray-900' : 'text-gray-700'}`}
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {item.account_name}
            </div>
          </td>
          <td className="px-6 py-2 whitespace-nowrap text-right">
            {item.is_header ? (
              item.children && (
                <div className="text-sm font-bold text-gray-900">
                  {formatCurrency(calculateSubtotal(item.children))}
                </div>
              )
            ) : (
              <div className="text-sm text-gray-900">
                {item.amount > 0 ? formatCurrency(item.amount) : '-'}
              </div>
            )}
          </td>
        </tr>
        {item.children && renderIncomeStatementSection(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting income statement as ${format}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!incomeStatementData) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p className="mt-1 text-sm text-gray-500">Data laporan laba rugi tidak tersedia untuk periode yang dipilih.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 print:p-4">
      <div className="mb-8 print:mb-4">
        <div className="flex justify-between items-start print:block">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-xl">Laporan Laba Rugi</h1>
            <p className="mt-2 text-gray-600 print:text-sm">
              Periode {new Date(periodFrom).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })} - {new Date(periodTo).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 print:hidden">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Dari:</span>
                <input
                  type="date"
                  className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sampai:</span>
                <input
                  type="date"
                  className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Income Statement Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden print:shadow-none">
        <div className="px-6 py-4 border-b border-gray-200 print:px-0 print:py-2">
          <h2 className="text-lg font-semibold text-center">SEKOLAH SALAM ANNUR</h2>
          <h3 className="text-md font-medium text-center">LAPORAN LABA RUGI</h3>
          <p className="text-sm text-center text-gray-600">
            Periode {new Date(periodFrom).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} - {new Date(periodTo).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Income Statement Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Akun
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Akun
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah (IDR)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Revenue Section */}
              {renderIncomeStatementSection(incomeStatementData.revenues)}
              
              {/* Total Revenue */}
              <tr className="bg-green-50 border-t-2 border-green-200">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-900"></div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-bold text-green-900">TOTAL PENDAPATAN</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-green-900">
                    {formatCurrency(incomeStatementData.total_revenue)}
                  </div>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={3} className="py-4"></td>
              </tr>

              {/* Expense Section */}
              {renderIncomeStatementSection(incomeStatementData.expenses)}
              
              {/* Total Expenses */}
              <tr className="bg-red-50 border-t border-red-200">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-red-900"></div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-bold text-red-900">TOTAL BEBAN</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-red-900">
                    ({formatCurrency(incomeStatementData.total_expense)})
                  </div>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={3} className="py-2"></td>
              </tr>

              {/* Net Income */}
              <tr className="bg-blue-50 border-t-2 border-blue-400">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-900"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base font-bold text-blue-900">LABA BERSIH</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-base font-bold ${
                    incomeStatementData.net_income >= 0 ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    {incomeStatementData.net_income >= 0 ? '' : '('}
                    {formatCurrency(Math.abs(incomeStatementData.net_income))}
                    {incomeStatementData.net_income >= 0 ? '' : ')'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Pendapatan</h3>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(incomeStatementData.total_revenue)}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Beban</h3>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(incomeStatementData.total_expense)}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Laba Bersih</h3>
          <div className={`text-2xl font-bold ${
            incomeStatementData.net_income >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {formatCurrency(incomeStatementData.net_income)}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Margin Laba</h3>
          <div className={`text-2xl font-bold ${
            incomeStatementData.net_income >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {((incomeStatementData.net_income / incomeStatementData.total_revenue) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement;
