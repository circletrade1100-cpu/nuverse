import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUpIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
// import Table from '../../components/common/UI/Table'; // Replaced with custom grouped table
import Modal from '../../components/common/UI/Modal';
import Button from '../../components/common/UI/Button';
import TULayout from '../../components/TU/TULayout';
import { useTransactions } from '../../hooks/useTU';
import { usePermission } from '../../hooks/usePermission';
import { studentService } from '../../services/studentService';
import { bankService } from '../../services/bankService';
import type { Student } from '../../types/student';
import type { Bank } from '../../types/masterData';
import toast from 'react-hot-toast';
import KwitansiTemplate from '../../components/TU/KwitansiTemplate';

interface IncomeTransaction {
  id: string;
  category: 'SPP' | 'Eskul' | 'Buku' | 'Kegiatan' | 'AJP' | 'Seragam' | 'Infaq' | 'Koperasi' | 'Lainnya' | string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'completed';
  paidBy?: string;
  paymentMethod: string;
  receiptNumber: string;
  createdBy: string;
  approvedBy?: string;
  receiptFile?: string;
  metadata?: Record<string, any>;
}

type GroupedTransaction = {
  mainName: string;
  transactions: IncomeTransaction[];
  totalAmount: number;
  isExpanded: boolean;
};

const Pemasukan: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<IncomeTransaction | null>(null);
  const [selectedTransactionGroup, setSelectedTransactionGroup] = useState<IncomeTransaction[] | null>(null);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<{ name: string; totalAmount: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState('2024-12');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // API hooks
  const {
    transactions,
    isLoading,
    pagination,
    setFilters,
    setPage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions
  } = useTransactions('income');

  // Permission hooks
  const { hasPermission, isSuperAdmin, user } = usePermission();
  
  // Debug permission
  useEffect(() => {
    console.log('=== PERMISSION DEBUG PEMASUKAN ===');
    console.log('Current user:', user);
    console.log('Is Super Admin:', isSuperAdmin());
    console.log('Has pemasukan.view:', hasPermission('pemasukan', 'view'));
    console.log('Has pemasukan.delete:', hasPermission('pemasukan', 'delete'));
    if (user?.roles) {
      user.roles.forEach(role => {
        console.log(`Role: ${role.name}`, role.permissions?.filter((p: any) => p.name.startsWith('pemasukan')));
      });
    }
  }, [user, hasPermission, isSuperAdmin]);

  // Load data and apply filters
  useEffect(() => {
    const newFilters: any = {};
    
    if (searchTerm) {
      newFilters.search = searchTerm;
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      newFilters.category = selectedCategory;
    }
    
    if (selectedMonth) {
      newFilters.month = selectedMonth;
    }
    
    setFilters(newFilters);
  }, [searchTerm, selectedCategory, selectedMonth, setFilters]);

  // Load initial data
  useEffect(() => {
    refreshTransactions();
  }, []);

  useEffect(() => {
    const loadBanks = async () => {
      setBankLoading(true);
      try {
        const response = await bankService.getAll({ paginate: false });
        if (response.success) {
          setBankOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error loading bank options:', error);
        toast.error('Gagal memuat daftar bank');
      } finally {
        setBankLoading(false);
      }
    };

    loadBanks();
  }, []);
  
  // Form state for adding new transaction
  const [formData, setFormData] = useState({
    namaTransaksi: '',
    jumlah: '',
    dibayarOleh: '',
    siswa: '',
    unitSekolah: '',
    tanggal: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'approved' | 'completed',
    kategori: '' as IncomeTransaction['category'],
    metodePembayaran: 'cash' as string,
    buktiTransaksi: null as File | null
  });


  // Dynamic categories state
  const [dynamicCategories, setDynamicCategories] = useState<Array<{
    id: string;
    kategori: IncomeTransaction['category'];
    jumlah: string;
  }>>([]);

  // Search state for student dropdown
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  
  // Students data state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [, setSelectedStudent] = useState<Student | null>(null);

  const [bankOptions, setBankOptions] = useState<Bank[]>([]);
  const [bankLoading, setBankLoading] = useState(false);

  // Student bills data state
  const [studentBills, setStudentBills] = useState<Array<{
    id: string;
    bill_type_name: string;
    amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
  }>>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  
  // Updated bills state for real-time calculation
  const [updatedBills, setUpdatedBills] = useState<Array<{
    id: string;
    bill_type_name: string;
    amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
  }>>([]);

  // Kategori state - dynamic from API with fallback
  const [kategoriPemasukanList, setKategoriPemasukanList] = useState([
    { id: '1', name: 'SPP Siswa', is_active: true },
    { id: '2', name: 'Ekstrakurikuler', is_active: true },
    { id: '3', name: 'Buku Pelajaran', is_active: true },
    { id: '4', name: 'Biaya Kegiatan', is_active: true },
    { id: '5', name: 'AJP', is_active: true },
    { id: '6', name: 'Seragam', is_active: true },
    { id: '7', name: 'Infaq dan Sumbangan', is_active: true },
    { id: '8', name: 'Transaksi Koperasi', is_active: true },
    { id: '9', name: 'Lainnya', is_active: true }
  ]);
  const [kategoriLoading, setKategoriLoading] = useState(false);

  // Load students data
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudentsLoading(true);
        const response = await studentService.getAll({ per_page: 100 });
        setStudents(response.students);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Gagal memuat data siswa');
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Load kategori pemasukan from API
  useEffect(() => {
    const loadKategoriPemasukan = async () => {
      try {
        setKategoriLoading(true);
        
        // Dynamic import to avoid circular dependency
        const { kategoriPemasukanService } = await import('../../services/kategoriPemasukanService');
        const response = await kategoriPemasukanService.getAll();
        
        if (response?.success && Array.isArray(response.data)) {
          // Filter only active categories
          const activeCategories = response.data.filter(kategori => kategori?.is_active);
          if (activeCategories.length > 0) {
            setKategoriPemasukanList(activeCategories);
          }
        }
      } catch (error) {
        console.error('Error loading kategori pemasukan:', error);
        // Keep fallback categories if API fails
      } finally {
        setKategoriLoading(false);
      }
    };

    loadKategoriPemasukan();
  }, []);

  // Initialize default kategori in form (only for new transactions)
  useEffect(() => {
    if (!isEditMode && isFormModalOpen && kategoriPemasukanList.length > 0 && !formData.kategori) {
      setFormData(prev => ({
        ...prev,
        kategori: kategoriPemasukanList[0].name
      }));
    }
  }, [kategoriPemasukanList, isEditMode, isFormModalOpen]);

  // Calculate updated bills when payment amount or category changes
  useEffect(() => {
    if (formData.siswa && studentBills.length > 0) {
      // Start with original bills
      let updated = [...studentBills];
      
      // Process main category
      if (formData.kategori && formData.jumlah) {
        const paymentAmount = parseFloat(formData.jumlah.replace(/[^\d]/g, '')) || 0;
        if (paymentAmount > 0) {
          updated = updated.map(bill => {
            const matches = bill.bill_type_name.toLowerCase().includes(formData.kategori.toLowerCase()) || 
                           formData.kategori.toLowerCase().includes(bill.bill_type_name.toLowerCase());
            
            if (matches) {
              const newPaidAmount = bill.paid_amount + paymentAmount;
              const newRemainingAmount = Math.max(0, bill.amount - newPaidAmount);
              
              let newStatus = 'unpaid';
              if (newRemainingAmount === 0) {
                newStatus = 'paid';
              } else if (newPaidAmount > 0) {
                newStatus = 'partial';
              }

              return {
                ...bill,
                paid_amount: newPaidAmount,
                remaining_amount: newRemainingAmount,
                status: newStatus
              };
            }
            return bill;
          });
        }
      }
      
      // Process dynamic categories
      dynamicCategories.forEach(category => {
        if (category.kategori && category.jumlah) {
          const paymentAmount = parseFloat(category.jumlah.replace(/[^\d]/g, '')) || 0;
          if (paymentAmount > 0) {
            updated = updated.map(bill => {
              const matches = bill.bill_type_name.toLowerCase().includes(category.kategori.toLowerCase()) || 
                             category.kategori.toLowerCase().includes(bill.bill_type_name.toLowerCase());
              
              if (matches) {
                const newPaidAmount = bill.paid_amount + paymentAmount;
                const newRemainingAmount = Math.max(0, bill.amount - newPaidAmount);
                
                let newStatus = 'unpaid';
                if (newRemainingAmount === 0) {
                  newStatus = 'paid';
                } else if (newPaidAmount > 0) {
                  newStatus = 'partial';
                }

                return {
                  ...bill,
                  paid_amount: newPaidAmount,
                  remaining_amount: newRemainingAmount,
                  status: newStatus
                };
              }
              return bill;
            });
          }
        }
      });
      
      setUpdatedBills(updated);
    } else {
      setUpdatedBills(studentBills);
    }
  }, [formData.kategori, formData.jumlah, dynamicCategories, studentBills]);

  const filteredStudents = students.filter(student =>
    (student.namaLengkap || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.nisn.includes(studentSearch) ||
    (student.unitKelas || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

const getPaymentMethodBadge = (method: string) => {
  const normalized = (method || '').toLowerCase();
  if (normalized === 'cash') {
    return { label: 'Tunai', className: 'bg-green-100 text-green-700' };
  }
  if (normalized === 'transfer') {
    return { label: 'Transfer', className: 'bg-blue-100 text-blue-700' };
  }
  if (normalized === 'card' || normalized === 'kartu') {
    return { label: 'Kartu', className: 'bg-purple-100 text-purple-700' };
  }
  if (method) {
    return { label: method, className: 'bg-slate-100 text-slate-700' };
  }
  return { label: 'Metode Tidak Diketahui', className: 'bg-slate-200 text-slate-600' };
};

  // Utility function for currency formatting
  const formatCurrencyIDR = (amount: number): string => {
    // Handle NaN, null, undefined
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(validAmount);
  };

  // Convert API data to frontend format
  const normalizeAdditionalCategories = (metadata: any): Array<Record<string, any>> => {
    if (!metadata) {
      return [];
    }

    const rawValue =
      metadata.additionalCategories ??
      metadata.additional_categories ??
      metadata.additional_categories_list ??
      [];

    if (!rawValue) {
      return [];
    }

    if (typeof rawValue === 'string') {
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('Failed to parse additional categories string:', rawValue, error);
        return [];
      }
    }

    if (Array.isArray(rawValue)) {
      return rawValue;
    }

    if (typeof rawValue === 'object') {
      // Handle object maps { key: {...}, ... }
      return Object.values(rawValue).filter(
        (item): item is Record<string, any> => !!item && typeof item === 'object'
      );
    }

    return [];
  };

  const convertApiToFrontendTransactions = (apiTransactions: any[]): IncomeTransaction[] => {
    if (!Array.isArray(apiTransactions)) {
      console.warn('apiTransactions is not an array:', apiTransactions);
      return [];
    }

    const frontendTransactions: IncomeTransaction[] = [];
    
    apiTransactions.forEach(transaction => {
      // Ensure amount is a valid number
      const baseAmount = typeof transaction.amount === 'number' ? transaction.amount : 
                   typeof transaction.amount === 'string' ? parseFloat(transaction.amount) || 0 : 0;
      
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

      const baseTransaction: IncomeTransaction = {
        id: transaction.id.toString(),
        category: transaction.category?.name || 'Lainnya',
        amount: baseAmount,
        description: transaction.title || 'Transaksi',
        date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        status: transaction.status || 'pending',
        paidBy: parsedMetadata.paidBy || parsedMetadata.student_name || '',
        paymentMethod: parsedMetadata.paymentMethod || parsedMetadata.payment_method || 'cash',
        receiptNumber: parsedMetadata.receiptNumber || parsedMetadata.reference_number || `TRX-${transaction.id}`,
        createdBy: transaction.user?.name || 'System',
        approvedBy: transaction.approved_by ? 'Admin' : undefined,
        receiptFile: transaction.receipt_file, // Tambahkan receipt file
        metadata: parsedMetadata // Include full metadata for edit mode
      };

      frontendTransactions.push(baseTransaction);

      // Generate additional transactions from metadata.additionalCategories
      const additionalCategories = normalizeAdditionalCategories(parsedMetadata);

      if (additionalCategories.length > 0) {
        additionalCategories.forEach((additionalCategory: any, index: number) => {
          const rawAmount =
            additionalCategory?.amount ??
            additionalCategory?.jumlah ??
            additionalCategory?.value ??
            additionalCategory?.nominal ??
            0;
          const additionalAmount = typeof rawAmount === 'number'
            ? rawAmount
            : typeof rawAmount === 'string'
              ? parseFloat(rawAmount.replace(/[^\d.-]/g, '')) || 0
              : 0;

          const categoryName =
            additionalCategory?.category ||
            additionalCategory?.category_name ||
            additionalCategory?.name ||
            additionalCategory?.label ||
            'Kategori Tambahan';

          if (!categoryName || additionalAmount === 0) {
            return;
          }

          const additionalTransaction: IncomeTransaction = {
            ...baseTransaction,
            id: `${transaction.id}-extra-${index}`,
            category: categoryName,
            amount: additionalAmount,
            description: `${baseTransaction.description} - ${categoryName}`,
            receiptNumber: `${baseTransaction.receiptNumber}-CAT${index + 1}`,
            metadata: {
              ...parsedMetadata,
              isAdditionalCategory: true,
              parentTransactionId: baseTransaction.id,
              additionalCategoryIndex: index
            }
          };

          frontendTransactions.push(additionalTransaction);
        });
      }
    });

    return frontendTransactions;
  };

  // Use API data instead of mock data
  const incomeTransactions: IncomeTransaction[] = convertApiToFrontendTransactions(transactions);

  // Group transactions by main transaction name and student (paidBy)
  const groupedTransactions: GroupedTransaction[] = React.useMemo(() => {
    const groups: { [key: string]: IncomeTransaction[] } = {};
    
    incomeTransactions.forEach(transaction => {
      // Extract main transaction name (before " - Category")
      const mainName = transaction.description.split(' - ')[0];
      // Create unique group key by combining main name with student/paidBy
      const groupKey = `${mainName} - ${transaction.paidBy || 'Tidak diketahui'}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return Object.entries(groups).map(([groupKey, transactions]) => ({
      mainName: groupKey,
      transactions,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      isExpanded: false
    }));
  }, [incomeTransactions]);

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Dynamic categories from API data
  const categories = [
    { key: 'all', label: 'Semua Kategori', count: incomeTransactions.length },
    ...kategoriPemasukanList.map(kategori => ({
      key: kategori.name,
      label: kategori.name,
      count: incomeTransactions.filter(t => t.category === kategori.name).length
    }))
  ];

  const totalIncome = incomeTransactions.reduce((sum, transaction) => {
    const amount = typeof transaction.amount === 'number' && !isNaN(transaction.amount) ? transaction.amount : 0;
    return sum + amount;
  }, 0);
  
  const completedIncome = incomeTransactions.filter(t => t.status === 'completed').reduce((sum, t) => {
    const amount = typeof t.amount === 'number' && !isNaN(t.amount) ? t.amount : 0;
    return sum + amount;
  }, 0);
  
  const pendingIncome = incomeTransactions.filter(t => t.status === 'pending').reduce((sum, t) => {
    const amount = typeof t.amount === 'number' && !isNaN(t.amount) ? t.amount : 0;
    return sum + amount;
  }, 0);

  const stats = [
    {
      title: 'Total Pemasukan',
      value: formatCurrencyIDR(totalIncome),
      icon: CurrencyDollarIcon,
      change: '+12%',
      changeType: 'increase',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Pemasukan Selesai',
      value: formatCurrencyIDR(completedIncome),
      icon: CheckCircleIcon,
      change: `${incomeTransactions.filter(t => t.status === 'completed').length} transaksi`,
      changeType: 'neutral',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Menunggu Approval',
      value: formatCurrencyIDR(pendingIncome),
      icon: ArrowUpIcon,
      change: `${incomeTransactions.filter(t => t.status === 'pending').length} transaksi`,
      changeType: 'warning',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Transaksi Hari Ini',
      value: incomeTransactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length.toString(),
      icon: CalendarDaysIcon,
      change: 'Hari ini',
      changeType: 'neutral',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ];

  const filteredData = incomeTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.paidBy && transaction.paidBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter grouped transactions based on filteredData
  const filteredGroupedTransactions: GroupedTransaction[] = groupedTransactions.filter(group => 
    group.transactions.some(transaction => 
      filteredData.some(filtered => filtered.id === transaction.id)
    )
  ).map(group => ({
    ...group,
    transactions: group.transactions.filter(transaction => 
      filteredData.some(filtered => filtered.id === transaction.id)
    )
  }));

  // Table columns configuration - for future table implementation
  /*
  const columns = [
    {
      header: 'Transaksi',
      key: 'description',
      render: (value: string, row: IncomeTransaction) => (
        <div>
          <p className="font-semibold text-slate-800">{value}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              {row.category}
            </span>
            <span className="text-xs text-slate-500 font-mono">{row.receiptNumber}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Jumlah',
      key: 'amount',
      render: (value: number) => (
        <span className="font-bold text-emerald-600 text-lg">
          {formatCurrencyIDR(value)}
        </span>
      )
    },
    {
      header: 'Dibayar Oleh',
      key: 'paidBy',
      render: (value: string, row: IncomeTransaction) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{value || '-'}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
              row.paymentMethod === 'transfer' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {row.paymentMethod === 'cash' ? 'Tunai' :
               row.paymentMethod === 'transfer' ? 'Transfer' : 'Kartu'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Tanggal',
      key: 'date',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{new Date(value).toLocaleDateString('id-ID')}</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value: string) => {
        const statusConfig = {
          pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
          approved: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Disetujui' },
          completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Selesai' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'Aksi',
      key: 'id',
      render: (_: string, row: IncomeTransaction) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleView(row)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          {(row.status === 'pending' || isSuperAdmin() || hasPermission('pemasukan', 'edit')) && hasPermission('pemasukan', 'edit') && (
            <button 
              onClick={() => handleEdit(row)}
              className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {true && (
            <button 
              onClick={() => handleDelete(row)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="Hapus"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];
  */

  // Format currency for input display
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) || 0;
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const handleEdit = async (transaction: IncomeTransaction) => {
    setSelectedTransactionGroup(null);
    setSelectedGroupInfo(null);
    // Extract metadata for student info
    const metadata = transaction.metadata || {};
    const studentId = metadata.student ? metadata.student.toString() : '';
    const unitSekolah = metadata.student_unit_sekolah || '';
    
    // Populate form with transaction data
    setFormData({
      namaTransaksi: transaction.description || '',
      jumlah: formatCurrency(transaction.amount.toString()),
      dibayarOleh: transaction.paidBy || '',
      siswa: studentId,
      unitSekolah: unitSekolah,
      tanggal: transaction.date || new Date().toISOString().split('T')[0],
      status: transaction.status || 'pending',
      kategori: transaction.category || '',
      metodePembayaran: transaction.paymentMethod || 'cash',
      buktiTransaksi: null // File can't be restored, user needs to re-upload
    });
    
    // Determine base transaction (for additional categories)
    let baseTransaction = transaction;
    if (transaction.metadata?.isAdditionalCategory && transaction.metadata?.parentTransactionId) {
      const parentTransaction = incomeTransactions.find(
        (t) => t.id === transaction.metadata?.parentTransactionId && !t.metadata?.isAdditionalCategory
      );
      if (parentTransaction) {
        baseTransaction = parentTransaction;
      }
    }

    // Populate dynamic categories from metadata
    const additionalCategories = Array.isArray(baseTransaction.metadata?.additionalCategories)
      ? baseTransaction.metadata.additionalCategories
      : [];

    const mappedAdditionalCategories = additionalCategories.length > 0
      ? additionalCategories.map((category: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          kategori: category.category,
          jumlah: formatCurrency(String(category.amount ?? 0))
        }))
      : [];

    setDynamicCategories(mappedAdditionalCategories);

    // Set student search display if paidBy exists
    if (baseTransaction.paidBy) {
      setStudentSearch(baseTransaction.paidBy);
    }

    setSelectedTransaction(baseTransaction);
    setIsEditMode(true);
    setIsFormModalOpen(true);

    // Fetch student bills if student ID exists
    if (studentId) {
      await fetchStudentBills(studentId);
    } else {
      setDynamicCategories(mappedAdditionalCategories);
      setStudentBills([]);
      setUpdatedBills([]);
    }

    setShowStudentDropdown(false);
  };

  const openTransactionDetail = (group: GroupedTransaction, baseTransaction?: IncomeTransaction) => {
    if (!group.transactions || group.transactions.length === 0) {
      return;
    }

    const primaryTransaction = baseTransaction || group.transactions[0];
    setSelectedTransaction(primaryTransaction);
    setSelectedTransactionGroup(group.transactions);
    setSelectedGroupInfo({
      name: group.mainName,
      totalAmount: group.totalAmount
    });
    setIsModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsModalOpen(false);
    setSelectedTransactionGroup(null);
    setSelectedGroupInfo(null);
  };

  const handleDelete = async (transaction: IncomeTransaction) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const success = await deleteTransaction(parseInt(transaction.id));
        if (success) {
          toast.success('Transaksi berhasil dihapus!');
          // Refresh transactions list to show updated data
          refreshTransactions();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Gagal menghapus transaksi.');
      }
    }
  };

  // Form handlers
  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Category mapping untuk mengirim category_id yang benar  
  // Berdasarkan CategorySeeder.php di backend - UPDATE MAPPING!
  // Helper function to get category ID from dynamic kategori list
  const getCategoryId = (categoryName: string): number => {
    const kategori = kategoriPemasukanList.find(k => k.name === categoryName);
    if (kategori) {
      return parseInt(kategori.id);
    }
    console.warn(`Unknown category: ${categoryName}, using first available category`);
    return kategoriPemasukanList.length > 0 ? parseInt(kategoriPemasukanList[0].id) : 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi field required
    if (!formData.namaTransaksi.trim()) {
      toast.error('Nama transaksi harus diisi');
      return;
    }
    
    if (!formData.jumlah.trim()) {
      toast.error('Jumlah harus diisi');
      return;
    }
    
    if (!formData.tanggal) {
      toast.error('Tanggal harus diisi');
      return;
    }
    
    if (!formData.kategori) {
      toast.error('Kategori harus dipilih');
      return;
    }
    
    try {
      // Check if student is selected and has bills
      let billPaymentSuccess = false;
      if (formData.siswa && studentBills.length > 0) {
        // Try to process bill payments first
        billPaymentSuccess = await processBillPayments();
      }
      
      // If bill payment failed or not applicable, process regular transaction
      if (!billPaymentSuccess) {
        await processRegularTransaction();
      }
      
    } catch (error) {
      console.error('Error handling transaction:', error);
      toast.error('Gagal menyimpan transaksi. Silakan coba lagi.');
    }
  };

  // Fetch student bills
  const fetchStudentBills = async (studentId: string) => {
    try {
      setBillsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`https://nurverse.id/api/master-data/tagihan?student_id=${studentId}&per_page=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch student bills:', response.status);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data?.data) {
        const billsData = data.data.data.map((bill: any) => ({
          id: bill.id,
          bill_type_name: bill.bill_type?.name || 'N/A',
          amount: parseFloat(bill.total_amount) || 0,
          paid_amount: parseFloat(bill.paid_amount) || 0,
          remaining_amount: parseFloat(bill.remaining_amount) || 0,
          status: bill.status
        }));
        setStudentBills(billsData);
        setUpdatedBills(billsData); // Initialize updated bills
      } else {
        setStudentBills([]);
        setUpdatedBills([]);
      }
    } catch (error) {
      console.error('Error fetching student bills:', error);
      setStudentBills([]);
      setUpdatedBills([]);
    } finally {
      setBillsLoading(false);
    }
  };


  // Process bill payments for students
  const processBillPayments = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Sesi login telah berakhir');
      return false;
    }

    // Prepare payments data
    const payments = [];
    
    // Add main category payment
    if (formData.kategori && formData.jumlah) {
      const amount = parseFloat(formData.jumlah.replace(/[^\d]/g, '')) || 0;
      if (amount > 0) {
        // Find matching bill
        const matchingBill = studentBills.find(bill => 
          bill.bill_type_name.toLowerCase().includes(formData.kategori.toLowerCase()) ||
          formData.kategori.toLowerCase().includes(bill.bill_type_name.toLowerCase())
        );
        
        if (matchingBill) {
          payments.push({
            bill_id: matchingBill.id,
            amount: amount,
            category: formData.kategori
          });
        }
      }
    }
    
    // Add dynamic categories payments
    dynamicCategories.forEach(category => {
      if (category.kategori && category.jumlah) {
        const amount = parseFloat(category.jumlah.replace(/[^\d]/g, '')) || 0;
        if (amount > 0) {
          // Find matching bill
          const matchingBill = studentBills.find(bill => 
            bill.bill_type_name.toLowerCase().includes(category.kategori.toLowerCase()) ||
            category.kategori.toLowerCase().includes(bill.bill_type_name.toLowerCase())
          );
          
          if (matchingBill) {
            payments.push({
              bill_id: matchingBill.id,
              amount: amount,
              category: category.kategori
            });
          }
        }
      }
    });

    if (payments.length === 0) {
      console.log('No matching bills found, falling back to regular transaction');
      return false;
    }

    // Prepare transaction data
    const transactionData = {
      description: formData.namaTransaksi,
      transaction_date: formData.tanggal,
      payment_method: formData.metodePembayaran,
      reference_number: `${formData.kategori.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Date.now()).slice(-3)}`,
      processed_by: 1, // Default user ID - should be actual user ID
      created_by: 1
    };

    // Process each payment individually using Laravel API
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const payment of payments) {
        try {
          const response = await fetch('https://nurverse.id/api/pembayaran.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              student_bill_id: payment.bill_id,
              amount: payment.amount,
              payment_date: transactionData.transaction_date,
              payment_method: transactionData.payment_method,
              reference_number: transactionData.reference_number,
              is_installment: true,
              notes: `Pembayaran ${payment.category} - ${transactionData.description}`
            })
          });

          const data = await response.json();
          
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Error processing payment for ${payment.category}:`, data.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing payment for ${payment.category}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} pembayaran berhasil diproses!`);
        setIsFormModalOpen(false);
        // Refresh transactions list
        refreshTransactions();
        return true;
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} pembayaran gagal diproses`);
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing bill payments:', error);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
      return false;
    }
  };

  // Process regular TU transaction (no student bills)
  const processRegularTransaction = async () => {
      const receiptPrefix = formData.kategori.substring(0, 3).toUpperCase();
      const receiptNumber = `${receiptPrefix}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(incomeTransactions.length + 1).padStart(3, '0')}`;
      
      const additionalCategories = dynamicCategories
        .map(category => {
          const amount = parseInt(category.jumlah.replace(/\D/g, '')) || 0;
          return category.kategori && amount > 0
            ? { category: category.kategori, amount }
            : null;
        })
        .filter(Boolean);

      const transactionData = {
        title: formData.namaTransaksi,
        description: formData.namaTransaksi,
        amount: parseInt(formData.jumlah.replace(/\D/g, '')) || 0,
        category_id: getCategoryId(formData.kategori),
        transaction_date: formData.tanggal,
        receipt_file: formData.buktiTransaksi || undefined,
        metadata: {
          paidBy: formData.dibayarOleh,
          paymentMethod: formData.metodePembayaran,
          receiptNumber: receiptNumber,
          student: formData.siswa,
          ...(additionalCategories.length > 0 ? { additionalCategories } : {})
        }
      };

      console.log('Creating main transaction:', transactionData);
      
      if (isEditMode && selectedTransaction) {
        // Update existing transaction
        const success = await updateTransaction(parseInt(selectedTransaction.id), transactionData);
        if (success) {
          toast.success('Transaksi berhasil diupdate!');
          setIsFormModalOpen(false);
          setIsEditMode(false);
          setSelectedTransaction(null);
          resetForm();
          refreshTransactions();
        }
      } else {
        // Create new transaction
        const success = await createTransaction(transactionData);
        if (success) {
          toast.success('Transaksi berhasil ditambahkan!');
          setIsFormModalOpen(false);
          resetForm();
          refreshTransactions();
        }
    }
  };

  // Reset form after successful submission
  const resetForm = () => {
      setFormData({
        namaTransaksi: '',
        jumlah: '',
        dibayarOleh: '',
        siswa: '',
        unitSekolah: '',
        tanggal: new Date().toISOString().split('T')[0],
      status: 'pending' as 'pending' | 'approved' | 'completed',
      kategori: '' as IncomeTransaction['category'],
      metodePembayaran: 'cash' as string,
      buktiTransaksi: null as File | null
      });
      setDynamicCategories([]);
    setStudentBills([]);
    setUpdatedBills([]);
      setStudentSearch('');
      setShowStudentDropdown(false);
  };


  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setFormData(prev => ({
      ...prev,
      siswa: student.id,
      unitSekolah: student.unitSekolah || '',
      dibayarOleh: `${student.namaLengkap} (${student.unitKelas})`
    }));
    setStudentSearch(`${student.namaLengkap} - ${student.unitKelas}`);
    setShowStudentDropdown(false);
    
    // Fetch student bills when student is selected
    fetchStudentBills(student.id);
  };

  // Dynamic categories functions
  const addDynamicCategory = () => {
    const defaultKategori = kategoriPemasukanList.length > 0 ? kategoriPemasukanList[0].name : '';
    const newCategory = {
      id: Date.now().toString(),
      kategori: defaultKategori as IncomeTransaction['category'],
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

  // Handle print kwitansi
  const handlePrintKwitansi = () => {
    const targetTransactions = selectedTransactionGroup && selectedTransactionGroup.length > 0
      ? selectedTransactionGroup
      : selectedTransaction
        ? [selectedTransaction]
        : [];

    if (targetTransactions.length === 0) {
      toast.error('Tidak ada transaksi untuk dicetak');
      return;
    }

    setShowPrintPreview(true);
  };

  const handleActualPrint = () => {
    if (!printRef.current) return;
    
    // Get all styles from the document
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup diblokir. Izinkan popup untuk melakukan print.');
      return;
    }
    
    // Get content and fix logo path for print
    let printContent = printRef.current.innerHTML;
    // Replace relative logo path with absolute URL
    printContent = printContent.replace(
      /src="\/logo-annur\.png"/g,
      'src="https://nurverse.id/logo-annur.png"'
    );
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kwitansi - ${selectedTransaction?.receiptNumber || ''}</title>
          <meta charset="utf-8">
          <style>
            ${styles}
            @page {
              margin: 0.5cm;
              size: A4 landscape;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after print dialog closes
      printWindow.addEventListener('afterprint', () => {
        printWindow.close();
      });
    }, 250);
  };

  const transactionsForDetail = selectedTransactionGroup && selectedTransactionGroup.length > 0
    ? selectedTransactionGroup
    : selectedTransaction
      ? [selectedTransaction]
      : [];
  const detailBaseTransaction = transactionsForDetail[0] || null;
  const detailTotalAmount = transactionsForDetail.reduce((sum, trx) => {
    const amount = typeof trx.amount === 'number' && !isNaN(trx.amount) ? trx.amount : 0;
    return sum + amount;
  }, 0);
  const uniqueCategories = Array.from(new Set(transactionsForDetail.map(trx => trx.category).filter(Boolean)));
  const combinedCategoryLabel = uniqueCategories.length > 1 ? 'Beberapa Kategori' : (uniqueCategories[0] || '-');
  const uniqueMethods = Array.from(new Set(transactionsForDetail.map(trx => trx.paymentMethod).filter(Boolean)));
  const detailPaymentMethodLabel = uniqueMethods.length === 1
    ? getPaymentMethodBadge(uniqueMethods[0]).label
    : uniqueMethods.length > 1
      ? 'Beragam'
      : getPaymentMethodBadge('').label;
  const detailReceiptNumber = detailBaseTransaction?.receiptNumber || '-';
  const detailBaseDescription = detailBaseTransaction?.description?.split(' - ')[0]
    || selectedGroupInfo?.name?.split(' - ')[0]
    || detailBaseTransaction?.description
    || '-';
  const detailPaidBy = detailBaseTransaction?.paidBy
    || selectedGroupInfo?.name?.split(' - ')[1]?.trim()
    || '-';
  const detailDate = detailBaseTransaction?.date || '';
  const detailCreatedBy = detailBaseTransaction?.createdBy || '-';
  const detailApprovedBy = detailBaseTransaction?.approvedBy || '-';
  const detailTanggalDisplay = detailDate ? new Date(detailDate).toLocaleDateString('id-ID') : '-';
  const hasMultipleTransactions = transactionsForDetail.length > 1;

  return (
    <TULayout>
      <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pemasukan</h1>
          <p className="text-slate-600 mt-1">Kelola dan monitoring semua transaksi pemasukan sekolah</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="2024-12">Desember 2024</option>
            <option value="2024-11">November 2024</option>
            <option value="2024-10">Oktober 2024</option>
          </select>
          <Button 
            variant="outline" 
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            onClick={() => setIsFormModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Pemasukan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`p-4 rounded-xl border ${stat.bgColor} ${stat.borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <span className={`text-xs font-semibold ${stat.textColor}`}>{stat.change}</span>
              </div>
              <h3 className="text-xs font-medium text-slate-600 uppercase tracking-wide">{stat.title}</h3>
              <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        {/* Category Filters - Scrollable Tabs */}
        <div className="mb-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.key
                      ? 'bg-emerald-500 text-white shadow-lg scale-105'
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-slate-800">Daftar Transaksi Pemasukan</h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <FunnelIcon className="w-4 h-4 text-slate-600" />
            </button>
            <Button variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-sm px-3 py-2">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat data transaksi...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="bg-white rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <div className="grid grid-cols-11 gap-4 font-semibold text-slate-700 text-sm">
                <div className="col-span-4">TRANSAKSI</div>
                <div className="col-span-2">JUMLAH</div>
                <div className="col-span-2">DIBAYAR OLEH</div>
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
                        <span className="font-bold text-emerald-600 text-lg">
                          {formatCurrencyIDR(group.totalAmount)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-slate-800">{group.transactions[0].paidBy || '-'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {(() => {
                            const badge = getPaymentMethodBadge(group.transactions[0].paymentMethod);
                            return (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
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
                              openTransactionDetail(group);
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
                            className="p-1 hover:bg-emerald-100 text-emerald-600 rounded transition-colors"
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
                                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                    {transaction.category}
                                  </span>
                                  <p className="text-xs text-slate-500 mt-1">{transaction.receiptNumber}</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="font-semibold text-emerald-600">
                                {formatCurrencyIDR(transaction.amount)}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-slate-600">{transaction.paidBy || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="col-span-1">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    openTransactionDetail(group, transaction);
                                  }}
                                  className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                  title="Lihat detail"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(transaction)}
                                  className="p-1 hover:bg-emerald-100 text-emerald-600 rounded transition-colors"
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
            <p className="text-slate-600 mb-4">Belum ada data transaksi pemasukan yang sesuai dengan filter.</p>
            <Button
              onClick={() => setIsFormModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Tambah Transaksi Pertama
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white rounded-lg p-4 mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari {pagination.total} transaksi
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || isLoading}
                className="px-3 py-2 text-sm"
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === pagination.currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "primary" : "outline"}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                    className="px-3 py-2 text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => setPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.lastPage || isLoading}
                className="px-3 py-2 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseDetailModal}
        title="Detail Transaksi Pemasukan"
        size="lg"
      >
        {transactionsForDetail.length > 0 && detailBaseTransaction && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-bold text-slate-800 mb-3">Informasi Transaksi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nomor Kwitansi</label>
                  <p className="text-slate-900 font-mono">{detailReceiptNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Kategori</label>
                  <p className="text-slate-900">{combinedCategoryLabel}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Deskripsi</label>
              <p className="text-slate-900">{detailBaseDescription}</p>
              {hasMultipleTransactions && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  Kwitansi ini mencakup {transactionsForDetail.length} item pembayaran.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Jumlah</label>
                <p className="text-slate-900 font-bold text-2xl text-emerald-600">
                  {formatCurrencyIDR(detailTotalAmount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Metode Pembayaran</label>
                <p className="text-slate-900">
                  {detailPaymentMethodLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Dibayar Oleh</label>
                <p className="text-slate-900">{detailPaidBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tanggal</label>
                <p className="text-slate-900">{detailTanggalDisplay}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Dibuat Oleh</label>
                <p className="text-slate-900">{detailCreatedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Disetujui Oleh</label>
                <p className="text-slate-900">{detailApprovedBy || '-'}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Rincian Pembayaran</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 w-12">No</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Deskripsi</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 w-48">Kategori</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 w-48">Nomor Referensi</th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600 w-40">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactionsForDetail.map((trx, index) => (
                      <tr key={trx.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center text-slate-700">{index + 1}</td>
                        <td className="px-3 py-2 text-slate-800">
                          <div className="font-medium">{trx.description}</div>
                          {trx.metadata?.notes && (
                            <div className="text-xs text-slate-500 mt-1 italic">
                              {trx.metadata.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700">{trx.category}</td>
                        <td className="px-3 py-2 text-slate-600 font-mono">{trx.receiptNumber}</td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-600">
                          {formatCurrencyIDR(trx.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100">
                      <td colSpan={4} className="px-3 py-2 text-right font-semibold text-slate-700">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600">
                        {formatCurrencyIDR(detailTotalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bukti Transfer */}
            {detailBaseTransaction.receiptFile && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Bukti Transfer</label>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DocumentArrowDownIcon className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {detailBaseTransaction.receiptFile.split('/').pop()}
                        </p>
                        <p className="text-xs text-slate-500">Bukti pembayaran</p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.PROD ? 'https://nurverse.id/api' : 'http://localhost:8000/api'}/storage/${detailBaseTransaction.receiptFile}`}
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
              <Button variant="outline" onClick={handleCloseDetailModal}>
                Tutup
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={handlePrintKwitansi}
              >
                <PrinterIcon className="w-4 h-4" />
                Print Kwitansi
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          resetForm();
          setIsFormModalOpen(false);
          setIsEditMode(false);
          setSelectedTransaction(null);
          setSelectedTransactionGroup(null);
          setSelectedGroupInfo(null);
        }}
        title={isEditMode ? "Edit Transaksi Pemasukan" : "Tambah Transaksi Pemasukan"}
        size="xl"
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-1 space-y-6 pb-4">
            
            {/* Section 1: Informasi Dasar */}
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Informasi Dasar
              </h4>
              
              <div className="space-y-4">
                {/* Pilih Siswa */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Pilih Siswa
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setShowStudentDropdown(true);
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      placeholder="Cari nama siswa, NIS, atau kelas..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    />
                    
                    {/* Student Dropdown */}
                    {showStudentDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto backdrop-blur-sm">
                        {studentsLoading ? (
                          <div className="px-4 py-3 text-slate-500 text-center text-sm">
                            Memuat data siswa...
                          </div>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => handleStudentSelect(student)}
                              className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-slate-100 last:border-b-0 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">{student.namaLengkap}</p>
                                  <p className="text-xs text-slate-500">NISN: {student.nisn}</p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                  {student.unitKelas}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-slate-500 text-center text-sm">
                            {students.length === 0 ? 'Belum ada data siswa' : 'Tidak ada siswa ditemukan'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Sekolah */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Unit Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.unitSekolah}
                    onChange={(e) => handleInputChange('unitSekolah', e.target.value)}
                    placeholder="Unit sekolah akan terisi otomatis saat memilih siswa"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    readOnly
                  />
                </div>

                {/* Nama Transaksi */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.namaTransaksi}
                    onChange={(e) => handleInputChange('namaTransaksi', e.target.value)}
                    placeholder="Masukkan nama/deskripsi transaksi"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                {/* Kategori & Jumlah */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Kategori Pemasukan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => handleInputChange('kategori', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                      required
                      disabled={kategoriLoading}
                    >
                      {kategoriLoading ? (
                        <option value="">Memuat kategori...</option>
                      ) : (
                        <>
                          <option value="">Pilih Kategori Pemasukan</option>
                          {kategoriPemasukanList.map((kategori) => (
                            <option key={kategori.id} value={kategori.name}>
                              {kategori.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

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
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
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
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Tambah Kategori Pemasukan
                  </button>
                </div>

                {/* Dynamic Categories */}
                {dynamicCategories.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t border-emerald-200 pt-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Kategori Tambahan
                      </h5>
                      {dynamicCategories.map((category, index) => (
                        <div key={category.id} className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-emerald-100 shadow-sm">
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
                                Kategori Pemasukan
                              </label>
                              <select
                                value={category.kategori}
                                onChange={(e) => updateDynamicCategory(category.id, 'kategori', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
                                disabled={kategoriLoading}
                              >
                                {kategoriLoading ? (
                                  <option value="">Memuat...</option>
                                ) : (
                                  <>
                                    <option value="">Pilih Kategori</option>
                                    {kategoriPemasukanList.map((kategori) => (
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
                                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
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

            {/* Section 2: Data Tagihan Siswa */}
            {formData.siswa && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100/50">
                <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Data Tagihan Siswa
                </h4>
                
                {billsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-slate-600">Memuat data tagihan...</span>
                  </div>
                ) : updatedBills.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-sm border border-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" style={{textAlign: 'left'}}>
                            Jenis Tagihan
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" style={{textAlign: 'right'}}>
                            Jumlah Tagihan
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" style={{textAlign: 'right'}}>
                            Terbayar
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" style={{textAlign: 'right'}}>
                            Sisa
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200" style={{textAlign: 'center'}}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {updatedBills.map((bill) => {
                          const originalBill = studentBills.find(orig => orig.id === bill.id);
                          const isUpdated = originalBill && (
                            originalBill.paid_amount !== bill.paid_amount ||
                            originalBill.remaining_amount !== bill.remaining_amount ||
                            originalBill.status !== bill.status
                          );
                          
                          return (
                            <tr key={bill.id} className={`hover:bg-slate-50 transition-colors ${isUpdated ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900" style={{textAlign: 'left'}}>
                                {bill.bill_type_name}
                                {isUpdated && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Akan Diupdate
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 font-medium" style={{textAlign: 'right'}}>
                                {formatCurrencyIDR(bill.amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-green-600 font-medium" style={{textAlign: 'right'}}>
                                {formatCurrencyIDR(bill.paid_amount)}
                                {isUpdated && originalBill && (
                                  <div className="text-xs text-blue-600">
                                    +{formatCurrencyIDR(bill.paid_amount - originalBill.paid_amount)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-red-600 font-medium" style={{textAlign: 'right'}}>
                                {formatCurrencyIDR(bill.remaining_amount)}
                                {isUpdated && originalBill && (
                                  <div className="text-xs text-blue-600">
                                    -{formatCurrencyIDR(originalBill.remaining_amount - bill.remaining_amount)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3" style={{textAlign: 'center'}}>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  bill.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : bill.status === 'partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {bill.status === 'paid' ? 'Lunas' : 
                                   bill.status === 'partial' ? 'Cicilan' : 'Belum Bayar'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-medium">Tidak ada tagihan untuk siswa ini</p>
                    <p className="text-slate-500 text-sm mt-1">Semua tagihan sudah lunas atau belum ada tagihan yang dibuat</p>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Detail Pembayaran */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                Detail Pembayaran
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Dibayar Oleh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.dibayarOleh}
                    onChange={(e) => handleInputChange('dibayarOleh', e.target.value)}
                    placeholder="Nama pembayar"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.metodePembayaran}
                    onChange={(e) => handleInputChange('metodePembayaran', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Pilih metode pembayaran</option>
                    <option value="cash">Tunai</option>
                    <option value="card">Kartu</option>
                    {bankOptions.map((bank) => (
                      <option
                        key={bank.id}
                        value={`${bank.namaBank} - ${bank.nomorRekening}`}
                      >
                        {bank.namaBank} - {bank.nomorRekening}
                      </option>
                    ))}
                    {['transfer', 'card'].includes(formData.metodePembayaran) && (
                      <option value={formData.metodePembayaran}>
                        {formData.metodePembayaran === 'transfer'
                          ? 'Transfer Bank (Legacy)'
                          : 'Kartu (Legacy)'}
                      </option>
                    )}
                  </select>
                  {bankLoading && (
                    <p className="text-xs text-slate-500 mt-2">Memuat daftar bank...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Upload Bukti */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100/50">
              <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Bukti Transaksi
              </h4>
              
              <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 hover:border-orange-400 transition-all duration-200 bg-white/50 backdrop-blur-sm">
                {formData.buktiTransaksi ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                        <DocumentArrowDownIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">
                          {formData.buktiTransaksi.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(formData.buktiTransaksi.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={(e) => handleInputChange('buktiTransaksi', e.target.files?.[0] || null)}
                        accept="image/*,.pdf"
                        className="hidden"
                        id="bukti-upload-replace"
                      />
                      <label
                        htmlFor="bukti-upload-replace"
                        className="cursor-pointer px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Ganti File
                      </label>
                      <button
                        type="button"
                        onClick={() => handleInputChange('buktiTransaksi', null)}
                        className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        title="Hapus file"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      onChange={(e) => handleInputChange('buktiTransaksi', e.target.files?.[0] || null)}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="bukti-upload"
                    />
                    <label
                      htmlFor="bukti-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center shadow-sm">
                        <DocumentArrowDownIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">
                          Klik untuk upload file
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Maksimal 5MB - Format: JPG, PNG, PDF
                        </p>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Total Summary */}
            {(formData.jumlah || dynamicCategories.some(cat => cat.jumlah)) && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <h4 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  Ringkasan Total
                </h4>
                
                <div className="space-y-3">
                  {/* Main category */}
                  {formData.jumlah && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {formData.kategori}: {formData.namaTransaksi || 'Transaksi Utama'}
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
                  <div className="border-t border-emerald-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-800">
                        Total Keseluruhan
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        {(() => {
                          const mainAmount = parseInt(formData.jumlah.replace(/\D/g, '')) || 0;
                          const additionalAmount = dynamicCategories.reduce((sum, cat) => {
                            return sum + (parseInt(cat.jumlah.replace(/\D/g, '')) || 0);
                          }, 0);
                          return formatCurrencyIDR(mainAmount + additionalAmount);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : (isEditMode ? 'Update Transaksi' : 'Simpan Transaksi')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Print Preview Modal */}
      <Modal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        title="Preview Kwitansi"
        size="xl"
      >
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="bg-white p-4 rounded-lg mb-4 shadow-sm flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Preview Kwitansi</h2>
            <div className="flex gap-2">
              <button
                onClick={handleActualPrint}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-semibold text-sm"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
          
          {/* Template Preview - Scaled down */}
          <div className="flex-1 bg-gray-50 rounded-lg shadow-lg overflow-auto p-4 flex items-start justify-center">
            <div className="preview-scale-75 w-full max-w-4xl">
              {(() => {
                const transactionsForPrint = selectedTransactionGroup && selectedTransactionGroup.length > 0
                  ? selectedTransactionGroup
                  : selectedTransaction
                    ? [selectedTransaction]
                    : [];

                if (transactionsForPrint.length === 0) {
                  return (
                    <div className="text-center text-slate-500 py-12">
                      Tidak ada data transaksi untuk dicetak.
                    </div>
                  );
                }

                const baseTransactionForPrint = selectedTransaction || transactionsForPrint[0];
                const totalPrintAmount = transactionsForPrint.reduce((sum, trx) => {
                  const amount = typeof trx.amount === 'number' && !isNaN(trx.amount) ? trx.amount : 0;
                  return sum + amount;
                }, 0);
                const uniqueCategoriesForPrint = Array.from(new Set(transactionsForPrint.map(trx => trx.category).filter(Boolean)));
                const printKategoriLabel = uniqueCategoriesForPrint.length > 1
                  ? 'Beberapa Kategori'
                  : (uniqueCategoriesForPrint[0] || baseTransactionForPrint?.category || '-');
                const uniqueMethodsForPrint = Array.from(new Set(transactionsForPrint.map(trx => trx.paymentMethod).filter(Boolean)));
                const metodePembayaranValue = uniqueMethodsForPrint.length === 1
                  ? uniqueMethodsForPrint[0]
                  : uniqueMethodsForPrint.length > 1
                    ? 'Beragam'
                    : '';
                const metodePembayaranLabel = metodePembayaranValue === 'Beragam'
                  ? 'Beragam'
                  : getPaymentMethodBadge(metodePembayaranValue || '').label;
                const printItems = transactionsForPrint.map((trx) => ({
                  namaItem: trx.description,
                  kategori: trx.category,
                  jumlah: trx.amount,
                  nomorReferensi: trx.receiptNumber
                }));
                const baseDescription = baseTransactionForPrint?.description?.split(' - ')[0]
                  || selectedGroupInfo?.name?.split(' - ')[0]
                  || 'Pembayaran';
                const diterimaDariLabel = baseTransactionForPrint?.paidBy
                  || selectedGroupInfo?.name?.split(' - ')[1]?.trim()
                  || '-';
                const nomorKwitansi = baseTransactionForPrint?.receiptNumber || transactionsForPrint[0]?.receiptNumber || '-';
                const tanggalKwitansi = baseTransactionForPrint?.date || new Date().toISOString();

                return (
                  <KwitansiTemplate
                    ref={printRef}
                    data={{
                      nomorKwitansi: nomorKwitansi,
                      tanggal: tanggalKwitansi,
                      diterimaDari: diterimaDariLabel,
                      jumlah: totalPrintAmount,
                      untukPembayaran: baseDescription,
                      dibayarOleh: diterimaDariLabel,
                      kategori: printKategoriLabel,
                      metodePembayaran: metodePembayaranLabel,
                      dibuatOleh: baseTransactionForPrint?.createdBy,
                      disetujuiOleh: baseTransactionForPrint?.approvedBy,
                      items: printItems
                    }}
                    showWatermark={true}
                  />
                );
              })()}
            </div>
          </div>
          <style>{`
            .preview-scale-75 {
              transform: scale(0.75);
              transform-origin: top center;
            }
            @media print {
              .preview-scale-75 {
                transform: none;
              }
            }
          `}</style>
        </div>
      </Modal>
      </div>
    </TULayout>
  );
};

export default Pemasukan;
