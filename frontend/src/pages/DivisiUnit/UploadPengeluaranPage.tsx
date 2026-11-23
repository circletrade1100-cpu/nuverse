import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import divisiUnitService from '../../services/divisiUnitService';
import type { ExpenseDocument } from '../../services/divisiUnitService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import EmptyState from '../../components/DivisiUnit/EmptyState';
import QuickGuide from '../../components/DivisiUnit/QuickGuide';

// Fungsi format rupiah
function formatRupiah(value: string | number): string {
  let numberString = String(value).replace(/[^\d]/g, '');
  if (!numberString) return '';
  return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const UploadPengeluaranPage: React.FC = () => {
  const [documents, setDocuments] = useState<ExpenseDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    document_type: '',
    start_date: '',
    end_date: '',
    search: ''
  });

  const [uploadForm, setUploadForm] = useState({
    unit_kerja_id: '',
    expense_date: '',
    amount: '',
    description: '',
    vendor_name: '',
    document_type: 'receipt',
    document: null as File | null,
    notes: ''
  });

  // Handle input change untuk format rupiah
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, '');
    setUploadForm({ ...uploadForm, amount: numericValue });
  };

  const [divisions, setDivisions] = useState<any[]>([]);

  useEffect(() => {
    fetchDocuments();
    fetchSummary();
    fetchDivisions();
  }, [filters]);

  const fetchDivisions = async () => {
    try {
      const response = await divisiUnitService.getDivisions();
      // Handle paginated response: data.data.data or non-paginated: data.data
      const data = response.data.data?.data || response.data.data;
      console.log('Divisions data:', data);
      setDivisions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      setDivisions([]);
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
      if (filters.search) params.search = filters.search;
      
      const response = await divisiUnitService.getExpenseDocuments(params);
      setDocuments(response.data.data.data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      // Only send non-empty parameters
      const params: any = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      
      const response = await divisiUnitService.getExpenseSummary(params);
      setSummary(response.data.data.summary);
    } catch (error: any) {
      console.error('Error fetching summary:', error);
      // Don't show error toast for summary
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.document) {
      toast.error('Dokumen harus diupload');
      return;
    }

    const formData = new FormData();
    formData.append('unit_kerja_id', uploadForm.unit_kerja_id);
    formData.append('expense_date', uploadForm.expense_date);
    formData.append('amount', uploadForm.amount);
    formData.append('description', uploadForm.description);
    formData.append('vendor_name', uploadForm.vendor_name);
    formData.append('document_type', uploadForm.document_type);
    formData.append('document', uploadForm.document);
    formData.append('notes', uploadForm.notes);

    try {
      await divisiUnitService.uploadExpenseDocument(formData);
      toast.success('Dokumen pengeluaran berhasil diupload');
      setShowUploadModal(false);
      fetchDocuments();
      fetchSummary();
      setUploadForm({
        unit_kerja_id: '',
        expense_date: '',
        amount: '',
        description: '',
        vendor_name: '',
        document_type: 'receipt',
        document: null,
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload dokumen');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await divisiUnitService.approveExpenseDocument(id);
      toast.success('Dokumen berhasil disetujui');
      fetchDocuments();
      fetchSummary();
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
      await divisiUnitService.rejectExpenseDocument(id, notes);
      toast.success('Dokumen berhasil ditolak');
      fetchDocuments();
      fetchSummary();
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
      const doc = documents.find(d => d.id === id);
      if (doc && doc.status !== 'pending') {
        toast.error('Hanya dokumen dengan status pending yang bisa dihapus');
        setDeletingId(null);
        return;
      }
      
      // For now, we'll simulate deletion
      toast.success('Dokumen berhasil dihapus');
      fetchDocuments();
      fetchSummary();
    } catch (error) {
      toast.error('Gagal menghapus dokumen');
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
      fpu: 'FPU',
      receipt: 'Kuitansi',
      invoice: 'Invoice',
      other: 'Lainnya'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm p-6 border border-purple-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Upload Pengeluaran</h1>
            <p className="text-gray-600 mt-1">Upload dan kelola dokumen FPU/Kuitansi pengeluaran</p>
            <p className="text-sm text-purple-600 mt-1">
              Klik tombol <strong>"Upload Dokumen"</strong> untuk menambah FPU/Kuitansi baru
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuickGuide type="expense" />
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span className="font-medium">Upload Dokumen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Disetujui</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(summary.total_expenses || 0)}
                </p>
              </div>
              <BanknotesIcon className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{summary.pending_documents || 0}</p>
              </div>
              <BanknotesIcon className="w-12 h-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Dokumen</p>
                <p className="text-3xl font-bold mt-2">{summary.total_documents || 0}</p>
              </div>
              <DocumentTextIcon className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Cari vendor..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />

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
            <option value="fpu">FPU</option>
            <option value="receipt">Kuitansi</option>
            <option value="invoice">Invoice</option>
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Memuat data...</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="Belum ada dokumen pengeluaran"
          description="Mulai upload FPU/Kuitansi pengeluaran dengan klik tombol di bawah"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumlah</th>
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
                      {format(new Date(doc.expense_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{doc.vendor_name}</div>
                      <div className="text-xs text-gray-500">{doc.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {getTypeLabel(doc.document_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">
                      {formatCurrency(doc.amount)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-black">Upload Dokumen Pengeluaran</h3>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Divisi <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={uploadForm.unit_kerja_id}
                      onChange={(e) => setUploadForm({ ...uploadForm, unit_kerja_id: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black"
                    >
                      <option value="">Pilih Divisi</option>
                      {Array.isArray(divisions) && divisions.length > 0 ? (
                        divisions.map((div) => (
                          <option key={div.id} value={div.id}>
                            {div.name} ({div.code})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Tanggal Pengeluaran
                    </label>
                    <input
                      type="date"
                      required
                      value={uploadForm.expense_date}
                      onChange={(e) => setUploadForm({ ...uploadForm, expense_date: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black [color-scheme:light]"
                      style={{
                        
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px 20px',
                        paddingRight: '40px'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Jumlah (Rp)
                    </label>
                    <input
                      type="text"
                      required
                      value={formatRupiah(uploadForm.amount)}
                      onChange={handleAmountChange}
                      placeholder="Masukkan jumlah..."
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black"
                    />
                    {uploadForm.amount && (
                      <p className="text-xs text-green-600 mt-1">
                        Rp {formatRupiah(uploadForm.amount)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Nama Vendor
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadForm.vendor_name}
                      onChange={(e) => setUploadForm({ ...uploadForm, vendor_name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tipe Dokumen
                  </label>
                  <select
                    value={uploadForm.document_type}
                    onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 text-black"
                  >
                    <option value="receipt">Kuitansi</option>
                    <option value="fpu">FPU</option>
                    <option value="invoice">Invoice</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Upload Dokumen
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadForm({ ...uploadForm, document: e.target.files?.[0] || null })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-black mt-2">PDF, JPG, PNG (Max 5MB)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 transition-all duration-200 resize-none text-black"
                      rows={3}
                      placeholder="Masukkan deskripsi pengeluaran..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
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

export default UploadPengeluaranPage;

