import React, { useState, useMemo } from 'react';
import type { User, UserFilters } from '../../types/user';
import { Filter, Download, Upload, MoreVertical, Eye, Edit, Trash2, Users } from 'lucide-react';

interface UserDataTableProps {
  users: User[];
  onImportExcel: (file: File) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onViewUser: (user: User) => void;
}

const UserDataTable: React.FC<UserDataTableProps> = ({
  users,
  onImportExcel,
  onEditUser,
  onDeleteUser,
  onViewUser,
}) => {
  const [filters, setFilters] = useState<UserFilters>({
    nama: '',
    nip: '',
    status: '',
    unitKerja: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter users berdasarkan kriteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesNama = user.namaLengkap.toLowerCase().includes(filters.nama.toLowerCase());
      const matchesNip = user.nip.toLowerCase().includes(filters.nip.toLowerCase());
      const matchesStatus = !filters.status || user.status === filters.status;
      const matchesUnitKerja = !filters.unitKerja || user.unitKerja.toLowerCase().includes(filters.unitKerja.toLowerCase());
      
      return matchesNama && matchesNip && matchesStatus && matchesUnitKerja;
    });
  }, [users, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportExcel(file);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      nama: '',
      nip: '',
      status: '',
      unitKerja: '',
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Enhanced Header with Modern Design */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Data Pengguna</h2>
                <p className="text-sm text-gray-600">
                  {filteredUsers.length} dari {users.length} pengguna
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                  showFilters 
                    ? 'text-blue-700 bg-blue-100 border-blue-200' 
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                } border shadow-sm hover:shadow-md`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              
              <label className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300">
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              <button className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filter Form */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter Pencarian</h3>
                <p className="text-sm text-gray-600">Gunakan filter untuk mencari data pengguna yang spesifik</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <input
                    type="text"
                    value={filters.nama}
                    onChange={(e) => setFilters({ ...filters, nama: e.target.value })}
                    placeholder="Cari nama..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                  <input
                    type="text"
                    value={filters.nip}
                    onChange={(e) => setFilters({ ...filters, nip: e.target.value })}
                    placeholder="Cari NIP..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                    <option value="Pensiun">Pensiun</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Kerja</label>
                  <input
                    type="text"
                    value={filters.unitKerja}
                    onChange={(e) => setFilters({ ...filters, unitKerja: e.target.value })}
                    placeholder="Cari unit kerja..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Reset Filter
                </button>
                <div className="text-sm text-gray-500">
                  {filteredUsers.length} hasil ditemukan
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table - Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Data Pribadi
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Kepegawaian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Pendidikan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Tugas Mengajar
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group">
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.namaLengkap.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-gray-900 truncate">{user.namaLengkap}</div>
                      <div className="text-sm text-gray-600 mt-1">NIP: {user.nip}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {user.tempatLahir}, {new Date(user.tanggalLahir).toLocaleDateString('id-ID')} ({calculateAge(user.tanggalLahir)} tahun)
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{user.statusPernikahan}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900">{user.jabatan}</div>
                    <div className="text-sm text-gray-600">{user.unitKerja}</div>
                    <div className="text-sm text-gray-500">TMT: {new Date(user.tmt).toLocaleDateString('id-ID')}</div>
                    <div className="text-sm text-gray-500">Masa Kerja: {user.masaKerja}</div>
                    <div className="mt-2">{getStatusBadge(user.status)}</div>
                    {user.tugasTambahan && (
                      <div className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-medium mt-2">
                        + {user.tugasTambahan}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900">{user.pendidikan.jenjang}</div>
                    <div className="text-sm text-gray-600">{user.pendidikan.jurusan}</div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className="space-y-2">
                    {user.mapelDiampu && user.mapelDiampu.length > 0 && (
                      <div className="text-sm text-gray-900 font-medium">
                        {Array.isArray(user.mapelDiampu) ? user.mapelDiampu.join(', ') : (user.mapelDiampu || '-')}
                      </div>
                    )}
                    {user.jamMengajar && (
                      <div className="inline-flex items-center px-2 py-1 rounded-lg bg-green-100 text-green-800 text-xs font-medium">
                        {user.jamMengajar} jam/minggu
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeDropdown === user.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              onViewUser(user);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Lihat Detail</span>
                          </button>
                          <button
                            onClick={() => {
                              onEditUser(user);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteUser(user.id);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
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

      {/* Enhanced Mobile View - Card Layout */}
      <div className="lg:hidden space-y-4">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {user.namaLengkap.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{user.namaLengkap}</h3>
                  <p className="text-sm text-gray-600 mt-1">NIP: {user.nip}</p>
                  <div className="mt-2">{getStatusBadge(user.status)}</div>
                </div>
              </div>
              <div className="relative ml-4">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {activeDropdown === user.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onViewUser(user);
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat Detail</span>
                      </button>
                      <button
                        onClick={() => {
                          onEditUser(user);
                          setActiveDropdown(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteUser(user.id);
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
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Jabatan & Unit</p>
                <p className="text-base font-medium text-gray-900">{user.jabatan}</p>
                <p className="text-sm text-gray-600">{user.unitKerja}</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tempat, Tanggal Lahir</p>
                <p className="text-sm text-gray-900">
                  {user.tempatLahir}, {new Date(user.tanggalLahir).toLocaleDateString('id-ID')} ({calculateAge(user.tanggalLahir)} tahun)
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Pendidikan</p>
                <p className="text-sm text-gray-900">{user.pendidikan.jenjang} - {user.pendidikan.jurusan}</p>
              </div>
              
              {user.mapelDiampu && user.mapelDiampu.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</p>
                  <p className="text-sm text-gray-900">{Array.isArray(user.mapelDiampu) ? user.mapelDiampu.join(', ') : (user.mapelDiampu || '-')}</p>
                  {user.jamMengajar && (
                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-green-100 text-green-800 text-xs font-medium mt-2">
                      {user.jamMengajar} jam/minggu
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">TMT & Masa Kerja</p>
                  <p className="text-sm text-gray-900">{new Date(user.tmt).toLocaleDateString('id-ID')}</p>
                  <p className="text-sm text-gray-500">{user.masaKerja}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Status Pernikahan</p>
                  <p className="text-sm text-gray-900">{user.statusPernikahan}</p>
                </div>
              </div>
              
              {user.tugasTambahan && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Tugas Tambahan</p>
                  <p className="text-sm text-blue-800">{user.tugasTambahan}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
              >
                Next
              </button>
            </div>
          
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-semibold text-blue-600">{startIndex + 1}</span> sampai{' '}
                  <span className="font-semibold text-blue-600">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> dari{' '}
                  <span className="font-semibold text-blue-600">{filteredUsers.length}</span> hasil
                </p>
              </div>
              <div>
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <span className="sr-only">Previous</span>
                    ← Prev
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'bg-white border border-gray-300 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <span className="sr-only">Next</span>
                    Next →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDataTable;