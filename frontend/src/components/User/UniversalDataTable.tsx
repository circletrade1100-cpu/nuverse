import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import type { Parent, Guru, Manajemen, UserType } from '../../types/user';

interface UniversalDataTableProps {
  type: UserType;
  data: Parent[] | Guru[] | Manajemen[];
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

const UniversalDataTable: React.FC<UniversalDataTableProps> = ({
  type,
  data,
  onView,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Debug: Log data yang diterima
  console.log('UniversalDataTable received data:', data);
  console.log('UniversalDataTable type:', type);
  console.log('UniversalDataTable searchTerm:', searchTerm);

  // Filter data berdasarkan search term
  const filteredData = data.filter((item: any) => {
    // Jika tidak ada search term, tampilkan semua data
    if (!searchTerm) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    console.log('Filtering item:', item, 'with search:', searchLower);
    
    switch (type) {
      case 'parents':
        return (
          (item.namaOrangTua && item.namaOrangTua.toLowerCase().includes(searchLower)) ||
          (item.namaAnak && item.namaAnak.toLowerCase().includes(searchLower)) ||
          (item.nisn && item.nisn.toLowerCase().includes(searchLower))
        );
      case 'guru':
        return (
          (item.namaLengkap && item.namaLengkap.toLowerCase().includes(searchLower)) ||
          (item.nip && item.nip.toLowerCase().includes(searchLower)) ||
          (item.jabatan && item.jabatan.toLowerCase().includes(searchLower))
        );
      case 'manajemen':
        return (
          (item.namaLengkap && item.namaLengkap.toLowerCase().includes(searchLower)) ||
          (item.nip && item.nip.toLowerCase().includes(searchLower)) ||
          (item.jabatan && item.jabatan.toLowerCase().includes(searchLower)) ||
          (item.unitKerja && item.unitKerja.toLowerCase().includes(searchLower)) ||
          (item.role && item.role.toLowerCase().includes(searchLower))
        );
      default:
        return true;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Debug: Log hasil filtering dan pagination
  console.log('Filtered data length:', filteredData.length);
  console.log('Total pages:', totalPages);
  console.log('Current page:', currentPage);
  console.log('Paginated data length:', paginatedData.length);

  const getColumns = () => {
    switch (type) {
      case 'parents':
        return [
          { key: 'nisn', label: 'NISN', width: '15%' },
          { key: 'namaOrangTua', label: 'Nama Orang Tua', width: '35%' },
          { key: 'namaAnak', label: 'Nama Anak', width: '35%' },
          { key: 'status', label: 'Status', width: '10%' },
          { key: 'actions', label: 'Aksi', width: '5%' },
        ];
      case 'guru':
        return [
          { key: 'nip', label: 'NIP', width: '20%' },
          { key: 'namaLengkap', label: 'Nama Lengkap', width: '40%' },
          { key: 'jabatan', label: 'Jabatan', width: '25%' },
          { key: 'status', label: 'Status', width: '10%' },
          { key: 'actions', label: 'Aksi', width: '5%' },
        ];
      case 'manajemen':
        return [
          { key: 'nip', label: 'NIP', width: '15%' },
          { key: 'namaLengkap', label: 'Nama Lengkap', width: '25%' },
          { key: 'jabatan', label: 'Jabatan', width: '20%' },
          { key: 'unitKerja', label: 'Unit Kerja', width: '20%' },
          { key: 'role', label: 'Role', width: '10%' },
          { key: 'status', label: 'Status', width: '5%' },
          { key: 'actions', label: 'Aksi', width: '5%' },
        ];
      default:
        return [];
    }
  };

  const renderCell = (item: any, column: string) => {
    console.log('Rendering cell for column:', column, 'item:', item);
    switch (column) {
      case 'status':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.status === 'Aktif'
                ? 'bg-green-100 text-green-800'
                : item.status === 'Non-Aktif'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.status}
          </span>
        );
      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={() => onView(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Lihat Detail"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        const value = item[column] || '-';
        console.log('Default render for column:', column, 'value:', value);
        return value;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'parents':
        return 'Data Orang Tua';
      case 'guru':
        return 'Data Guru';
      case 'manajemen':
        return 'Data Manajemen';
      default:
        return 'Data Pengguna';
    }
  };

  const columns = getColumns();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Cari ${getTitle().toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(item, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === page
                      ? 'text-white bg-blue-600'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default UniversalDataTable;
