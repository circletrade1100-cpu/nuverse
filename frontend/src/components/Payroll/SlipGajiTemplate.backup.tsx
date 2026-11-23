import { forwardRef } from 'react';

interface SlipGajiData {
  id: string;
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  periode: string;
  
  // Pendapatan - Gaji Dasar & Tunjangan
  gajiPokok: number;
  tunjanganJabatan: number;
  masaKerja: number;
  waliKelas: number;
  koordinator: number;
  tatapmuka: number;
  tatapMukaPengganti: number;
  tunjanganKeluarga: number;
  transport: number;
  makan: number;
  jamsostek: number;
  overtime: number;
  
  // Insentif
  pramuka: number;
  tunjanganLain: number;
  ekskul: number;
  bimbel: number;
  proyek: number;
  insentifPramuka: number;
  insentifEkskul: number;
  insentifProyek: number;
  insentifBimbel: number;
  insentifLain: number;
  
  // Total Pendapatan
  totalPendapatan: number;
  lemburHari: number;
  gajiLembur: number;
  
  // Transport Detail
  transport1?: number;
  transport2?: number;
  jumlahHari?: number;
  jumlahHariLain?: number;
  totalTransport?: number;
  totalTransport2?: number;
  totalTransportAll?: number;
  
  // Tatap Muka Pengganti Detail
  jumlahHariTatapMukaPengganti?: number;
  baseTatapMukaPengganti?: number;
  
  // Potongan Standar
  potonganYayasan: number;
  potonganLain: number;
  potonganKoperasiWajib: number;
  potonganKoperasiSukarela: number;
  potonganAngsuranKoperasi: number;
  depositAnnurmart: number;
  potonganJHT: number;
  potonganPPH21: number;
  potonganTMukaPengganti: number;
  
  // Potongan Lain
  potonganBPJS: number;
  potonganPajak: number;
  potonganAbsen: number;
  
  // Total Potongan & Net
  totalPotongan: number;
  gajiDiterima: number;
  totalGaji: number;
  status: 'Draft' | 'Disetujui' | 'Dibayar';
  tanggalGenerate: string;
  tanggalBayar?: string;
  namaBank?: string;
  noRekening?: string;
  memo?: string;
  tanggalMulaiBekerja?: string;
  hariKerja?: number | string;
  absen?: number | string;
}

interface SlipGajiTemplateProps {
  data: SlipGajiData;
  showWatermark?: boolean;
  templateType?: 'formal' | 'modern' | 'minimalist';
}

const SlipGajiTemplate = forwardRef<HTMLDivElement, SlipGajiTemplateProps>(
  ({ data }, ref) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return dateString;
      }
    };

    const formatPeriode = (periode: string) => {
      if (!periode) return '';
      if (periode.includes(' ') && !periode.includes('-')) {
        return periode;
      }
      const [year, month] = periode.split('-');
      if (!year || !month) return periode;
      
      return `${year}/${String(parseInt(month)).padStart(2, '0')}`;
    };

    // Helper untuk mendapatkan semua pendapatan yang > 0
    const getPendapatanItems = () => {
      const items: Array<{ label: string; value: number; showDetail?: boolean; jumlahHari?: number; nilaiPerHari?: number }> = [];
      
      if (data.gajiPokok > 0) items.push({ label: 'Gaji Pokok', value: data.gajiPokok });
      if (data.overtime > 0 || data.gajiLembur > 0) {
        items.push({ label: 'Lembur', value: data.overtime || data.gajiLembur });
      }
      if (data.tunjanganJabatan > 0) items.push({ label: 'Tunjangan Jabatan', value: data.tunjanganJabatan });
      
      // Transport - tampilkan secara terpisah jika ada
      if (data.transport1 !== undefined && data.transport1 > 0) {
        items.push({ label: 'Transport 1', value: data.transport1 });
      }
      if (data.transport2 !== undefined && data.transport2 > 0) {
        items.push({ label: 'Transport 2', value: data.transport2 });
      }
      if (data.totalTransportAll !== undefined && data.totalTransportAll > 0) {
        items.push({ label: 'Total Transport All', value: data.totalTransportAll });
      } else {
        // Fallback ke transport lain jika total_transport_all tidak ada
        const transportValue = data.totalTransport || data.transport || 
          (data.jumlahHari && data.transport1 ? data.jumlahHari * (data.transport1 || 0) : 0);
        if (transportValue > 0) {
          items.push({ label: 'Total Transport', value: transportValue });
        }
      }
      
      if (data.makan > 0) items.push({ label: 'Uang Makan', value: data.makan });
      
      // Tunjangan lain-lain
      if (data.masaKerja > 0) items.push({ label: 'Tunjangan Masa Kerja', value: data.masaKerja });
      if (data.waliKelas > 0) items.push({ label: 'Tunjangan Wali Kelas', value: data.waliKelas });
      if (data.koordinator > 0) items.push({ label: 'Tunjangan Koordinator', value: data.koordinator });
      if (data.tatapmuka > 0) items.push({ label: 'Tunjangan Tatap Muka', value: data.tatapmuka });
      // Tunjangan Tatap Muka Pengganti - format khusus dengan jumlah hari x value
      const jumlahHariTMP = data.jumlahHariTatapMukaPengganti || 0; // Default 23 hari
      const baseTMP = data.baseTatapMukaPengganti || 0;
      const totalTMP = data.tatapMukaPengganti || 0;
      // Hitung nilai per hari jika ada total dan jumlah hari, atau gunakan base value
      const nilaiPerHari = totalTMP > 0 && jumlahHariTMP > 0 ? Math.round(totalTMP / jumlahHariTMP) : (baseTMP || 0);
      items.push({ 
        label: 'Tunjangan Tatap Muka Pengganti', 
        value: totalTMP || (jumlahHariTMP * nilaiPerHari), // Jika total kosong, hitung dari hari x value
        showDetail: true,
        jumlahHari: jumlahHariTMP,
        nilaiPerHari: nilaiPerHari
      });
      if (data.tunjanganKeluarga > 0) items.push({ label: 'Tunjangan Keluarga', value: data.tunjanganKeluarga });
      if (data.tunjanganLain > 0) items.push({ label: 'Tunjangan Lain', value: data.tunjanganLain });
      if (data.pramuka > 0) items.push({ label: 'Insentif Pramuka', value: data.pramuka });
      // Makan - selalu tampilkan meskipun 0
      items.push({ label: 'Makan', value: data.makan || 0 });
      // Over Time - selalu tampilkan meskipun 0
      items.push({ label: 'Over Time', value: data.overtime || data.gajiLembur || 0 });
      if (data.ekskul > 0) items.push({ label: 'Insentif Ekskul', value: data.ekskul });
      // Insentif Bimbel/Proyek - selalu tampilkan meskipun 0
      const insentifBimbelProyek = (data.bimbel || 0) + (data.proyek || 0);
      items.push({ label: 'Insentif Bimbel/Proyek', value: insentifBimbelProyek });
      // Insentif Pengurus Pramuka - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Pramuka', value: data.insentifPramuka || 0 });
      // Insentif Pengurus Ekskul - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Ekskul', value: data.insentifEkskul || 0 });
      // Insentif Pengurus Bimbel/Proyek - selalu tampilkan meskipun 0
      const insentifPengurusBimbelProyek = (data.insentifBimbel || 0) + (data.insentifProyek || 0);
      items.push({ label: 'Insentif Pengurus Bimbel/Proyek', value: insentifPengurusBimbelProyek });
      if (data.insentifLain > 0) items.push({ label: 'Insentif Lain', value: data.insentifLain });
      
      return items;
    };

    // Helper untuk mendapatkan semua potongan yang > 0
    const getPotonganItems = () => {
      const items: Array<{ label: string; value: number }> = [];
      
      if (data.potonganAbsen > 0) items.push({ label: 'Potongan Absen', value: data.potonganAbsen });
      if (data.potonganTMukaPengganti > 0) {
        items.push({ label: 'Potongan Tatap Muka Pengganti', value: data.potonganTMukaPengganti });
      }
      // BPJS Kesehatan - selalu tampilkan meskipun 0
      const bpjsKesehatan = data.potonganBPJS || data.jamsostek || 0;
      items.push({ label: 'BPJS Kesehatan', value: bpjsKesehatan });
      if (data.potonganJHT > 0) items.push({ label: 'Potongan BPJS TK JHT', value: data.potonganJHT });
      // JP biasanya 2% dari gaji pokok atau value terpisah
      if (data.potonganJHT > 0) {
        const jpValue = Math.round(data.potonganJHT * 0.2); // Estimasi
        if (jpValue > 0) items.push({ label: 'Potongan BPJS TK JP', value: jpValue });
      }
      if (data.potonganPPH21 > 0 || data.potonganPajak > 0) {
        items.push({ label: 'Potongan Pajak PPh21', value: data.potonganPPH21 || data.potonganPajak });
      }
      if (data.potonganYayasan > 0) items.push({ label: 'Potongan Yayasan', value: data.potonganYayasan });
      if (data.potonganAngsuranKoperasi > 0) {
        items.push({ label: 'Potongan Angsuran Koperasi', value: data.potonganAngsuranKoperasi });
      }
      if (data.potonganKoperasiWajib > 0) {
        items.push({ label: 'Potongan Iuran Wajib Koperasi', value: data.potonganKoperasiWajib });
      }
      if (data.depositAnnurmart > 0) items.push({ label: 'Potongan Annurmart', value: data.depositAnnurmart });
      if (data.potonganKoperasiSukarela > 0) {
        items.push({ label: 'Potongan Koperasi Sukarela', value: data.potonganKoperasiSukarela });
      }
      if (data.potonganLain > 0) items.push({ label: 'Potongan Lain-lain', value: data.potonganLain });
      
      return items;
    };

    return (
      <div
        ref={ref}
        className="relative min-h-screen bg-white print:p-0 print:m-0"
      >
        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-6 print:max-w-none print:px-8 print:py-6">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            {/* Left: Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-600 rounded flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">YAYASAN NURRAHIM ANNUR</h2>
                  <p className="text-xs text-slate-600">Cikarang, Indonesia</p>
                </div>
              </div>
            </div>

            {/* Right: Employee Info & Title */}
            <div className="flex-1 flex flex-col items-end">
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Slip Gaji</h1>
              
              {/* Employee Information */}
              <div className="text-right space-y-1 text-sm">
                <div className="flex justify-end gap-2">
                  <span className="text-slate-600">Nama / NIK</span>
                  <span className="font-bold text-slate-900">: {data.nama} ({data.nip})</span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="text-slate-600">Dept / Jabatan</span>
                  <span className="font-bold text-slate-900">: {data.divisi} / {data.jabatan}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="text-slate-600">Tgl Mulai Bekerja</span>
                  <span className="font-bold text-slate-900">: {data.tanggalMulaiBekerja ? formatDate(data.tanggalMulaiBekerja) : '-'}</span>
                  <span className="text-slate-600 ml-4">Periode Gaji</span>
                  <span className="font-bold text-slate-900">: {formatPeriode(data.periode)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Pendapatan & Potongan - 2 Columns */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Left Column: Pendapatan */}
            <div className="border border-slate-200">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Pendapatan</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {getPendapatanItems().map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-2">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    {/* {item.showDetail && item.jumlahHari !== undefined && item.nilaiPerHari !== undefined ? (
                      <span className="text-sm font-semibold text-slate-900 text-center flex-1">
                        {formatCurrency(data.tatapMukaPengganti || 0)}
                      </span>
                    ) : ( */}
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                    {/* )} */}
                  </div>
                ))}
                {/* Total Pendapatan */}
                <div className="bg-slate-100 flex justify-between items-center px-4 py-2">
                  <span className="text-sm font-bold text-slate-900">Total Pendapatan</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(data.totalGaji || data.totalPendapatan)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Potongan */}
            <div className="border border-slate-200">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Potongan</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {getPotonganItems().map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-2">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                {/* Total Potongan */}
                <div className="bg-slate-100 flex justify-between items-center px-4 py-2">
                  <span className="text-sm font-bold text-slate-900">Total Potongan</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(data.totalPotongan)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Gaji Diterima */}
          <div className="mb-6">
            <div className="bg-slate-50 border border-slate-200 px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Gaji Diterima</span>
                <span className="text-lg font-bold text-green-700">{formatCurrency(data.gajiDiterima)}</span>
              </div>
            </div>
          </div>


          {/* Memo Section */}
          {data.memo && (
            <div className="mb-6">
              <div className="bg-slate-100 px-4 py-2 border border-slate-200 border-b-0">
                <h3 className="text-sm font-bold text-slate-900">Memo</h3>
              </div>
              <div className="border border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.memo}</p>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-8 mb-4">
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <p className="font-semibold text-slate-900 mb-12 text-sm">Bendahara</p>
                <div className="border-t border-slate-400 pt-2">
                  <p className="text-xs text-slate-600">(________________________)</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 mb-12 text-sm">Penerima</p>
                <div className="border-t border-slate-400 pt-2">
                  <p className="text-sm font-bold text-slate-900 uppercase">{data.nama}</p>
                  <p className="text-xs text-slate-600">{data.nip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 mt-6">
            <p>©2025 YPI An-Nur Cikarang. Dokumen digenerate secara otomatis dan resmi.</p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              margin: 0.5cm;
              size: A4;
            }
            
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              background: white;
            }
            
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    );
  }
);

SlipGajiTemplate.displayName = 'SlipGajiTemplate';

export default SlipGajiTemplate;
