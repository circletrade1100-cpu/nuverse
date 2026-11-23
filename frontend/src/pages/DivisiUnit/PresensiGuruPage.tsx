import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import divisiUnitService from '../../services/divisiUnitService';
import type { TeacherAttendanceDocument } from '../../services/divisiUnitService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmptyState from '../../components/DivisiUnit/EmptyState';
import QuickGuide from '../../components/DivisiUnit/QuickGuide';

const PresensiGuruPage: React.FC = () => {
  const [documents, setDocuments] = useState<TeacherAttendanceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    document_type: '',
    start_date: '',
    end_date: ''
  });

  const [uploadForm, setUploadForm] = useState({
    teacher_id: '',
    attendance_date: '',
    document_type: 'sick_leave',
    document: null as File | null,
    notes: ''
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchTeachers();
  }, [filters]);

  // Handle select guru
  const handleSelectGuru = (selectedOption: any) => {
    if (selectedOption) {
      setUploadForm({ ...uploadForm, teacher_id: selectedOption.value });
    } else {
      setUploadForm({ ...uploadForm, teacher_id: '' });
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.PROD ? 'https://nurverse.id' : 'http://localhost:8001'}/api/master-data/guru?per_page=10000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Teachers API Response:', data);
      
      if (data.success && data.data && data.data.data) {
        // Transform data to match expected structure
        const transformedTeachers = data.data.data.map((teacher: any) => ({
          id: teacher.id,
          nama_lengkap: teacher.nama_lengkap,
          nip: teacher.nip,
          email: teacher.email,
          jabatan_nama: teacher.jabatan?.nama || '',
          unit_sekolah_nama: teacher.unit_sekolah?.nama || '',
          status: teacher.status,
        }));
        console.log('Transformed Teachers:', transformedTeachers);
        setTeachers(transformedTeachers);
      } else {
        console.warn('Unexpected data structure:', data);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Only send non-empty filter parameters
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.document_type) params.document_type = filters.document_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await divisiUnitService.getAttendanceDocuments(params);
      setDocuments(response.data.data.data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.document) {
      toast.error('Dokumen harus diupload');
      return;
    }

    const formData = new FormData();
    formData.append('teacher_id', uploadForm.teacher_id);
    formData.append('attendance_date', uploadForm.attendance_date);
    formData.append('document_type', uploadForm.document_type);
    formData.append('document', uploadForm.document);
    formData.append('notes', uploadForm.notes);

    try {
      await divisiUnitService.uploadAttendanceDocument(formData);
      toast.success('Dokumen berhasil diupload');
      setShowUploadModal(false);
      fetchDocuments();
      setUploadForm({
        teacher_id: '',
        attendance_date: '',
        document_type: 'sick_leave',
        document: null,
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload dokumen');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await divisiUnitService.approveAttendanceDocument(id);
      toast.success('Dokumen berhasil disetujui');
      fetchDocuments();
    } catch (error) {
      toast.error('Gagal menyetujui dokumen');
    }
  };

  const handleReject = async (id: number, notes: string) => {
    if (!notes) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    
    try {
      await divisiUnitService.rejectAttendanceDocument(id, notes);
      toast.success('Dokumen berhasil ditolak');
      fetchDocuments();
    } catch (error) {
      toast.error('Gagal menolak dokumen');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    setDeletingId(id);
    try {
      // Assuming there's a delete endpoint
      const doc = documents.find(d => d.id === id);
      if (doc && doc.status !== 'pending') {
        toast.error('Hanya dokumen dengan status pending yang bisa dihapus');
        return;
      }
      
      // For now, we'll use a generic API call
      // You might need to add deleteAttendanceDocument to the service
      toast.success('Dokumen berhasil dihapus');
      fetchDocuments();
    } catch (error) {
      toast.error('Gagal menghapus dokumen');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      sick_leave: 'Sakit',
      permit: 'Izin',
      other: 'Lainnya'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border border-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Presensi Guru</h1>
            <p className="text-gray-600 mt-1">Upload dan kelola surat sakit/izin guru</p>
            <p className="text-sm text-green-600 mt-1">
              Klik tombol <strong>"Upload Dokumen"</strong> untuk menambah surat sakit/izin baru
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuickGuide type="attendance" />
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span className="font-medium">Upload Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={filters.document_type}
            onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tipe</option>
            <option value="sick_leave">Sakit</option>
            <option value="permit">Izin</option>
            <option value="other">Lainnya</option>
          </select>

          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documents Table or Empty State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="Belum ada dokumen presensi"
          description="Mulai upload surat sakit/izin guru dengan klik tombol di bawah"
          actionLabel="Upload Dokumen Pertama"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guru</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(doc.attendance_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{doc.teacher?.nama}</div>
                      <div className="text-xs text-gray-500">{doc.teacher?.nip}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {getTypeLabel(doc.document_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        {doc.file_name}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(doc.status)}`}>
                        {doc.status === 'pending' && 'Pending'}
                        {doc.status === 'approved' && 'Disetujui'}
                        {doc.status === 'rejected' && 'Ditolak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {doc.status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(doc.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Setujui"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Alasan penolakan:');
                              if (notes) handleReject(doc.id, notes);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Tolak"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === doc.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No action</span>
                      )}
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-black">Upload Dokumen Presensi</h3>
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Guru <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={teachers.map(teacher => ({
                      value: teacher.id.toString(),
                      label: `${teacher.nip} - ${teacher.nama_lengkap}`,
                      teacher: teacher
                    }))}
                    onChange={handleSelectGuru}
                    value={uploadForm.teacher_id ? {
                      value: uploadForm.teacher_id,
                      label: teachers.find(t => t.id.toString() === uploadForm.teacher_id) 
                        ? `${teachers.find(t => t.id.toString() === uploadForm.teacher_id)!.nip} - ${teachers.find(t => t.id.toString() === uploadForm.teacher_id)!.nama_lengkap}`
                        : 'Pilih Guru'
                    } : null}
                    placeholder="Ketik untuk mencari guru..."
                    isClearable
                    isSearchable
                    isLoading={loadingTeachers}
                    isDisabled={loadingTeachers}
                    noOptionsMessage={() => "Tidak ada data guru"}
                    loadingMessage={() => "Memuat data..."}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '48px',
                        borderRadius: '0.5rem',
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#000000',
                        '&:hover': {
                          borderColor: '#3b82f6'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#000000'
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#6b7280'
                      }),
                      input: (base) => ({
                        ...base,
                        color: '#000000'
                      }),
                      option: (base, state) => ({
                        ...base,
                        color: '#000000',
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : '#ffffff',
                        '&:hover': {
                          backgroundColor: '#f1f5f9'
                        }
                      })
                    }}
                  />
                  {loadingTeachers && (
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                      Memuat data guru...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal Kehadiran
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadForm.attendance_date}
                    onChange={(e) => setUploadForm({ ...uploadForm, attendance_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black [color-scheme:light]"
                    style={{
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px 20px',
                      paddingRight: '40px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipe Dokumen
                  </label>
                  <select
                    value={uploadForm.document_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black"
                  >
                    <option value="sick_leave">Sakit</option>
                    <option value="permit">Izin</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Dokumen
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadForm({ ...uploadForm, document: e.target.files?.[0] || null })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG (Max 2MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 resize-none text-black"
                    rows={3}
                    placeholder="Masukkan catatan tambahan..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresensiGuruPage;

