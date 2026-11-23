import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  getChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount
} from '../../../services/accountingService';
import { toast } from 'react-hot-toast';

interface ChartOfAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parent_id: number | null;
  level: number;
  is_header: boolean;
  is_active: boolean;
  description?: string;
  children?: ChartOfAccount[];
}

const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    parent_id: null as number | null,
    description: '',
    is_header: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, selectedType]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      const response = await getChartOfAccounts({
        per_page: 1000,
        is_active: true
      });

      if (response.success) {
        // Build tree structure from flat list
        const accountsMap = new Map<number, ChartOfAccount>();
        const rootAccounts: ChartOfAccount[] = [];

        // First pass: create map
        response.data.data.forEach((acc: any) => {
          accountsMap.set(acc.id, {
            ...acc,
            children: []
          });
        });

        // Second pass: build tree
        response.data.data.forEach((acc: any) => {
          const account = accountsMap.get(acc.id)!;
          if (acc.parent_id && accountsMap.has(acc.parent_id)) {
            const parent = accountsMap.get(acc.parent_id)!;
            if (!parent.children) parent.children = [];
            parent.children.push(account);
          } else {
            rootAccounts.push(account);
          }
        });

        setAccounts(rootAccounts);
        
        // Expand all top level nodes by default
        const topLevelIds = rootAccounts.map(acc => acc.id);
        setExpandedNodes(new Set(topLevelIds));
      } else {
        toast.error('Gagal mengambil data akun');
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error(error.response?.data?.message || 'Gagal mengambil data akun');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = [...accounts];

    if (selectedType !== 'all') {
      filtered = filtered.filter(acc => acc.account_type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(acc => 
        acc.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.account_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  };

  const toggleExpanded = (accountId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedNodes(newExpanded);
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-blue-100 text-blue-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-purple-100 text-purple-800',
      revenue: 'bg-green-100 text-green-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  const handleAddAccount = async () => {
    if (editingAccount) {
      handleUpdateAccount();
      return;
    }

    try {
      if (!formData.account_code || !formData.account_name) {
        toast.error('Kode akun dan nama akun harus diisi');
        return;
      }

      const response = await createChartOfAccount({
        account_code: formData.account_code,
        account_name: formData.account_name,
        account_type: formData.account_type,
        parent_id: formData.parent_id || undefined,
        is_active: true
      });

      if (response.success) {
        toast.success('Akun berhasil ditambahkan');
        handleCloseModal();
        fetchAccounts(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal menambahkan akun');
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan akun');
    }
  };

  const getParentAccounts = () => {
    return accounts.filter(acc => acc.is_header);
  };

  const handleEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      parent_id: account.parent_id,
      description: account.description || '',
      is_header: account.is_header || false
    });
    setShowAddModal(true);
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;

    try {
      if (!formData.account_code || !formData.account_name) {
        toast.error('Kode akun dan nama akun harus diisi');
        return;
      }

      const response = await updateChartOfAccount(editingAccount.id, {
        account_code: formData.account_code,
        account_name: formData.account_name,
        account_type: formData.account_type,
        parent_id: formData.parent_id || undefined,
        is_active: editingAccount.is_active
      });

      if (response.success) {
        toast.success('Akun berhasil diupdate');
        setShowAddModal(false);
        setEditingAccount(null);
        setFormData({
          account_code: '',
          account_name: '',
          account_type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
          parent_id: null as number | null,
          description: '',
          is_header: false
        });
        fetchAccounts(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal mengupdate akun');
      }
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error(error.response?.data?.message || 'Gagal mengupdate akun');
    }
  };

  const handleDeleteAccount = async (account: ChartOfAccount) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "${account.account_name}"?`)) {
      return;
    }

    try {
      const response = await deleteChartOfAccount(account.id);

      if (response.success) {
        toast.success('Akun berhasil dihapus');
        fetchAccounts(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal menghapus akun');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus akun');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
      parent_id: null as number | null,
      description: '',
      is_header: false
    });
  };

  const renderAccountTree = (accountList: ChartOfAccount[], parentLevel = 0) => {
    return accountList.map((account) => (
      <React.Fragment key={account.id}>
        <tr className="group hover:bg-slate-50/50 transition-colors duration-200">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${parentLevel * 20}px` }}>
              {account.children && account.children.length > 0 ? (
                <button
                  onClick={() => toggleExpanded(account.id)}
                  className="mr-3 p-1.5 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                >
                  {expandedNodes.has(account.id) ? (
                    <ChevronDownIcon className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-slate-600" />
                  )}
                </button>
              ) : (
                <div className="w-7 h-7 flex items-center justify-center mr-3">
                  <DocumentIcon className="h-4 w-4 text-slate-400" />
                </div>
              )}
              <span className={`text-sm font-mono ${account.is_header ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                {account.account_code}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className={`text-sm ${account.is_header ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}`}>
              {account.account_name}
            </div>
            {account.description && (
              <div className="text-xs text-slate-500 mt-1 font-medium">{account.description}</div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${getAccountTypeColor(account.account_type)}`}>
              {getAccountTypeLabel(account.account_type)}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
              account.is_active 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                account.is_active ? 'bg-green-500' : 'bg-slate-400'
              }`}></div>
              {account.is_active ? 'Aktif' : 'Non-aktif'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button 
                onClick={() => {/* TODO: Implement view detail */}}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Lihat Detail"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleEditAccount(account)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
                title="Edit"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDeleteAccount(account)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Hapus"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {account.children && expandedNodes.has(account.id) && (
          <>
            {renderAccountTree(account.children, parentLevel + 1)}
          </>
        )}
      </React.Fragment>
    ));
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
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
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
                Chart of Accounts
              </h1>
              <p className="mt-1 text-slate-600 font-medium">Kelola daftar akun perkiraan</p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Import/Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Tambah Akun
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cari Akun</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Kode atau nama akun..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Akun</label>
              <div className="relative">
                <select
                  className="block w-full py-3 px-4 border border-slate-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none text-slate-900"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Semua Tipe</option>
                  <option value="asset">Aset</option>
                  <option value="liability">Kewajiban</option>
                  <option value="equity">Modal</option>
                  <option value="revenue">Pendapatan</option>
                  <option value="expense">Beban</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-300 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60">
            <h3 className="text-lg font-semibold text-slate-900">Daftar Akun Perkiraan</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kode Akun
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Nama Akun
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredAccounts.length > 0 ? (
                renderAccountTree(filteredAccounts)
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">
                      {searchTerm || selectedType !== 'all' ? 'Tidak ada akun yang sesuai filter' : 'Belum ada akun'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Chart of accounts akan muncul di sini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
            Ringkasan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-center mb-2">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {accounts.filter(acc => acc.account_type === 'asset').length}
              </div>
              <div className="text-sm font-medium text-blue-700">Akun Aset</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <div className="flex items-center justify-center mb-2">
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {accounts.filter(acc => acc.account_type === 'liability').length}
              </div>
              <div className="text-sm font-medium text-red-700">Akun Kewajiban</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {accounts.filter(acc => acc.account_type === 'equity').length}
              </div>
              <div className="text-sm font-medium text-purple-700">Akun Modal</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-center mb-2">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {accounts.filter(acc => acc.account_type === 'revenue').length}
              </div>
              <div className="text-sm font-medium text-green-700">Akun Pendapatan</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center justify-center mb-2">
                <DocumentIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {accounts.filter(acc => acc.account_type === 'expense').length}
              </div>
              <div className="text-sm font-medium text-orange-700">Akun Beban</div>
            </div>
          </div>
        </div>

        {/* Add/Edit Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kode Akun <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full py-3 px-4 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Contoh: 1100"
                      value={formData.account_code}
                      onChange={(e) => setFormData({...formData, account_code: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipe Akun <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="block w-full py-3 px-4 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none"
                      value={formData.account_type}
                      onChange={(e) => setFormData({...formData, account_type: e.target.value as any})}
                    >
                      <option value="asset">Aset</option>
                      <option value="liability">Kewajiban</option>
                      <option value="equity">Modal</option>
                      <option value="revenue">Pendapatan</option>
                      <option value="expense">Beban</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Akun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full py-3 px-4 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Masukkan nama akun"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Akun Induk (Opsional)
                  </label>
                  <select
                    className="block w-full py-3 px-4 border border-slate-300 bg-white rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none"
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value ? Number(e.target.value) : null})}
                  >
                    <option value="">-- Pilih Akun Induk --</option>
                    {getParentAccounts().map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    className="block w-full py-3 px-4 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Deskripsi akun"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_header"
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    checked={formData.is_header}
                    onChange={(e) => setFormData({...formData, is_header: e.target.checked})}
                  />
                  <label htmlFor="is_header" className="ml-2 text-sm text-slate-700">
                    Akun Header (Memiliki sub-akun)
                  </label>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddAccount}
                  disabled={!formData.account_code || !formData.account_name}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {editingAccount ? 'Update Akun' : 'Simpan Akun'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartOfAccounts;
