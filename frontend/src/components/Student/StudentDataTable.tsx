import React, { useState, useEffect, useRef } from 'react';
import type { Student } from '../../types/student';
import { Filter, Download, Upload, MoreVertical, Eye, Edit, Trash2, GraduationCap } from 'lucide-react';

interface StudentDataTableProps {
  students: Student[];
  onImportExcel: (file: File) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onViewStudent: (student: Student) => void;
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  filters: { nama: string; unitSekolah: string; unitKelas: string };
  onFilterChange: (filters: { nama: string; unitSekolah: string; unitKelas: string }) => void;
}

const StudentDataTable: React.FC<StudentDataTableProps> = ({
  students,
  onImportExcel,
  onEditStudent,
  onDeleteStudent,
  onViewStudent,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  totalPages,
  filters,
  onFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Local state untuk input fields agar tidak kehilangan fokus saat re-render
  const [localNama, setLocalNama] = useState(filters.nama);
  const [localUnitKelas, setLocalUnitKelas] = useState(filters.unitKelas);
  const namaInputRef = useRef<HTMLInputElement>(null);
  const kelasInputRef = useRef<HTMLInputElement>(null);

  // Students sudah di-filter di server-side, langsung gunakan dari props

  // Sync local state dengan props filters (hanya jika berbeda)
  useEffect(() => {
    if (filters.nama !== localNama) {
      setLocalNama(filters.nama);
    }
    if (filters.unitKelas !== localUnitKelas) {
      setLocalUnitKelas(filters.unitKelas);
    }
  }, [filters.nama, filters.unitKelas]);

  // Keep filter section open when there are active filters
  useEffect(() => {
    const hasActiveFilters = filters.nama || filters.unitSekolah || filters.unitKelas;
    if (hasActiveFilters) {
      setShowFilters(true);
    }
  }, [filters.nama, filters.unitSekolah, filters.unitKelas]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportExcel(file);
    }
  };

  const handleClearFilters = () => {
    setLocalNama('');
    setLocalUnitKelas('');
    onFilterChange({
      nama: '',
      unitSekolah: '',
      unitKelas: '',
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getUnitBadge = (unit: string) => {
    const unitClasses = {
      'TK': 'bg-purple-100 text-purple-800 border-purple-200',
      'SD': 'bg-blue-100 text-blue-800 border-blue-200',
      'SMP': 'bg-green-100 text-green-800 border-green-200',
      'SMA': 'bg-red-100 text-red-800 border-red-200',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${unitClasses[unit as keyof typeof unitClasses] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {unit}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Enhanced Header with Modern Design */}
      <div className="bg-gradient-to-r from-gray-50 to-emerald-50 p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Murid</h2>
                <p className="text-sm text-gray-600">
                  Total: {totalItems} murid
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              
              <label className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Filter Section */}
          {showFilters && (
            <div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Murid
                  </label>
                  <input
                    ref={namaInputRef}
                    type="text"
                    value={localNama}
                    onChange={(e) => {
                      e.stopPropagation();
                      const value = e.target.value;
                      setLocalNama(value);
                      onFilterChange({ ...filters, nama: value });
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      e.target.select();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Cari nama atau panggilan..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Sekolah
                  </label>
                  <select
                    value={filters.unitSekolah}
                    onChange={(e) => {
                      e.stopPropagation();
                      onFilterChange({ ...filters, unitSekolah: e.target.value });
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  >
                    <option value="">Semua Unit</option>
                    <option value="TK">TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas
                  </label>
                  <input
                    ref={kelasInputRef}
                    type="text"
                    value={localUnitKelas}
                    onChange={(e) => {
                      e.stopPropagation();
                      const value = e.target.value;
                      setLocalUnitKelas(value);
                      onFilterChange({ ...filters, unitKelas: value });
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      e.target.select();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="Cari kelas..."
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Murid
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Informasi Pribadi
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orang Tua
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendidikan
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontak
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.namaLengkap}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initial if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white font-semibold text-lg">${student.namaLengkap.charAt(0).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {student.namaLengkap.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.namaLengkap}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({student.namaPanggilan})
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.tempatLahir}, {new Date(student.tanggalLahir).toLocaleDateString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Usia: {calculateAge(student.tanggalLahir)} tahun
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>Ayah: {student.namaAyah}</div>
                    <div>Ibu: {student.namaIbu}</div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {getUnitBadge(student.unitSekolah)}
                    <span className="text-sm text-gray-600">
                      Kelas {student.unitKelas}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {student.nomorHP}
                  </div>
                  <div className="text-sm text-gray-500">
                    {student.email}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === student.id ? null : student.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdown === student.id && (
                      <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <button
                          onClick={() => {
                            onViewStudent(student);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Lihat Detail</span>
                        </button>
                        <button
                          onClick={() => {
                            onEditStudent(student);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            onDeleteStudent(student.id);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {currentPage * itemsPerPage - itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} murid
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDataTable;
