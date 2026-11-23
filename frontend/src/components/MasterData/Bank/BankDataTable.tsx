import React, { useMemo, useState } from 'react';
import { Search, Filter, Edit, Trash2, Landmark } from 'lucide-react';
import type { Bank, BankFilters } from '../../../types/masterData';

interface BankDataTableProps {
  data: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (id: string) => void;
}

const BankDataTable: React.FC<BankDataTableProps> = ({ data, onEdit, onDelete }) => {
  const [filters, setFilters] = useState<BankFilters>({
    namaBank: '',
    nomorRekening: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameMatch = item.namaBank.toLowerCase().includes(filters.namaBank.toLowerCase());
      const accountMatch = item.nomorRekening
        .toLowerCase()
        .includes(filters.nomorRekening.toLowerCase());
      return nameMatch && accountMatch;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setFilters({
      namaBank: '',
      nomorRekening: '',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            Data Bank
          </h2>
          <p className="text-sm text-gray-500">
            {filteredData.length} dari {data.length} bank terdaftar
          </p>
        </div>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {showFilters && (
        <div className="px-6 pb-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
              <input
                type="text"
                value={filters.namaBank}
                onChange={(event) => {
                  setCurrentPage(1);
                  setFilters({ ...filters, namaBank: event.target.value });
                }}
                placeholder="Cari nama bank..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={filters.nomorRekening}
                onChange={(event) => {
                  setCurrentPage(1);
                  setFilters({ ...filters, nomorRekening: event.target.value });
                }}
                placeholder="Cari nomor rekening..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Bersihkan Filter
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                Nama Bank
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                Nomor Rekening
              </th>
              <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider px-6 py-3">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.namaBank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700 font-mono">{item.nomorRekening}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      title="Edit bank"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Hapus bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Belum ada data bank</h3>
          <p className="text-gray-500">
            {data.length === 0
              ? 'Silakan tambahkan data bank pertama Anda.'
              : 'Tidak ada data yang sesuai dengan filter.'}
          </p>
        </div>
      )}

      {filteredData.length > 0 && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1} sampai{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length}{' '}
            data
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDataTable;

