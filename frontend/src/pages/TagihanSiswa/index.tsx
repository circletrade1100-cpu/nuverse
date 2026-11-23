import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CreditCard,
  Calendar,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import CreateBillModal from '../../components/TagihanSiswa/CreateBillModal';
import PaymentModal from '../../components/TagihanSiswa/PaymentModal';
import BillDetailModal from '../../components/TagihanSiswa/BillDetailModal';
import BulkCreateModal from '../../components/TagihanSiswa/BulkCreateModal';
import { studentService } from '../../services/studentService';
import { unitSekolahService } from '../../services/unitSekolahService';
import type { Student } from '../../types/student';
import type { UnitSekolah } from '../../types/masterData';

// Types
interface BillType {
  id: string;
  name: string;
  description: string;
  default_amount: number;
  is_active: boolean;
}

interface StudentBill {
  id: string;
  student_id: string;
  bill_type_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  period_month?: number;
  period_year?: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  allow_installment: boolean;
  notes?: string;
  student?: {
    id: string;
    nama_lengkap: string;
    nisn?: string;
    unit_kelas?: string;
    unit_sekolah?: string;
  };
  bill_type?: BillType;
  payments?: any[];
  created_at: string;
  updated_at: string;
}

// interface Payment {
//   id: string;
//   student_bill_id: string;
//   amount: number;
//   payment_date: string;
//   payment_method: 'cash' | 'transfer' | 'qris' | 'credit_card';
//   reference_number?: string;
//   is_installment: boolean;
//   installment_number: number;
//   notes?: string;
//   processed_by: string;
//   processed_by_user?: {
//     name: string;
//   };
//   created_at: string;
// }

const TagihanSiswaPage: React.FC = () => {
  const [bills, setBills] = useState<StudentBill[]>([]);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [unitSekolahList, setUnitSekolahList] = useState<UnitSekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<StudentBill | null>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  // const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);

  // Metadata & sumber dropdown (data tagihan lewat effect filter di bawah)
  useEffect(() => {
    fetchBillTypes();
    fetchStudents();
    fetchUnitSekolah();
  }, []);

  const fetchBillsRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(async () => {});

  const fetchBills = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Sesi login telah berakhir, silakan login kembali');
        return;
      }

      // Fetch all bills without pagination for grouping
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (billTypeFilter) params.append('bill_type_id', billTypeFilter);
      if (unitFilter) params.append('unit_sekolah', unitFilter);
      params.append('per_page', '1000'); // Get all data
      params.append('sort_by', 'created_at'); // Sort by creation date
      params.append('sort_order', 'desc'); // Newest first

      const response = await fetch(`https://nurverse.id/api/master-data/tagihan?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch bills:', response.status, response.statusText);
        toast.error('Gagal mengambil data tagihan');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        const billsData = data.data.data || [];
        console.log('📅 Sample bill data for due_date:', billsData.slice(0, 3).map((bill: StudentBill) => ({
          id: bill.id,
          student: bill.student?.nama_lengkap,
          due_date: bill.due_date,
          due_date_type: typeof bill.due_date,
          due_date_keys: typeof bill.due_date === 'object' ? Object.keys(bill.due_date) : 'N/A',
          formatted_date: formatDate(bill.due_date)
        })));
        
        // Debug pagination
        console.log('📊 Pagination debug:', {
          totalBills: billsData.length,
          perPage,
          currentPage,
          totalGroupedStudents: Object.keys(billsData.reduce((acc: any, bill: StudentBill) => {
            acc[bill.student_id] = true;
            return acc;
          }, {})).length
        });
        
        // Debug MUHAMMAD SALMAN AN NAFI
        const salmanBills = billsData.filter((bill: StudentBill) => 
          bill.student?.nama_lengkap?.includes('MUHAMMAD SALMAN AN NAFI')
        );
        console.log('👤 MUHAMMAD SALMAN AN NAFI bills:', salmanBills);
        setBills(billsData);
      } else {
        toast.error('Gagal mengambil data tagihan');
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Terjadi kesalahan saat mengambil data');
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  fetchBillsRef.current = fetchBills;

  // Auto-refresh ringan setiap 30 detik — selalu pakai fetchBills terbaru (filter/pencarian)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBillsRef.current({ silent: true });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBillTypes = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('https://nurverse.id/api/master-data/tagihan/bill-types', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch bill types:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setBillTypes(data.data || []);
      } else {
        console.error('API returned error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching bill types:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      // Try to get students from studentService first
      const response = await studentService.getAll({ per_page: 1000 }); // Increased to get all students
      setStudents(response.students);
      console.log('✅ Students loaded from studentService:', response.students.length);
      console.log('📋 First few students:', response.students.slice(0, 5));
    } catch (error) {
      console.error('❌ Error fetching students from studentService:', error);
      
      // Fallback: Get students from bills data
      try {
        console.log('🔄 Trying fallback: getting students from bills...');
        const token = localStorage.getItem('auth_token');
        const billsResponse = await fetch('https://nurverse.id/api/master-data/tagihan?per_page=1000', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (billsResponse.ok) {
          const billsData = await billsResponse.json();
          
          if (billsData.success && billsData.data && Array.isArray(billsData.data)) {
            // Extract unique students from bills
            const studentMap = new Map();
            billsData.data.forEach((bill: any) => {
              if (bill.student && bill.student.id) {
                studentMap.set(bill.student.id, {
                  id: bill.student.id,
                  nama_lengkap: bill.student.nama_lengkap || '',
                  unit_kelas: bill.student.unit_kelas || '',
                  unit_sekolah: bill.student.unit_sekolah || '',
                  status: bill.student.status || 'active'
                });
              }
            });
            
            const uniqueStudents = Array.from(studentMap.values());
            setStudents(uniqueStudents);
            console.log('✅ Students loaded from bills fallback:', uniqueStudents.length);
          } else {
            console.log('⚠️ No bills data available');
            setStudents([]);
          }
        } else {
          console.log('⚠️ Bills API also failed');
          setStudents([]);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setStudents([]);
      }
    }
  };

  const fetchUnitSekolah = async () => {
    try {
      const units = await unitSekolahService.getAllForDropdown();
      setUnitSekolahList(units);
    } catch (error) {
      console.error('Error fetching unit sekolah:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchBills();
  }, [searchTerm, statusFilter, billTypeFilter, unitFilter, classFilter]);

  // Refresh students data when modal opens
  useEffect(() => {
    if (showCreateModal || showBulkCreateModal || showEditModal) {
      fetchStudents();
    }
  }, [showCreateModal, showBulkCreateModal, showEditModal]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateBill = async (billData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Sesi login telah berakhir, silakan login kembali');
        return;
      }

      // Determine endpoint based on data structure
      let endpoint = '/api/master-data/tagihan';
      let requestData = billData;
      
      // If bill_items exists (even with 1 item), use create-multiple endpoint
      if (billData.bill_items && Array.isArray(billData.bill_items) && billData.bill_items.length > 0) {
        endpoint = '/api/master-data/tagihan/create-multiple';
      } else if (billData.bill_type_id && billData.total_amount) {
        // Single bill format - use regular store endpoint
        endpoint = '/api/master-data/tagihan';
      }

      const response = await fetch(`https://nurverse.id${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create bill:', response.status, response.statusText, errorData);
        toast.error(errorData.message || 'Gagal membuat tagihan');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        // SweetAlert success notification
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Tagihan berhasil dibuat',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        setShowCreateModal(false);
        fetchBills({ silent: true });
      } else {
        toast.error(data.message || 'Gagal membuat tagihan');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Terjadi kesalahan saat membuat tagihan');
    }
  };

  const handleBulkCreate = async (bulkData: any) => {
    // Prevent double submit
    if (isSubmittingBulk) {
      console.warn('⚠️ Bulk create already in progress, ignoring duplicate request');
      return;
    }

    try {
      setIsSubmittingBulk(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Sesi login telah berakhir, silakan login kembali');
        return;
      }

      console.log('📤 Sending bulk create request:', {
        student_ids: bulkData.student_ids?.length,
        bill_items: bulkData.bill_items?.length,
        data: bulkData
      });

      const response = await fetch('https://nurverse.id/api/master-data/tagihan/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to create bulk bills:', response.status, response.statusText, errorData);
        toast.error(errorData.message || 'Gagal membuat tagihan bulk');
        return;
      }

      const data = await response.json();
      console.log('✅ Bulk create response:', data);

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: data.message,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        setShowBulkCreateModal(false);
        // Wait a bit before fetching to ensure data is saved
        setTimeout(() => {
          fetchBills({ silent: true });
        }, 500);
      } else {
        toast.error(data.message || 'Gagal membuat tagihan bulk');
      }
    } catch (error) {
      console.error('❌ Error creating bulk bills:', error);
      toast.error('Terjadi kesalahan saat membuat tagihan bulk');
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleProcessPayment = async (paymentData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Sesi login telah berakhir, silakan login kembali');
        return;
      }

      const response = await fetch('/api/master-data/pembayaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        console.error('Failed to process payment:', response.status, response.statusText);
        toast.error('Gagal memproses pembayaran');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Pembayaran berhasil diproses');
        setShowPaymentModal(false);
        setSelectedBill(null);
        fetchBills({ silent: true });
      } else {
        toast.error(data.message || 'Gagal memproses pembayaran');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    }
  };

  const handleEditBill = async (bill: StudentBill) => {
    await fetchStudents(); // Refresh students before opening edit modal
    setSelectedBill(bill);
    setShowEditModal(true);
  };

  const handleViewDetail = (bill: StudentBill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  const handleUpdateBill = async (billData: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Sesi login telah berakhir, silakan login kembali');
        return;
      }

      const response = await fetch(`https://nurverse.id/api/master-data/tagihan/${selectedBill?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        console.error('Failed to update bill:', response.status, response.statusText);
        toast.error('Gagal memperbarui tagihan');
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Tagihan berhasil diperbarui',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3B82F6',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        setShowEditModal(false);
        setSelectedBill(null);
        fetchBills({ silent: true });
      } else {
        toast.error(data.message || 'Gagal memperbarui tagihan');
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Terjadi kesalahan saat memperbarui tagihan');
    }
  };

  const handleDeleteBill = async (bill: StudentBill) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus tagihan ${bill.bill_type?.name} untuk ${bill.student?.nama_lengkap}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Sesi login telah berakhir, silakan login kembali');
          return;
        }

        const response = await fetch(`https://nurverse.id/api/master-data/tagihan/${bill.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Failed to delete bill:', response.status, response.statusText);
          toast.error('Gagal menghapus tagihan');
          return;
        }

        const data = await response.json();
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Tagihan berhasil dihapus',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          
          fetchBills({ silent: true });
        } else {
          toast.error(data.message || 'Gagal menghapus tagihan');
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
        toast.error('Terjadi kesalahan saat menghapus tagihan');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Belum Bayar' },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Cicilan' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Lunas' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Jatuh Tempo' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN or invalid numbers
    if (isNaN(amount) || amount === null || amount === undefined) {
      return 'Rp 0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateInput: any) => {
    if (!dateInput) return '-';
    
    try {
      // Handle different date formats from API
      let dateString = dateInput;
      
      // If it's an object with date property (Laravel Carbon)
      if (typeof dateInput === 'object' && dateInput.date) {
        dateString = dateInput.date;
      }
      // If it's already a string
      else if (typeof dateInput === 'string') {
        dateString = dateInput;
      }
      // If it's a Date object
      else if (dateInput instanceof Date) {
        dateString = dateInput.toISOString();
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateInput);
        return '-';
      }
      
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return '-';
    }
  };

  // Group bills by student
  const groupedBills = bills.reduce((acc, bill) => {
    const studentId = bill.student_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: bill.student,
        bills: [],
        totalAmount: 0,
        totalPaid: 0,
        totalRemaining: 0
      };
    }
    acc[studentId].bills.push(bill);
    
    // Ensure values are numbers, not strings
    const totalAmount = typeof bill.total_amount === 'string' ? parseFloat(bill.total_amount) : bill.total_amount;
    const paidAmount = typeof bill.paid_amount === 'string' ? parseFloat(bill.paid_amount) : bill.paid_amount;
    const remainingAmount = typeof bill.remaining_amount === 'string' ? parseFloat(bill.remaining_amount) : bill.remaining_amount;
    
    // Debug log for problematic values
    if (isNaN(totalAmount) || isNaN(paidAmount) || isNaN(remainingAmount)) {
      console.log('🔍 Debug bill data:', {
        id: bill.id,
        student: (bill.student as any)?.nama_lengkap || (bill.student as any)?.namaLengkap,
        total_amount: bill.total_amount,
        paid_amount: bill.paid_amount,
        remaining_amount: bill.remaining_amount,
        due_date: bill.due_date,
        totalAmount,
        paidAmount,
        remainingAmount
      });
    }
    
    acc[studentId].totalAmount += totalAmount || 0;
    acc[studentId].totalPaid += paidAmount || 0;
    acc[studentId].totalRemaining += remainingAmount || 0;
    return acc;
  }, {} as Record<string, {
    student: any;
    bills: StudentBill[];
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
  }>);

  // Filter grouped bills by unit sekolah and class
  let filteredGroupedBills = groupedBills;
  
  // Apply unit sekolah filter first
  if (unitFilter) {
    filteredGroupedBills = Object.entries(filteredGroupedBills).reduce((acc, [studentId, group]) => {
      const studentUnitSekolah = (group.student?.unit_sekolah || group.student?.unitSekolah || '').toUpperCase().trim();
      const filterUnit = unitFilter.toUpperCase().trim();
      if (studentUnitSekolah === filterUnit || studentUnitSekolah.startsWith(filterUnit)) {
        acc[studentId] = group;
      }
      return acc;
    }, {} as typeof groupedBills);
  }
  
  // Then apply class filter if set
  if (classFilter) {
    filteredGroupedBills = Object.entries(filteredGroupedBills).reduce((acc, [studentId, group]) => {
      const studentUnitKelas = (group.student?.unit_kelas || group.student?.unitKelas || '').trim();
      if (studentUnitKelas === classFilter) {
        acc[studentId] = group;
      }
      return acc;
    }, {} as typeof groupedBills);
  }

  // Convert grouped bills to array for pagination and sort by newest bill
  const groupedBillsArray = Object.entries(filteredGroupedBills).sort(([, a], [, b]) => {
    // Sort by the newest bill in each group
    const newestBillA = Math.max(...a.bills.map(bill => new Date(bill.created_at).getTime()));
    const newestBillB = Math.max(...b.bills.map(bill => new Date(bill.created_at).getTime()));
    return newestBillB - newestBillA; // Descending (newest first)
  });
  
  const totalGroupedStudents = groupedBillsArray.length;
  const totalGroupedPages = Math.ceil(totalGroupedStudents / perPage);

  // Jaga agar nomor halaman tidak melebihi total halaman setelah data berkurang / filter berubah
  useEffect(() => {
    if (totalGroupedStudents === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (totalGroupedPages > 0 && currentPage > totalGroupedPages) {
      setCurrentPage(totalGroupedPages);
    }
  }, [totalGroupedStudents, totalGroupedPages, currentPage]);

  // Get current page data
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentPageGroupedBills = groupedBillsArray.slice(startIndex, endIndex);

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Bulk selection functions
  const toggleBillSelection = (billId: string) => {
    setSelectedBills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
      } else {
        newSet.add(billId);
      }
      return newSet;
    });
  };

  const selectAllBills = () => {
    const allBillIds = new Set<string>();
    currentPageGroupedBills.forEach(([_, group]) => {
      group.bills.forEach(bill => {
        allBillIds.add(bill.id);
      });
    });
    setSelectedBills(allBillIds);
  };

  const clearAllSelections = () => {
    setSelectedBills(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedBills.size === 0) {
      toast.error('Pilih minimal 1 tagihan untuk dihapus');
      return;
    }

    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus ${selectedBills.size} tagihan yang dipilih?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Sesi login telah berakhir, silakan login kembali');
          return;
        }

        // Delete all selected bills
        const deletePromises = Array.from(selectedBills).map(billId =>
          fetch(`https://nurverse.id/api/master-data/tagihan/${billId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        );

        const results = await Promise.allSettled(deletePromises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (successful > 0) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `${successful} tagihan berhasil dihapus${failed > 0 ? `, ${failed} gagal` : ''}`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#3B82F6',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          
          clearAllSelections();
          fetchBills({ silent: true });
        } else {
          toast.error('Gagal menghapus tagihan');
        }
      } catch (error) {
        console.error('Error deleting bills:', error);
        toast.error('Terjadi kesalahan saat menghapus tagihan');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Toaster position="top-right" />
      
      {/* Header Section - Modern Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                  <DollarSign className="h-7 w-7" />
                </div>
                Tagihan Siswa
              </h1>
              <p className="text-blue-100 text-lg font-medium">Kelola tagihan dan pembayaran siswa dengan mudah</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 -mt-4">

        {/* Stats Cards - Modern Design with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Tagihan</p>
                  <p className="text-3xl font-bold text-gray-900">{totalGroupedStudents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Belum Bayar</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {groupedBillsArray.filter(([_, group]) => 
                      group.bills.some(bill => bill.status === 'unpaid')
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Cicilan</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {groupedBillsArray.filter(([_, group]) => 
                      group.bills.some(bill => bill.status === 'partial')
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Lunas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {groupedBillsArray.filter(([_, group]) => 
                      group.bills.every(bill => bill.status === 'paid')
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section - Modern Card Design */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
            {/* Search and Filters - Left Side */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Cari nama siswa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full sm:w-64 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Filters - Grid Layout */}
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Status Filter */}
                <div className="relative flex-1 min-w-[160px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-900"
                  >
                    <option value="" className="text-gray-900">Semua Status</option>
                    <option value="unpaid" className="text-gray-900">Belum Bayar</option>
                    <option value="partial" className="text-gray-900">Cicilan</option>
                    <option value="paid" className="text-gray-900">Lunas</option>
                    <option value="overdue" className="text-gray-900">Jatuh Tempo</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                </div>

                {/* Bill Type Filter */}
                <div className="relative flex-1 min-w-[160px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <select
                    value={billTypeFilter}
                    onChange={(e) => setBillTypeFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-900"
                  >
                    <option value="" className="text-gray-900">Semua Jenis</option>
                    {billTypes.map((type) => (
                      <option key={type.id} value={type.id} className="text-gray-900">
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                </div>

                {/* Unit Sekolah Filter */}
                <div className="relative flex-1 min-w-[180px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <select
                    value={unitFilter}
                    onChange={(e) => {
                      setUnitFilter(e.target.value);
                      setClassFilter(''); // Reset class filter when unit changes
                    }}
                    className="w-full pl-10 pr-8 py-3 h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-900"
                  >
                    <option value="" className="text-gray-900">Semua Unit Sekolah</option>
                    {unitSekolahList.map((unit) => (
                      <option key={unit.id} value={unit.jenjang} className="text-gray-900">
                        {unit.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                </div>

                {/* Class Filter - Only show when unit is selected */}
                {unitFilter && (
                  <div className="relative flex-1 min-w-[160px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="w-full pl-10 pr-8 py-3 h-[44px] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-900"
                    >
                      <option value="" className="text-gray-900">Semua Kelas</option>
                      {Array.from(new Set(
                        bills
                          .filter((bill: StudentBill) => {
                            const studentUnitSekolah = ((bill.student as any)?.unit_sekolah || (bill.student as any)?.unitSekolah || '').toUpperCase().trim();
                            const filterUnit = unitFilter.toUpperCase().trim();
                            return studentUnitSekolah === filterUnit || studentUnitSekolah.startsWith(filterUnit);
                          })
                          .map((bill: StudentBill) => (bill.student as any)?.unit_kelas || (bill.student as any)?.unitKelas || '')
                          .filter((kelas: string) => kelas)
                      )).sort().map((kelas) => (
                        <option key={kelas} value={kelas} className="text-gray-900">
                          {kelas}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Right Side */}
            <div className="flex flex-wrap gap-3 items-center justify-start xl:justify-end flex-shrink-0">
              {selectedBills.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-5 py-2.5 h-[44px] bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus ({selectedBills.size})
                </button>
              )}
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => {
                  toast.success('Memperbarui data...');
                  fetchBills({ silent: true });
                }}
                className="px-5 py-2.5 h-[44px] bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={async () => {
                  await fetchStudents(); // Refresh students before opening modal
                  console.log('🔄 Opening Bulk Create Modal...');
                  console.log('📊 Students data:', students);
                  console.log('📋 Bill Types data:', billTypes);
                  setShowBulkCreateModal(true);
                }}
                className="px-5 py-2.5 h-[44px] bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
              >
                <Users className="h-4 w-4" />
                Bulk Create
              </button>
              <button
                onClick={async () => {
                  await fetchStudents(); // Refresh students before opening modal
                  setShowCreateModal(true);
                }}
                className="px-5 py-2.5 h-[44px] bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Tambah Tagihan
              </button>
            </div>
          </div>
        </div>

        {/* Bills Table - Modern Design */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12 shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                  <button
                    onClick={() => {
                      const allCurrentPageBillIds = new Set<string>();
                      currentPageGroupedBills.forEach(([_, group]) => {
                        group.bills.forEach(bill => allCurrentPageBillIds.add(bill.id));
                      });
                      if (Array.from(allCurrentPageBillIds).every(id => selectedBills.has(id))) {
                        // All selected, deselect all
                        const newSet = new Set(selectedBills);
                        allCurrentPageBillIds.forEach(id => newSet.delete(id));
                        setSelectedBills(newSet);
                      } else {
                        // Select all on current page
                        const newSet = new Set(selectedBills);
                        allCurrentPageBillIds.forEach(id => newSet.add(id));
                        setSelectedBills(newSet);
                      }
                    }}
                    className="flex items-center justify-center"
                  >
                    {Array.from(new Set(
                      currentPageGroupedBills.flatMap(([_, group]) => group.bills.map(b => b.id))
                    )).every(id => selectedBills.has(id)) && 
                     currentPageGroupedBills.length > 0 ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="sticky left-12 z-30 bg-gray-50 p-0 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px] shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                  <div className="px-6 py-4 resize-x overflow-auto min-w-[200px] max-w-[500px]">
                    Siswa
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Jenis Tagihan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Terbayar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sisa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="sticky right-0 z-30 bg-gray-100 px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider shadow-[-1px_0_0_0_rgba(229,231,235,1)]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : Object.keys(filteredGroupedBills).length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data tagihan
                  </td>
                </tr>
              ) : (
                currentPageGroupedBills.map(([studentId, group]) => (
                  <React.Fragment key={studentId}>
                    {/* Main Student Row */}
                    <tr className="hover:bg-blue-50/50 bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                      <td className="sticky left-0 z-20 bg-gray-50 px-6 py-4 whitespace-nowrap shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const allGroupBillIds = group.bills.map(b => b.id);
                              const allSelected = allGroupBillIds.every(id => selectedBills.has(id));
                              if (allSelected) {
                                const newSet = new Set(selectedBills);
                                allGroupBillIds.forEach(id => newSet.delete(id));
                                setSelectedBills(newSet);
                              } else {
                                const newSet = new Set(selectedBills);
                                allGroupBillIds.forEach(id => newSet.add(id));
                                setSelectedBills(newSet);
                              }
                            }}
                            className="flex items-center justify-center"
                          >
                            {group.bills.every(bill => selectedBills.has(bill.id)) && group.bills.length > 0 ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleStudentExpansion(studentId)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {expandedStudents.has(studentId) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="sticky left-12 z-20 bg-gray-50 px-6 py-4 whitespace-nowrap shadow-[1px_0_0_0_rgba(229,231,235,1)]">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {group.student?.nama_lengkap || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {group.student?.unit_kelas || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {group.bills.length} tagihan
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(group.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatCurrency(group.totalPaid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {formatCurrency(group.totalRemaining)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {group.bills.map(bill => getStatusBadge(bill.status))}
                        </div>
                      </td>
                      <td className="sticky right-0 z-20 bg-gray-50 px-6 py-4 whitespace-nowrap text-sm font-medium shadow-[-1px_0_0_0_rgba(229,231,235,1)]">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedBill(group.bills[0]);
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Proses Pembayaran"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetail(group.bills[0])}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Rows */}
                    {expandedStudents.has(studentId) && group.bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-blue-50/30 bg-white transition-colors duration-200 border-b border-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap shadow-[1px_0_0_0_rgba(229,231,235,0.5)]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBillSelection(bill.id)}
                              className="flex items-center justify-center"
                            >
                              {selectedBills.has(bill.id) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                        </td>
                        <td className="sticky left-12 z-10 bg-white px-6 py-4 whitespace-nowrap shadow-[1px_0_0_0_rgba(229,231,235,0.5)]">
                          {/* Empty spacer for student name column */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {bill.bill_type?.name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {bill.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(bill.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(bill.paid_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(bill.remaining_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(bill.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(bill.status)}
                        </td>
                        <td className="sticky right-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium shadow-[-1px_0_0_0_rgba(229,231,235,0.5)]">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Proses Pembayaran"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewDetail(bill)}
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditBill(bill)}
                              className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalGroupedPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm border mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalGroupedPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan{' '}
                <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>
                {' '}sampai{' '}
                <span className="font-medium">
                  {Math.min(currentPage * perPage, totalGroupedStudents)}
                </span>
                {' '}dari{' '}
                <span className="font-medium">{totalGroupedStudents}</span>
                {' '}hasil
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalGroupedPages) }, (_, i) => {
                  let pageNum;
                  if (totalGroupedPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalGroupedPages - 2) {
                    pageNum = totalGroupedPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalGroupedPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modals */}
      <CreateBillModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBill}
        students={students}
      />

      <BulkCreateModal
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
        onSubmit={handleBulkCreate}
        students={students}
        billTypes={billTypes}
        isSubmitting={isSubmittingBulk}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleProcessPayment}
        bill={selectedBill}
      />

      {/* Edit Bill Modal */}
      <CreateBillModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBill(null);
        }}
        onSubmit={handleUpdateBill}
        students={students}
        editMode={true}
        editData={selectedBill}
      />

      {/* Bill Detail Modal */}
      <BillDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
      />
    </div>
  );
};

export default TagihanSiswaPage;
