import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import Modal from '../common/UI/Modal';
import { lpjService } from '../../services/lpjService';
import { API_BASE_URL } from '../../services/api';
import type { LPJ, LPJSummary, LPJDocument, LPJNote } from '../../types/lpj';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';

interface LPJDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lpj: LPJ | null;
  onRefresh?: () => void;
}

const LPJDetailModal: React.FC<LPJDetailModalProps> = ({
  isOpen,
  onClose,
  lpj,
  onRefresh,
}) => {
  const { hasRole } = usePermission();
  const { user } = useAuth();
  const [lpjData, setLpjData] = useState<LPJ | null>(lpj);
  const [summary, setSummary] = useState<LPJSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionLevel, setRejectionLevel] = useState<'principal' | 'dirpen' | 'director'>('principal');
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    if (isOpen && lpj) {
      loadLPJDetail();
      loadSummary();
    }
  }, [isOpen, lpj]);

  const loadLPJDetail = async () => {
    if (!lpj) return;
    
    try {
      setLoading(true);
      const response = await lpjService.getLPJ(lpj.id);
      if (response.success && response.data) {
        console.log('LPJ Detail Response:', response.data);
        console.log('Created By:', response.data.created_by_user || response.data.createdBy);
        console.log('Unit Kerja:', response.data.unit_kerja || response.data.unitKerja);
        setLpjData(response.data);
      }
    } catch (error) {
      console.error('Error loading LPJ detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!lpj) return;
    
    try {
      const response = await lpjService.getSummary(lpj.id);
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  if (!lpjData) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft', icon: ClockIcon },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Diajukan', icon: ClockIcon },
      approved_by_principal: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui Kepala Sekolah', icon: CheckCircleSolidIcon },
      approved_by_dirpen: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui Dirpen', icon: CheckCircleSolidIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui', icon: CheckCircleSolidIcon },
      finalized: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Finalisasi', icon: CheckCircleSolidIcon },
      rejected_by_principal: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak Kepala Sekolah', icon: XCircleIcon },
      rejected_by_dirpen: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak Dirpen', icon: XCircleIcon },
      rejected_by_director: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak Direktur', icon: XCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak', icon: XCircleIcon },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: ClockIcon };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cover_letter: 'Surat Pengantar',
      legal_doc: 'Dokumen Legal',
      photo: 'Foto Dokumentasi',
      other: 'Lainnya',
    };
    return labels[type] || type;
  };

  // Get note type label and color
  const getNoteTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      summary: { label: 'Ringkasan', bg: 'bg-blue-100', text: 'text-blue-800', icon: DocumentTextIcon },
      issue: { label: 'Masalah', bg: 'bg-red-100', text: 'text-red-800', icon: ExclamationCircleIcon },
      achievement: { label: 'Pencapaian', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleSolidIcon },
      recommendation: { label: 'Rekomendasi', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: PaperClipIcon },
    };
    return configs[type] || { label: type, bg: 'bg-gray-100', text: 'text-gray-800', icon: DocumentTextIcon };
  };

  // Approval actions
  const handleApprove = async (action: 'submit' | 'approve-by-principal' | 'approve-by-dirpen' | 'approve-by-director' | 'finalize') => {
    if (!lpjData) return;
    
    try {
      setActionLoading(action);
      let response;
      
      switch (action) {
        case 'submit':
          response = await lpjService.submitLPJ(lpjData.id);
          break;
        case 'approve-by-principal':
          response = await lpjService.approveByPrincipal(lpjData.id);
          break;
        case 'approve-by-dirpen':
          response = await lpjService.approveByDirpen(lpjData.id);
          break;
        case 'approve-by-director':
          response = await lpjService.approveByDirector(lpjData.id);
          break;
        case 'finalize':
          response = await lpjService.finalizeLPJ(lpjData.id);
          break;
      }
      
      if (response.success) {
        await loadLPJDetail();
        onRefresh?.();
        alert('Aksi berhasil dilakukan');
      }
    } catch (error: any) {
      console.error('Error approving LPJ:', error);
      alert(error?.response?.data?.message || 'Gagal melakukan aksi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!lpjData || !rejectionNotes.trim()) {
      alert('Catatan penolakan wajib diisi');
      return;
    }
    
    try {
      setActionLoading('reject');
      const response = await lpjService.rejectLPJ(lpjData.id, {
        rejection_notes: rejectionNotes,
        rejection_level: rejectionLevel,
      });
      
      if (response.success) {
        await loadLPJDetail();
        onRefresh?.();
        setShowRejectModal(false);
        setRejectionNotes('');
        alert('LPJ berhasil ditolak');
      }
    } catch (error: any) {
      console.error('Error rejecting LPJ:', error);
      alert(error?.response?.data?.message || 'Gagal menolak LPJ');
    } finally {
      setActionLoading(null);
    }
  };

  // Get approval timeline steps
  const getApprovalTimeline = () => {
    const steps = [
      {
        id: 'created',
        label: 'Dibuat',
        status: lpjData.status === 'draft' ? 'pending' : 'completed',
        date: lpjData.created_at,
        user: lpjData.created_by_user || (lpjData as any).createdBy || null,
      },
      {
        id: 'submitted',
        label: 'Diajukan',
        status: lpjData.status === 'submitted' || 
                lpjData.status?.startsWith('approved') || 
                lpjData.status === 'finalized' ||
                lpjData.status?.startsWith('rejected') ? 'completed' : 
                lpjData.status === 'draft' ? 'pending' : 'completed',
        date: lpjData.submitted_at,
        user: null,
      },
      {
        id: 'principal',
        label: 'Kepala Sekolah',
        status: lpjData.status === 'rejected_by_principal' ? 'rejected' :
                lpjData.status === 'approved_by_principal' || 
                lpjData.status === 'approved_by_dirpen' || 
                lpjData.status === 'approved' ||
                lpjData.status === 'finalized' ? 'completed' : 
                lpjData.status === 'submitted' ? 'pending' : 'pending',
        date: lpjData.approved_by_principal_at || null,
        user: lpjData.approved_by_principal_user || (lpjData as any).approvedByPrincipal || null,
        rejectionNotes: lpjData.rejection_notes_principal || null,
      },
      {
        id: 'dirpen',
        label: 'Direktur Pendidikan',
        status: lpjData.status === 'rejected_by_dirpen' ? 'rejected' :
                lpjData.status === 'approved_by_dirpen' || 
                lpjData.status === 'approved' ||
                lpjData.status === 'finalized' ? 'completed' : 
                lpjData.status === 'approved_by_principal' ? 'pending' : 'pending',
        date: lpjData.approved_by_dirpen_at || null,
        user: lpjData.approved_by_dirpen_user || (lpjData as any).approvedByDirpen || null,
        rejectionNotes: lpjData.rejection_notes_dirpen || null,
      },
      {
        id: 'director',
        label: 'Direktur Keuangan',
        status: lpjData.status === 'rejected_by_director' ? 'rejected' :
                lpjData.status === 'approved' ||
                lpjData.status === 'finalized' ? 'completed' : 
                lpjData.status === 'approved_by_dirpen' ? 'pending' : 'pending',
        date: lpjData.approved_by_director_at || null,
        user: lpjData.approved_by_director_user || (lpjData as any).approvedByDirector || null,
        rejectionNotes: lpjData.rejection_notes_director || null,
      },
    ];

    return steps;
  };

  const timelineSteps = getApprovalTimeline();

  // Check permissions for actions
  const canApproveByPrincipal = () => {
    // Check if user has principal role (Kepala Sekolah or Kepsek RAPBS & Divisi Unit)
    const hasPrincipalRole = hasRole('Kepala Sekolah') || 
                              hasRole('kepala_sekolah') ||
                              hasRole('kepsek_rapbs_&_divisi_unit') ||
                              hasRole('Kepsek RAPBS & Divisi Unit') ||
                              user?.roles?.some((r: any) => {
                                const name = (r.name || '').toLowerCase();
                                return name.includes('kepsek') && (name.includes('rapbs') || name.includes('divisi'));
                              });
    
    // Also check Dirpen and Super Admin
    const hasDirpenRole = hasRole('Direktur Pendidikan') || 
                          hasRole('direktur_pendidikan') || 
                          hasRole('Dirpen');
    
    const isSuperAdmin = hasRole('Super Administrator') || hasRole('Super Admin');
    
    // If super admin or dirpen, always allow
    if (isSuperAdmin || hasDirpenRole) {
      return true;
    }
    
    // For principal role, check unit kerja match if LPJ has unit_kerja_id
    if (hasPrincipalRole) {
      // If LPJ doesn't have unit_kerja_id, allow (global LPJ)
      if (!lpjData.unit_kerja_id) {
        return true;
      }
      
      // If user doesn't have unit_kerja in profile, allow (fallback)
      if (!user?.profile?.unit_kerja) {
        return true;
      }
      
      // Check if unit kerja matches
      const lpjUnitKerja = lpjData.unit_kerja?.nama || (lpjData as any).unitKerja?.nama;
      const userUnitKerja = user.profile.unit_kerja;
      
      // Allow if unit kerja matches
      if (lpjUnitKerja && userUnitKerja && lpjUnitKerja === userUnitKerja) {
        return true;
      }
      
      // If unit kerja doesn't match, don't allow
      return false;
    }
    
    return false;
  };

  const canApproveByDirpen = () => {
    return hasRole('Direktur Pendidikan') || hasRole('direktur_pendidikan') || hasRole('Dirpen') ||
           hasRole('Super Administrator') || hasRole('Super Admin');
  };

  const canApproveByDirector = () => {
    return hasRole('Direktur Keuangan') || hasRole('direktur_keuangan') ||
           hasRole('Super Administrator') || hasRole('Super Admin');
  };

  const canFinalize = () => {
    return lpjData.status === 'approved' && (canApproveByDirector() || lpjData.created_by === user?.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail LPJ"
      size="xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border border-teal-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <CheckCircleSolidIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700 mb-1">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(lpjData.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tahun Ajaran */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Tahun Ajaran</p>
                  <p className="text-lg font-bold text-blue-900">
                    {lpjData.academic_year?.year || (lpjData as any).academicYear?.year || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Kerja */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Unit Kerja</p>
                  <p className="text-lg font-bold text-purple-900">
                    {(() => {
                      // Try unit_kerja from LPJ first
                      if (lpjData.unit_kerja?.nama) return lpjData.unit_kerja.nama;
                      if ((lpjData as any).unitKerja?.nama) return (lpjData as any).unitKerja.nama;
                      
                      // Fallback to created_by user's profile unit_kerja
                      const createdBy = lpjData.created_by_user || (lpjData as any).createdBy;
                      if (createdBy?.profile?.unit_kerja) return createdBy.profile.unit_kerja;
                      
                      return '-';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{lpjData.title}</h3>
            {lpjData.description && (
              <p className="text-gray-600 leading-relaxed">{lpjData.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {lpjData.periode_type === 'semester' ? 'Semester' : 'Tahunan'} - {formatDate(lpjData.periode_start_date)} s/d {formatDate(lpjData.periode_end_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>
                  Dibuat oleh: {(() => {
                    const createdBy = lpjData.created_by_user || (lpjData as any).createdBy;
                    if (createdBy?.name) return createdBy.name;
                    if (createdBy?.email) return createdBy.email;
                    return 'Unknown';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1">Total Rencana</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.total_planned)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-1">Total Realisasi</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.total_realized)}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                <p className="text-sm font-medium text-orange-700 mb-1">Sisa Anggaran</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.remaining)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <p className="text-sm font-medium text-purple-700 mb-1">Tingkat Utilisasi</p>
                <p className="text-2xl font-bold text-purple-900">{summary.utilization_rate.toFixed(1)}%</p>
              </div>
            </div>
          )}

          {/* RAPBS Plans */}
          {lpjData.rapbs_plans && lpjData.rapbs_plans.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                Rencana RAPBS ({lpjData.rapbs_plans.length})
              </h4>
              <div className="space-y-3">
                {lpjData.rapbs_plans.map((lpjPlan) => {
                  const plan = lpjPlan.rapbs_plan || (lpjPlan as any).rapbsPlan;
                  if (!plan) return null;
                  
                  return (
                    <div key={lpjPlan.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{plan.title || 'N/A'}</h5>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>Kategori: {plan.activity_category?.name || (plan as any).activityCategory?.name || 'N/A'}</span>
                            <span>Sumber Dana: {plan.funding_source?.name || (plan as any).fundingSource?.name || 'N/A'}</span>
                            <span>Anggaran: {formatCurrency(plan.planned_amount || 0)}</span>
                          </div>
                          {lpjPlan.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">Catatan: {lpjPlan.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents */}
          {lpjData.documents && lpjData.documents.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentArrowDownIcon className="w-5 h-5 text-teal-600" />
                Dokumen Pendukung ({lpjData.documents.length})
              </h4>
              <div className="space-y-3">
                {lpjData.documents.map((doc: LPJDocument) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                        {doc.document_type === 'photo' ? (
                          <PhotoIcon className="w-5 h-5 text-teal-600" />
                        ) : (
                          <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.file_name}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.file_size)}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {getDocumentTypeLabel(doc.document_type)}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/storage/${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-1"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lpjData.notes && lpjData.notes.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                Catatan ({lpjData.notes.length})
              </h4>
              <div className="space-y-3">
                {lpjData.notes.map((note: LPJNote) => {
                  const noteConfig = getNoteTypeConfig(note.note_type);
                  const Icon = noteConfig.icon;
                  
                  return (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${noteConfig.bg} ${noteConfig.text}`}>
                            <Icon className="w-3 h-3" />
                            {noteConfig.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{note.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                      {note.created_by_user && (
                        <p className="text-xs text-gray-500 mt-2">
                          Oleh: {note.created_by_user.name || (note as any).createdBy?.name || 'System'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Approval Timeline */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-md">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Timeline Persetujuan</h4>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
                <div 
                  className="absolute top-0 left-0 w-full bg-gradient-to-b from-teal-500 to-teal-600 transition-all duration-500 rounded-full"
                  style={{
                    height: `${(timelineSteps.filter(s => s.status === 'completed' || s.status === 'rejected').length / timelineSteps.length) * 100}%`
                  }}
                />
              </div>

              {/* Timeline Steps */}
              <div className="space-y-6 relative">
                {timelineSteps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-4 relative">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 relative z-10">
                      {step.status === 'completed' ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg ring-4 ring-green-100">
                          <CheckCircleSolidIcon className="w-6 h-6 text-white" />
                        </div>
                      ) : step.status === 'rejected' ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg ring-4 ring-red-100">
                          <XCircleIcon className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shadow-md ring-4 ring-gray-50">
                          <ClockIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className={`text-sm font-bold mb-1 ${
                              step.status === 'completed' ? 'text-green-700' :
                              step.status === 'rejected' ? 'text-red-700' :
                              'text-gray-500'
                            }`}>
                              {step.label}
                            </h5>
                            {step.date && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>{formatDateTime(step.date)}</span>
                              </div>
                            )}
                          </div>
                          {step.status === 'completed' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Selesai
                            </span>
                          )}
                          {step.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Ditolak
                            </span>
                          )}
                          {step.status === 'pending' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                              Menunggu
                            </span>
                          )}
                        </div>
                        
                        {step.user && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Oleh:</span> {step.user.name || step.user.email || 'System'}
                            </p>
                          </div>
                        )}
                        
                        {step.rejectionNotes && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700 font-semibold mb-1 flex items-center gap-1">
                              <ExclamationCircleIcon className="w-3.5 h-3.5" />
                              Catatan Penolakan
                            </p>
                            <p className="text-xs text-red-600 leading-relaxed">{step.rejectionNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-wrap gap-3 justify-end">
              {/* Submit - Show for draft status */}
              {lpjData.status === 'draft' && (
                <button
                  onClick={() => handleApprove('submit')}
                  disabled={actionLoading !== null}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {actionLoading === 'submit' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  )}
                  Ajukan LPJ
                </button>
              )}

              {/* Approve by Principal */}
              {lpjData.status === 'submitted' && canApproveByPrincipal() && (
                <>
                  <button
                    onClick={() => handleApprove('approve-by-principal')}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'approve-by-principal' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Setujui (Kepala Sekolah)
                  </button>
                  <button
                    onClick={() => {
                      setRejectionLevel('principal');
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Tolak
                  </button>
                </>
              )}

              {/* Approve by Dirpen */}
              {lpjData.status === 'approved_by_principal' && canApproveByDirpen() && (
                <>
                  <button
                    onClick={() => handleApprove('approve-by-dirpen')}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'approve-by-dirpen' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Setujui (Dirpen)
                  </button>
                  <button
                    onClick={() => {
                      setRejectionLevel('dirpen');
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Tolak
                  </button>
                </>
              )}

              {/* Approve by Director */}
              {lpjData.status === 'approved_by_dirpen' && canApproveByDirector() && (
                <>
                  <button
                    onClick={() => handleApprove('approve-by-director')}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'approve-by-director' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Setujui (Direktur)
                  </button>
                  <button
                    onClick={() => {
                      setRejectionLevel('director');
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Tolak
                  </button>
                </>
              )}

              {/* Finalize */}
              {canFinalize() && (
                <button
                  onClick={() => handleApprove('finalize')}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'finalize' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircleSolidIcon className="w-4 h-4" />
                  )}
                  Finalisasi
                </button>
              )}

              {/* Export & Print */}
              <button
                onClick={() => alert('Fitur export akan segera tersedia')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-red-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-bold text-white">Tolak LPJ</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Masukkan alasan penolakan..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionNotes('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === 'reject' || !rejectionNotes.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === 'reject' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <XCircleIcon className="w-4 h-4" />
                  )}
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LPJDetailModal;

