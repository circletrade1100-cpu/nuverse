import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import divisiUnitService from '../../services/divisiUnitService';
import type { Transaction } from '../../services/divisiUnitService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';
import CreateTransactionButton from './CreateTransactionButton';
import EmptyState from './EmptyState';
import QuickGuide from './QuickGuide';

interface TransactionListProps {
  type: 'income' | 'expense';
  fundingSourceType?: 'regular' | 'bos' | 'other';
  title: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ type, fundingSourceType, title }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
    unit_kerja_id: '',
    funding_source_id: ''
  });
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [type, fundingSourceType, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Only send valid filter parameters to backend
      const params: any = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.unit_kerja_id) params.unit_kerja_id = filters.unit_kerja_id;
      if (filters.funding_source_id) params.funding_source_id = filters.funding_source_id;
      
      const response = type === 'income' 
        ? await divisiUnitService.getIncomeTransactions(params)
        : await divisiUnitService.getExpenseTransactions(params);
      
      const transactionsData = response.data.data.data || [];
      console.log('Transactions loaded:', transactionsData);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      // Only send valid parameters
      const params: any = {};
      if (filters.unit_kerja_id) params.unit_kerja_id = filters.unit_kerja_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await divisiUnitService.getSummary(params);
      setSummary(response.data.data);
    } catch (error: any) {
      console.error('Error fetching summary:', error);
      // Don't show error toast for summary as it's not critical
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingTransaction) {
        await divisiUnitService.updateTransaction(editingTransaction.id, data);
        toast.success('Transaksi berhasil diupdate');
      } else {
        await divisiUnitService.createTransaction(data);
        toast.success('Transaksi berhasil ditambahkan');
      }
      fetchTransactions();
      fetchSummary();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan transaksi');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    setDeletingId(id);
    try {
      await divisiUnitService.deleteTransaction(id);
      toast.success('Transaksi berhasil dihapus');
      fetchTransactions();
      fetchSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus transaksi');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">
              Kelola {type === 'income' ? 'pemasukan' : 'pengeluaran'} sekolah
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Klik tombol <strong>"Tambah Transaksi"</strong> untuk membuat transaksi baru
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuickGuide type="transaction" />
            <CreateTransactionButton 
              onClick={handleCreate}
              label="Tambah Transaksi"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(type === 'income' ? summary.total_income : summary.total_expense)}
                </p>
              </div>
              <BanknotesIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Jumlah Transaksi</p>
                <p className="text-3xl font-bold mt-2">
                  {type === 'income' ? summary.income_count : summary.expense_count}
                </p>
              </div>
              <CalendarIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Saldo</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(summary.balance || 0)}</p>
              </div>
              <BanknotesIcon className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Tanggal Mulai"
          />
          
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Tanggal Akhir"
          />
          
          <button
            onClick={fetchTransactions}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Transactions Table or Empty State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description={`Mulai tambahkan ${type === 'income' ? 'pemasukan' : 'pengeluaran'} dengan klik tombol di bawah`}
          actionLabel="Tambah Transaksi Pertama"
          onAction={handleCreate}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Referensi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Divisi/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sumber Dana
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.transaction_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.reference_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.unit_kerja?.nama || (
                          <span className="text-gray-400">ID: {transaction.unit_kerja_id}</span>
                        )}
                      </div>
                      {transaction.unit_kerja?.kode && (
                        <div className="text-xs text-gray-500">{transaction.unit_kerja.kode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{transaction.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.funding_source?.name || (
                          <span className="text-gray-400">ID: {transaction.funding_source_id}</span>
                        )}
                      </div>
                      {transaction.funding_source?.type && (
                        <div className="text-xs text-gray-500 capitalize">
                          {transaction.funding_source.type}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-semibold ${
                        type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deletingId === transaction.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === transaction.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
        type={type}
        fundingSourceType={fundingSourceType}
      />
    </div>
  );
};

export default TransactionList;
