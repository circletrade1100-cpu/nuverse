import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, User, Search, CreditCard, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Student } from '../../types/student';

interface BillType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface BillLabel {
  id: string;
  bill_type_id: string;
  label_name: string;
  label_text: string;
  is_active: boolean;
}

interface BillItem {
  id: string;
  bill_type_id: string;
  total_amount: string;
}

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (billData: any) => void;
  students: Student[];
  editMode?: boolean;
  editData?: any;
}

const CreateBillModal: React.FC<CreateBillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  editMode = false,
  editData = null
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_id: '',
    due_date: '',
    period_month: '',
    period_year: '',
    allow_installment: true,
    notes: ''
  });

  const [billItems, setBillItems] = useState<BillItem[]>([
    { id: '1', bill_type_id: '', total_amount: '' }
  ]);

  const [errors, setErrors] = useState<any>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [loadingBillTypes, setLoadingBillTypes] = useState(false);
  const [billLabels, setBillLabels] = useState<{ [key: string]: BillLabel[] }>({});
  const [loadingBillLabels, setLoadingBillLabels] = useState<{ [key: string]: boolean }>({});

  // Fetch Bill Types
  useEffect(() => {
    if (isOpen) {
      fetchBillTypes();
    }
  }, [isOpen]);

  const fetchBillTypes = async () => {
    try {
      setLoadingBillTypes(true);
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
    } finally {
      setLoadingBillTypes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('🔵 CreateBillModal useEffect triggered - isOpen:', isOpen, 'students count:', students.length);
      
      if (editMode && editData) {
        // Populate form with edit data
        const selectedStudent = students.find(s => s.id === editData.student_id);
        console.log('📝 Edit mode - selectedStudent:', selectedStudent);
        
        setFormData({
          student_id: editData.student_id || '',
          due_date: editData.due_date || '',
          period_month: editData.period_month?.toString() || '',
          period_year: editData.period_year?.toString() || '',
          allow_installment: editData.allow_installment ?? true,
          notes: editData.notes || ''
        });
        
        // Set single bill item for edit mode
        setBillItems([{
          id: '1',
          bill_type_id: editData.bill_type_id || '',
          total_amount: editData.total_amount?.toString() || ''
        }]);
        
        if (selectedStudent) {
          setSelectedStudent(selectedStudent);
          setStudentSearch(selectedStudent.namaLengkap || '');
        }
      } else {
        // Reset form when modal opens for create mode
        console.log('🆕 Create mode - resetting form');
        setFormData({
          student_id: '',
          due_date: '',
          period_month: '',
          period_year: '',
          allow_installment: true,
          notes: ''
        });
        setBillItems([{ id: '1', bill_type_id: '', total_amount: '' }]);
        setStudentSearch('');
        setSelectedStudent(null);
      }
      
      setErrors({});
      setShowStudentDropdown(false);
    }
  }, [isOpen, editMode, editData, students]);

  // Handle Bill Items
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
    handleInputChange('notes', labelText);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.namaLengkap?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.namaPanggilan?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.nisn?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.unitKelas?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.unitSekolah?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Debug students data
  useEffect(() => {
    console.log('🎓 CreateBillModal - Students received:', students.length);
    console.log('🔍 Filtered students:', filteredStudents.length);
    console.log('📝 Search term:', studentSearch);
    console.log('📋 First student data:', students[0]);
    console.log('🔍 First filtered student:', filteredStudents[0]);
    console.log('🔄 Modal isOpen:', isOpen);
    console.log('📊 Students array:', students);
  }, [students, filteredStudents, studentSearch, isOpen]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, student_id: student.id }));
    setStudentSearch(student.namaLengkap || '');
    setShowStudentDropdown(false);
    if (errors.student_id) {
      setErrors((prev: any) => ({ ...prev, student_id: null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: any = {};
    
    if (!formData.student_id) newErrors.student_id = 'Pilih siswa';
    if (!formData.due_date) newErrors.due_date = 'Pilih tanggal jatuh tempo';
    
    // Validate each bill item
    billItems.forEach((item) => {
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

    // Prepare data for submission
    let submitData;
    
    if (editMode) {
      // Edit mode - single bill format
      submitData = {
      student_id: formData.student_id,
        bill_type_id: billItems[0]?.bill_type_id,
        total_amount: parseFloat(billItems[0]?.total_amount || '0'),
      due_date: formData.due_date,
      period_month: formData.period_month ? parseInt(formData.period_month) : null,
      period_year: formData.period_year ? parseInt(formData.period_year) : null,
        allow_installment: formData.allow_installment,
      notes: formData.notes || null
    };
    } else {
      // Create mode - multiple bills format
      submitData = {
        student_id: formData.student_id,
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
    }

    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header - Modern Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{editMode ? 'Edit Tagihan' : 'Tambah Tagihan Baru'}</h2>
              <p className="text-blue-100 text-sm mt-1">{editMode ? 'Perbarui informasi tagihan siswa' : 'Buat tagihan pembayaran untuk siswa'}</p>
            </div>
          <button
            onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-8 py-6 space-y-6">
            
            {/* Search Select Student - Modern Design */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                Pilih Siswa
                <span className="text-red-500">*</span>
            </label>
              
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setShowStudentDropdown(true);
                      if (selectedStudent && e.target.value !== selectedStudent.namaLengkap) {
                      setSelectedStudent(null);
                      setFormData(prev => ({ ...prev, student_id: '' }));
                    }
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  placeholder="Cari nama siswa, NISN, atau kelas..."
                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400 ${
                      errors.student_id ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {selectedStudent && (
                    <CheckCircle2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>

                {/* Dropdown Results */}
                {showStudentDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      <div className="py-2">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => handleStudentSelect(student)}
                            className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {student.namaLengkap?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                                {student.namaLengkap || 'No Name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.unitKelas && <span className="mr-3">{student.unitKelas}</span>}
                                {student.nisn && <span className="text-gray-400">NISN: {student.nisn}</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Siswa tidak ditemukan</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            {errors.student_id && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.student_id}</span>
                </div>
              )}

              {/* Selected Student Card */}
              {selectedStudent && (
                <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedStudent.namaLengkap?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{selectedStudent.namaLengkap || 'No Name'}</div>
                      <div className="text-sm text-gray-600 flex gap-4 mt-1">
                        {selectedStudent.unitKelas && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {selectedStudent.unitKelas}
                          </span>
                        )}
                        {selectedStudent.nisn && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            NISN: {selectedStudent.nisn}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>


            {/* Jenis Tagihan - Multiple Bill Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                Jenis Tagihan
                <span className="text-red-500">*</span>
            </label>
                <div className="flex items-center gap-2">
                  {!editMode && (
                    <button
                      type="button"
                      onClick={addBillItem}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Jenis Tagihan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/master-data/jenis-tagihan');
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    {editMode ? 'Tambah Jenis Tagihan' : 'Kelola Jenis Tagihan'}
                  </button>
                </div>
              </div>

              {/* Primary Bill Item */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bill Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Jenis Tagihan *</label>
              {loadingBillTypes ? (
                <div className="py-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
            <select
                        value={billItems[0]?.bill_type_id || ''}
                        onChange={(e) => updateBillItem(billItems[0]?.id || '1', 'bill_type_id', e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-gray-900 bg-gray-50 ${
                          errors[`bill_type_${billItems[0]?.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">-- Pilih Jenis Tagihan --</option>
                  {billTypes.map((billType) => (
                    <option key={billType.id} value={billType.id}>
                      {billType.name}
                </option>
              ))}
            </select>
              )}
                    {errors[`bill_type_${billItems[0]?.id}`] && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                        <span>{errors[`bill_type_${billItems[0]?.id}`]}</span>
                </div>
            )}

                  {/* Bill Labels */}
                  {billItems[0]?.bill_type_id && (
                    <div className="mt-3 space-y-2">
                      {loadingBillLabels[billItems[0]?.bill_type_id] ? (
                        <div className="py-2 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                      ) : billLabels[billItems[0]?.bill_type_id]?.length > 0 ? (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">
                            Pilih Label Catatan:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {billLabels[billItems[0]?.bill_type_id].map((label) => (
                              <button
                                key={label.id}
                                type="button"
                                onClick={() => handleLabelClick(label.label_text)}
                                className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
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

          {/* Amount */}
              <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Jumlah Tagihan *</label>
            <input
              type="text"
              inputMode="decimal"
                      value={billItems[0]?.total_amount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty, numbers, and decimals (including trailing dot)
                        if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                          // Remove leading zeros except for decimals like "0.5"
                          let cleanValue = value;
                          if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
                            cleanValue = value.replace(/^0+/, '') || '0';
                          }
                          updateBillItem(billItems[0]?.id || '1', 'total_amount', cleanValue);
                        }
                      }}
                      onBlur={(e) => {
                        // On blur, format the value if it's valid
                        const value = e.target.value;
                        if (value && !isNaN(parseFloat(value))) {
                          const numValue = parseFloat(value);
                          if (numValue > 0) {
                            updateBillItem(billItems[0]?.id || '1', 'total_amount', numValue.toString());
                          }
                        }
                      }}
                  placeholder="0"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 bg-gray-50 ${
                        errors[`amount_${billItems[0]?.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
                    {billItems[0]?.total_amount && parseFloat(billItems[0].total_amount) > 0 && (
                  <p className="text-xs text-gray-600 pl-1">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                        }).format(parseFloat(billItems[0].total_amount))}
                  </p>
                )}
                    {errors[`amount_${billItems[0]?.id}`] && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                        <span>{errors[`amount_${billItems[0]?.id}`]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Bill Items */}
              {!editMode && billItems.length > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Kategori Tambahan
                  </div>
                  {billItems.slice(1).map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Kategori #{index + 2}</span>
                        <button
                          type="button"
                          onClick={() => removeBillItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bill Type */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Jenis Tagihan *</label>
                          <select
                            value={item.bill_type_id}
                            onChange={(e) => updateBillItem(item.id, 'bill_type_id', e.target.value)}
                            className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-gray-900 bg-white ${
                              errors[`bill_type_${item.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                          >
                            <option value="">-- Pilih Jenis Tagihan --</option>
                            {billTypes.map((billType) => (
                              <option key={billType.id} value={billType.id}>
                                {billType.name}
                              </option>
                            ))}
                          </select>
                          {errors[`bill_type_${item.id}`] && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{errors[`bill_type_${item.id}`]}</span>
                            </div>
                          )}

                          {/* Bill Labels for Additional Items */}
                          {item.bill_type_id && (
                            <div className="mt-2 space-y-2">
                              {loadingBillLabels[item.bill_type_id] ? (
                                <div className="py-1 text-center text-gray-500">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mx-auto"></div>
                                </div>
                              ) : billLabels[item.bill_type_id]?.length > 0 ? (
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-gray-600">
                                    Label Catatan:
                                  </label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {billLabels[item.bill_type_id].map((label) => (
                                      <button
                                        key={label.id}
                                        type="button"
                                        onClick={() => handleLabelClick(label.label_text)}
                                        className="px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
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

                        {/* Amount */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-600">Jumlah Tagihan *</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.total_amount}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty, numbers, and decimals (including trailing dot)
                              if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                // Remove leading zeros except for decimals like "0.5"
                                let cleanValue = value;
                                if (value.length > 1 && value[0] === '0' && value[1] !== '.') {
                                  cleanValue = value.replace(/^0+/, '') || '0';
                                }
                                updateBillItem(item.id, 'total_amount', cleanValue);
                              }
                            }}
                            onBlur={(e) => {
                              // On blur, format the value if it's valid
                              const value = e.target.value;
                              if (value && !isNaN(parseFloat(value))) {
                                const numValue = parseFloat(value);
                                if (numValue > 0) {
                                  updateBillItem(item.id, 'total_amount', numValue.toString());
                                }
                              }
                            }}
                            placeholder="0"
                            className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-gray-900 placeholder-gray-400 bg-white ${
                              errors[`amount_${item.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                          />
                          {item.total_amount && parseFloat(item.total_amount) > 0 && (
                            <p className="text-xs text-gray-600 pl-1">
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
                              <span>{errors[`amount_${item.id}`]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
            )}
          </div>

          {/* Due Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  Jatuh Tempo
                  <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-gray-900 bg-gray-50 ${
                    errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.due_date && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.due_date}</span>
                  </div>
            )}
          </div>

            {/* Period - Optional */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Periode Bulan <span className="text-gray-400">(Opsional)</span>
              </label>
              <select
                value={formData.period_month}
                onChange={(e) => handleInputChange('period_month', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">-- Pilih Bulan --</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month} className="text-gray-900">
                    {new Date(2024, month - 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Periode Tahun <span className="text-gray-400">(Opsional)</span>
              </label>
              <select
                value={formData.period_year}
                onChange={(e) => handleInputChange('period_year', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">-- Pilih Tahun --</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                  <option key={year} value={year} className="text-gray-900">
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

            {/* Payment Method - Cicilan Fleksibel */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                Metode Pembayaran
              </div>

              {/* Checkbox Allow Installment - Cicilan Fleksibel */}
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-300">
            <input
              type="checkbox"
              id="allow_installment"
              checked={formData.allow_installment}
              onChange={(e) => handleInputChange('allow_installment', e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="allow_installment" className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                    <span>Izinkan Pembayaran Cicilan (Fleksibel)</span>
                    <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">Rekomendasi</span>
            </label>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    ✓ Siswa bebas bayar <strong>kapan saja</strong> dengan <strong>nominal berapa saja</strong><br/>
                    ✓ Sistem otomatis tracking pembayaran hingga lunas<br/>
                    ✓ Tidak ada batasan jumlah atau jadwal cicilan
                  </p>
                </div>
              </div>

              {/* Info Box */}
              {formData.allow_installment && (
                <div className="p-4 bg-blue-100 rounded-lg border border-blue-300 animate-in slide-in-from-top duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <strong>Cicilan Fleksibel Aktif!</strong> Siswa dapat membayar tagihan ini secara bertahap sesuai kemampuan hingga lunas.
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Catatan <span className="text-gray-400">(Opsional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Tambahkan catatan atau keterangan tambahan..."
              rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          </div>
        </form>

        {/* Footer Actions - Fixed */}
        <div className="border-t bg-gray-50 px-8 py-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            >
              Batal
            </button>
            <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              {editMode ? 'Update Tagihan' : 'Buat Tagihan'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default CreateBillModal;
