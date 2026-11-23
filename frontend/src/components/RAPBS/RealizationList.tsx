import React, { useEffect, useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';
import { unitKerjaService } from '../../services/unitKerjaService';
import type { RAPBSRealization } from '../../types/rapbs';
import type { UnitKerja } from '../../types/masterData';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import RealizationDetailModal from './RealizationDetailModal';

interface RealizationListProps {
  onAdd: () => void;
  onEdit: (realization: RAPBSRealization) => void;
  refreshTrigger?: number;
}

const RealizationList: React.FC<RealizationListProps> = ({ onAdd, onEdit, refreshTrigger }) => {
  const { hasRole } = usePermission();
  const { user } = useAuth();
  
  // Cek apakah user bisa menambah realisasi (bukan Kepsek, Dirpen, atau Direktur)
  const canAddRealization = () => {
    if (!user) return false;
    
    // Cek role yang tidak boleh tambah realisasi
    const restrictedRoles = [
      'Kepsek RAPBS & Divisi Unit',
      'kepsek_rapbs_&_divisi_unit',
      'Kepsek_RAPBS_&_Divisi_Unit',
      'Direktur Pendidikan',
      'direktur_pendidikan',
      'Direktur_Pendidikan',
      'Dirpen',
      'dirpen',
      'DIRPEN',
      'Direktur Keuangan',
      'direktur_keuangan',
      'Direktur_Keuangan'
    ];
    
    // Cek apakah user punya role yang dilarang
    const hasRestrictedRole = user.roles?.some((r: any) => {
      const roleName = r.name?.toLowerCase() || '';
      return restrictedRoles.some(restricted => 
        roleName === restricted.toLowerCase() ||
        roleName.includes('kepsek') ||
        roleName.includes('dirpen') ||
        (roleName.includes('direktur') && roleName.includes('keuangan'))
      );
    });
    
    return !hasRestrictedRole;
  };
  const [realizations, setRealizations] = useState<RAPBSRealization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [unitKerjaFilter, setUnitKerjaFilter] = useState<string>('');
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRealization, setSelectedRealization] = useState<RAPBSRealization | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadUnitKerjaList();
  }, []);

  useEffect(() => {
    loadRealizations();
  }, [refreshTrigger, searchTerm, paymentMethodFilter, unitKerjaFilter, startDate, endDate, currentPage]);

  const loadUnitKerjaList = async () => {
    try {
      const response = await unitKerjaService.getAll({ status: 'Aktif', per_page: 100 });
      if (response.success) {
        setUnitKerjaList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading unit kerja:', error);
    }
  };

  const loadRealizations = async () => {
    try {
      setLoading(true);
      const response = await rapbsService.getRealizations({
        search: searchTerm,
        payment_method: paymentMethodFilter ? (paymentMethodFilter as 'cash' | 'transfer' | 'check') : undefined,
        unit_kerja_id: unitKerjaFilter ? (typeof unitKerjaFilter === 'string' ? parseInt(unitKerjaFilter) : unitKerjaFilter) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page: currentPage,
        per_page: 10,
      } as any);
      
      console.log('Realization response:', response);
      
      if (response.success && response.data) {
        const realizationsData = response.data.data || [];
        console.log('Loaded realizations:', realizationsData.length, realizationsData);
        // Debug: Log first realization to check structure
        if (realizationsData.length > 0) {
          const first = realizationsData[0];
          console.log('=== DEBUG REALIZATION ===');
          console.log('First realization:', first);
          console.log('First realization rapbsPlan:', first.rapbsPlan);
          console.log('First realization rapbs_plan:', first.rapbs_plan);
          console.log('First realization unitKerja:', first.rapbsPlan?.unitKerja);
          console.log('First realization unit_kerja:', first.rapbsPlan?.unit_kerja);
          console.log('First realization unitKerja nama:', first.rapbsPlan?.unitKerja?.nama);
          console.log('First realization unit_kerja nama:', first.rapbsPlan?.unit_kerja?.nama);
          console.log('First realization rapbs_plan unit_kerja:', first.rapbs_plan?.unit_kerja);
          console.log('First realization rapbs_plan unit_kerja nama:', first.rapbs_plan?.unit_kerja?.nama);
          console.log('=== END DEBUG ===');
        }
        setRealizations(realizationsData);
        setTotalPages(response.data.last_page || 1);
      } else {
        console.warn('Response success is false or data is missing:', response);
        setRealizations([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('Error loading realizations:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Gagal memuat data realisasi: ' + (error.response?.data?.message || error.message));
      setRealizations([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus realisasi ini?')) return;

    try {
      await rapbsService.deleteRealization(id);
      toast.success('Realisasi berhasil dihapus');
      loadRealizations();
    } catch (error) {
      console.error('Error deleting realization:', error);
      toast.error('Gagal menghapus realisasi');
    }
  };

  const handleView = async (realization: RAPBSRealization) => {
    // Load full realization details with all relationships
    try {
      const response = await rapbsService.getRealization(realization.id);
      if (response.success && response.data) {
        setSelectedRealization(response.data);
        setIsDetailModalOpen(true);
      } else {
        // Fallback to basic realization data
        setSelectedRealization(realization);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading realization details:', error);
      // Fallback to basic realization data
      setSelectedRealization(realization);
      setIsDetailModalOpen(true);
    }
  };

  const handleSubmit = async (id: number) => {
    if (!confirm('Ajukan realisasi ini untuk persetujuan?')) return;

    try {
      await rapbsService.submitRealization(id);
      toast.success('Realisasi berhasil diajukan');
      loadRealizations();
    } catch (error: any) {
      console.error('Error submitting realization:', error);
      const message = error.response?.data?.message || 'Gagal mengajukan realisasi';
      toast.error(message);
    }
  };

  // Multi-Level Approval Handlers (mengikuti alur Rencana RAPBS)
  const handleApproveByPrincipal = async (id: number) => {
    if (!confirm('Approve realisasi ini sebagai Kepala Sekolah?')) return;
    try {
      await rapbsService.approveRealizationByPrincipal(id);
      toast.success('Realisasi berhasil disetujui oleh Kepala Sekolah');
      loadRealizations();
    } catch (error: any) {
      console.error('Error approving by principal:', error);
      const message = error.response?.data?.message || 'Gagal approve realisasi';
      toast.error(message);
    }
  };

  const handleApproveByDirpen = async (id: number) => {
    if (!confirm('Approve realisasi ini sebagai Direktur Pendidikan (Dirpen)?')) return;
    try {
      await rapbsService.approveRealizationByDirpen(id);
      toast.success('Realisasi berhasil disetujui oleh Dirpen');
      loadRealizations();
    } catch (error: any) {
      console.error('Error approving by dirpen:', error);
      const message = error.response?.data?.message || 'Gagal approve realisasi';
      toast.error(message);
    }
  };

  const handleApproveByDirector = async (id: number) => {
    if (!confirm('Approve realisasi ini sebagai Direktur Keuangan (Final)? Anggaran akan dikurangi.')) return;
    try {
      await rapbsService.approveRealizationByDirector(id);
      toast.success('Realisasi berhasil disetujui oleh Direktur Keuangan');
      loadRealizations();
    } catch (error: any) {
      console.error('Error approving by director:', error);
      const message = error.response?.data?.message || 'Gagal approve realisasi';
      toast.error(message);
    }
  };

  // Multi-Level Rejection Handlers
  const handleRejectByPrincipal = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Kepala Sekolah:');
    if (!notes) return;
    try {
      await rapbsService.rejectRealizationByPrincipal(id, notes);
      toast.success('Realisasi ditolak oleh Kepala Sekolah');
      loadRealizations();
    } catch (error: any) {
      console.error('Error rejecting by principal:', error);
      const message = error.response?.data?.message || 'Gagal reject realisasi';
      toast.error(message);
    }
  };

  const handleRejectByDirpen = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Direktur Pendidikan (Dirpen):');
    if (!notes) return;
    try {
      await rapbsService.rejectRealizationByDirpen(id, notes);
      toast.success('Realisasi ditolak oleh Dirpen');
      loadRealizations();
    } catch (error: any) {
      console.error('Error rejecting by dirpen:', error);
      const message = error.response?.data?.message || 'Gagal reject realisasi';
      toast.error(message);
    }
  };

  const handleRejectByDirector = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Direktur Keuangan:');
    if (!notes) return;
    try {
      await rapbsService.rejectRealizationByDirector(id, notes);
      toast.success('Realisasi ditolak oleh Direktur Keuangan');
      loadRealizations();
    } catch (error: any) {
      console.error('Error rejecting by director:', error);
      const message = error.response?.data?.message || 'Gagal reject realisasi';
      toast.error(message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Cek apakah data baru (dibuat dalam 7 hari terakhir)
  const isNewData = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'Tunai',
      transfer: 'Transfer',
      check: 'Cek',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-700 border border-slate-200',
      submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
      approved_by_principal: 'bg-orange-50 text-orange-700 border border-orange-200',
      approved_by_dirpen: 'bg-purple-50 text-purple-700 border border-purple-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected_by_principal: 'bg-red-50 text-red-700 border border-red-200',
      rejected_by_dirpen: 'bg-red-50 text-red-700 border border-red-200',
      rejected_by_director: 'bg-red-100 text-red-800 border border-red-300',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      submitted: 'Diajukan',
      approved_by_principal: 'Disetujui Kepala Sekolah',
      approved_by_dirpen: 'Disetujui Dirpen',
      approved: 'Disetujui (Final)',
      rejected_by_principal: 'Ditolak Kepala Sekolah',
      rejected_by_dirpen: 'Ditolak Dirpen',
      rejected_by_director: 'Ditolak Direktur',
      rejected: 'Ditolak',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Helper untuk cek apakah user bisa approve sebagai Principal (Level 1)
  const canApproveByPrincipal = (realization: RAPBSRealization): boolean => {
    if (realization.status !== 'submitted') {
      return false;
    }
    
    // Cek role dengan berbagai format
    const hasPrincipalRole = hasRole('Kepala Sekolah') || 
                            hasRole('kepala_sekolah') || 
                            hasRole('Kepala_Sekolah') ||
                            hasRole('kepsek_rapbs_&_divisi_unit') ||
                            hasRole('Kepsek_RAPBS_&_Divisi_Unit') ||
                            user?.roles?.some((r: any) => 
                              r.name?.toLowerCase().includes('kepala') && 
                              r.name?.toLowerCase().includes('sekolah')
                            ) ||
                            user?.roles?.some((r: any) => 
                              r.name?.toLowerCase().includes('kepsek')
                            );
    
    if (!hasPrincipalRole) {
      return false;
    }
    
    const userUnitKerja = user?.profile?.unit_kerja;
    const planUnitKerja = realization.rapbsPlan?.unitKerja?.nama || 
                         realization.rapbsPlan?.unit_kerja?.nama ||
                         (realization.rapbsPlan as any)?.unit_kerja_id;
    
    // Jika plan tidak punya unit_kerja atau user tidak punya unit_kerja, allow (untuk fleksibilitas)
    if (!userUnitKerja || !planUnitKerja) {
      return true;
    }
    
    return userUnitKerja === planUnitKerja || userUnitKerja === String(planUnitKerja);
  };

  // Helper untuk cek apakah user bisa approve sebagai Dirpen (Level 2)
  const canApproveByDirpen = (realization: RAPBSRealization): boolean => {
    if (realization.status !== 'approved_by_principal') {
      return false;
    }
    
    // Cek role dengan berbagai format
    const hasDirpenRole = hasRole('Direktur Pendidikan') ||
                          hasRole('direktur_pendidikan') ||
                          hasRole('Direktur_Pendidikan') ||
                          hasRole('Dirpen') ||
                          hasRole('dirpen') ||
                          hasRole('DIRPEN') ||
                          user?.roles?.some((r: any) => 
                            r.name?.toLowerCase().includes('dirpen')
                          );
    
    return !!hasDirpenRole;
    // Tidak perlu cek unit kerja (bisa global)
  };

  // Helper untuk cek apakah user bisa approve sebagai Director (Level 3 - Final)
  const canApproveByDirector = (realization: RAPBSRealization): boolean => {
    if (realization.status !== 'approved_by_dirpen') {
      return false;
    }
    
    // Cek role dengan berbagai format
    const hasDirectorRole = hasRole('Direktur Keuangan') || 
                           hasRole('direktur_keuangan') ||
                           hasRole('Direktur_Keuangan') ||
                           hasRole('DIREKTUR_KEUANGAN') ||
                           user?.roles?.some((r: any) => 
                             r.name?.toLowerCase().includes('direktur') && 
                             r.name?.toLowerCase().includes('keuangan')
                           );
    
    return !!hasDirectorRole || false;
  };


  return (
    <div className="space-y-6">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Realisasi Anggaran</h2>
              <p className="text-blue-100 mt-1 text-sm lg:text-base">Kelola realisasi penggunaan anggaran dengan efisien</p>
            </div>
          </div>
          {canAddRealization() && (
            <button
              onClick={onAdd}
              className="flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tambah Realisasi
            </button>
          )}
        </div>
      </div>

      {/* Modern Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari realisasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white text-gray-900"
            />
          </div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          >
            <option value="">Semua Metode Pembayaran</option>
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="check">Cek</option>
          </select>
          <select
            value={unitKerjaFilter}
            onChange={(e) => setUnitKerjaFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          >
            <option value="">Semua Unit Kerja</option>
            {unitKerjaList.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.nama}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Dari Tanggal"
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Sampai Tanggal"
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          />
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat data realisasi...</p>
          </div>
        ) : realizations.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Tidak ada realisasi ditemukan</p>
            <p className="text-gray-500 mb-6">Tambah realisasi baru untuk memulai mengelola anggaran sekolah</p>
            {canAddRealization() && (
              <button
                onClick={onAdd}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-semibold"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Tambah Realisasi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Unit Kerja
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Metode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {realizations.map((realization) => (
                  <tr key={realization.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatDate(realization.transaction_date)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {realization.reference_number}
                          </div>
                        </div>
                        {realization.created_at && (
                          <div className="flex-shrink-0">
                            {isNewData(realization.created_at) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Baru
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                Sudah Lama
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(realization as any).rapbs_plan?.unit_kerja?.nama || 
                         (realization.rapbsPlan as any)?.unit_kerja?.nama || 
                         (realization.rapbsPlan as any)?.unitKerja?.nama ||
                         (realization as any).rapbs_plan?.unitKerja?.nama ||
                         '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-gray-900">{realization.description}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{realization.vendor_name || '-'}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(realization.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm bg-blue-50 text-blue-700 border border-blue-200">
                        {getPaymentMethodLabel(realization.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(realization.status || 'pending')}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {realization.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onEdit(realization)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(realization.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleSubmit(realization.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Ajukan untuk Approval"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 1: Principal Approval */}
                        {realization.status === 'submitted' && canApproveByPrincipal(realization) && (
                          <>
                            <button
                              onClick={() => handleApproveByPrincipal(realization.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Kepala Sekolah"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByPrincipal(realization.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Kepala Sekolah"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 2: Dirpen Approval */}
                        {realization.status === 'approved_by_principal' && canApproveByDirpen(realization) && (
                          <>
                            <button
                              onClick={() => handleApproveByDirpen(realization.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Dirpen"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByDirpen(realization.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Dirpen"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 3: Director Approval (Final) */}
                        {realization.status === 'approved_by_dirpen' && canApproveByDirector(realization) && (
                          <>
                            <button
                              onClick={() => handleApproveByDirector(realization.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Direktur Keuangan (Final)"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByDirector(realization.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Direktur Keuangan"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleView(realization)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="Dokumen"
                        >
                          <DocumentCheckIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && realizations.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
            <div className="text-sm font-medium text-gray-700">
              Menampilkan <span className="font-bold text-gray-900">{realizations.length}</span> dari <span className="font-bold text-gray-900">{totalPages}</span> halaman
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Sebelumnya
              </button>
              <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
              >
                Selanjutnya
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedRealization && (
          <RealizationDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedRealization(null);
            }}
            realization={selectedRealization}
          />
        )}
      </div>
    </div>
  );
};

export default RealizationList;

