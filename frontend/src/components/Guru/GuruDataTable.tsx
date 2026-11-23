import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Guru } from '../../types/guru';
import type { UnitSekolah } from '../../types/masterData';
import { Download, Upload, MoreVertical, Eye, Edit, Trash2, FileText } from 'lucide-react';

interface GuruDataTableProps {
  gurus: Guru[];
  onImportExcel: (file: File) => void;
  onEditGuru: (guru: Guru) => void;
  onDeleteGuru: (guruId: string) => void;
  onViewGuru: (guru: Guru) => void;
  onExportGuru?: () => void;
  onExportPdf?: () => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  unitSekolahs?: UnitSekolah[];
  // Filter props untuk backend filtering
  filters?: { search: string; status: string; unit_sekolah_id: string };
  onFilterChange?: (filters: { search: string; status: string; unit_sekolah_id: string }) => void;
  onResetFilters?: () => void;
}

const GuruDataTable: React.FC<GuruDataTableProps> = ({
  gurus,
  onImportExcel,
  onEditGuru,
  onDeleteGuru,
  onViewGuru,
  onExportGuru,
  onExportPdf,
  pagination,
  onPageChange,
  unitSekolahs = [],
  filters = { search: '', status: '', unit_sekolah_id: '' },
  onFilterChange,
  onResetFilters,
}) => {
  
  // Local state untuk UI filter (controlled by parent filters)
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localStatus, setLocalStatus] = useState(filters.status);
  const [localUnitKerja, setLocalUnitKerja] = useState(filters.unit_sekolah_id);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local state ketika filters props berubah
  useEffect(() => {
    setLocalSearch(filters.search);
    setLocalStatus(filters.status);
    setLocalUnitKerja(filters.unit_sekolah_id);
  }, [filters]);

  // Debounce handler untuk search
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          search: value,
          status: localStatus,
          unit_sekolah_id: localUnitKerja
        });
      }
    }, 1500);
  };

  // Handler untuk status dan unit kerja (immediate, tanpa debounce)
  const handleStatusChange = (value: string) => {
    setLocalStatus(value);
    if (onFilterChange) {
      onFilterChange({
        search: localSearch,
        status: value,
        unit_sekolah_id: localUnitKerja
      });
    }
  };

  const handleUnitKerjaChange = (value: string) => {
    setLocalUnitKerja(value);
    if (onFilterChange) {
      onFilterChange({
        search: localSearch,
        status: localStatus,
        unit_sekolah_id: value
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalStatus('');
    setLocalUnitKerja('');
    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Use server-side pagination or fallback to client-side
  const useServerPagination = pagination && onPageChange;

  // Filter gurus berdasarkan kriteria (pure client-side)
  const filteredGurus = useMemo(() => {
    if (useServerPagination) return gurus; // Server already filtered

    return gurus.filter(guru => {
      // Search di nama OR nip
      const searchLower = localSearch.toLowerCase();
      const matchesSearch = searchLower === '' ||
        (guru.namaLengkap || '').toLowerCase().includes(searchLower) ||
        (guru.nip || '').toLowerCase().includes(searchLower);

      // Filter status
      const matchesStatus = localStatus === '' || guru.status === localStatus;

      // Filter unit kerja
      const matchesUnitKerja = localUnitKerja === '' ||
        (guru.unitKerja || '').toLowerCase().includes(localUnitKerja.toLowerCase()) ||
        guru.unitSekolahId === localUnitKerja;

      return matchesSearch && matchesStatus && matchesUnitKerja;
    });
  }, [gurus, localSearch, localStatus, localUnitKerja, useServerPagination]);

  // Pagination - use server pagination if available
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.lastPage || 1;
  const paginatedGurus = filteredGurus;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportExcel(file);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      
      // Check if date is valid
      if (isNaN(birth.getTime())) {
        return 0;
      }
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 0;
    }
  };

  const calculateMasaKerja = (tmtDate: string) => {
    if (!tmtDate) return "0 bulan";
    
    try {
      const today = new Date();
      const tmt = new Date(tmtDate);
      
      // Check if date is valid
      if (isNaN(tmt.getTime())) {
        return "0 bulan";
      }
      
      // If TMT is in the future
      if (today < tmt) {
        return "0 bulan";
      }
      
      // Simple and reliable calculation
      let years = today.getFullYear() - tmt.getFullYear();
      let months = today.getMonth() - tmt.getMonth();
      let days = today.getDate() - tmt.getDate();
      
      // Adjust for negative days
      if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }
      
      // Adjust for negative months
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // If less than 1 month, calculate days
      if (years === 0 && months === 0) {
        const diffTime = today.getTime() - tmt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          return "1 hari";
        } else if (diffDays < 30) {
          return `${diffDays} hari`;
        } else {
          return "1 bulan";
        }
      }
      
      if (years > 0) {
        return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
      } else {
        return `${months} bulan`;
      }
    } catch (error) {
      console.error('Error calculating masa kerja:', error);
      return "0 bulan";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'Aktif': 'bg-green-100 text-green-800 border-green-200',
      'Non-Aktif': 'bg-red-100 text-red-800 border-red-200',
      'Pensiun': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header dengan Import */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Data Guru</h2>
          <div className="flex space-x-3">
            <label className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button 
              onClick={onExportGuru}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <button 
              onClick={onExportPdf}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Form - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama/NIP</label>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari nama atau NIP..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={localStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
              <option value="Pensiun">Pensiun</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
            <select
              value={localUnitKerja}
              onChange={(e) => handleUnitKerjaChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Unit Kerja</option>
              {unitSekolahs.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Pribadi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kepegawaian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendidikan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tugas Mengajar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedGurus.map((guru) => (
              <tr key={guru.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{guru.namaLengkap || 'Nama tidak tersedia'}</div>
                    <div className="text-sm text-gray-500">NIP: {guru.nip}</div>
                    <div className="text-sm text-gray-500">
                      {guru.tempatLahir}, {guru.tanggalLahir ? new Date(guru.tanggalLahir).toLocaleDateString('id-ID') : 'Tidak ada tanggal'} ({calculateAge(guru.tanggalLahir)} tahun)
                    </div>
                    <div className="text-sm text-gray-500">{guru.statusPernikahan}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{guru.jabatan}</div>
                    <div className="text-sm text-gray-500">{guru.unitKerja}</div>
                    <div className="text-sm text-gray-500">TMT: {guru.tmt ? new Date(guru.tmt).toLocaleDateString('id-ID') : 'Tidak ada TMT'}</div>
                    <div className="text-sm text-gray-500">Masa Kerja: {guru.masaKerja || calculateMasaKerja(guru.tmt)}</div>
                    <div className="mt-1">{getStatusBadge(guru.status)}</div>
                    {guru.tugasTambahan && (
                      <div className="text-sm text-blue-600 mt-1">+ {guru.tugasTambahan}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {guru.pendidikan?.jenjang || 'Tidak ada data'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {guru.pendidikan?.jurusan || 'Tidak ada data'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    {guru.mapelDiampu && guru.mapelDiampu.length > 0 && !guru.mapelDiampu.every(item => item === "0") ? (
                      <div className="text-sm text-gray-900">
                        {Array.isArray(guru.mapelDiampu) ? guru.mapelDiampu.filter(item => item !== "0").join(', ') : String(guru.mapelDiampu)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Tidak ada mata pelajaran</div>
                    )}
                    {guru.jamMengajar !== null && guru.jamMengajar !== undefined && guru.jamMengajar > 0 ? (
                      <div className="text-sm text-gray-500">{guru.jamMengajar} jam/minggu</div>
                    ) : (
                      <div className="text-sm text-gray-500">Tidak ada jam mengajar</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === guru.id ? null : guru.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === guru.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onViewGuru(guru);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Lihat Detail</span>
                          </button>
                          <button
                            onClick={() => {
                              onEditGuru(guru);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteGuru(guru.id);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="lg:hidden">
        {paginatedGurus.map((guru) => (
          <div key={guru.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{guru.namaLengkap || 'Nama tidak tersedia'}</h3>
                <p className="text-sm text-gray-500">NIP: {guru.nip}</p>
                <div className="mt-1">{getStatusBadge(guru.status)}</div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === guru.id ? null : guru.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {activeDropdown === guru.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onViewGuru(guru);
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat Detail</span>
                      </button>
                      <button
                        onClick={() => {
                          onEditGuru(guru);
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteGuru(guru.id);
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Jabatan & Unit</p>
                <p className="text-sm text-gray-900">{guru.jabatan}</p>
                <p className="text-sm text-gray-500">{guru.unitKerja}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Tempat, Tanggal Lahir</p>
                <p className="text-sm text-gray-900">
                  {guru.tempatLahir}, {guru.tanggalLahir ? new Date(guru.tanggalLahir).toLocaleDateString('id-ID') : 'Tidak ada tanggal'} ({calculateAge(guru.tanggalLahir)} tahun)
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Pendidikan</p>
                <p className="text-sm text-gray-900">
                  {guru.pendidikan?.jenjang || 'Tidak ada data'} - {guru.pendidikan?.jurusan || 'Tidak ada data'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Mata Pelajaran & Jam Mengajar</p>
                {guru.mapelDiampu && guru.mapelDiampu.length > 0 && !guru.mapelDiampu.every(item => item === "0") ? (
                  <p className="text-sm text-gray-900">{Array.isArray(guru.mapelDiampu) ? guru.mapelDiampu.filter(item => item !== "0").join(', ') : String(guru.mapelDiampu)}</p>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada mata pelajaran</p>
                )}
                {guru.jamMengajar !== null && guru.jamMengajar !== undefined && guru.jamMengajar > 0 ? (
                  <p className="text-sm text-gray-500">{guru.jamMengajar} jam/minggu</p>
                ) : (
                  <p className="text-sm text-gray-500">Tidak ada jam mengajar</p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">TMT & Masa Kerja</p>
                  <p className="text-sm text-gray-900">{guru.tmt ? new Date(guru.tmt).toLocaleDateString('id-ID') : 'Tidak ada TMT'}</p>
                  <p className="text-sm text-gray-500">{guru.masaKerja || calculateMasaKerja(guru.tmt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status Pernikahan</p>
                  <p className="text-sm text-gray-900">{guru.statusPernikahan}</p>
                </div>
              </div>
              
              {guru.tugasTambahan && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Tugas Tambahan</p>
                  <p className="text-sm text-blue-600">{guru.tugasTambahan}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{(currentPage - 1) * (pagination?.perPage || 10) + 1}</span> sampai{' '}
                <span className="font-medium">{Math.min(currentPage * (pagination?.perPage || 10), pagination?.total || filteredGurus.length)}</span> dari{' '}
                <span className="font-medium">{pagination?.total || filteredGurus.length}</span> hasil
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => onPageChange?.(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button
                  onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuruDataTable;
