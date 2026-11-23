import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import sarprasService, { type AuditLog, type InventoryItem } from '../../services/sarprasService';

const Audit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [editingAudit, setEditingAudit] = useState<AuditLog | null>(null);
  
  const [formData, setFormData] = useState({
    item_id: undefined as number | undefined,
    audit_date: new Date().toISOString().split('T')[0],
    auditor_id: 1,
    condition_before: 'baik' as 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi',
    condition_after: 'baik' as 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tidak_berfungsi',
    status_before: 'aktif' as 'aktif' | 'maintenance' | 'penghapusan',
    status_after: 'aktif' as 'aktif' | 'maintenance' | 'penghapusan',
    findings: '',
    recommendations: '',
    action_taken: '',
    estimated_repair_cost: 0,
    audit_type: 'routine' as 'routine' | 'special' | 'emergency',
    location_verified: '',
    audit_images: [] as File[]
  });

  // Statistics
  const [stats, setStats] = useState({
    totalAudits: 0,
    thisMonthAudits: 0,
    problematicAssets: 0,
    overdueAudits: 0
  });

  useEffect(() => {
    loadData();
    loadInventoryItems();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.item_id = parseInt(searchTerm);
      if (selectedType) params.audit_type = selectedType;
      if (selectedAuditor) params.auditor_id = selectedAuditor;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await sarprasService.getAuditLogs(params);
      setAuditLogs(response.data);

      // Calculate statistics
      const totalAudits = response.data.length;
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisMonthAudits = response.data
        .filter(log => log.audit_date.startsWith(thisMonth))
        .length;
      const problematicAssets = response.data
        .filter(log => log.condition_after === 'rusak_berat' || log.condition_after === 'tidak_berfungsi')
        .length;
      
      setStats({
        totalAudits,
        thisMonthAudits,
        problematicAssets,
        overdueAudits: 0 // TODO: Implement overdue calculation
      });
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast.error('Gagal memuat data audit');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const response = await sarprasService.getInventoryItems();
      setInventoryItems(response);
    } catch (error: any) {
      console.error('Error loading inventory items:', error);
    }
  };

  const handleCreateAudit = async () => {
    try {
      if (!formData.item_id) {
        toast.error('Mohon pilih asset');
        return;
      }

      const { audit_images, ...auditData } = formData;
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(auditData).forEach(key => {
        if (key !== 'audit_images') {
          formDataToSend.append(key, auditData[key as keyof typeof auditData] as string);
        }
      });
      
      // Append images if any
      if (audit_images && audit_images.length > 0) {
        console.log('Appending images to FormData:', audit_images.length, 'files');
        audit_images.forEach((image, index) => {
          console.log(`Appending image ${index}:`, image.name, image.size);
          formDataToSend.append('audit_images[]', image);
        });
      } else {
        console.log('No images to append');
      }

      console.log('FormData contents:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      if (editingAudit) {
        // Update existing audit
        await sarprasService.updateAuditLog(editingAudit.id, formDataToSend);
        toast.success('Audit berhasil diperbarui');
      } else {
        // Create new audit
        await sarprasService.createAuditLog(formDataToSend);
        toast.success('Audit berhasil dibuat');
      }
      
      setIsFormModalOpen(false);
      resetForm();
      setEditingAudit(null);
      loadData();
    } catch (error: any) {
      console.error('Error creating audit log:', error);
      toast.error(error.message || 'Gagal membuat audit');
    }
  };

  const handleDeleteAudit = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus audit ini?')) {
      try {
        await sarprasService.deleteAuditLog(id);
        toast.success('Audit berhasil dihapus');
        loadData();
      } catch (error: any) {
        console.error('Error deleting audit log:', error);
        toast.error('Gagal menghapus audit');
      }
    }
  };

  const openDetailModal = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleEditAudit = (log: AuditLog) => {
    setEditingAudit(log);
    setFormData({
      item_id: log.item_id,
      audit_date: log.audit_date,
      auditor_id: log.auditor_id,
      condition_before: log.condition_before,
      condition_after: log.condition_after,
      status_before: log.status_before,
      status_after: log.status_after,
      findings: log.findings || '',
      recommendations: log.recommendations || '',
      action_taken: log.action_taken || '',
      estimated_repair_cost: log.estimated_repair_cost || 0,
      audit_type: log.audit_type,
      location_verified: log.location_verified || '',
      audit_images: []
    });
    setIsFormModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      item_id: undefined,
      audit_date: new Date().toISOString().split('T')[0],
      auditor_id: 1,
      condition_before: 'baik',
      condition_after: 'baik',
      status_before: 'aktif',
      status_after: 'aktif',
      findings: '',
      recommendations: '',
      action_taken: '',
      estimated_repair_cost: 0,
      audit_type: 'routine',
      location_verified: '',
      audit_images: []
    });
    setEditingAudit(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getConditionLabel = (condition: string) => {
    const conditions = {
      baik: 'Baik',
      rusak_ringan: 'Rusak Ringan',
      rusak_berat: 'Rusak Berat',
      tidak_berfungsi: 'Tidak Berfungsi'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      aktif: 'Aktif',
      maintenance: 'Maintenance',
      penghapusan: 'Penghapusan'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getTypeLabel = (type: string) => {
    const types = {
      routine: 'Rutin',
      special: 'Khusus',
      emergency: 'Darurat'
    };
    return types[type as keyof typeof types] || type;
  };

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'baik': return 'bg-green-100 text-green-800';
      case 'rusak_ringan': return 'bg-yellow-100 text-yellow-800';
      case 'rusak_berat': return 'bg-orange-100 text-orange-800';
      case 'tidak_berfungsi': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'penghapusan': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Barang</h1>
        <p className="text-gray-600">Kelola audit dan verifikasi aset inventaris</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audit</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAudits}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonthAudits}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Asset Bermasalah</p>
              <p className="text-2xl font-bold text-gray-900">{stats.problematicAssets}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueAudits}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari asset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Tipe</option>
              <option value="routine">Rutin</option>
              <option value="special">Khusus</option>
              <option value="emergency">Darurat</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tanggal Mulai"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tanggal Akhir"
            />

            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              Filter
            </button>
          </div>

          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Buat Audit
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Asset</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Auditor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipe</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kondisi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Biaya Perbaikan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : auditLogs && auditLogs.length > 0 ? auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.audit_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.item?.name}</div>
                      <div className="text-sm text-gray-500">{log.item?.item_code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.auditor?.name || 'Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(log.audit_type)}`}>
                      {getTypeLabel(log.audit_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionBadgeColor(log.condition_before)}`}>
                        {getConditionLabel(log.condition_before)}
                      </span>
                      <div className="text-xs text-gray-500">→</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionBadgeColor(log.condition_after)}`}>
                        {getConditionLabel(log.condition_after)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(log.status_before)}`}>
                        {getStatusLabel(log.status_before)}
                      </span>
                      <div className="text-xs text-gray-500">→</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(log.status_after)}`}>
                        {getStatusLabel(log.status_after)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.estimated_repair_cost ? formatCurrency(log.estimated_repair_cost) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal(log)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                      >
                        Lihat
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleEditAudit(log)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDeleteAudit(log.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data audit
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAudit ? 'Edit Audit Barang' : 'Buat Audit Barang'}
              </h2>
              <p className="text-gray-600 mt-1">
                {editingAudit ? 'Perbarui hasil audit dan verifikasi aset' : 'Catat hasil audit dan verifikasi aset'}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Asset *
                    </label>
                    <select
                      value={formData.item_id || ''}
                      onChange={(e) => setFormData({ ...formData, item_id: parseInt(e.target.value) || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      required
                    >
                      <option value="">Pilih asset...</option>
                      {inventoryItems && inventoryItems.length > 0 ? inventoryItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_code} - {item.name}
                        </option>
                      )) : (
                        <option value="" disabled>Tidak ada data asset</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Audit *
                    </label>
                    <input
                      type="date"
                      value={formData.audit_date}
                      onChange={(e) => setFormData({ ...formData, audit_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipe Audit *
                    </label>
                    <select
                      value={formData.audit_type}
                      onChange={(e) => setFormData({ ...formData, audit_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="routine">Rutin</option>
                      <option value="special">Khusus</option>
                      <option value="emergency">Darurat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lokasi Terverifikasi
                    </label>
                    <input
                      type="text"
                      value={formData.location_verified}
                      onChange={(e) => setFormData({ ...formData, location_verified: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      placeholder="Lokasi saat audit dilakukan"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kondisi Sebelum
                      </label>
                      <select
                        value={formData.condition_before}
                        onChange={(e) => setFormData({ ...formData, condition_before: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="baik">Baik</option>
                        <option value="rusak_ringan">Rusak Ringan</option>
                        <option value="rusak_berat">Rusak Berat</option>
                        <option value="tidak_berfungsi">Tidak Berfungsi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kondisi Sesudah
                      </label>
                      <select
                        value={formData.condition_after}
                        onChange={(e) => setFormData({ ...formData, condition_after: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="baik">Baik</option>
                        <option value="rusak_ringan">Rusak Ringan</option>
                        <option value="rusak_berat">Rusak Berat</option>
                        <option value="tidak_berfungsi">Tidak Berfungsi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Sebelum
                      </label>
                      <select
                        value={formData.status_before}
                        onChange={(e) => setFormData({ ...formData, status_before: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="penghapusan">Penghapusan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Sesudah
                      </label>
                      <select
                        value={formData.status_after}
                        onChange={(e) => setFormData({ ...formData, status_after: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="penghapusan">Penghapusan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimasi Biaya Perbaikan
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_repair_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_repair_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Full Width Fields */}
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Gambar Audit
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormData({ ...formData, audit_images: files });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                  />
                  <p className="text-sm text-gray-500 mt-1">Pilih beberapa gambar untuk dokumentasi audit</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temuan
                  </label>
                  <textarea
                    value={formData.findings}
                    onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="Temuan saat audit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rekomendasi
                  </label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="Rekomendasi perbaikan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tindakan yang Diambil
                  </label>
                  <textarea
                    value={formData.action_taken}
                    onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
                    placeholder="Tindakan yang telah diambil..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateAudit}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {editingAudit ? 'Perbarui Audit' : 'Buat Audit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detail Audit Barang</h2>
              <p className="text-gray-600 mt-1">Informasi lengkap audit aset</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Item Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Asset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Nama Asset</p>
                    <p className="text-base font-semibold text-gray-900 break-words">{selectedLog.item?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Kode Asset</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.item?.item_code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Harga Beli</p>
                    <p className="text-base font-semibold text-gray-900">{formatCurrency(selectedLog.item?.purchase_price || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Lokasi</p>
                    <p className="text-base font-semibold text-gray-900 break-words">{selectedLog.item?.location}</p>
                  </div>
                </div>
              </div>

              {/* Audit Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Audit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tanggal Audit</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(selectedLog.audit_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Auditor</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.auditor?.name || 'Admin'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Tipe Audit</p>
                    <p className="text-base font-semibold text-gray-900">{getTypeLabel(selectedLog.audit_type)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Lokasi Terverifikasi</p>
                    <p className="text-base font-semibold text-gray-900">{selectedLog.location_verified || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Condition & Status Changes */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perubahan Kondisi & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Kondisi</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getConditionBadgeColor(selectedLog.condition_before)}`}>
                        {getConditionLabel(selectedLog.condition_before)}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getConditionBadgeColor(selectedLog.condition_after)}`}>
                        {getConditionLabel(selectedLog.condition_after)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(selectedLog.status_before)}`}>
                        {getStatusLabel(selectedLog.status_before)}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(selectedLog.status_after)}`}>
                        {getStatusLabel(selectedLog.status_after)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Findings & Recommendations */}
              {selectedLog.findings && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Temuan</h3>
                  <div className="space-y-1">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLog.findings}</p>
                  </div>
                </div>
              )}

              {selectedLog.recommendations && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekomendasi</h3>
                  <div className="space-y-1">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLog.recommendations}</p>
                  </div>
                </div>
              )}

              {selectedLog.action_taken && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tindakan yang Diambil</h3>
                  <div className="space-y-1">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedLog.action_taken}</p>
                  </div>
                </div>
              )}

              {/* Estimated Repair Cost */}
              {selectedLog.estimated_repair_cost && selectedLog.estimated_repair_cost > 0 && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimasi Biaya Perbaikan</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedLog.estimated_repair_cost)}</p>
                  </div>
                </div>
              )}

              {/* Audit Photos */}
              {selectedLog.photos && selectedLog.photos.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto Audit</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedLog.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Audit photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => window.open(photo, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-opacity duration-200"
                          >
                            Lihat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
