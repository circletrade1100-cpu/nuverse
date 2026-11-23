import React, { useEffect, useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { rapbsService } from '../../services/rapbsService';
import type { RAPBSPlan } from '../../types/rapbs';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import { unitKerjaService } from '../../services/unitKerjaService';
import type { UnitKerja } from '../../types/masterData';
import RAPBSPlanDetailModal from './RAPBSPlanDetailModal';

interface RAPBSPlanListProps {
  onAdd: () => void;
  onEdit: (plan: RAPBSPlan) => void;
  onView: (plan: RAPBSPlan) => void;
  refreshTrigger?: number;
}

const RAPBSPlanList: React.FC<RAPBSPlanListProps> = ({ onAdd, onEdit, onView, refreshTrigger }) => {
  const { isSuperAdmin, hasRole } = usePermission();
  const { user } = useAuth();
  const [plans, setPlans] = useState<RAPBSPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [unitKerjaFilter, setUnitKerjaFilter] = useState<string>('');
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<RAPBSPlan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadUnitKerjaList();
  }, []);

  useEffect(() => {
    loadPlans();
  }, [refreshTrigger, searchTerm, statusFilter, priorityFilter, unitKerjaFilter, currentPage]);

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

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await rapbsService.getPlans({
        search: searchTerm,
        status: statusFilter || undefined as any,
        priority: priorityFilter || undefined as any,
        unit_kerja_id: unitKerjaFilter ? parseInt(unitKerjaFilter) : undefined,
        page: currentPage,
        per_page: 10,
      } as any);
      
      if (response.success && response.data) {
        setPlans(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (plan: RAPBSPlan) => {
    // Load full plan details with all relationships
    try {
      const response = await rapbsService.getPlan(plan.id);
      if (response.success && response.data) {
        setSelectedPlan(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error loading plan details:', error);
      // Fallback to basic plan data
      setSelectedPlan(plan);
      setIsDetailModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rencana ini?')) return;

    try {
      await rapbsService.deletePlan(id);
      loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Gagal menghapus rencana');
    }
  };

  const handleSubmit = async (id: number) => {
    if (!confirm('Ajukan rencana ini untuk persetujuan?')) return;

    try {
      await rapbsService.submitPlan(id);
      alert('Rencana berhasil diajukan');
      loadPlans();
    } catch (error) {
      console.error('Error submitting plan:', error);
      alert('Gagal mengajukan rencana');
    }
  };

  // Multi-Level Approval Handlers
  const handleApproveByPrincipal = async (id: number) => {
    if (!confirm('Approve rencana ini sebagai Kepala Sekolah?')) return;
    try {
      await rapbsService.approveByPrincipal(id);
      alert('Rencana berhasil disetujui oleh Kepala Sekolah');
      loadPlans();
    } catch (error: any) {
      console.error('Error approving by principal:', error);
      alert(error.response?.data?.message || 'Gagal approve rencana');
    }
  };

  const handleApproveByDirpen = async (id: number) => {
    if (!confirm('Approve rencana ini sebagai Direktur Pendidikan (Dirpen)?')) return;
    try {
      await rapbsService.approveByDirpen(id);
      alert('Rencana berhasil disetujui oleh Dirpen');
      loadPlans();
    } catch (error: any) {
      console.error('Error approving by dirpen:', error);
      alert(error.response?.data?.message || 'Gagal approve rencana');
    }
  };

  const handleApproveByDirector = async (id: number) => {
    if (!confirm('Approve rencana ini sebagai Direktur Keuangan (Final)?')) return;
    try {
      await rapbsService.approveByDirector(id);
      alert('Rencana berhasil disetujui oleh Direktur Keuangan');
      loadPlans();
    } catch (error: any) {
      console.error('Error approving by director:', error);
      alert(error.response?.data?.message || 'Gagal approve rencana');
    }
  };

  // Multi-Level Rejection Handlers
  const handleRejectByPrincipal = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Kepala Sekolah:');
    if (!notes) return;
    try {
      await rapbsService.rejectByPrincipal(id, notes);
      loadPlans();
    } catch (error: any) {
      console.error('Error rejecting by principal:', error);
      alert(error.response?.data?.message || 'Gagal reject rencana');
    }
  };

  const handleRejectByDirpen = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Direktur Pendidikan (Dirpen):');
    if (!notes) return;
    try {
      await rapbsService.rejectByDirpen(id, notes);
      loadPlans();
    } catch (error: any) {
      console.error('Error rejecting by dirpen:', error);
      alert(error.response?.data?.message || 'Gagal reject rencana');
    }
  };

  const handleRejectByDirector = async (id: number) => {
    const notes = prompt('Alasan reject sebagai Direktur Keuangan:');
    if (!notes) return;
    try {
      await rapbsService.rejectByDirector(id, notes);
      loadPlans();
    } catch (error: any) {
      console.error('Error rejecting by director:', error);
      alert(error.response?.data?.message || 'Gagal reject rencana');
    }
  };

  // Backward compatibility
  const handleApprove = async (id: number) => {
    if (!confirm('Approve rencana ini?')) return;
    try {
      await rapbsService.approvePlan(id);
      loadPlans();
    } catch (error) {
      console.error('Error approving plan:', error);
      alert('Gagal approve rencana');
    }
  };

  const handleReject = async (id: number) => {
    const notes = prompt('Alasan reject:');
    if (!notes) return;
    try {
      await rapbsService.rejectPlan(id, notes);
      loadPlans();
    } catch (error) {
      console.error('Error rejecting plan:', error);
      alert('Gagal reject rencana');
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
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700 border border-slate-200',
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
      draft: 'Draft',
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

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-slate-100 text-slate-700 border border-slate-200',
      medium: 'bg-amber-50 text-amber-700 border border-amber-200',
      high: 'bg-orange-50 text-orange-700 border border-orange-200',
      urgent: 'bg-red-50 text-red-700 border border-red-200',
    };
    const labels = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi',
      urgent: 'Urgent',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${styles[priority as keyof typeof styles]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  // Helper untuk cek apakah user bisa approve sebagai Principal (Level 1)
  const canApproveByPrincipal = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'submitted') return false;
    
    // Check role dengan multiple format support (termasuk role khusus RAPBS)
    const hasPrincipalRole = hasRole('Kepala Sekolah') 
      || hasRole('kepala_sekolah') 
      || hasRole('Kepala_Sekolah')
      || hasRole('kepsek_rapbs_&_divisi_unit')
      || hasRole('Kepsek_RAPBS_&_Divisi_Unit')
      || (user?.roles?.some((r: any) => r.name?.toLowerCase().includes('kepsek') && r.name?.toLowerCase().includes('rapbs')));
    
    if (!hasPrincipalRole) return false;
    
    const userUnitKerja = user?.profile?.unit_kerja;
    const planUnitKerja = (plan as any).unitKerja?.nama || (plan as any).unit_kerja?.nama;
    
    if (!userUnitKerja || !planUnitKerja) return false;
    return userUnitKerja === planUnitKerja;
  };

  // Helper untuk cek apakah user bisa approve sebagai Dirpen (Level 2)
  const canApproveByDirpen = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'approved_by_principal') return false;
    
    // Check role dengan multiple format support
    const hasDirpenRole = hasRole('Direktur Pendidikan')
      || hasRole('direktur_pendidikan')
      || hasRole('Direktur_Pendidikan')
      || hasRole('Dirpen')
      || hasRole('dirpen')
      || hasRole('DIRPEN')
      || !!(user?.roles?.some((r: any) => r.name?.toLowerCase().includes('dirpen')));
    
    return !!hasDirpenRole;
    // Tidak perlu cek unit kerja (bisa global)
  };

  // Helper untuk cek apakah user bisa approve sebagai Director (Level 3 - Final)
  const canApproveByDirector = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'approved_by_dirpen') return false;
    
    // Check role dengan multiple format support + proxy manajer unit
    const rolesToCheck = [
      'Direktur Keuangan',
      'direktur_keuangan',
      'Direktur_Keuangan',
      'Manajer Unit Sekolah',
      'manajer_unit_sekolah',
      'Manajer_Unit_Sekolah',
    ];
    
    if (rolesToCheck.some((role) => hasRole(role))) return true;
    
    // fallback cek substring nama role (misal variasi lain)
    return !!(user?.roles?.some((r: any) => {
      const name = r.name?.toLowerCase() || '';
      return name.includes('direktur') && name.includes('keuangan');
    }) || false);
  };

  // Helper untuk cek apakah user bisa reject sebagai Principal
  const canRejectByPrincipal = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'submitted') return false;
    
    // Check role dengan multiple format support (termasuk role khusus RAPBS)
    const hasPrincipalRole = hasRole('Kepala Sekolah') 
      || hasRole('kepala_sekolah') 
      || hasRole('Kepala_Sekolah')
      || hasRole('kepsek_rapbs_&_divisi_unit')
      || hasRole('Kepsek_RAPBS_&_Divisi_Unit')
      || (user?.roles?.some((r: any) => r.name?.toLowerCase().includes('kepsek') && r.name?.toLowerCase().includes('rapbs')));
    
    if (!hasPrincipalRole) return false;
    
    const userUnitKerja = user?.profile?.unit_kerja;
    const planUnitKerja = (plan as any).unitKerja?.nama || (plan as any).unit_kerja?.nama;
    
    if (!userUnitKerja || !planUnitKerja) return false;
    return userUnitKerja === planUnitKerja;
  };

  // Helper untuk cek apakah user bisa reject sebagai Dirpen
  const canRejectByDirpen = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'approved_by_principal') return false;
    
    // Check role dengan multiple format support
    const hasDirpenRole = hasRole('Direktur Pendidikan')
      || hasRole('direktur_pendidikan')
      || hasRole('Direktur_Pendidikan')
      || hasRole('Dirpen')
      || hasRole('dirpen')
      || hasRole('DIRPEN')
      || !!(user?.roles?.some((r: any) => r.name?.toLowerCase().includes('dirpen')));
    
    return !!hasDirpenRole;
    // Tidak perlu cek unit kerja (bisa global)
  };

  // Helper untuk cek apakah user bisa reject sebagai Director
  const canRejectByDirector = (plan: RAPBSPlan): boolean => {
    if (plan.status !== 'approved_by_dirpen') return false;
    
    // Check role dengan multiple format support
    return !!(hasRole('Direktur Keuangan') || hasRole('direktur_keuangan') || hasRole('Direktur_Keuangan') || false);
  };

  // Helper untuk cek apakah user adalah pembuat plan (dari unit yang sama)
  const isCreatorUnit = (plan: RAPBSPlan): boolean => {
    const userUnitKerja = user?.profile?.unit_kerja;
    const planUnitKerja = (plan as any).unitKerja?.nama || (plan as any).unit_kerja?.nama;
    
    // Jika tidak ada data unit, return false
    if (!planUnitKerja || !userUnitKerja) return false;
    
    // Return true jika unit sama
    return userUnitKerja === planUnitKerja;
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
              <h2 className="text-3xl font-bold text-white">Rencana RAPBS</h2>
              <p className="text-blue-100 mt-1 text-sm lg:text-base">Kelola rencana anggaran sekolah dengan efisien</p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Tambah Rencana
          </button>
        </div>
      </div>

      {/* Modern Filters Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari rencana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Diajukan</option>
            <option value="approved_by_principal">Disetujui Kepala Sekolah</option>
            <option value="approved_by_dirpen">Disetujui Dirpen</option>
            <option value="approved">Disetujui (Final)</option>
            <option value="rejected_by_principal">Ditolak Kepala Sekolah</option>
            <option value="rejected_by_dirpen">Ditolak Dirpen</option>
            <option value="rejected_by_director">Ditolak Direktur</option>
            <option value="rejected">Ditolak</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          >
            <option value="">Semua Prioritas</option>
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={unitKerjaFilter}
            onChange={(e) => setUnitKerjaFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium text-gray-700"
          >
            <option value="">Semua Unit Kerja</option>
            {unitKerjaList.map((unit) => (
              <option key={unit.id} value={unit.id.toString()}>
                {unit.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat data rencana...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Tidak ada rencana ditemukan</p>
            <p className="text-gray-500 mb-6">Buat rencana baru untuk memulai mengelola anggaran sekolah</p>
            <button
              onClick={onAdd}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-semibold"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Tambah Rencana Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rencana
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Unit Kerja
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Anggaran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Terealisasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sisa Anggaran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Prioritas
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
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{plan.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{plan.description}</div>
                        {plan.activity_category && (
                          <div className="text-xs text-gray-500 mt-2 inline-flex items-center px-2 py-1 bg-gray-100 rounded-md">
                            {plan.activity_category.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(plan as any).unitKerja?.nama || (plan as any).unit_kerja?.nama || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(plan.planned_amount)}
                      </div>
                      {plan.funding_source && (
                        <div className="text-xs text-gray-500 mt-1">{plan.funding_source.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency((plan as any).realized_amount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(plan.planned_amount - ((plan as any).realized_amount || 0))}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getPriorityBadge(plan.priority)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {getStatusBadge(plan.status)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(plan)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {plan.status === 'draft' && (
                          <>
                            <button
                              onClick={() => onEdit(plan)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleSubmit(plan.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Ajukan untuk Persetujuan"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {/* Rejected status - bisa edit & submit ulang */}
                        {(plan.status === 'rejected' || 
                          plan.status === 'rejected_by_principal' || 
                          plan.status === 'rejected_by_dirpen' || 
                          plan.status === 'rejected_by_director') && 
                          isCreatorUnit(plan) && (
                          <>
                            <button
                              onClick={() => onEdit(plan)}
                              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleSubmit(plan.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Ajukan Ulang untuk Persetujuan"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 1: Principal Approval */}
                        {canApproveByPrincipal(plan) && (
                          <>
                            <button
                              onClick={() => handleApproveByPrincipal(plan.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Kepala Sekolah"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByPrincipal(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Kepala Sekolah"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 2: Dirpen Approval */}
                        {canApproveByDirpen(plan) && (
                          <>
                            <button
                              onClick={() => handleApproveByDirpen(plan.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Dirpen"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByDirpen(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Dirpen"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Level 3: Director Approval (Final) */}
                        {canApproveByDirector(plan) && (
                          <>
                            <button
                              onClick={() => handleApproveByDirector(plan.id)}
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                              title="Approve sebagai Direktur Keuangan (Final)"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectByDirector(plan.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Reject sebagai Direktur Keuangan"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modern Pagination */}
        {!loading && plans.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
            <div className="text-sm font-medium text-gray-700">
              Menampilkan <span className="font-bold text-gray-900">{plans.length}</span> dari <span className="font-bold text-gray-900">{totalPages}</span> halaman
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
        <RAPBSPlanDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
        />
      </div>
    </div>
  );
};

export default RAPBSPlanList;

