import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Bank, BankFormData } from '../../types/masterData';
import BankDataTable from '../../components/MasterData/Bank/BankDataTable';
import BankFormModal from '../../components/MasterData/Bank/BankFormModal';
import { bankService } from '../../services/bankService';

const BankPage: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const total = banks.length;
    const uniqueRekening = new Set(banks.map((item) => item.nomorRekening)).size;
    return { total, uniqueRekening };
  }, [banks]);

  const fetchBanks = async (search?: string) => {
    try {
      setIsLoading(true);
      const response = await bankService.getAll({
        search,
        per_page: 100,
      });

      if (response.success) {
        setBanks(response.data.data);
      } else {
        toast.error('Gagal memuat data bank');
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Terjadi kesalahan saat memuat data bank');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchBanks(searchTerm.trim() || undefined);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingBank(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm('Apakah Anda yakin ingin menghapus data bank ini?');
    if (!confirmation) {
      return;
    }

    try {
      const response = await bankService.delete(id);
      if (response.success) {
        toast.success('Bank berhasil dihapus');
        fetchBanks(searchTerm.trim() || undefined);
      } else {
        toast.error(response.message ?? 'Gagal menghapus data bank');
      }
    } catch (error: any) {
      console.error('Error deleting bank:', error);
      const message =
        error?.errors?.nomor_rekening?.[0] ??
        error?.message ??
        'Terjadi kesalahan saat menghapus bank';
      toast.error(message);
    }
  };

  const handleSubmit = async (formData: BankFormData) => {
    try {
      if (editingBank) {
        const response = await bankService.update(editingBank.id, formData);
        if (response.success) {
          toast.success('Bank berhasil diperbarui');
        }
      } else {
        const response = await bankService.create(formData);
        if (response.success) {
          toast.success('Bank berhasil ditambahkan');
        }
      }
      setIsModalOpen(false);
      setEditingBank(null);
      fetchBanks(searchTerm.trim() || undefined);
    } catch (error: any) {
      console.error('Error saving bank:', error);
      if (error?.errors) {
        Object.values(error.errors).forEach((messages) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(messages[0]);
          }
        });
      } else {
        toast.error(editingBank ? 'Gagal memperbarui bank' : 'Gagal menambahkan bank');
      }
      throw error;
    }
  };

  const convertToFormData = (bank: Bank): BankFormData => ({
    namaBank: bank.namaBank,
    nomorRekening: bank.nomorRekening,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="p-2 bg-amber-100 rounded-lg">
              <Landmark className="w-8 h-8 text-amber-600" />
            </span>
            Master Data Bank
          </h1>
          <p className="text-gray-600 mt-2">Kelola daftar bank beserta nomor rekening resmi.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Tambah Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Total Bank</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        {/* <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Nomor Rekening</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.uniqueRekening}</p>
        </div> */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Pencarian</p>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari bank atau nomor rekening..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <BankDataTable data={banks} onEdit={handleEdit} onDelete={handleDelete} />

      <BankFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBank(null);
        }}
        onSubmit={handleSubmit}
        isEdit={!!editingBank}
        initialData={editingBank ? convertToFormData(editingBank) : undefined}
      />
    </div>
  );
};

export default BankPage;

