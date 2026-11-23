import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Users, DollarSign, Calendar, Search, Filter, ChevronDown, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  namaLengkap?: string;
  nama_lengkap?: string; // Support both camelCase and snake_case
  unitKelas?: string;
  unit_kelas?: string; // Support both camelCase and snake_case
  unitSekolah?: string;
  unit_sekolah?: string; // Support both camelCase and snake_case
}

interface BillType {
  id: string;
  name: string;
  is_active: boolean;
}

interface BillLabel {
  id: string;
  bill_type_id: string;
  label_name: string;
  label_text: string;
  is_active: boolean;
}

interface BulkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  students: Student[];
  billTypes: BillType[];
  isSubmitting?: boolean;
}

interface BillItem {
  id: string;
  bill_type_id: string;
  total_amount: string;
}

const BulkCreateModal: React.FC<BulkCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  billTypes,
  isSubmitting = false
}) => {
  console.log('🎯 BulkCreateModal rendered with props:', {
    isOpen,
    studentsLength: students?.length,
    billTypesLength: billTypes?.length,
    students: students,
    billTypes: billTypes
  });
  const [formData, setFormData] = useState({
    due_date: '',
    period_month: '',
    period_year: '',
    allow_installment: true,
    notes: ''
  });

  const [billItems, setBillItems] = useState<BillItem[]>([
    { id: '1', bill_type_id: '', total_amount: '' }
  ]);

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [unitFilter, setUnitFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [billLabels, setBillLabels] = useState<{ [key: string]: BillLabel[] }>({});
  const [loadingBillLabels, setLoadingBillLabels] = useState<{ [key: string]: boolean }>({});
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const classDropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        due_date: '',
        period_month: '',
        period_year: '',
        allow_installment: true,
        notes: ''
      });
      setBillItems([{ id: '1', bill_type_id: '', total_amount: '' }]);
      setSelectedStudents([]);
      setUnitFilter('');
      setClassFilter('');
      setSearchTerm('');
      setClassSearchTerm('');
      setIsClassDropdownOpen(false);
      setErrors({});
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setIsClassDropdownOpen(false);
        setClassSearchTerm('');
      }
    };

    if (isClassDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClassDropdownOpen]);

  const addBillItem = () => {
    const newId = (billItems.length + 1).toString();
    setBillItems(prev => [...prev, { id: newId, bill_type_id: '', total_amount: '' }]);
  };

  const removeBillItem = (id: string) => {
    if (billItems.length > 1) {
      setBillItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const fetchBillLabels = async (billTypeId: string) => {
    if (!billTypeId) {
      setBillLabels(prev => {
        const newLabels = { ...prev };
        delete newLabels[billTypeId];
        return newLabels;
      });
      return;
    }

    // Skip if already loaded
    if (billLabels[billTypeId]) {
      return;
    }

    try {
      setLoadingBillLabels(prev => ({ ...prev, [billTypeId]: true }));
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`https://nurverse.id/api/master-data/tagihan/bill-labels?bill_type_id=${billTypeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch bill labels:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setBillLabels(prev => ({ ...prev, [billTypeId]: data.data || [] }));
      } else {
        console.error('API returned error:', data.message);
        setBillLabels(prev => ({ ...prev, [billTypeId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching bill labels:', error);
      setBillLabels(prev => ({ ...prev, [billTypeId]: [] }));
    } finally {
      setLoadingBillLabels(prev => ({ ...prev, [billTypeId]: false }));
    }
  };

  const updateBillItem = (id: string, field: keyof BillItem, value: string) => {
    setBillItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    
    // Fetch bill labels when bill_type_id is selected
    if (field === 'bill_type_id') {
      fetchBillLabels(value);
    }
    
    // Clear errors for this field
    if (errors[`bill_type_${id}`] || errors[`amount_${id}`]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[`bill_type_${id}`];
        delete newErrors[`amount_${id}`];
        return newErrors;
      });
    }
  };

  const handleLabelClick = (labelText: string) => {
    setFormData(prev => ({ ...prev, notes: labelText }));
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    if (Array.isArray(filteredStudents)) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  const getFilteredStudents = () => {
    if (!students || !Array.isArray(students)) {
      console.log('⚠️ Students is not an array:', students);
      return [];
    }
    
    const filtered = students.filter(student => {
      if (!student) return false;
      // Support both camelCase and snake_case field names
      const studentName = student.namaLengkap || student.nama_lengkap || '';
      const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Unit sekolah matching with case-insensitive and pattern support
      const unitSekolah = (student.unitSekolah || student.unit_sekolah || '').toUpperCase().trim();
      const filterUnit = unitFilter ? unitFilter.toUpperCase().trim() : '';
      const matchesUnit = !unitFilter || 
                          unitSekolah === filterUnit || 
                          unitSekolah.startsWith(filterUnit) ||
                          unitSekolah.includes(filterUnit);
      
      // Class matching (exact match, case-insensitive)
      const unitKelas = (student.unitKelas || student.unit_kelas || '').trim();
      const filterClass = classFilter ? classFilter.trim() : '';
      const matchesClass = !classFilter || unitKelas === filterClass;
      
      return matchesSearch && matchesUnit && matchesClass;
    });
    
    // Debug logging
    console.log('🔍 BulkCreateModal Filter Debug:', {
      totalStudents: students.length,
      unitFilter,
      classFilter,
      searchTerm,
      filteredCount: filtered.length,
      studentsByUnit: students.reduce((acc, s) => {
        const unit = s.unitSekolah || s.unit_sekolah || 'N/A';
        acc[unit] = (acc[unit] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      studentsByClass: students.reduce((acc, s) => {
        const kelas = s.unitKelas || s.unit_kelas || 'N/A';
        acc[kelas] = (acc[kelas] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      filteredSample: filtered.slice(0, 5).map(s => ({
        name: s.namaLengkap || s.nama_lengkap,
        unit: s.unitSekolah || s.unit_sekolah,
        kelas: s.unitKelas || s.unit_kelas
      }))
    });
    
    return filtered;
  };

  // Get unique classes based on selected unit with count
  const getAvailableClasses = () => {
    if (!students || !Array.isArray(students)) {
      console.log('⚠️ getAvailableClasses: students is not an array:', students);
      return [];
    }
    
    // Filter by unit with case-insensitive and pattern matching
    // SD should match "SD", "SDIT", "SD IT", etc.
    const filteredByUnit = unitFilter 
      ? students.filter(s => {
          const unit = (s.unitSekolah || s.unit_sekolah || '').toUpperCase().trim();
          const filterValue = unitFilter.toUpperCase().trim();
          
          // Exact match or starts with pattern (e.g., "SD" matches "SDIT")
          const matches = unit === filterValue || unit.startsWith(filterValue) || unit.includes(filterValue);
          
          return matches;
        })
      : students;
    
    // Collect unique classes with count
    const classMap = new Map<string, number>();
    filteredByUnit.forEach(student => {
      const kelas = (student.unitKelas || student.unit_kelas || '').trim();
      if (kelas) {
        classMap.set(kelas, (classMap.get(kelas) || 0) + 1);
      }
    });
    
    // Convert to array and sort
    const classesArray = Array.from(classMap.entries())
      .map(([kelas, count]) => ({ kelas, count }))
      .sort((a, b) => {
        // Natural sort: extract numbers and compare
        const numA = parseInt(a.kelas.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.kelas.match(/\d+/)?.[0] || '0');
        if (numA !== numB) return numA - numB;
        return a.kelas.localeCompare(b.kelas);
      });
    
    // Debug logging
    console.log('📚 getAvailableClasses Debug:', {
      unitFilter,
      totalStudents: students.length,
      filteredByUnitCount: filteredByUnit.length,
      uniqueClassesCount: classesArray.length,
      allClasses: classesArray.map(c => c.kelas),
      classesWithCount: classesArray
    });
    
    return classesArray;
  };

  // Get filtered classes based on search
  const getFilteredClasses = () => {
    const classes = getAvailableClasses();
    if (!classSearchTerm.trim()) return classes;
    
    const search = classSearchTerm.toLowerCase().trim();
    return classes.filter(c => c.kelas.toLowerCase().includes(search));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submit
    if (isSubmitting) {
      console.warn('⚠️ Form submission already in progress');
      return;
    }

    const newErrors: any = {};

    // Validate form data
    if (!formData.due_date) newErrors.due_date = 'Pilih tanggal jatuh tempo';
    if (selectedStudents.length === 0) newErrors.students = 'Pilih minimal 1 siswa';

    // Validate bill items
    billItems.forEach((item, index) => {
      if (!item.bill_type_id) {
        newErrors[`bill_type_${item.id}`] = 'Pilih jenis tagihan';
      }
      if (!item.total_amount || parseFloat(item.total_amount) <= 0) {
        newErrors[`amount_${item.id}`] = 'Jumlah tagihan harus lebih dari 0';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = {
      student_ids: selectedStudents,
      due_date: formData.due_date,
      period_month: formData.period_month ? parseInt(formData.period_month) : null,
      period_year: formData.period_year ? parseInt(formData.period_year) : null,
      allow_installment: formData.allow_installment,
      notes: formData.notes || null,
      bill_items: billItems.map(item => ({
        bill_type_id: item.bill_type_id,
        total_amount: parseFloat(item.total_amount)
      }))
    };

    console.log('📤 BulkCreateModal submitting:', {
      student_count: selectedStudents.length,
      bill_items_count: submitData.bill_items.length,
      data: submitData
    });

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  const filteredStudents = getFilteredStudents();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Create Tagihan</h2>
                <p className="text-purple-100 mt-1">Buat tagihan untuk multiple siswa sekaligus</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Bill Configuration */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Konfigurasi Tagihan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 ${
                      errors.due_date ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {errors.due_date && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{errors.due_date}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Periode Tahun
                  </label>
                  <input
                    type="number"
                    value={formData.period_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, period_year: e.target.value }))}
                    placeholder="2024"
                    min="2020"
                    max="2030"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_installment}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_installment: e.target.checked }))}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Izinkan Cicilan</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan untuk tagihan..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white resize-none"
                />
              </div>
            </div>

            {/* Bill Items */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Jenis Tagihan</h3>
                </div>
                <button
                  type="button"
                  onClick={addBillItem}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Jenis Tagihan
                </button>
              </div>

              <div className="space-y-4">
                {billItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Card Header */}
                    {billItems.length > 1 && (
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Kategori Tagihan #{index + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBillItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Hapus kategori"
                        >
                          <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    )}

                    {/* Form Fields - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Jenis Tagihan */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <FileText className="h-4 w-4 inline mr-2 text-green-600" />
                          Jenis Tagihan <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.bill_type_id}
                          onChange={(e) => updateBillItem(item.id, 'bill_type_id', e.target.value)}
                          className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 bg-white ${
                            errors[`bill_type_${item.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <option value="">-- Pilih Jenis Tagihan --</option>
                          {billTypes && billTypes.length > 0 ? billTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          )) : (
                            <option value="" disabled>Tidak ada jenis tagihan tersedia</option>
                          )}
                        </select>
                        {errors[`bill_type_${item.id}`] && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">{errors[`bill_type_${item.id}`]}</span>
                          </div>
                        )}

                        {/* Bill Labels */}
                        {item.bill_type_id && (
                          <div className="mt-3 space-y-2">
                            {loadingBillLabels[item.bill_type_id] ? (
                              <div className="py-2 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto"></div>
                              </div>
                            ) : billLabels[item.bill_type_id]?.length > 0 ? (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                  <span>💡</span>
                                  Pilih Label Catatan:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {billLabels[item.bill_type_id].map((label) => (
                                    <button
                                      key={label.id}
                                      type="button"
                                      onClick={() => handleLabelClick(label.label_text)}
                                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow"
                                    >
                                      {label.label_name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Jumlah Tagihan */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <DollarSign className="h-4 w-4 inline mr-2 text-green-600" />
                          Jumlah Tagihan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">Rp</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.total_amount}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty, numbers, and decimals
                              // Remove any non-numeric characters except dot
                              const numericValue = value.replace(/[^0-9.]/g, '');
                              
                              // Prevent multiple dots
                              const dotCount = (numericValue.match(/\./g) || []).length;
                              if (dotCount > 1) return;
                              
                              // Allow empty, numbers, and decimals
                              if (numericValue === '' || /^\d*\.?\d*$/.test(numericValue)) {
                                // Remove leading zeros except for decimals like "0.5"
                                let cleanValue = numericValue;
                                if (numericValue.length > 1 && numericValue[0] === '0' && numericValue[1] !== '.') {
                                  cleanValue = numericValue.replace(/^0+/, '') || '0';
                                }
                                updateBillItem(item.id, 'total_amount', cleanValue);
                              }
                            }}
                            onBlur={(e) => {
                              // Format on blur: ensure proper decimal format
                              const value = e.target.value.trim();
                              if (value) {
                                // Remove any trailing dots
                                let formattedValue = value.replace(/\.$/, '');
                                
                                // Ensure valid number
                                const numValue = parseFloat(formattedValue);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  // Format to 2 decimal places if has decimal
                                  if (formattedValue.includes('.')) {
                                    formattedValue = numValue.toFixed(2);
                                  } else {
                                    formattedValue = numValue.toString();
                                  }
                                  updateBillItem(item.id, 'total_amount', formattedValue);
                                }
                              }
                            }}
                            placeholder="0.00"
                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 bg-white font-medium ${
                              errors[`amount_${item.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300'
                            }`}
                          />
                        </div>
                        
                        {/* Formatted Amount Display */}
                        {item.total_amount && !isNaN(parseFloat(item.total_amount)) && parseFloat(item.total_amount) > 0 && (
                          <p className="text-xs text-green-600 font-semibold pl-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }).format(parseFloat(item.total_amount))}
                          </p>
                        )}
                        
                        {errors[`amount_${item.id}`] && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">{errors[`amount_${item.id}`]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Selection */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pilih Siswa ({selectedStudents.length} dipilih)
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={clearAllStudents}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>

              {/* Student Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={unitFilter}
                      onChange={(e) => {
                        setUnitFilter(e.target.value);
                        setClassFilter(''); // Reset class filter when unit changes
                        setClassSearchTerm(''); // Reset class search when unit changes
                        setIsClassDropdownOpen(false); // Close dropdown when unit changes
                      }}
                      className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Semua Unit</option>
                      <option value="TK">TKIT</option>
                      <option value="SD">SDIT</option>
                      <option value="SMP">SMPIT</option>
                      <option value="SMA">SMAIT</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-64">
                  <div className="relative" ref={classDropdownRef}>
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <button
                      type="button"
                      onClick={() => unitFilter && setIsClassDropdownOpen(!isClassDropdownOpen)}
                      disabled={!unitFilter}
                      className={`w-full pl-12 pr-10 py-3 border-2 rounded-xl text-left transition-all duration-200 text-gray-900 bg-white ${
                        !unitFilter 
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                          : 'border-gray-200 cursor-pointer hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                    >
                      <span className={`block truncate ${classFilter ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {classFilter || 'Semua Kelas'}
                      </span>
                      <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Custom Dropdown */}
                    {isClassDropdownOpen && unitFilter && (
                      <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={classSearchTerm}
                              onChange={(e) => setClassSearchTerm(e.target.value)}
                              placeholder="Cari kelas..."
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Classes List */}
                        <div className="max-h-64 overflow-y-auto">
                          {getFilteredClasses().length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p>Tidak ada kelas ditemukan</p>
                            </div>
                          ) : (
                            <>
                              {/* Option: Semua Kelas */}
                              <button
                                type="button"
                                onClick={() => {
                                  setClassFilter('');
                                  setIsClassDropdownOpen(false);
                                  setClassSearchTerm('');
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between ${
                                  !classFilter ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                                }`}
                              >
                                <span className={`font-medium ${!classFilter ? 'text-purple-700' : 'text-gray-900'}`}>
                                  Semua Kelas
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {getAvailableClasses().reduce((sum, c) => sum + c.count, 0)} siswa
                                </span>
                              </button>
                              <div className="border-t border-gray-100" />
                              
                              {/* Individual Classes */}
                              {getFilteredClasses().map(({ kelas, count }) => (
                                <button
                                  key={kelas}
                                  type="button"
                                  onClick={() => {
                                    setClassFilter(kelas);
                                    setIsClassDropdownOpen(false);
                                    setClassSearchTerm('');
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between ${
                                    classFilter === kelas ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                                  }`}
                                >
                                  <span className={`font-medium ${classFilter === kelas ? 'text-purple-700' : 'text-gray-900'}`}>
                                    {kelas}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    classFilter === kelas 
                                      ? 'text-purple-700 bg-purple-100' 
                                      : 'text-gray-500 bg-gray-100'
                                  }`}>
                                    {count} siswa
                                  </span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {errors.students && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">{errors.students}</span>
                </div>
              )}

              {/* Student List */}
              <div className="max-h-80 overflow-y-auto border-2 border-gray-200 rounded-xl bg-white">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Tidak ada siswa yang ditemukan</p>
                    <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-4 p-4 hover:bg-purple-50 cursor-pointer transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">
                            {student.namaLengkap || student.nama_lengkap || 'Nama tidak tersedia'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {(() => {
                              const unitKelas = student.unitKelas || student.unit_kelas || '';
                              const unitSekolah = student.unitSekolah || student.unit_sekolah || '';
                              if (unitKelas && unitSekolah) {
                                return `${unitKelas} - ${unitSekolah}`;
                              } else if (unitKelas) {
                                return unitKelas;
                              } else if (unitSekolah) {
                                return unitSekolah;
                              }
                              return '';
                            })()}
                          </div>
                        </div>
                        {selectedStudents.includes(student.id) && (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'Membuat Tagihan...' : `Buat Tagihan (${selectedStudents.length} Siswa)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkCreateModal;