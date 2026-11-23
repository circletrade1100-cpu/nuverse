import React, { useEffect, useState } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { lpjService } from '../../services/lpjService';
import type { LPJ } from '../../types/lpj';

interface LPJListProps {
  onAdd: () => void;
  onEdit: (lpj: LPJ) => void;
  onView: (lpj: LPJ) => void;
  refreshTrigger?: number;
}

const LPJList: React.FC<LPJListProps> = ({ onAdd, onEdit, onView, refreshTrigger }) => {
  const [lpjs, setLpjs] = useState<LPJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadLPJs();
  }, [refreshTrigger, searchTerm, statusFilter, currentPage]);

  const loadLPJs = async () => {
    try {
      setLoading(true);
      const response = await lpjService.getLPJs({
        search: searchTerm,
        status: statusFilter || undefined,
        page: currentPage,
        per_page: 10,
      });
      
      if (response.success && response.data) {
        setLpjs(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading LPJs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus LPJ ini?')) return;
    
    try {
      await lpjService.deleteLPJ(id);
      loadLPJs();
    } catch (error) {
      console.error('Error deleting LPJ:', error);
      alert('Gagal menghapus LPJ');
    }
  };

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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateLong = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading && lpjs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data LPJ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar LPJ</h2>
          <p className="text-sm text-gray-600 mt-1">Total {total} LPJ ditemukan</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-5 py-2.5 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Buat LPJ Baru
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari LPJ berdasarkan judul, deskripsi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700 min-w-[160px]"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>{statusFilter ? getStatusBadge(statusFilter).props.children[1] : 'Semua Status'}</span>
              </button>

              {showFilter && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilter(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-2">
                    <button
                      onClick={() => {
                        setStatusFilter('');
                        setShowFilter(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        !statusFilter ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Semua Status
                    </button>
                    {['draft', 'submitted', 'approved_by_principal', 'approved_by_dirpen', 'approved', 'finalized', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowFilter(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          statusFilter === status ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {getStatusBadge(status).props.children[1]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    Judul LPJ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    Unit Kerja
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Periode
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lpjs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium text-lg mb-1">Tidak ada data LPJ</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm || statusFilter 
                          ? 'Coba ubah filter atau kata kunci pencarian' 
                          : 'Mulai dengan membuat LPJ baru'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                lpjs.map((lpj) => (
                  <tr 
                    key={lpj.id} 
                    className="hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-blue-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => onView(lpj)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-1">{lpj.title}</p>
                          {lpj.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{lpj.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {lpj.unit_kerja?.nama || (lpj as any).unitKerja?.nama || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 capitalize">{lpj.periode_type}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          {formatDate(lpj.periode_start_date)} - {formatDate(lpj.periode_end_date)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lpj.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{formatDate(lpj.created_at)}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{formatDateLong(lpj.created_at)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div 
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onView(lpj)}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {(lpj.status === 'draft' || lpj.status.includes('rejected')) && (
                          <>
                            <button
                              onClick={() => onEdit(lpj)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(lpj.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Hapus"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> -{' '}
                <span className="font-medium">{Math.min(currentPage * 10, total)}</span> dari{' '}
                <span className="font-medium">{total}</span> LPJ
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LPJList;
