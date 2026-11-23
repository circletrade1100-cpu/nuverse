import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  CloudArrowUpIcon,
  // ExclamationTriangleIcon, // Not used after removing columns
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
// import Table from '../../components/common/UI/Table'; // Replaced with custom grouped table
import Modal from '../../components/common/UI/Modal';
import Button from '../../components/common/UI/Button';
import TULayout from '../../components/TU/TULayout';
import { useTransactions } from '../../hooks/useTU';
// import { usePermission } from '../../hooks/usePermission'; // Unused for now
import toast from 'react-hot-toast';

interface ExpenseTransaction {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  vendor?: string;
  invoiceNumber?: string;
  paymentMethod: 'cash' | 'transfer' | 'check';
  createdBy: string;
  approvedBy?: string;
  approvalLevel: 'tu' | 'kepala_sekolah';
  receiptFile?: string;
  receiptFileUrl?: string;
}

const Pengeluaran: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ExpenseTransaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Kategori state - dynamic from API with fallback
  const [kategoriPengeluaranList, setKategoriPengeluaranList] = useState([
    { id: '1', name: 'Operasional', is_active: true },
    { id: '2', name: 'Gaji Karyawan', is_active: true },
    { id: '3', name: 'Alat Kantor', is_active: true }
  ]);
  const [kategoriLoading, setKategoriLoading] = useState(false);

  // API hooks
  const {
    transactions,
    isLoading,
    // pagination, // Not used in grouped view
    setFilters,
    // setPage, // Not used in grouped view
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions
  } = useTransactions('expense');

  // Permission hooks - unused for now but keeping for future implementation
  // const { hasPermission, isSuperAdmin } = usePermission();

  useEffect(() => {
    const newFilters: any = {};
    
    if (searchTerm) {
      newFilters.search = searchTerm;
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      newFilters.category = selectedCategory;
    }
    
    newFilters.period = filterPeriod;
    
    if (filterPeriod === 'monthly') {
      newFilters.month = selectedMonth;
    } else if (filterPeriod === 'yearly') {
      newFilters.year = selectedYear;
    } else if (filterPeriod === 'custom') {
      newFilters.date_from = dateFrom;
      newFilters.date_to = dateTo;
    }
    
    setFilters(newFilters);
  }, [searchTerm, selectedCategory, filterPeriod, selectedMonth, selectedYear, dateFrom, dateTo, setFilters]);

  // Load initial data
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Convert API data to frontend format
  const convertApiToFrontendTransactions = (apiTransactions: any[]): ExpenseTransaction[] => {
    return apiTransactions.map(transaction => {
      // Parse metadata if it's a string
      let parsedMetadata: any = {};
      if (typeof transaction.metadata === 'string') {
        try {
          parsedMetadata = JSON.parse(transaction.metadata);
        } catch (e) {
          console.warn('Failed to parse metadata:', transaction.metadata);
        }
      } else if (typeof transaction.metadata === 'object' && transaction.metadata !== null) {
        parsedMetadata = transaction.metadata;
      }

      // Format date correctly without timezone conversion
      let formattedDate = transaction.transaction_date;
      if (formattedDate) {
        // If it's already in YYYY-MM-DD format, use it directly
        if (typeof formattedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          formattedDate = formattedDate;
        } else {
          // Otherwise parse it and format as YYYY-MM-DD
          const date = new Date(formattedDate);
          // Use local date components to avoid timezone issues
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }

      // Get receipt file URL - use receipt_file_url if available, otherwise construct from receipt_file
      let receiptFileUrl = null;
      if (transaction.receipt_file_url) {
        receiptFileUrl = transaction.receipt_file_url;
      } else if (transaction.receipt_file) {
        // Construct URL using API route for storage files
        const baseUrl = import.meta.env.PROD ? 'https://nurverse.id/api' : 'http://localhost:8000/api';
        receiptFileUrl = `${baseUrl}/storage/${transaction.receipt_file}`;
      }

      return {
        id: transaction.id.toString(),
        category: transaction.category?.name || 'Operasional',
        amount: typeof transaction.amount === 'number' ? transaction.amount : (parseFloat(transaction.amount) || 0),
        description: transaction.title,
        date: formattedDate,
        status: transaction.status,
        vendor: parsedMetadata.vendor || '',
        invoiceNumber: parsedMetadata.invoiceNumber || '',
        paymentMethod: parsedMetadata.paymentMethod || parsedMetadata.payment_method || 'cash',
        createdBy: transaction.user?.name || 'System',
        approvedBy: transaction.approved_by ? 'Admin' : undefined,
        approvalLevel: parsedMetadata.approvalLevel || 'tu',
        receiptFile: transaction.receipt_file,
        receiptFileUrl: receiptFileUrl
      };
    });
  };

  // Use API data instead of mock data
  const expenseTransactions: ExpenseTransaction[] = convertApiToFrontendTransactions(transactions);

  // Group transactions by main transaction name and created by (like in Pemasukan)
  const groupedTransactions = React.useMemo(() => {
    const groups: { [key: string]: ExpenseTransaction[] } = {};
    
    expenseTransactions.forEach(transaction => {
      // Extract main transaction name (before " - Category")
      const mainName = transaction.description.split(' - ')[0];
      // Create unique group key by combining main name with created by
      const groupKey = `${mainName} - ${transaction.createdBy || 'System'}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return Object.entries(groups).map(([groupKey, transactions]) => ({
      mainName: groupKey,
      transactions,
      totalAmount: transactions.reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : (parseFloat(t.amount) || 0);
        return sum + amount;
      }, 0),
      isExpanded: false
    }));
  }, [expenseTransactions]);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Form state untuk tambah pengeluaran
  const [formData, setFormData] = useState({
    namaTransaksi: '',
    kategoriPengeluaran: '',
    jumlah: '',
    jenisPengeluaran: 'cash' as 'transfer' | 'cash' | 'check',
    tanggal: new Date().toISOString().split('T')[0],
    buktiPengeluaran: null as File | null,
    vendor: '',
    nomorInvoice: '',
    tingkatApproval: 'tu' as 'tu' | 'kepala_sekolah',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'completed',
    approval: [] as string[]
  });

  // Dynamic categories state untuk pengeluaran
  const [dynamicCategories, setDynamicCategories] = useState<Array<{
    id: string;
    kategori: string;
    jumlah: string;
  }>>([]);

  // Load kategori pengeluaran from API
  useEffect(() => {
    const loadKategoriPengeluaran = async () => {
      try {
        setKategoriLoading(true);
        
        // Dynamic import to avoid circular dependency
        const { kategoriPengeluaranService } = await import('../../services/kategoriPengeluaranService');
        const response = await kategoriPengeluaranService.getAll();
        
        if (response?.success && Array.isArray(response.data)) {
          // Filter only active categories
          const activeCategories = response.data.filter(kategori => kategori?.is_active);
          if (activeCategories.length > 0) {
            setKategoriPengeluaranList(activeCategories);
          }
        }
      } catch (error) {
        console.error('Error loading kategori pengeluaran:', error);
        // Keep fallback categories if API fails
      } finally {
        setKategoriLoading(false);
      }
    };

    loadKategoriPengeluaran();
  }, []);

  // Initialize default kategori in form
  useEffect(() => {
    if (kategoriPengeluaranList.length > 0 && !formData.kategoriPengeluaran) {
      setFormData(prev => ({
        ...prev,
        kategoriPengeluaran: kategoriPengeluaranList[0].name as any
      }));
    }
  }, [kategoriPengeluaranList, formData.kategoriPengeluaran]);

  const [showApprovalDropdown, setShowApprovalDropdown] = useState(false);

  // Mock data untuk approval
  const mockApprovers = [
    { id: '1', nama: 'Kepala Sekolah', jabatan: 'Kepala Sekolah' },
    { id: '2', nama: 'Direktur Keuangan', jabatan: 'Direktur Keuangan' },
    { id: '3', nama: 'Direktur Pendidikan', jabatan: 'Direktur Pendidikan' }
  ];

  // Mock data sudah diganti dengan API data di atas
  // Sudah diganti dengan API data di line 106
  // expenseTransactions sudah didefinisikan dari konversi API data

  const categories = [
    { key: 'all', label: 'Semua Kategori', count: expenseTransactions.length },
    ...kategoriPengeluaranList.map(kategori => ({
      key: kategori.name,
      label: kategori.name,
      count: expenseTransactions.filter(t => t.category === kategori.name).length
    }))
  ];

  // Format currency untuk display (number ke string Rupiah)
  const formatRupiah = (amount: number | string | null | undefined): string => {
    // Convert to number and validate
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    // Check if valid number
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount < 0) {
      return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const totalExpense = expenseTransactions.reduce((sum, transaction) => {
    const amount = typeof transaction.amount === 'number' ? transaction.amount : (parseFloat(transaction.amount) || 0);
    return sum + amount;
  }, 0);
  const completedExpense = expenseTransactions.filter(t => t.status === 'completed').reduce((sum, t) => {
    const amount = typeof t.amount === 'number' ? t.amount : (parseFloat(t.amount) || 0);
    return sum + amount;
  }, 0);
  const pendingExpense = expenseTransactions.filter(t => t.status === 'pending').reduce((sum, t) => {
    const amount = typeof t.amount === 'number' ? t.amount : (parseFloat(t.amount) || 0);
    return sum + amount;
  }, 0);
  const pendingCount = expenseTransactions.filter(t => t.status === 'pending').length;

  const stats = [
    {
      title: 'Total Pengeluaran',
      value: formatRupiah(totalExpense),
      icon: CurrencyDollarIcon,
      change: '+8%',
      changeType: 'increase',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      title: 'Pengeluaran Selesai',
      value: formatRupiah(completedExpense),
      icon: CheckCircleIcon,
      change: `${expenseTransactions.filter(t => t.status === 'completed').length} transaksi`,
      changeType: 'neutral',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Menunggu Approval',
      value: formatRupiah(pendingExpense),
      icon: ClockIcon,
      change: `${pendingCount} transaksi`,
      changeType: 'warning',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Transaksi Hari Ini',
      value: expenseTransactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length.toString(),
      icon: CalendarDaysIcon,
      change: 'Hari ini',
      changeType: 'neutral',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ];

  const filteredData = expenseTransactions.filter(transaction => {
    const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.vendor && transaction.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter grouped transactions based on filteredData
  const filteredGroupedTransactions = groupedTransactions.filter(group => 
    group.transactions.some(transaction => 
      filteredData.some(filtered => filtered.id === transaction.id)
    )
  ).map(group => ({
    ...group,
    transactions: group.transactions.filter(transaction => 
      filteredData.some(filtered => filtered.id === transaction.id)
    )
  }));

  // Note: columns definition removed as we now use custom grouped table instead of Table component

  // Handlers dipindahkan ke bawah dengan implementasi API

  // Form handlers
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        buktiPengeluaran: file
      }));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      buktiPengeluaran: null
    }));
  };

  const handleApprovalToggle = (approverId: string) => {
    setFormData(prev => ({
      ...prev,
      approval: prev.approval.includes(approverId)
        ? prev.approval.filter(id => id !== approverId)
        : [...prev.approval, approverId]
    }));
  };

  // Dynamic categories functions
  const addDynamicCategory = () => {
    const defaultKategori = kategoriPengeluaranList.length > 0 ? kategoriPengeluaranList[0].name : 'Operasional';
    const newCategory = {
      id: Date.now().toString(),
      kategori: defaultKategori,
      jumlah: ''
    };
    setDynamicCategories(prev => [...prev, newCategory]);
  };

  const removeDynamicCategory = (id: string) => {
    setDynamicCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const updateDynamicCategory = (id: string, field: 'kategori' | 'jumlah', value: string) => {
    setDynamicCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  // Format currency untuk input (string ke string dengan format)
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(numbers) || 0);
  };

  // CRUD Handlers
  const handleView = (transaction: ExpenseTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: ExpenseTransaction) => {
    // Populate form with transaction data
    setFormData({
      namaTransaksi: transaction.description,
      kategoriPengeluaran: transaction.category,
      jumlah: transaction.amount.toString(),
      jenisPengeluaran: transaction.paymentMethod as 'transfer' | 'cash' | 'check',
      tanggal: transaction.date,
      buktiPengeluaran: null,
      vendor: transaction.vendor || '',
      nomorInvoice: transaction.invoiceNumber || '',
      tingkatApproval: transaction.approvalLevel,
      status: transaction.status,
      approval: []
    });
    
    setSelectedTransaction(transaction);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (transaction: ExpenseTransaction) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const success = await deleteTransaction(parseInt(transaction.id));
        if (success) {
          toast.success('Transaksi berhasil dihapus!');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Gagal menghapus transaksi.');
      }
    }
  };

  // Helper function to get category ID from dynamic kategori list
  const getCategoryId = (categoryName: string): number => {
    const kategori = kategoriPengeluaranList.find(k => k.name === categoryName);
    if (kategori) {
      return parseInt(kategori.id);
    }
    console.warn(`Unknown category: ${categoryName}, using first available category`);
    return kategoriPengeluaranList.length > 0 ? parseInt(kategoriPengeluaranList[0].id) : 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Main transaction
      const transactionData = {
        title: formData.namaTransaksi,
        description: formData.namaTransaksi,
        amount: parseInt(formData.jumlah.replace(/\D/g, '')),
        category_id: getCategoryId(formData.kategoriPengeluaran),
        transaction_date: formData.tanggal,
        receipt_file: formData.buktiPengeluaran || undefined,
        metadata: {
          vendor: formData.vendor,
          invoiceNumber: formData.nomorInvoice,
          paymentMethod: formData.jenisPengeluaran,
          approvalLevel: formData.tingkatApproval,
          approval: formData.approval
        }
      };

      console.log('Creating expense transaction:', transactionData);
      
      if (isEditMode && selectedTransaction) {
        // Update existing transaction
        const success = await updateTransaction(parseInt(selectedTransaction.id), transactionData);
        if (success) {
          toast.success('Transaksi berhasil diupdate!');
          setIsFormModalOpen(false);
          setIsEditMode(false);
          setSelectedTransaction(null);
        }
      } else {
        // Create new transaction
        console.log('🚀 Calling createTransaction with data:', transactionData);
        const success = await createTransaction(transactionData);
        if (success) {
          toast.success('Transaksi berhasil ditambahkan!');
          setIsFormModalOpen(false);
        } else {
          toast.error('Gagal menyimpan transaksi. Silakan coba lagi.');
        }
      }
    
      // Handle dynamic categories (create additional transactions)
    if (dynamicCategories.length > 0) {
        // Process dynamic categories separately
        for (const category of dynamicCategories) {
          const categoryData = {
            title: `${formData.namaTransaksi} - ${category.kategori}`,
            description: `${formData.namaTransaksi} - ${category.kategori}`,
            amount: parseInt(category.jumlah.replace(/\D/g, '')) || 0,
            category_id: getCategoryId(category.kategori),
            transaction_date: formData.tanggal,
            receipt_file: formData.buktiPengeluaran || undefined,
            metadata: {
              vendor: formData.vendor,
              invoiceNumber: formData.nomorInvoice,
              paymentMethod: formData.jenisPengeluaran,
              approvalLevel: formData.tingkatApproval,
              approval: formData.approval,
              isAdditionalCategory: true
            }
          };
          
          // Debug: console.log(`Creating dynamic category ${category.kategori}:`, categoryData);
          try {
            await createTransaction(categoryData);
          } catch (error) {
            console.error(`Error creating dynamic category ${category.kategori}:`, error);
            toast.error(`Gagal membuat kategori ${category.kategori}: ${error}`);
          }
        }
    }

    // Calculate total amount including dynamic categories (for reference)
    // const totalMainAmount = parseInt(formData.jumlah.replace(/\D/g, '')) || 0;
    // const totalAdditionalAmount = dynamicCategories.reduce((sum, cat) => {
    //   return sum + (parseInt(cat.jumlah.replace(/\D/g, '')) || 0);
    // }, 0);
    // const grandTotal = totalMainAmount + totalAdditionalAmount;

      // Reset form
      setFormData({
        namaTransaksi: '',
        kategoriPengeluaran: 'Operasional',
        jumlah: '',
        jenisPengeluaran: 'cash',
        tanggal: new Date().toISOString().split('T')[0],
        buktiPengeluaran: null,
        vendor: '',
        nomorInvoice: '',
        tingkatApproval: 'tu',
        status: 'pending',
        approval: []
      });
      setDynamicCategories([]);
      
    } catch (error: any) {
      console.error('❌ Error handling transaction:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menyimpan transaksi. Silakan coba lagi.';
      const errorDetails = error?.response?.data?.errors;
      
      if (errorDetails) {
        console.error('Validation errors:', errorDetails);
        const errorText = Object.values(errorDetails).flat().join(', ');
        toast.error(`Validasi gagal: ${errorText}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <TULayout>
      <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengeluaran</h1>
            <p className="text-slate-600 mt-1">Monitoring dan kelola semua transaksi pengeluaran sekolah</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select 
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-700 bg-white"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
                <option value="custom">Rentang Tanggal</option>
              </select>

              {filterPeriod === 'monthly' && (
                <input 
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-700 bg-white"
                />
              )}

              {filterPeriod === 'yearly' && (
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium text-slate-700 bg-white"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              )}

              {filterPeriod === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <input 
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-700 bg-white"
                    placeholder="Dari"
                  />
                  <span className="text-slate-400 text-xs font-bold uppercase">s/d</span>
                  <input 
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-slate-700 bg-white"
                    placeholder="Sampai"
                  />
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setIsFormModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4" />
              Tambah Pengeluaran
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`p-6 rounded-2xl border-2 ${stat.bgColor} ${stat.borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-xs font-semibold ${stat.textColor}`}>{stat.change}</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>


      {/* Filters & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Category Filters - Scrollable Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.key
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Daftar Transaksi Pengeluaran</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <FunnelIcon className="w-4 h-4 text-slate-600" />
            </button>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data transaksi...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="grid grid-cols-11 gap-4 font-semibold text-slate-700 text-sm">
                <div className="col-span-4">TRANSAKSI</div>
                <div className="col-span-2">JUMLAH</div>
                <div className="col-span-2">JENIS PENGELUARAN</div>
                <div className="col-span-2">TANGGAL</div>
                <div className="col-span-1">AKSI</div>
              </div>
            </div>

            {/* Grouped Table Body */}
            <div className="divide-y divide-slate-200">
              {filteredGroupedTransactions.map((group) => (
                <div key={group.mainName}>
                  {/* Main Row */}
                  <div 
                    className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedRows(prev => ({
                      ...prev,
                      [group.mainName]: !prev[group.mainName]
                    }))}
                  >
                    <div className="grid grid-cols-11 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        <button className="text-slate-400 hover:text-slate-600">
                          {expandedRows[group.mainName] ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <p className="font-semibold text-slate-800">{group.mainName}</p>
                          <p className="text-xs text-slate-500">{group.transactions.length} kategori</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold text-red-600 text-lg">
                          {formatRupiah(group.totalAmount)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            group.transactions[0].paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                            group.transactions[0].paymentMethod === 'transfer' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {group.transactions[0].paymentMethod === 'cash' ? 'Tunai' :
                             group.transactions[0].paymentMethod === 'transfer' ? 'Transfer' : 'Cek'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-slate-800">{new Date(group.transactions[0].date).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(group.transactions[0]);
                            }}
                            className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                            title="Lihat detail"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(group.transactions[0]);
                            }}
                            className="p-1 hover:bg-amber-100 text-amber-600 rounded transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(group.transactions[0]);
                            }}
                            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                            title="Hapus"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub Rows (Categories) */}
                  {expandedRows[group.mainName] && group.transactions.length > 1 && (
                    <div className="bg-slate-25">
                      {group.transactions.map((transaction) => (
                        <div key={transaction.id} className="px-6 py-3 ml-8 border-l-2 border-slate-200">
                          <div className="grid grid-cols-11 gap-4 items-center">
                            <div className="col-span-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                <div>
                                  <span className="text-xs font-medium text-slate-600 bg-red-100 px-2 py-1 rounded-full">
                                    {transaction.category}
                                  </span>
                                  <p className="text-xs text-slate-500 mt-1">{transaction.invoiceNumber || '-'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold text-red-600">
                                {formatRupiah(transaction.amount)}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                                transaction.paymentMethod === 'transfer' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {transaction.paymentMethod === 'cash' ? 'Tunai' :
                                 transaction.paymentMethod === 'transfer' ? 'Transfer' : 'Cek'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="col-span-1">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleView(transaction)}
                                  className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                  title="Lihat detail"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(transaction)}
                                  className="p-1 hover:bg-amber-100 text-amber-600 rounded transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(transaction)}
                                  className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                                  title="Hapus"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Transaksi</h3>
            <p className="text-slate-600 mb-4">Belum ada data transaksi pengeluaran yang sesuai dengan filter.</p>
            <Button
              onClick={() => setIsFormModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Tambah Transaksi Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detail Transaksi Pengeluaran"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Transaksi</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
                  <p className="text-slate-900">{selectedTransaction.category}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Deskripsi</label>
              <p className="text-slate-900">{selectedTransaction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Jumlah</label>
                <p className="text-slate-900 font-bold text-2xl text-red-600">
                  {formatRupiah(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Metode Pembayaran</label>
                <p className="text-slate-900 capitalize">{selectedTransaction.paymentMethod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tanggal</label>
                <p className="text-slate-900">{new Date(selectedTransaction.date).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Dibuat Oleh</label>
                <p className="text-slate-900">{selectedTransaction.createdBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Disetujui Oleh</label>
                <p className="text-slate-900">{selectedTransaction.approvedBy || '-'}</p>
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Level Approval</label>
                <p className="text-slate-900">{selectedTransaction.approvalLevel === 'tu' ? 'Kepala TU' : 'Kepala Sekolah'}</p>
              </div>

              {/* Bukti Pengeluaran */}
              {selectedTransaction.receiptFile && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Bukti Pengeluaran</label>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DocumentArrowDownIcon className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedTransaction.receiptFile.split('/').pop()}
                          </p>
                          <p className="text-xs text-slate-500">Bukti pengeluaran</p>
                        </div>
                      </div>
                      <a
                        href={selectedTransaction.receiptFileUrl || `${import.meta.env.PROD ? 'https://nurverse.id/api' : 'http://localhost:8000/api'}/storage/${selectedTransaction.receiptFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Lihat File
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
              {selectedTransaction.status === 'pending' && (
                <>
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Tolak
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Setujui
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Tambah Transaksi Pengeluaran"
        size="xl"
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1 space-y-6 pb-4">
            {/* Section 1: Informasi Dasar */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Informasi Dasar
              </h4>
              
              <div className="space-y-4">
                {/* Nama Transaksi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.namaTransaksi}
                    onChange={(e) => handleInputChange('namaTransaksi', e.target.value)}
                    placeholder="Masukkan nama/deskripsi transaksi pengeluaran"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                {/* Kategori & Jumlah */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kategori Pengeluaran */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Kategori Pengeluaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kategoriPengeluaran}
                      onChange={(e) => handleInputChange('kategoriPengeluaran', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                      required
                      disabled={kategoriLoading}
                    >
                      {kategoriLoading ? (
                        <option value="">Memuat kategori...</option>
                      ) : (
                        <>
                          <option value="">Pilih Kategori Pengeluaran</option>
                          {kategoriPengeluaranList.map((kategori) => (
                            <option key={kategori.id} value={kategori.name}>
                              {kategori.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Jumlah */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={formData.jumlah}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          handleInputChange('jumlah', formatted);
                        }}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Tambah Kategori */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addDynamicCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Kategori Pengeluaran
                  </button>
                </div>

                {/* Dynamic Categories */}
                {dynamicCategories.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t border-red-200 pt-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        Kategori Tambahan
                      </h5>
                      {dynamicCategories.map((category, index) => (
                        <div key={category.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-red-100 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-600">
                              Kategori #{index + 2}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDynamicCategory(category.id)}
                              className="p-1 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                              title="Hapus kategori"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Kategori Pengeluaran
                              </label>
                              <select
                                value={category.kategori}
                                onChange={(e) => updateDynamicCategory(category.id, 'kategori', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm"
                                disabled={kategoriLoading}
                              >
                                {kategoriLoading ? (
                                  <option value="">Memuat...</option>
                                ) : (
                                  <>
                                    <option value="">Pilih Kategori</option>
                                    {kategoriPengeluaranList.map((kategori) => (
                                      <option key={kategori.id} value={kategori.name}>
                                        {kategori.name}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Jumlah
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-xs">
                                  Rp
                                </span>
                                <input
                                  type="text"
                                  value={category.jumlah}
                                  onChange={(e) => {
                                    const formatted = formatCurrency(e.target.value);
                                    updateDynamicCategory(category.id, 'jumlah', formatted);
                                  }}
                                  placeholder="0"
                                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Detail Pembayaran */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Detail Pembayaran
              </h4>
              
              <div className="space-y-4">
                {/* Jenis Pengeluaran & Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jenis Pengeluaran */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Jenis Pengeluaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jenisPengeluaran}
                      onChange={(e) => handleInputChange('jenisPengeluaran', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="transfer">Transfer Bank</option>
                      <option value="cash">Cash/Tunai</option>
                      <option value="debit">Kartu Debit</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) => handleInputChange('tanggal', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            {(formData.jumlah || dynamicCategories.some(cat => cat.jumlah)) && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Ringkasan Total
                </h4>
                
                <div className="space-y-3">
                  {/* Main category */}
                  {formData.jumlah && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {formData.kategoriPengeluaran}: {formData.namaTransaksi || 'Transaksi Utama'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        Rp {formatCurrency(formData.jumlah)}
                      </span>
                    </div>
                  )}
                  
                  {/* Dynamic categories */}
                  {dynamicCategories.map((category, index) => (
                    category.jumlah && (
                      <div key={category.id} className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          {category.kategori}: Kategori #{index + 2}
                        </span>
                        <span className="font-semibold text-slate-800">
                          Rp {formatCurrency(category.jumlah)}
                        </span>
                      </div>
                    )
                  ))}
                  
                  {/* Grand total */}
                  <div className="border-t border-red-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-800">
                        Total Keseluruhan
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {(() => {
                          const mainAmount = parseInt(formData.jumlah.replace(/\D/g, '')) || 0;
                          const additionalAmount = dynamicCategories.reduce((sum, cat) => {
                            return sum + (parseInt(cat.jumlah.replace(/\D/g, '')) || 0);
                          }, 0);
                          return formatRupiah(mainAmount + additionalAmount);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Dokumen dan Approval */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Dokumen & Approval
              </h4>
              
              <div className="space-y-4">
                {/* Upload Bukti Pengeluaran */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Bukti Pengeluaran
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      id="file-upload-input"
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors bg-white/70 relative pointer-events-none">
                      {formData.buktiPengeluaran && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleRemoveFile();
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors z-30 pointer-events-auto"
                          title="Hapus file"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                      <CloudArrowUpIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">
                        {formData.buktiPengeluaran ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-purple-600 font-medium">{formData.buktiPengeluaran.name}</span>
                            <span className="text-xs text-slate-500">
                              {(formData.buktiPengeluaran.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">Klik untuk upload</span> atau drag & drop
                            <br />
                            <span className="text-xs">PNG, JPG, PDF hingga 10MB</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approval */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Approval <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowApprovalDropdown(!showApprovalDropdown)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md text-left flex items-center justify-between"
                    >
                      <span className={formData.approval.length === 0 ? 'text-slate-500' : 'text-slate-900'}>
                        {formData.approval.length === 0 
                          ? 'Pilih approver' 
                          : `${formData.approval.length} approver dipilih`
                        }
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform ${showApprovalDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showApprovalDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                        {mockApprovers.map((approver) => (
                          <label
                            key={approver.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.approval.includes(approver.id)}
                              onChange={() => handleApprovalToggle(approver.id)}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{approver.nama}</p>
                              <p className="text-xs text-slate-500">{approver.jabatan}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Approvers Display */}
                  {formData.approval.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.approval.map((approverId) => {
                        const approver = mockApprovers.find(a => a.id === approverId);
                        return approver ? (
                          <span
                            key={approverId}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                          >
                            {approver.nama}
                            <button
                              type="button"
                              onClick={() => handleApprovalToggle(approverId)}
                              className="hover:text-purple-900"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>

            {/* Fixed Bottom Actions */}
            <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4 mt-4">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl border-2 hover:bg-slate-50 transition-all duration-200"
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Simpan Transaksi
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
      </div>
    </TULayout>
  );
};

export default Pengeluaran;
