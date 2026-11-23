import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentCheckIcon,
  XMarkIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Modal from '../../../components/common/UI/Modal';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  getChartOfAccounts
} from '../../../services/accountingService';
import { toast } from 'react-hot-toast';

interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  reference_number?: string;
  description: string;
  entry_type: 'automatic' | 'manual' | 'adjustment' | 'reversing';
  source_module?: string;
  source_id?: number;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'void';
  posted_by?: string;
  posted_at?: string;
  created_by: string;
  created_at: string;
}

interface ChartOfAccount {
  id: number;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  is_header: boolean;
  is_active: boolean;
  description?: string;
}

interface JournalEntryDetail {
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalFormData {
  entry_date: string;
  reference_number: string;
  description: string;
  details: JournalEntryDetail[];
}

const JournalEntries: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isPostBatchModalOpen, setIsPostBatchModalOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);

  // Form states
  const [formData, setFormData] = useState<JournalFormData>({
    entry_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    description: '',
    details: [
      { account_code: '', account_name: '', description: '', debit: 0, credit: 0 },
      { account_code: '', account_name: '', description: '', debit: 0, credit: 0 }
    ]
  });
  const [formErrors, setFormErrors] = useState<any>({});

  // Chart of Accounts data
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [accountDropdowns, setAccountDropdowns] = useState<{[key: number]: boolean}>({});
  const [accountSearches, setAccountSearches] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchJournalEntries();
    fetchChartOfAccounts();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedStatus, selectedType, dateFrom, dateTo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-dropdown-container')) {
        setAccountDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      
      const response = await getJournalEntries({
        per_page: 1000
      });

      if (response.success) {
        setEntries(response.data.data);
      } else {
        toast.error('Gagal mengambil data jurnal');
      }
    } catch (error: any) {
      console.error('Error fetching journal entries:', error);
      toast.error(error.response?.data?.message || 'Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartOfAccounts = async () => {
    try {
      const response = await getChartOfAccounts({
        per_page: 1000,
        is_active: true
      });

      if (response.success) {
        // Filter hanya akun yang bukan header (bisa digunakan untuk jurnal)
        const activeAccounts = response.data.data.filter((acc: any) => !acc.is_header || acc.is_header === false);
        setChartOfAccounts(activeAccounts);
      }
    } catch (error: any) {
      console.error('Error fetching chart of accounts:', error);
      toast.error('Gagal mengambil data akun');
    }
  };

  const getFilteredAccounts = (searchTerm: string) => {
    if (!searchTerm) return chartOfAccounts;
    
    return chartOfAccounts.filter(account => 
      account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const selectAccount = (index: number, account: ChartOfAccount) => {
    updateDetailRow(index, 'account_code', account.account_code);
    updateDetailRow(index, 'account_name', account.account_name);
    
    // Close dropdown
    setAccountDropdowns(prev => ({ ...prev, [index]: false }));
    
    // Clear search
    setAccountSearches(prev => ({ ...prev, [index]: '' }));
  };

  const toggleAccountDropdown = (index: number) => {
    setAccountDropdowns(prev => ({ 
      ...prev, 
      [index]: !prev[index] 
    }));
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.reference_number && entry.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(entry => entry.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.entry_type === selectedType);
    }

    if (dateFrom) {
      filtered = filtered.filter(entry => entry.entry_date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(entry => entry.entry_date <= dateTo);
    }

    setFilteredEntries(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };


  const getStatusBadge = (status: string) => {
    const statusClasses = {
      posted: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      void: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      posted: 'Posted',
      draft: 'Draft',
      void: 'Void'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      automatic: 'bg-blue-100 text-blue-800',
      manual: 'bg-purple-100 text-purple-800',
      adjustment: 'bg-orange-100 text-orange-800',
      reversing: 'bg-gray-100 text-gray-800'
    };

    const typeLabels = {
      automatic: 'Otomatis',
      manual: 'Manual',
      adjustment: 'Penyesuaian',
      reversing: 'Pembalik'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeClasses[type as keyof typeof typeClasses]}`}>
        {typeLabels[type as keyof typeof typeLabels]}
      </span>
    );
  };

  const handlePost = async (entryId: number) => {
    try {
      const response = await postJournalEntry(entryId);

      if (response.success) {
        toast.success('Jurnal berhasil di-post');
        fetchJournalEntries(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal memposting jurnal');
      }
    } catch (error: any) {
      console.error('Error posting entry:', error);
      toast.error(error.response?.data?.message || 'Gagal memposting jurnal');
    }
  };

  const handleVoid = async (entryId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin void jurnal ini?')) {
      return;
    }

    try {
      const response = await voidJournalEntry(entryId);

      if (response.success) {
        toast.success('Jurnal berhasil di-void');
        fetchJournalEntries(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal void jurnal');
      }
    } catch (error: any) {
      console.error('Error voiding entry:', error);
      toast.error(error.response?.data?.message || 'Gagal void jurnal');
    }
  };

  const handleDelete = async (entryId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      return;
    }

    try {
      const response = await deleteJournalEntry(entryId);

      if (response.success) {
        toast.success('Jurnal berhasil dihapus');
        fetchJournalEntries(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal menghapus jurnal');
      }
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus jurnal');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
    setDateFrom('');
    setDateTo('');
  };

  // Journal form functions
  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { account_code: '', account_name: '', description: '', debit: 0, credit: 0 }]
    }));
  };

  const removeDetailRow = (index: number) => {
    if (formData.details.length > 2) {
      setFormData(prev => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index)
      }));
    }
  };

  const updateDetailRow = (index: number, field: keyof JournalEntryDetail, value: any) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map((detail, i) => 
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  const calculateTotals = () => {
    const totalDebit = formData.details.reduce((sum, detail) => sum + (detail.debit || 0), 0);
    const totalCredit = formData.details.reduce((sum, detail) => sum + (detail.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const validateJournalForm = () => {
    const errors: any = {};
    const { totalDebit, totalCredit } = calculateTotals();

    if (!formData.entry_date) errors.entry_date = 'Tanggal harus diisi';
    if (!formData.description) errors.description = 'Deskripsi harus diisi';
    if (totalDebit !== totalCredit) errors.balance = 'Total debit dan kredit harus seimbang';
    if (totalDebit === 0) errors.amount = 'Nominal harus lebih dari 0';

    formData.details.forEach((detail, index) => {
      if (!detail.account_code) errors[`detail_${index}_account`] = 'Akun harus dipilih';
      if (!detail.description) errors[`detail_${index}_description`] = 'Deskripsi harus diisi';
      if (detail.debit === 0 && detail.credit === 0) errors[`detail_${index}_amount`] = 'Nominal debit atau kredit harus diisi';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleJournalSubmit = async () => {
    if (!validateJournalForm()) return;

    try {
      // Convert form details to API format
      const details = formData.details
        .filter(d => d.account_code && (d.debit > 0 || d.credit > 0))
        .map(d => {
          // Find account_id from chartOfAccounts
          const account = chartOfAccounts.find(acc => acc.account_code === d.account_code);
          if (!account) {
            throw new Error(`Akun ${d.account_code} tidak ditemukan`);
          }
          return {
            account_id: account.id,
            debit_amount: d.debit || 0,
            credit_amount: d.credit || 0,
            description: d.description || ''
          };
        });

      const response = await createJournalEntry({
        entry_date: formData.entry_date,
        reference_number: formData.reference_number || undefined,
        description: formData.description,
        entry_type: 'manual',
        details: details
      });

      if (response.success) {
        toast.success('Jurnal berhasil dibuat!');
        setIsJournalModalOpen(false);
        resetForm();
        fetchJournalEntries(); // Refresh data
      } else {
        toast.error(response.message || 'Gagal membuat jurnal');
      }
    } catch (error: any) {
      console.error('Error creating journal:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal membuat jurnal');
    }
  };

  const resetForm = () => {
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      description: '',
      details: [
        { account_code: '', account_name: '', description: '', debit: 0, credit: 0 },
        { account_code: '', account_name: '', description: '', debit: 0, credit: 0 }
      ]
    });
    setFormErrors({});
    setAccountDropdowns({});
    setAccountSearches({});
  };

  // Post Batch functions
  const handlePostBatch = async () => {
    const draftEntries = entries.filter(entry => entry.status === 'draft');
    if (draftEntries.length === 0) {
      toast.error('Tidak ada jurnal draft untuk di-post');
      return;
    }

    try {
      // Post each draft entry
      const postPromises = draftEntries.map(entry => postJournalEntry(entry.id));
      await Promise.all(postPromises);
      
      toast.success(`${draftEntries.length} jurnal berhasil di-post`);
      setIsPostBatchModalOpen(false);
      fetchJournalEntries(); // Refresh data
    } catch (error: any) {
      console.error('Error posting batch:', error);
      toast.error(error.response?.data?.message || 'Gagal post jurnal');
    }
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
                Jurnal Umum
              </h1>
            </div>
            <div className="flex space-x-3">
              {/* Post Batch button di-hide sementara */}
              {/* <button 
                onClick={() => setIsPostBatchModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Post Batch
              </button> */}
              <button 
                onClick={() => setIsJournalModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Buat Jurnal
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <label className="block text-sm font-medium text-slate-700 mb-2">Cari Jurnal</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Cari nomor, referensi, atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${
                    showFilters 
                      ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                    showFilters ? 'rotate-180' : ''
                  }`} />
                </button>
                {(selectedStatus !== 'all' || selectedType !== 'all' || dateFrom || dateTo) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <div className="relative">
                      <select
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200 appearance-none"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">Semua Status</option>
                        <option value="draft">Draft</option>
                        <option value="posted">Posted</option>
                        <option value="void">Void</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
                    <div className="relative">
                      <select
                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200 appearance-none"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <option value="all">Semua Tipe</option>
                        <option value="automatic">Otomatis</option>
                        <option value="manual">Manual</option>
                        <option value="adjustment">Penyesuaian</option>
                        <option value="reversing">Pembalik</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Dari Tanggal</label>
                    <input
                      type="date"
                      className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sampai Tanggal</label>
                    <input
                      type="date"
                      className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

        {/* Journal Entries Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60">
            <h3 className="text-lg font-semibold text-slate-900">Daftar Jurnal Umum</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Nomor Jurnal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.entry_number}</div>
                      {entry.reference_number && (
                        <div className="text-xs text-gray-500">Ref: {entry.reference_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(entry.entry_date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{entry.description}</div>
                      {entry.source_module && (
                        <div className="text-xs text-gray-500">
                          Dari: {entry.source_module}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(entry.entry_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(entry.total_debit)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {entry.status === 'draft' && (
                          <>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handlePost(entry.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Post Jurnal"
                            >
                              <DocumentCheckIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {entry.status === 'posted' && (
                          <button 
                            onClick={() => handleVoid(entry.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Void Jurnal"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || dateFrom || dateTo
                      ? 'Tidak ada jurnal yang sesuai filter'
                      : 'Belum ada jurnal'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Jurnal</h3>
          <div className="text-3xl font-bold text-blue-600">{filteredEntries.length}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Draft</h3>
          <div className="text-3xl font-bold text-yellow-600">
            {filteredEntries.filter(e => e.status === 'draft').length}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Posted</h3>
          <div className="text-3xl font-bold text-green-600">
            {filteredEntries.filter(e => e.status === 'posted').length}
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Total Debit</h3>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(filteredEntries.reduce((sum, e) => sum + e.total_debit, 0))}
          </div>
        </div>
      </div>
      </div>

      {/* Modal Buat Jurnal */}
      <Modal
        isOpen={isJournalModalOpen}
        onClose={() => {
          setIsJournalModalOpen(false);
          resetForm();
        }}
        title="Buat Jurnal Umum"
        size="xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleJournalSubmit(); }} className="modal-form-container">
          {/* Scrollable Content */}
          <div className="modal-form-content px-1 space-y-6">
          {/* Header Form */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
                <DocumentTextIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">Informasi Jurnal</h4>
                <p className="text-sm text-slate-600">Masukkan detail informasi jurnal</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Jurnal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-700"
                  value={formData.entry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                />
                {formErrors.entry_date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.entry_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  No. Referensi
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                  placeholder="Masukkan nomor referensi..."
                  value={formData.reference_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 resize-none"
                  rows={3}
                  placeholder="Masukkan deskripsi jurnal..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detail Jurnal */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-lg">
                  <CogIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Detail Transaksi</h4>
                  <p className="text-sm text-slate-600">Input akun debit dan kredit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addDetailRow}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200 pb-2">
                <div className="col-span-3">Kode Akun</div>
                <div className="col-span-3">Deskripsi</div>
                <div className="col-span-2">Debit (Rp)</div>
                <div className="col-span-2">Kredit (Rp)</div>
                <div className="col-span-2 text-center">Aksi</div>
              </div>

              {formData.details.map((detail, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-3 relative account-dropdown-container">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 pr-8"
                          placeholder="Cari kode akun..."
                          value={accountSearches[index] || detail.account_code}
                          onChange={(e) => {
                            setAccountSearches(prev => ({ ...prev, [index]: e.target.value }));
                            if (!e.target.value) {
                              updateDetailRow(index, 'account_code', '');
                              updateDetailRow(index, 'account_name', '');
                            }
                            setAccountDropdowns(prev => ({ ...prev, [index]: true }));
                          }}
                          onFocus={() => setAccountDropdowns(prev => ({ ...prev, [index]: true }))}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => toggleAccountDropdown(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown */}
                      {accountDropdowns[index] && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {getFilteredAccounts(accountSearches[index] || '').length > 0 ? (
                            getFilteredAccounts(accountSearches[index] || '').map((account) => (
                              <button
                                key={account.id}
                                type="button"
                                onClick={() => selectAccount(index, account)}
                                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-slate-100 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm text-slate-900">
                                      {account.account_code} - {account.account_name}
                                    </div>
                                    {account.description && (
                                      <div className="text-xs text-slate-500">{account.description}</div>
                                    )}
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    account.account_type === 'asset' ? 'bg-blue-100 text-blue-800' :
                                    account.account_type === 'liability' ? 'bg-red-100 text-red-800' :
                                    account.account_type === 'equity' ? 'bg-purple-100 text-purple-800' :
                                    account.account_type === 'revenue' ? 'bg-green-100 text-green-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {account.account_type === 'asset' ? 'Aset' :
                                     account.account_type === 'liability' ? 'Kewajiban' :
                                     account.account_type === 'equity' ? 'Modal' :
                                     account.account_type === 'revenue' ? 'Pendapatan' : 'Beban'}
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-slate-500">
                              Tidak ada akun yang ditemukan
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show selected account */}
                      {detail.account_code && !accountSearches[index] && (
                        <div className="mt-1 text-xs text-slate-600">
                          {detail.account_code} - {detail.account_name}
                        </div>
                      )}

                      {formErrors[`detail_${index}_account`] && (
                        <p className="text-red-500 text-xs mt-1">{formErrors[`detail_${index}_account`]}</p>
                      )}
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="Deskripsi transaksi..."
                        value={detail.description}
                        onChange={(e) => updateDetailRow(index, 'description', e.target.value)}
                      />
                      {formErrors[`detail_${index}_description`] && (
                        <p className="text-red-500 text-xs mt-1">{formErrors[`detail_${index}_description`]}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-right text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        placeholder="0"
                        value={detail.debit || ''}
                        onChange={(e) => updateDetailRow(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-right text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        placeholder="0"
                        value={detail.credit || ''}
                        onChange={(e) => updateDetailRow(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2 flex justify-center">
                      {formData.details.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeDetailRow(index)}
                          className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-all duration-200"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    {formErrors[`detail_${index}_amount`] && (
                      <div className="col-span-12">
                        <p className="text-red-500 text-xs mt-1">{formErrors[`detail_${index}_amount`]}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Total Debit:</span>
                  <div className="font-semibold text-lg text-blue-600">
                    {formatCurrency(calculateTotals().totalDebit)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Total Kredit:</span>
                  <div className="font-semibold text-lg text-emerald-600">
                    {formatCurrency(calculateTotals().totalCredit)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Selisih:</span>
                  <div className={`font-semibold text-lg ${
                    calculateTotals().totalDebit === calculateTotals().totalCredit 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(calculateTotals().totalDebit - calculateTotals().totalCredit))}
                  </div>
                </div>
              </div>
              
              {formErrors.balance && (
                <p className="text-red-500 text-sm mt-2">{formErrors.balance}</p>
              )}
              {formErrors.amount && (
                <p className="text-red-500 text-sm mt-2">{formErrors.amount}</p>
              )}
            </div>
          </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="modal-form-footer bg-white border-t border-slate-200 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsJournalModalOpen(false);
                resetForm();
              }}
              className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              Simpan Jurnal
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Post Batch */}
      <Modal
        isOpen={isPostBatchModalOpen}
        onClose={() => setIsPostBatchModalOpen(false)}
        title="Post Batch Jurnal"
        size="md"
      >
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <AdjustmentsHorizontalIcon className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Post Batch Jurnal
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
              <p className="text-slate-700 font-medium leading-relaxed">
                Proses ini akan memposting semua jurnal dengan status <span className="font-bold text-yellow-700">"Draft"</span> 
                menjadi <span className="font-bold text-green-700">"Posted"</span>. 
              </p>
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-red-700 text-sm font-semibold flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Perhatian: Jurnal yang sudah di-post tidak dapat diubah lagi!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 shadow-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">
                    {entries.filter(e => e.status === 'draft').length}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Jurnal Draft Siap di-Post
                  </div>
                </div>
              </div>
              
              {entries.filter(e => e.status === 'draft').length > 0 && (
                <div className="text-xs text-slate-600 bg-white rounded-lg p-3 border">
                  Semua jurnal draft akan diubah statusnya menjadi "Posted"
                </div>
              )}
            </div>

            {entries.filter(e => e.status === 'draft').length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border-2 border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-600 font-medium">Tidak ada jurnal draft untuk di-post</p>
                <p className="text-gray-500 text-sm mt-2">Buat jurnal baru terlebih dahulu</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-slate-100">
            <button
              onClick={() => setIsPostBatchModalOpen(false)}
              className="px-8 py-4 text-sm font-semibold text-slate-700 bg-slate-100 border-2 border-slate-200 rounded-xl hover:bg-slate-200 hover:border-slate-300 transition-all duration-200 shadow-sm"
            >
              Batal
            </button>
            <button
              onClick={handlePostBatch}
              disabled={entries.filter(e => e.status === 'draft').length === 0}
              className="px-8 py-4 text-sm font-semibold text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent disabled:shadow-none"
            >
              <DocumentCheckIcon className="w-5 h-5 mr-2 inline" />
              Post Semua Draft
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JournalEntries;
