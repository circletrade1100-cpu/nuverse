import { useState, useEffect } from 'react';
import {
  getJournalEntries,
  createJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  deleteJournalEntry,
  getChartOfAccounts,
  JournalEntry,
  JournalDetail,
  ChartOfAccount
} from '../services/accountingService';
import { toast } from 'react-hot-toast';

export default function JournalEntries() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    description: '',
    entry_type: 'manual' as const,
    details: [
      { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' },
      { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }
    ]
  });

  useEffect(() => {
    fetchJournals();
    fetchAccounts();
  }, [pagination.current_page, searchTerm, filterStatus]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const response = await getJournalEntries({
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: searchTerm || undefined,
        status: filterStatus || undefined
      });

      if (response.success) {
        setJournals(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await getChartOfAccounts({ per_page: 1000, is_active: true });
      if (response.success) {
        setAccounts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalDebit = formData.details.reduce((sum, d) => sum + d.debit_amount, 0);
    const totalCredit = formData.details.reduce((sum, d) => sum + d.credit_amount, 0);
    
    if (totalDebit !== totalCredit) {
      toast.error('Total debit harus sama dengan total credit');
      return;
    }

    try {
      const response = await createJournalEntry(formData);
      if (response.success) {
        toast.success('Jurnal berhasil dibuat');
        fetchJournals();
        handleCloseModal();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan jurnal');
    }
  };

  const handlePost = async (id: number) => {
    if (!confirm('Post jurnal ini?')) return;
    
    try {
      const response = await postJournalEntry(id);
      if (response.success) {
        toast.success('Jurnal berhasil di-post');
        fetchJournals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mem-post jurnal');
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm('Void jurnal ini?')) return;
    
    try {
      const response = await voidJournalEntry(id);
      if (response.success) {
        toast.success('Jurnal berhasil di-void');
        fetchJournals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mem-void jurnal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus jurnal ini?')) return;
    
    try {
      const response = await deleteJournalEntry(id);
      if (response.success) {
        toast.success('Jurnal berhasil dihapus');
        fetchJournals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus jurnal');
    }
  };

  const addDetail = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }]
    });
  };

  const removeDetail = (index: number) => {
    if (formData.details.length <= 2) {
      toast.error('Minimal 2 detail entry');
      return;
    }
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData({ ...formData, details: newDetails });
  };

  const updateDetail = (index: number, field: keyof JournalDetail, value: any) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, details: newDetails });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      description: '',
      entry_type: 'manual',
      details: [
        { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' },
        { account_id: 0, debit_amount: 0, credit_amount: 0, description: '' }
      ]
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      posted: 'bg-green-100 text-green-800',
      void: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalDebit = formData.details.reduce((sum, d) => sum + d.debit_amount, 0);
  const totalCredit = formData.details.reduce((sum, d) => sum + d.credit_amount, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jurnal Umum</h1>
        <p className="text-gray-600">Kelola entri jurnal akuntansi</p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari jurnal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="posted">Posted</option>
            <option value="void">Void</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Buat Jurnal
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Jurnal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : journals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data jurnal
                </td>
              </tr>
            ) : (
              journals.map((journal) => (
                <tr key={journal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{journal.entry_number}</td>
                  <td className="px-6 py-4 text-sm">{new Date(journal.entry_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{journal.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right">Rp {journal.total_debit.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm text-right">Rp {journal.total_credit.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(journal.status)}`}>
                      {journal.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {journal.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handlePost(journal.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Post
                        </button>
                        <button
                          onClick={() => handleDelete(journal.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                    {journal.status === 'posted' && (
                      <button
                        onClick={() => handleVoid(journal.id)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        Void
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
            <h2 className="text-xl font-bold mb-4">Buat Jurnal Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      value={formData.entry_date}
                      onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Referensi
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Detail Jurnal</h3>
                    <button
                      type="button"
                      onClick={addDetail}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Tambah Baris
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {formData.details.map((detail, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select
                          value={detail.account_id}
                          onChange={(e) => updateDetail(index, 'account_id', parseInt(e.target.value))}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value={0}>Pilih Akun</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.account_code} - {acc.account_name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Debit"
                          value={detail.debit_amount}
                          onChange={(e) => updateDetail(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Credit"
                          value={detail.credit_amount}
                          onChange={(e) => updateDetail(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between text-sm font-medium">
                    <span>Total Debit: Rp {totalDebit.toLocaleString('id-ID')}</span>
                    <span>Total Credit: Rp {totalCredit.toLocaleString('id-ID')}</span>
                    <span className={totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'}>
                      Selisih: Rp {Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={totalDebit !== totalCredit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

