import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  DocumentArrowDownIcon, 
  PrinterIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BalanceSheetItem {
  account_code: string;
  account_name: string;
  level: number;
  is_header: boolean;
  amount: number;
  children?: BalanceSheetItem[];
}

interface BalanceSheetData {
  assets: BalanceSheetItem[];
  liabilities: BalanceSheetItem[];
  equity: BalanceSheetItem[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  report_date: string;
}

const BalanceSheet: React.FC = () => {
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBalanceSheet();
  }, [reportDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await accountingService.getBalanceSheet(reportDate);
      
      // Mock data for demo
      setTimeout(() => {
        const mockData: BalanceSheetData = {
          assets: [
            {
              account_code: '1000',
              account_name: 'ASET',
              level: 1,
              is_header: true,
              amount: 0,
              children: [
                {
                  account_code: '1100',
                  account_name: 'ASET LANCAR',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '1110',
                      account_name: 'Kas',
                      level: 3,
                      is_header: false,
                      amount: 125000000
                    },
                    {
                      account_code: '1120',
                      account_name: 'Bank BCA',
                      level: 3,
                      is_header: false,
                      amount: 85000000
                    },
                    {
                      account_code: '1130',
                      account_name: 'Bank Mandiri',
                      level: 3,
                      is_header: false,
                      amount: 45000000
                    }
                  ]
                },
                {
                  account_code: '1200',
                  account_name: 'PIUTANG',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '1210',
                      account_name: 'Piutang SPP',
                      level: 3,
                      is_header: false,
                      amount: 50000000
                    },
                    {
                      account_code: '1220',
                      account_name: 'Piutang Ekstrakurikuler',
                      level: 3,
                      is_header: false,
                      amount: 15000000
                    }
                  ]
                },
                {
                  account_code: '1300',
                  account_name: 'ASET TETAP',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '1310',
                      account_name: 'Bangunan',
                      level: 3,
                      is_header: false,
                      amount: 2500000000
                    },
                    {
                      account_code: '1320',
                      account_name: 'Peralatan Sekolah',
                      level: 3,
                      is_header: false,
                      amount: 350000000
                    },
                    {
                      account_code: '1330',
                      account_name: 'Kendaraan',
                      level: 3,
                      is_header: false,
                      amount: 150000000
                    }
                  ]
                }
              ]
            }
          ],
          liabilities: [
            {
              account_code: '2000',
              account_name: 'KEWAJIBAN',
              level: 1,
              is_header: true,
              amount: 0,
              children: [
                {
                  account_code: '2100',
                  account_name: 'KEWAJIBAN LANCAR',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '2110',
                      account_name: 'Hutang Gaji',
                      level: 3,
                      is_header: false,
                      amount: 25000000
                    },
                    {
                      account_code: '2120',
                      account_name: 'Hutang Supplier',
                      level: 3,
                      is_header: false,
                      amount: 15000000
                    },
                    {
                      account_code: '2130',
                      account_name: 'Hutang PPh',
                      level: 3,
                      is_header: false,
                      amount: 8000000
                    }
                  ]
                },
                {
                  account_code: '2200',
                  account_name: 'KEWAJIBAN JANGKA PANJANG',
                  level: 2,
                  is_header: true,
                  amount: 0,
                  children: [
                    {
                      account_code: '2210',
                      account_name: 'Hutang Bank',
                      level: 3,
                      is_header: false,
                      amount: 500000000
                    }
                  ]
                }
              ]
            }
          ],
          equity: [
            {
              account_code: '3000',
              account_name: 'MODAL',
              level: 1,
              is_header: true,
              amount: 0,
              children: [
                {
                  account_code: '3100',
                  account_name: 'Modal Yayasan',
                  level: 2,
                  is_header: false,
                  amount: 2000000000
                },
                {
                  account_code: '3200',
                  account_name: 'Saldo Laba',
                  level: 2,
                  is_header: false,
                  amount: 792000000
                }
              ]
            }
          ],
          total_assets: 3320000000,
          total_liabilities: 548000000,
          total_equity: 2792000000,
          report_date: reportDate
        };

        setBalanceSheetData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
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

  const calculateSubtotal = (items: BalanceSheetItem[]): number => {
    return items.reduce((sum, item) => {
      if (item.children) {
        return sum + calculateSubtotal(item.children);
      }
      return sum + item.amount;
    }, 0);
  };

  const renderBalanceSheetSection = (items: BalanceSheetItem[], level = 0) => {
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
        {item.children && renderBalanceSheetSection(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting balance sheet as ${format}`);
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

  if (!balanceSheetData) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p className="mt-1 text-sm text-gray-500">Data neraca tidak tersedia untuk tanggal yang dipilih.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 print:p-4">
      <div className="mb-8 print:mb-4">
        <div className="flex justify-between items-start print:block">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 print:text-xl">Neraca (Balance Sheet)</h1>
            <p className="mt-2 text-gray-600 print:text-sm">
              Per tanggal {new Date(reportDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 print:hidden">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
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

      {/* Balance Sheet Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden print:shadow-none">
        <div className="px-6 py-4 border-b border-gray-200 print:px-0 print:py-2">
          <h2 className="text-lg font-semibold text-center">SEKOLAH SALAM ANNUR</h2>
          <h3 className="text-md font-medium text-center">NERACA</h3>
          <p className="text-sm text-center text-gray-600">
            Per {new Date(reportDate).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Assets Section */}
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
              {renderBalanceSheetSection(balanceSheetData.assets)}
              
              {/* Total Assets */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-blue-900"></div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-bold text-blue-900">TOTAL ASET</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-blue-900">
                    {formatCurrency(balanceSheetData.total_assets)}
                  </div>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={3} className="py-4"></td>
              </tr>

              {/* Liabilities Section */}
              {renderBalanceSheetSection(balanceSheetData.liabilities)}
              
              {/* Total Liabilities */}
              <tr className="bg-red-50 border-t border-red-200">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-red-900"></div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-bold text-red-900">TOTAL KEWAJIBAN</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-red-900">
                    {formatCurrency(balanceSheetData.total_liabilities)}
                  </div>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={3} className="py-2"></td>
              </tr>

              {/* Equity Section */}
              {renderBalanceSheetSection(balanceSheetData.equity)}
              
              {/* Total Equity */}
              <tr className="bg-purple-50 border-t border-purple-200">
                <td className="px-6 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-purple-900"></div>
                </td>
                <td className="px-6 py-3">
                  <div className="text-sm font-bold text-purple-900">TOTAL MODAL</div>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-purple-900">
                    {formatCurrency(balanceSheetData.total_equity)}
                  </div>
                </td>
              </tr>

              {/* Total Liabilities + Equity */}
              <tr className="bg-gray-100 border-t-2 border-gray-400">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base font-bold text-gray-900">TOTAL KEWAJIBAN + MODAL</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-base font-bold text-gray-900">
                    {formatCurrency(balanceSheetData.total_liabilities + balanceSheetData.total_equity)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Verification */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Aset</h3>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(balanceSheetData.total_assets)}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Kewajiban + Modal</h3>
          <div className="text-2xl font-bold text-gray-600">
            {formatCurrency(balanceSheetData.total_liabilities + balanceSheetData.total_equity)}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Balance Check</h3>
          <div className={`text-2xl font-bold ${
            Math.abs(balanceSheetData.total_assets - (balanceSheetData.total_liabilities + balanceSheetData.total_equity)) < 1
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {Math.abs(balanceSheetData.total_assets - (balanceSheetData.total_liabilities + balanceSheetData.total_equity)) < 1
              ? '✓ Balanced' 
              : '✗ Unbalanced'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
