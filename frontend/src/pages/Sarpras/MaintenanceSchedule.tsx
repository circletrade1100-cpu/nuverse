import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  CalendarIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import sarprasService, { type MaintenanceSchedule, type InventoryItem } from '../../services/sarprasService';

interface MaintenanceFormData {
  item_id: number | null;
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  frequency?: string;
  next_maintenance: string;
  technician_id?: number;
  technician_name?: string;
  estimated_duration?: string;
  required_materials?: string;
  checklist?: string;
  notes?: string;
}

const MaintenanceSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<MaintenanceFormData>({
    item_id: null,
    maintenance_type: 'preventive',
    frequency: '',
    next_maintenance: '',
    technician_id: undefined,
    technician_name: '',
    estimated_duration: '',
    required_materials: '',
    checklist: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, itemsData] = await Promise.all([
        sarprasService.getMaintenanceSchedules(),
        sarprasService.getInventoryItems()
      ]);
      setSchedules(schedulesData);
      setItems(itemsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (!formData.item_id || !formData.next_maintenance) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      await sarprasService.createMaintenanceSchedule(formData);
      toast.success('Jadwal maintenance berhasil dibuat');
      setIsFormModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast.error(error.message || 'Gagal membuat jadwal');
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      if (!editingSchedule?.id || !formData.item_id || !formData.next_maintenance) {
        toast.error('Mohon lengkapi data yang wajib diisi');
        return;
      }

      // Update schedule via API (assuming updateMaintenanceSchedule exists)
      await sarprasService.updateMaintenanceSchedule(editingSchedule.id, formData);
      toast.success('Jadwal maintenance berhasil diupdate');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error(error.message || 'Gagal mengupdate jadwal');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal maintenance ini?')) {
      return;
    }

    try {
      // Delete schedule via API (assuming deleteMaintenanceSchedule exists)
      await sarprasService.deleteMaintenanceSchedule(scheduleId);
      toast.success('Jadwal maintenance berhasil dihapus');
      loadData();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error(error.message || 'Gagal menghapus jadwal');
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: null,
      maintenance_type: 'preventive',
      frequency: '',
      next_maintenance: '',
      technician_id: undefined,
      technician_name: '',
      estimated_duration: '',
      required_materials: '',
      checklist: '',
      notes: ''
    });
  };

  const openFormModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (schedule: MaintenanceSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      item_id: schedule.item_id,
      maintenance_type: schedule.maintenance_type,
      frequency: schedule.frequency || '',
      next_maintenance: schedule.next_maintenance,
      technician_id: schedule.technician_id,
      technician_name: schedule.technician?.name || '',
      estimated_duration: schedule.estimated_duration || '',
      required_materials: schedule.required_materials || '',
      checklist: schedule.checklist || '',
      notes: schedule.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setIsDetailModalOpen(true);
  };

  // Statistics
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === 'scheduled').length,
    in_progress: schedules.filter(s => s.status === 'in_progress').length,
    overdue: schedules.filter(s => s.status === 'overdue').length,
    completed: schedules.filter(s => s.status === 'completed').length,
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesType = typeFilter === 'all' || schedule.maintenance_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Status colors
  const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Terjadwal' },
    in_progress: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Sedang Dikerjakan' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Selesai' },
    overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Terlambat' },
  };

  // Type colors
  const typeColors: Record<string, { bg: string; text: string }> = {
    preventive: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    corrective: { bg: 'bg-amber-100', text: 'text-amber-700' },
    emergency: { bg: 'bg-red-100', text: 'text-red-700' },
    upgrade: { bg: 'bg-purple-100', text: 'text-purple-700' },
  };

  const typeLabels: Record<string, string> = {
    preventive: 'Preventif',
    corrective: 'Korektif',
    emergency: 'Darurat',
    upgrade: 'Upgrade',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600" />
            Jadwal Maintenance
          </h1>
          <p className="text-slate-600 mt-1">Kelola jadwal perawatan aset dan fasilitas</p>
        </div>
        <button
          onClick={openFormModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
        >
          <PlusIcon className="w-5 h-5" />
          Buat Jadwal Baru
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Jadwal</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Terjadwal</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Dalam Proses</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.in_progress}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl">
              <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Terlambat</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
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
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset, teknisi, tipe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">Semua Status</option>
              <option value="scheduled">Terjadwal</option>
              <option value="in_progress">Dalam Proses</option>
              <option value="overdue">Terlambat</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="preventive">Preventif</option>
              <option value="corrective">Korektif</option>
              <option value="emergency">Darurat</option>
              <option value="upgrade">Upgrade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Aset
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tipe Maintenance
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Jadwal Berikutnya
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Teknisi
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
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CalendarIcon className="w-16 h-16 mb-3" />
                      <p className="text-lg font-medium">Tidak ada jadwal maintenance</p>
                      <p className="text-sm">Belum ada jadwal yang dibuat atau tidak ada yang sesuai filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <CubeIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{schedule.item?.name || '-'}</p>
                          <p className="text-sm text-slate-500">{schedule.item?.item_code || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeColors[schedule.maintenance_type]?.bg} ${typeColors[schedule.maintenance_type]?.text}`}>
                        {typeLabels[schedule.maintenance_type] || schedule.maintenance_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-700">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{formatDate(schedule.next_maintenance)}</span>
                      </div>
                      {schedule.frequency && (
                        <p className="text-xs text-slate-500 mt-1">Frekuensi: {schedule.frequency}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">{schedule.technician?.name || 'Belum ditentukan'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[schedule.status]?.bg} ${statusColors[schedule.status]?.text} ${statusColors[schedule.status]?.border}`}>
                        {statusColors[schedule.status]?.label || schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(schedule)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                        >
                          Lihat
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                        >
                          Hapus
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

      {/* Create Form Modal - 2 Column Layout */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Buat Jadwal Maintenance</h2>
                <p className="text-purple-100 text-sm mt-1">Isi form untuk membuat jadwal baru</p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* 2 Column Layout */}
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
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
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

                  {/* Maintenance Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipe Maintenance <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="preventive">Preventif (Pencegahan)</option>
                      <option value="corrective">Korektif (Perbaikan)</option>
                      <option value="emergency">Darurat</option>
                      <option value="upgrade">Upgrade</option>
                    </select>
                  </div>

                  {/* Next Maintenance Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Jadwal Maintenance Berikutnya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.next_maintenance}
                      onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900"
                      required
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Frekuensi
                    </label>
                    <input
                      type="text"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="Contoh: Setiap 3 bulan, Bulanan, dll"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Technician */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Teknisi
                    </label>
                    <input
                      type="text"
                      value={formData.technician_name || ''}
                      onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                      placeholder="Nama teknisi yang bertugas (opsional)"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estimasi Durasi
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                      placeholder="Contoh: 2 jam, 1 hari, dll"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Required Materials */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Material yang Dibutuhkan
                    </label>
                    <textarea
                      value={formData.required_materials}
                      onChange={(e) => setFormData({ ...formData, required_materials: e.target.value })}
                      placeholder="Daftar material/bahan yang dibutuhkan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Checklist */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Checklist Maintenance
                    </label>
                    <textarea
                      value={formData.checklist}
                      onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
                      placeholder="Daftar checklist yang harus dikerjakan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan tambahan..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
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
                  onClick={handleCreateSchedule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 font-medium"
                >
                  Buat Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Edit Jadwal Maintenance</h2>
                <p className="text-green-100 text-sm mt-1">Edit jadwal maintenance yang sudah ada</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* 2 Column Layout */}
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
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
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

                  {/* Maintenance Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipe Maintenance <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                      required
                    >
                      <option value="preventive">Preventif (Pencegahan)</option>
                      <option value="corrective">Korektif (Perbaikan)</option>
                      <option value="emergency">Darurat</option>
                      <option value="upgrade">Upgrade</option>
                    </select>
                  </div>

                  {/* Next Maintenance Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Jadwal Maintenance Berikutnya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.next_maintenance}
                      onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
                      required
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Frekuensi
                    </label>
                    <input
                      type="text"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="Contoh: Setiap 3 bulan, Bulanan, dll"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Technician */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Teknisi
                    </label>
                    <input
                      type="text"
                      value={formData.technician_name || ''}
                      onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                      placeholder="Nama teknisi yang bertugas (opsional)"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estimasi Durasi
                    </label>
                    <input
                      type="text"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                      placeholder="Contoh: 2 jam, 1 hari, dll"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Required Materials */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Material yang Dibutuhkan
                    </label>
                    <textarea
                      value={formData.required_materials}
                      onChange={(e) => setFormData({ ...formData, required_materials: e.target.value })}
                      placeholder="Daftar material/bahan yang dibutuhkan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Checklist */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Checklist Maintenance
                    </label>
                    <textarea
                      value={formData.checklist}
                      onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
                      placeholder="Daftar checklist yang harus dikerjakan..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan tambahan..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                    />
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
                  onClick={handleUpdateSchedule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-500/30 font-medium"
                >
                  Update Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold">Detail Jadwal Maintenance</h2>
                <p className="text-purple-100 text-sm mt-1">Informasi lengkap jadwal maintenance</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${statusColors[selectedSchedule.status]?.bg} ${statusColors[selectedSchedule.status]?.text} ${statusColors[selectedSchedule.status]?.border}`}>
                  {statusColors[selectedSchedule.status]?.label || selectedSchedule.status}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${typeColors[selectedSchedule.maintenance_type]?.bg} ${typeColors[selectedSchedule.maintenance_type]?.text}`}>
                  {typeLabels[selectedSchedule.maintenance_type] || selectedSchedule.maintenance_type}
                </span>
              </div>

              {/* Asset Info */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <CubeIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-purple-700 font-medium">Aset yang Dimaintenance</p>
                    <p className="text-xl font-bold text-purple-900 mt-1">{selectedSchedule.item?.name || '-'}</p>
                    <p className="text-sm text-purple-600 mt-1">Kode: {selectedSchedule.item?.item_code || '-'}</p>
                    {selectedSchedule.item?.location && (
                      <p className="text-sm text-purple-600">Lokasi: {selectedSchedule.item.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Jadwal Berikutnya</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatDate(selectedSchedule.next_maintenance)}</p>
                </div>

                {selectedSchedule.last_maintenance && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Maintenance Terakhir</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{formatDate(selectedSchedule.last_maintenance)}</p>
                  </div>
                )}

                {selectedSchedule.frequency && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <ClockIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Frekuensi</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{selectedSchedule.frequency}</p>
                  </div>
                )}

                {selectedSchedule.estimated_duration && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                      <ClockIcon className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700">Estimasi Durasi</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{selectedSchedule.estimated_duration}</p>
                  </div>
                )}
              </div>

              {/* Technician */}
              {selectedSchedule.technician && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Teknisi</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{selectedSchedule.technician.name}</p>
                </div>
              )}

              {/* Materials */}
              {selectedSchedule.required_materials && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Material yang Dibutuhkan</p>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line">{selectedSchedule.required_materials}</p>
                </div>
              )}

              {/* Checklist */}
              {selectedSchedule.checklist && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Checklist</p>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line">{selectedSchedule.checklist}</p>
                </div>
              )}

              {/* Notes */}
              {selectedSchedule.notes && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-700">Catatan</p>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line">{selectedSchedule.notes}</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 font-medium"
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

export default MaintenanceSchedulePage;