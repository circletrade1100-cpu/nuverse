import React from 'react';
import { ClockIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { RAPBSRealization } from '../../types/rapbs';
import Modal from '../common/UI/Modal';

interface RealizationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  realization: RAPBSRealization | null;
}

const RealizationDetailModal: React.FC<RealizationDetailModalProps> = ({
  isOpen,
  onClose,
  realization,
}) => {
  if (!realization) return null;

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

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Tunai',
      transfer: 'Transfer',
      check: 'Cek',
    };
    return labels[method] || method;
  };

  // Get approval timeline steps (mengikuti alur Rencana RAPBS)
  const getApprovalTimeline = () => {
    const steps = [
      {
        id: 'pending',
        label: 'Dibuat',
        status: realization.status === 'pending' || 
                realization.status === 'submitted' || 
                realization.status === 'approved_by_principal' || 
                realization.status === 'approved_by_dirpen' || 
                realization.status === 'approved' ||
                realization.status?.startsWith('rejected') ? 'completed' : 'pending',
        date: realization.created_at,
        user: (realization as any).createdBy || null,
      },
      {
        id: 'submitted',
        label: 'Diajukan',
        status: realization.status === 'submitted' || 
                realization.status === 'approved_by_principal' || 
                realization.status === 'approved_by_dirpen' || 
                realization.status === 'approved' ||
                realization.status?.startsWith('rejected') ? 'completed' : 
                realization.status === 'pending' ? 'pending' : 'completed',
        date: realization.status === 'submitted' || realization.status?.startsWith('approved') || realization.status?.startsWith('rejected') 
              ? realization.updated_at 
              : null,
        user: null,
      },
      {
        id: 'principal',
        label: 'Kepala Sekolah',
        status: realization.status === 'rejected_by_principal' ? 'rejected' :
                realization.status === 'approved_by_principal' || 
                realization.status === 'approved_by_dirpen' || 
                realization.status === 'approved' ? 'completed' : 
                realization.status === 'submitted' ? 'pending' : 'pending',
        date: realization.approved_by_principal_at || null,
        user: realization.approved_by_principal_user || 
              (realization as any).approvedByPrincipal || 
              (realization as any).approved_by_principal || null,
        rejectionNotes: realization.rejection_notes_principal || null,
      },
      {
        id: 'dirpen',
        label: 'Direktur Pendidikan (Dirpen)',
        status: realization.status === 'rejected_by_dirpen' ? 'rejected' :
                realization.status === 'approved_by_dirpen' || 
                realization.status === 'approved' ? 'completed' : 
                realization.status === 'approved_by_principal' ? 'pending' : 'pending',
        date: realization.approved_by_dirpen_at || null,
        user: realization.approved_by_dirpen_user || 
              (realization as any).approvedByDirpen || 
              (realization as any).approved_by_dirpen || null,
        rejectionNotes: realization.rejection_notes_dirpen || null,
      },
      {
        id: 'director',
        label: 'Direktur Keuangan',
        status: realization.status === 'rejected_by_director' ? 'rejected' :
                realization.status === 'approved' ? 'completed' : 
                realization.status === 'approved_by_dirpen' ? 'pending' : 'pending',
        date: realization.approved_by_director_at || null,
        user: realization.approved_by_director_user || 
              (realization as any).approvedByDirector || 
              (realization as any).approved_by_director || null,
        rejectionNotes: realization.rejection_notes_director || null,
      },
    ];

    return steps;
  };

  const timelineSteps = getApprovalTimeline();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Realisasi Anggaran"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanggal Transaksi */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Tanggal Transaksi</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatDate(realization.transaction_date)}
                </p>
                {realization.reference_number && (
                  <p className="text-xs text-blue-600 mt-1">
                    No. Ref: {realization.reference_number}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Metode Pembayaran</p>
                <p className="text-lg font-bold text-green-900">
                  {getPaymentMethodLabel(realization.payment_method)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi & Vendor */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-500 rounded-lg flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-700 mb-2">Deskripsi Transaksi</p>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{realization.description}</h3>
              {realization.vendor_name && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <p className="text-sm font-medium text-indigo-700 mb-1">Vendor</p>
                  <p className="text-base text-gray-900 font-semibold">{realization.vendor_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Jumlah Realisasi */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Jumlah Realisasi</p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(realization.amount)}
                </p>
              </div>
            </div>
            {realization.rapbsPlan && (
              <div className="text-right">
                <p className="text-xs text-amber-600 mb-1">Rencana RAPBS</p>
                <span className="inline-block px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-medium">
                  {realization.rapbsPlan?.title || '-'}
                </span>
                {realization.rapbsPlan?.planned_amount && (
                  <p className="text-xs text-amber-600 mt-1">
                    Anggaran: {formatCurrency(realization.rapbsPlan.planned_amount)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

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
                            {isRejected ? 'Ditolak oleh' : step.id === 'pending' ? 'Dibuat oleh' : 'Disetujui oleh'}: <span className="font-medium text-gray-900">
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
            <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              realization.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
              realization.status === 'approved_by_dirpen' ? 'bg-purple-100 text-purple-800' :
              realization.status === 'approved_by_principal' ? 'bg-orange-100 text-orange-800' :
              realization.status?.includes('rejected') ? 'bg-red-100 text-red-800' :
              realization.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {realization.status === 'pending' ? 'Pending' :
               realization.status === 'submitted' ? 'Diajukan' :
               realization.status === 'approved_by_principal' ? 'Disetujui Kepala Sekolah' :
               realization.status === 'approved_by_dirpen' ? 'Disetujui Dirpen' :
               realization.status === 'approved' ? 'Disetujui (Final)' :
               realization.status?.includes('rejected') ? 'Ditolak' : realization.status}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Dibuat</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(realization.created_at)}
            </p>
            {(realization as any).createdBy && (
              <p className="text-xs text-gray-600 mt-1">
                oleh: {typeof (realization as any).createdBy === 'object' 
                  ? ((realization as any).createdBy?.name || (realization as any).createdBy?.email || '-')
                  : '-'}
              </p>
            )}
          </div>
        </div>

        {/* Rencana RAPBS Info */}
        {realization.rapbsPlan && (
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-cyan-500 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-cyan-700 mb-2">Rencana RAPBS Terkait</p>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {realization.rapbsPlan?.title || '-'}
                </h4>
                {realization.rapbsPlan?.description && (
                  <p className="text-sm text-gray-600 mb-3">{realization.rapbsPlan.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-xs text-cyan-600 mb-1">Anggaran Direncanakan</p>
                    <p className="text-sm font-bold text-gray-900">
                      {realization.rapbsPlan?.planned_amount 
                        ? formatCurrency(realization.rapbsPlan.planned_amount)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-cyan-600 mb-1">Sisa Anggaran</p>
                    <p className="text-sm font-bold text-gray-900">
                      {realization.rapbsPlan?.planned_amount && realization.rapbsPlan?.realized_amount
                        ? formatCurrency(realization.rapbsPlan.planned_amount - realization.rapbsPlan.realized_amount)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RealizationDetailModal;

