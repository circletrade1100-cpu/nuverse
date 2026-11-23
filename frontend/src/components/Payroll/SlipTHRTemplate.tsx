import { forwardRef } from 'react';

export interface SlipTHRData {
  id: number | string;
  namaLengkap: string;
  nip?: string;
  jabatan?: string;
  unitSekolah?: string;
  masaKerjaTahun: number;
  gajiPokok: number;
  tunjanganJabatan: number;
  masaKerjaRupiah: number;
  jumlahTatapMuka: number;
  tatapMukaRupiah: number;
  totalRupiah: number;
  tahun: number;
  namaBank?: string;
  noRekening?: string;
  tanggalCetak?: string;
}

interface SlipTHRTemplateProps {
  data: SlipTHRData;
}

const SlipTHRTemplate = forwardRef<HTMLDivElement, SlipTHRTemplateProps>(({ data }, ref) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value || 0);
  };

  return (
    <div
      ref={ref}
      className="min-h-screen bg-slate-50 text-slate-800 print:bg-white"
    >
      <div className="max-w-4xl mx-auto py-10 px-8 print:px-6 print:py-8">
        {/* Header */}
        <header className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg print:shadow-none bg-white flex items-center justify-center">
                <img
                  src="/logo-annur.png"
                  alt="Logo YPI Nurrahim Annur"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-wide">YPI NURRAHIM ANNUR</h1>
                <p className="text-sm text-slate-500">Cikarang, Jawa Barat</p>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Slip Tunjangan Hari Raya {data.tahun}
            </p>
          </div>
          <div className="text-right space-y-1">
            {/* <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">THR #{data.id}</p> */}
            <p className="text-sm font-semibold text-slate-900">Tanggal Cetak</p>
            <p className="text-sm text-slate-600">
              {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}
            </p>
          </div>
        </header>

        {/* Employee Info */}
        <section className="mt-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:shadow-none">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Informasi Karyawan</h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-semibold text-slate-900">{data.namaLengkap}</span>
              </div>
              {data.nip && (
                <div className="flex justify-between">
                  <span className="text-slate-500">NIP</span>
                  <span className="font-medium text-slate-800">{data.nip}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Jabatan</span>
                <span className="font-medium text-slate-800">{data.jabatan || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Sekolah</span>
                <span className="font-medium text-slate-800">{data.unitSekolah || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Kerja</span>
                <span className="font-medium text-slate-800">{formatNumber(data.masaKerjaTahun)} Tahun</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:shadow-none">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Informasi Pembayaran</h2>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Gaji Pokok</span>
                <span className="font-medium text-slate-800">{formatCurrency(data.gajiPokok)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tunjangan Jabatan</span>
                <span className="font-medium text-slate-800">{formatCurrency(data.tunjanganJabatan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tunjangan Masa Kerja</span>
                <span className="font-medium text-slate-800">{formatCurrency(data.masaKerjaRupiah)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tatap Muka ({formatNumber(data.jumlahTatapMuka)}x)</span>
                <span className="font-medium text-slate-800">{formatCurrency(data.tatapMukaRupiah)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total THR</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalRupiah)}</span>
              </div>
              {(data.namaBank || data.noRekening) && (
                <div className="pt-2 border-t border-dashed border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Rekening Penerima</p>
                  <p className="text-sm font-semibold text-slate-800">{data.namaBank || '-'}</p>
                  <p className="text-sm font-medium text-slate-700">{data.noRekening || '-'}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Breakdown */}
        <section className="mt-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:shadow-none">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Rincian Komponen THR</h2>
          </div>
          <div className="p-3 space-y-2.5 text-sm">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <p className="text-xs uppercase text-emerald-600 font-semibold tracking-wide">Gaji Pokok</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(data.gajiPokok)}</p>
                <p className="text-xs text-emerald-500 mt-1">Dasar perhitungan THR</p>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
                <p className="text-xs uppercase text-sky-600 font-semibold tracking-wide">Tunjangan Jabatan</p>
                <p className="mt-1 text-lg font-bold text-sky-700">{formatCurrency(data.tunjanganJabatan)}</p>
                <p className="text-xs text-sky-500 mt-1">Penyesuaian jabatan aktif</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <p className="text-xs uppercase text-amber-600 font-semibold tracking-wide">Tunjangan Masa Kerja</p>
                <p className="mt-1 text-lg font-bold text-amber-700">{formatCurrency(data.masaKerjaRupiah)}</p>
                <p className="text-xs text-amber-500 mt-1">Akumulasi masa kerja</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <p className="text-xs uppercase text-indigo-600 font-semibold tracking-wide">
                  Tatap Muka ({formatNumber(data.jumlahTatapMuka)}x)
                </p>
                <p className="mt-1 text-lg font-bold text-indigo-700">{formatCurrency(data.tatapMukaRupiah)}</p>
                <p className="text-xs text-indigo-500 mt-1">Intensitas tatap muka efektif</p>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-8">
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-6 py-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Catatan</p>
            <ul className="mt-3 grid grid-cols-2 gap-3 list-disc list-inside">
              <li>Slip ini dicetak secara otomatis melalui sistem Payroll.</li>
              <li>Pastikan informasi rekening sudah diperbarui sebelum pencairan.</li>
              <li>Hubungi bagian keuangan untuk koreksi data paling lambat H-3 pencairan THR.</li>
              <li>Total THR termasuk komponen masa kerja dan tatap muka yang sudah diverifikasi.</li>
            </ul>
          </div>
        </section>

        {/* Signature */}
        <section className="mt-10 flex justify-between items-end text-sm">
          <div>
            <p className="text-slate-500">Disiapkan oleh</p>
            <p className="mt-16 font-semibold text-slate-800 border-t border-slate-300 pt-2">
              Bagian Payroll
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Disetujui oleh</p>
            <p className="mt-16 font-semibold text-slate-800 border-t border-slate-300 pt-2">
              Bendahara Yayasan
            </p>
          </div>
        </section>
      </div>
    </div>
  );
});

SlipTHRTemplate.displayName = 'SlipTHRTemplate';

export default SlipTHRTemplate;

