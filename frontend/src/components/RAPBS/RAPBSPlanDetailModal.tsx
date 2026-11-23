import React from 'react';
import { ClockIcon, XCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { RAPBSPlan, RAPBSDocument } from '../../types/rapbs';
import Modal from '../common/UI/Modal';
import { API_BASE_URL } from '../../services/api';

interface RAPBSPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: RAPBSPlan | null;
}

const RAPBSPlanDetailModal: React.FC<RAPBSPlanDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  if (!plan) return null;

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

  // Get proposal documents
  const proposalDocuments = (plan.documents || []).filter(
    (doc: RAPBSDocument) => doc.document_type === 'proposal'
  );

  // Get approval timeline steps
  const getApprovalTimeline = () => {
    const steps = [
      {
        id: 'submitted',
        label: 'Diajukan',
        status: plan.status === 'submitted' || 
                plan.status === 'approved_by_principal' || 
                plan.status === 'approved_by_dirpen' || 
                plan.status === 'approved' ||
                plan.status?.startsWith('rejected') ? 'completed' : 
                plan.status === 'draft' ? 'pending' : 'completed',
        date: plan.created_at,
        user: null,
      },
      {
        id: 'principal',
        label: 'Kepala Sekolah',
        status: plan.status === 'rejected_by_principal' ? 'rejected' :
                plan.status === 'approved_by_principal' || 
                plan.status === 'approved_by_dirpen' || 
                plan.status === 'approved' ? 'completed' : 
                plan.status === 'submitted' ? 'pending' : 'pending',
        date: plan.approved_by_principal_at || null,
        user: plan.approved_by_principal_user || (plan as any).approvedByPrincipal || (plan as any).approved_by_principal || null,
        rejectionNotes: plan.rejection_notes_principal || null,
      },
      {
        id: 'dirpen',
        label: 'Direktur Pendidikan (Dirpen)',
        status: plan.status === 'rejected_by_dirpen' ? 'rejected' :
                plan.status === 'approved_by_dirpen' || 
                plan.status === 'approved' ? 'completed' : 
                plan.status === 'approved_by_principal' ? 'pending' : 'pending',
        date: plan.approved_by_dirpen_at || null,
        user: plan.approved_by_dirpen_user || (plan as any).approvedByDirpen || (plan as any).approved_by_dirpen || null,
        rejectionNotes: plan.rejection_notes_dirpen || null,
      },
      {
        id: 'director',
        label: 'Direktur Keuangan',
        status: plan.status === 'rejected_by_director' ? 'rejected' :
                plan.status === 'approved' ? 'completed' : 
                plan.status === 'approved_by_dirpen' ? 'pending' : 'pending',
        date: plan.approved_by_director_at || null,
        user: plan.approved_by_director_user || (plan as any).approvedByDirector || (plan as any).approved_by_director || null,
        rejectionNotes: plan.rejection_notes_director || null,
      },
    ];

    return steps;
  };

  const timelineSteps = getApprovalTimeline();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Rencana RAPBS"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tahun Anggaran */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Tahun Anggaran</p>
                <p className="text-lg font-bold text-blue-900">
                  {plan.academic_year?.year || (plan as any).academicYear?.year || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Sumber Dana */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Sumber Dana</p>
                <p className="text-lg font-bold text-green-900">
                  {plan.funding_source?.name || (plan as any).fundingSource?.name || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Judul Rencana */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-500 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-700 mb-2">Judul Rencana</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.title}</h3>
              {plan.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Jumlah Anggaran */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Jumlah Anggaran</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(plan.planned_amount)}
                </p>
              </div>
            </div>
            {plan.activity_category && (
              <div className="text-right">
                <p className="text-xs text-amber-600 mb-1">Kategori</p>
                <span className="inline-block px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                  {plan.activity_category?.name || (plan as any).activityCategory?.name || '-'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* File Proposal yang Diupload */}
        {proposalDocuments.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <DocumentArrowDownIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">File Proposal</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {proposalDocuments.length} file
              </span>
            </div>
            <div className="space-y-2">
              {proposalDocuments.map((doc: RAPBSDocument) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
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
                          {doc.document_type === 'proposal' ? 'Proposal' : doc.document_type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`${API_BASE_URL}/storage/${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Status Approval */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Timeline Status Approval</h3>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
              <div 
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-500"
                style={{
                  height: `${(timelineSteps.filter(s => s.status === 'completed' || s.status === 'rejected').length / timelineSteps.length) * 100}%`
                }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="space-y-6 relative">
              {timelineSteps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isRejected = step.status === 'rejected';
                const isPending = step.status === 'pending';

                return (
                  <div key={step.id} className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                        : isRejected
                        ? 'bg-red-500 shadow-lg shadow-red-500/50'
                        : isPending
                        ? 'bg-gray-300'
                        : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleSolidIcon className="w-6 h-6 text-white" />
                      ) : isRejected ? (
                        <XCircleIcon className="w-6 h-6 text-white" />
                      ) : (
                        <ClockIcon className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className={`flex items-center justify-between mb-2 ${
                        isCompleted ? 'text-green-700' : isRejected ? 'text-red-700' : 'text-gray-500'
                      }`}>
                        <h4 className={`font-semibold ${
                          isCompleted ? 'text-green-900' : isRejected ? 'text-red-900' : 'text-gray-700'
                        }`}>
                          {step.label}
                        </h4>
                        {step.date && (
                          <span className="text-xs font-medium">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      {step.user && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">
                            {isRejected ? 'Ditolak oleh' : 'Disetujui oleh'}: <span className="font-medium text-gray-900">
                              {typeof step.user === 'object' ? (step.user?.name || step.user?.email || '-') : '-'}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Rejection Notes */}
                      {isRejected && step.rejectionNotes && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-medium text-red-800 mb-1">Catatan Penolakan:</p>
                          <p className="text-sm text-red-700">{step.rejectionNotes}</p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? 'bg-green-100 text-green-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : isPending
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? 'Selesai' : isRejected ? 'Ditolak' : isPending ? 'Menunggu' : 'Dalam Proses'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Prioritas</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              plan.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              plan.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              plan.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {plan.priority === 'urgent' ? 'Urgent' :
               plan.priority === 'high' ? 'Tinggi' :
               plan.priority === 'medium' ? 'Sedang' : 'Rendah'}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              plan.status === 'approved' ? 'bg-green-100 text-green-800' :
              plan.status?.includes('approved') ? 'bg-blue-100 text-blue-800' :
              plan.status?.includes('rejected') ? 'bg-red-100 text-red-800' :
              plan.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {plan.status === 'draft' ? 'Draft' :
               plan.status === 'submitted' ? 'Diajukan' :
               plan.status === 'approved_by_manager' ? 'Disetujui Manajer' :
               plan.status === 'approved_by_principal' ? 'Disetujui Kepala Sekolah' :
               plan.status === 'approved' ? 'Disetujui (Final)' :
               plan.status?.includes('rejected') ? 'Ditolak' : plan.status}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RAPBSPlanDetailModal;

