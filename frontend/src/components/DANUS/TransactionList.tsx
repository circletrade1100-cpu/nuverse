import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { danusService, type BusinessTransaction, type BusinessUnit } from '../../services/danusService';

interface TransactionListProps {
  onEdit: (transaction: BusinessTransaction) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

const TransactionList: React.FC<TransactionListProps> = ({
  onEdit,
  onAdd,
  refreshTrigger
}) => {
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
    fetchBusinessUnits();
  }, [currentPage, searchTerm, unitFilter, typeFilter, statusFilter, refreshTrigger]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await danusService.getTransactions({
        search: searchTerm,
        business_unit_id: unitFilter ? parseInt(unitFilter) : undefined,
        transaction_type: typeFilter as 'income' | 'expense' | undefined,
        status: statusFilter,
        per_page: 10,
        page: currentPage
      });

      if (response.success) {
        setTransactions(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const response = await danusService.getBusinessUnits({ per_page: 100 });
      if (response.success) {
        setBusinessUnits(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await danusService.deleteTransaction(id);
        if (response.success) {
          fetchTransactions();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Gagal menghapus transaksi');
      }
    }
  };

  const handleApprove = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menyetujui transaksi ini?')) {
      try {
        const response = await danusService.approveTransaction(id);
        if (response.success) {
          fetchTransactions();
        }
      } catch (error) {
        console.error('Error approving transaction:', error);
        alert('Gagal menyetujui transaksi');
      }
    }
  };

  const handleReject = async (id: number) => {
    const notes = window.prompt('Masukkan alasan penolakan:');
    if (notes) {
      try {
        const response = await danusService.rejectTransaction(id, notes);
        if (response.success) {
          fetchTransactions();
        }
      } catch (error) {
        console.error('Error rejecting transaction:', error);
        alert('Gagal menolak transaksi');
      }
    }
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menyelesaikan transaksi ini?')) {
      try {
        const response = await danusService.completeTransaction(id);
        if (response.success) {
          fetchTransactions();
        }
      } catch (error) {
        console.error('Error completing transaction:', error);
        alert('Gagal menyelesaikan transaksi');
      }
    }
  };

  const getBusinessUnitName = (unitId: number) => {
    const unit = businessUnits.find(u => u.id === unitId);
    return unit ? unit.name : 'Unit tidak ditemukan';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: CheckIcon },
      rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: XMarkIcon },
      completed: { label: 'Selesai', color: 'bg-blue-100 text-blue-800', icon: CheckIcon }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-800', 
      icon: ClockIcon 
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      income: { label: 'Pemasukan', color: 'bg-green-100 text-green-800' },
      expense: { label: 'Pengeluaran', color: 'bg-red-100 text-red-800' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodConfig = {
      cash: 'Tunai',
      transfer: 'Transfer',
      card: 'Kartu'
    };
    
    return methodConfig[method as keyof typeof methodConfig] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const canEdit = (transaction: BusinessTransaction) => {
    return transaction.status === 'pending';
  };

  const canDelete = (transaction: BusinessTransaction) => {
    return transaction.status === 'pending';
  };

  const canApprove = (transaction: BusinessTransaction) => {
    return transaction.status === 'pending';
  };

  const canReject = (transaction: BusinessTransaction) => {
    return transaction.status === 'pending';
  };

  const canComplete = (transaction: BusinessTransaction) => {
    return transaction.status === 'approved';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Transaksi Usaha</h3>
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari transaksi..."
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Usaha</label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Semua Unit</option>
              {businessUnits.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Semua Jenis</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setUnitFilter('');
                setTypeFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Usaha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data transaksi
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBusinessUnitName(transaction.business_unit_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(transaction.transaction_type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">
                      {transaction.description}
                    </div>
                    {transaction.reference_number && (
                      <div className="text-xs text-gray-500">
                        Ref: {transaction.reference_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className={`font-medium ${
                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      {canEdit(transaction) && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canApprove(transaction) && (
                        <button
                          onClick={() => handleApprove(transaction.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Setujui"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canReject(transaction) && (
                        <button
                          onClick={() => handleReject(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Tolak"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canComplete(transaction) && (
                        <button
                          onClick={() => handleComplete(transaction.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Selesaikan"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canDelete(transaction) && (
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
