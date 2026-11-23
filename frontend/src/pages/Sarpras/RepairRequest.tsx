import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CubeIcon,
  BanknotesIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import sarprasService, { type RepairRequest, type InventoryItem } from '../../services/sarprasService';

interface RepairFormData {
  item_id?: number;
  request_date: string;
  problem_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  notes?: string;
  images?: File[];
}

interface RealizationFormData {
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  start_date?: string;
  completion_date?: string;
  actual_cost?: number;
  notes?: string;
}

const RepairRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRealizationModalOpen, setIsRealizationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<RepairFormData>({
    item_id: undefined,
    request_date: new Date().toISOString().split('T')[0],
    problem_description: '',
    priority: 'medium',
    estimated_cost: undefined,
    notes: '',
    images: []
  });

  const [realizationData, setRealizationData] = useState<RealizationFormData>({
    status: 'pending',
    start_date: '',
    completion_date: '',
    actual_cost: undefined,
    notes: ''
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, itemsData] = await Promise.all([
        sarprasService.getRepairRequests(),
        sarprasService.getInventoryItems()
      ]);
      setRequests(requestsData);
      setItems(itemsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      if (!formData.item_id || !formData.problem_description) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      const { images, ...requestData } = formData;
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('item_id', requestData.item_id!.toString());
      formDataToSend.append('requester_id', '1'); // TODO: Get from auth
      formDataToSend.append('request_date', requestData.request_date);
      formDataToSend.append('problem_description', requestData.problem_description);
      formDataToSend.append('priority', requestData.priority);
      if (requestData.estimated_cost) {
        formDataToSend.append('estimated_cost', requestData.estimated_cost.toString());
      }
      if (requestData.notes) {
        formDataToSend.append('notes', requestData.notes);
      }
      
      // Append images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append('images[]', image);
        });
      }

      await sarprasService.createRepairRequestWithFiles(formDataToSend);
      toast.success('Pengajuan perbaikan berhasil dibuat');
      setIsFormModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Gagal membuat pengajuan');
    }
  };

  const handleUpdateRequest = async () => {
    try {
      if (!selectedRequest?.id || !formData.item_id || !formData.problem_description) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      const { images, ...requestData } = formData;
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('_method', 'PUT');
      formDataToSend.append('item_id', requestData.item_id!.toString());
      formDataToSend.append('requester_id', '1'); // TODO: Get from auth
      formDataToSend.append('request_date', requestData.request_date);
      formDataToSend.append('problem_description', requestData.problem_description);
      formDataToSend.append('priority', requestData.priority);
      if (requestData.estimated_cost) {
        formDataToSend.append('estimated_cost', requestData.estimated_cost.toString());
      }
      if (requestData.notes) {
        formDataToSend.append('notes', requestData.notes);
      }
      
      // Append images
      if (images && images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append('images[]', image);
        });
      }

      await sarprasService.updateRepairRequestWithFiles(selectedRequest.id, formDataToSend);
      toast.success('Pengajuan perbaikan berhasil diupdate');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast.error(error.message || 'Gagal mengupdate pengajuan');
    }
  };

  const handleUpdateRealization = async () => {
    try {
      if (!selectedRequest?.id) return;

      await sarprasService.updateRepairRequestStatus(selectedRequest.id, realizationData);
      toast.success('Realisasi berhasil diupdate');
      setIsRealizationModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error updating realization:', error);
      toast.error(error.message || 'Gagal update realisasi');
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: undefined,
      request_date: new Date().toISOString().split('T')[0],
      problem_description: '',
      priority: 'medium',
      estimated_cost: undefined,
      notes: '',
      images: []
    });
    setImagePreviews([]);
  };

  const openFormModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openRealizationModal = (request: RepairRequest) => {
    setSelectedRequest(request);
    setRealizationData({
      status: request.status,
      start_date: request.start_date || '',
      completion_date: request.completion_date || '',
      actual_cost: request.actual_cost || undefined,
      notes: request.notes || ''
    });
    setIsRealizationModalOpen(true);
  };

  const openDetailModal = (request: RepairRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (request: RepairRequest) => {
    setSelectedRequest(request);
    setFormData({
      item_id: request.item_id,
      request_date: request.request_date ? new Date(request.request_date).toISOString().split('T')[0] : '',
      problem_description: request.problem_description || '',
      priority: request.priority,
      estimated_cost: request.estimated_cost || undefined,
      notes: request.notes || '',
      images: []
    });
    setImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
      try {
        await sarprasService.deleteRepairRequest(id);
        toast.success('Pengajuan berhasil dihapus');
        loadData();
      } catch (error: any) {
        console.error('Error deleting request:', error);
        toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...(formData.images || []), ...files];
    setFormData({ ...formData, images: newImages });

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images?.filter((_, i) => i !== index) || [];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    urgent: requests.filter(r => r.priority === 'urgent').length,
  };

  // Filtered requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.problem_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Status colors
  const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Menunggu' },
    approved: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Disetujui' },
    in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Dikerjakan' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Selesai' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Ditolak' },
  };

  // Priority colors
  const priorityColors: Record<string, { bg: string; text: string }> = {
    low: { bg: 'bg-slate-100', text: 'text-slate-700' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  const priorityLabels: Record<string, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    urgent: 'Mendesak',
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-8 h-8 text-orange-600" />
            Pengajuan & Realisasi Perbaikan
          </h1>
          <p className="text-slate-600 mt-1">Kelola pengajuan dan realisasi perbaikan aset</p>
        </div>
        <button
          onClick={openFormModal}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
        >
          <PlusIcon className="w-5 h-5" />
          Buat Pengajuan Baru
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Pengajuan</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
              <DocumentTextIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Menunggu</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Dikerjakan</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.in_progress}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
              <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Selesai</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Mendesak</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.urgent}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset, masalah, pelapor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="in_progress">Dikerjakan</option>
              <option value="completed">Selesai</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              <option value="all">Semua Prioritas</option>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
              <option value="urgent">Mendesak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Aset
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Masalah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Estimasi Biaya
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <DocumentTextIcon className="w-16 h-16 mb-3" />
                      <p className="text-lg font-medium">Tidak ada pengajuan perbaikan</p>
                      <p className="text-sm">Belum ada pengajuan atau tidak ada yang sesuai filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <CubeIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{request.item?.name || '-'}</p>
                          <p className="text-sm text-slate-500">{request.item?.item_code || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 line-clamp-2 max-w-xs">{request.problem_description}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(request.request_date)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityColors[request.priority]?.bg} ${priorityColors[request.priority]?.text}`}>
                        {priorityLabels[request.priority] || request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-700">
                        <BanknotesIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{formatCurrency(request.estimated_cost)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[request.status]?.bg} ${statusColors[request.status]?.text} ${statusColors[request.status]?.border}`}>
                        {statusColors[request.status]?.label || request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                        >
                          Lihat
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => openEditModal(request)}
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                        >
                          Hapus
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => openRealizationModal(request)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                        >
                          Realisasi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Buat Pengajuan Perbaikan</h2>
                <p className="text-orange-100 text-sm mt-1">Ajukan perbaikan untuk aset yang rusak</p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Item Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pilih Aset <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.item_id || ''}
                      onChange={(e) => setFormData({ ...formData, item_id: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="">-- Pilih Aset --</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.item_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Request Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tanggal Pengajuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.request_date}
                      onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Prioritas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                      <option value="urgent">Mendesak</option>
                    </select>
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estimasi Biaya
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_cost || ''}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Problem Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Deskripsi Masalah <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.problem_description}
                      onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                      placeholder="Jelaskan masalah/kerusakan yang terjadi..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Catatan Tambahan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan atau informasi tambahan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Upload Gambar Perbaikan
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <PhotoIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">Klik untuk upload gambar</p>
                        <p className="text-xs text-slate-500">JPG, PNG, GIF (max 5MB per file)</p>
                      </label>
                    </div>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 font-medium"
                >
                  Ajukan Perbaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Edit Pengajuan Perbaikan</h2>
                <p className="text-orange-100 text-sm mt-1">Edit pengajuan perbaikan yang sudah dibuat</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  {/* Item Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pilih Aset <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.item_id || ''}
                      onChange={(e) => setFormData({ ...formData, item_id: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="">-- Pilih Aset --</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.item_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Request Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tanggal Pengajuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.request_date}
                      onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Prioritas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="low">Rendah</option>
                      <option value="medium">Sedang</option>
                      <option value="high">Tinggi</option>
                      <option value="urgent">Mendesak</option>
                    </select>
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estimasi Biaya
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_cost || ''}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Problem Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Deskripsi Masalah <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.problem_description}
                      onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                      placeholder="Jelaskan masalah/kerusakan yang terjadi..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Catatan Tambahan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan atau informasi tambahan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Upload Gambar Perbaikan
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label htmlFor="edit-image-upload" className="cursor-pointer">
                        <PhotoIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">Klik untuk upload gambar</p>
                        <p className="text-xs text-slate-500">JPG, PNG, GIF (max 5MB per file)</p>
                      </label>
                    </div>
                    
                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateRequest}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 font-medium"
                >
                  Update Pengajuan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Realization Modal */}
      {isRealizationModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Realisasi Perbaikan</h2>
                <p className="text-green-100 text-sm mt-1">Update status dan realisasi perbaikan</p>
              </div>
              <button
                onClick={() => setIsRealizationModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Asset Info */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-sm text-green-700 font-medium">Aset</p>
                <p className="text-lg font-bold text-green-900 mt-1">{selectedRequest.item?.name}</p>
                <p className="text-sm text-green-600">Masalah: {selectedRequest.problem_description}</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={realizationData.status}
                  onChange={(e) => setRealizationData({ ...realizationData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                >
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="in_progress">Dikerjakan</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={realizationData.start_date}
                  onChange={(e) => setRealizationData({ ...realizationData, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                />
              </div>

              {/* Completion Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={realizationData.completion_date}
                  onChange={(e) => setRealizationData({ ...realizationData, completion_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                />
              </div>

              {/* Actual Cost */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Biaya Aktual
                </label>
                <input
                  type="number"
                  value={realizationData.actual_cost || ''}
                  onChange={(e) => setRealizationData({ ...realizationData, actual_cost: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Estimasi: {formatCurrency(selectedRequest.estimated_cost)}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Catatan Realisasi
                </label>
                <textarea
                  value={realizationData.notes}
                  onChange={(e) => setRealizationData({ ...realizationData, notes: e.target.value })}
                  placeholder="Catatan hasil perbaikan..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsRealizationModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateRealization}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 font-medium"
                >
                  Simpan Realisasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Detail Pengajuan Perbaikan</h2>
                <p className="text-orange-100 text-sm mt-1">Informasi lengkap pengajuan</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Priority Badges */}
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${statusColors[selectedRequest.status]?.bg} ${statusColors[selectedRequest.status]?.text} ${statusColors[selectedRequest.status]?.border}`}>
                  {statusColors[selectedRequest.status]?.label || selectedRequest.status}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${priorityColors[selectedRequest.priority]?.bg} ${priorityColors[selectedRequest.priority]?.text}`}>
                  {priorityLabels[selectedRequest.priority] || selectedRequest.priority}
                </span>
              </div>

              {/* Asset Info */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <CubeIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-orange-700 font-medium">Aset yang Diperbaiki</p>
                    <p className="text-xl font-bold text-orange-900 mt-1">{selectedRequest.item?.name || '-'}</p>
                    <p className="text-sm text-orange-600 mt-1">Kode: {selectedRequest.item?.item_code || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700">Deskripsi Masalah</p>
                </div>
                <p className="text-slate-700">{selectedRequest.problem_description}</p>
              </div>

              {/* Dates & Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Tanggal Pengajuan</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatDate(selectedRequest.request_date)}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <BanknotesIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Estimasi Biaya</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedRequest.estimated_cost)}</p>
                </div>

                {selectedRequest.start_date && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <ClockIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Tanggal Mulai</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatDate(selectedRequest.start_date)}</p>
                  </div>
                )}

                {selectedRequest.completion_date && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Tanggal Selesai</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatDate(selectedRequest.completion_date)}</p>
                  </div>
                )}

                {selectedRequest.actual_cost && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <BanknotesIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Biaya Aktual</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedRequest.actual_cost)}</p>
                  </div>
                )}
              </div>

              {/* Requester & Technician */}
              {selectedRequest.requester && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Pelapor</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{selectedRequest.requester.name}</p>
                </div>
              )}

              {selectedRequest.technician && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Teknisi</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{selectedRequest.technician.name}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Catatan</p>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <PhotoIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Gambar Perbaikan</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedRequest.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.image_url}
                          alt={`Gambar perbaikan ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(image.image_url, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white bg-opacity-90 rounded-full p-2">
                              <PhotoIcon className="w-4 h-4 text-slate-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg shadow-orange-500/30 font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairRequestPage;

