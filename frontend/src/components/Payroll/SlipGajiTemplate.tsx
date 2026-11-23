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
  bpjs?: number;
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
  transport1PerHari?: number; // Nilai transport per hari dari guru
  transport2PerHari?: number; // Nilai transport per hari dari guru
  jumlahHari?: number;
  jumlahHariLain?: number;
  totalTransport?: number;
  totalTransport2?: number;
  totalTransportAll?: number;
  jmlHariTransport1?: number;
  jmlHariTransport2?: number;
  
  // Tatap Muka Pengganti Detail
  jumlahHariTatapMukaPengganti?: number;
  baseTatapMukaPengganti?: number;
  tatapMukaPenggantiPerHari?: number; // Nilai per hari dari guru
  jmlJamTMukaPengganti?: number; // Jumlah jam tatap muka pengganti
  
  // Detail Jumlah Hari/Jam
  makanHari?: number;
  makanPerHari?: number; // Nilai per hari dari guru
  overtimeHari?: number;
  overtimePerHari?: number; // Nilai per hari dari guru
  jmlJamPramuka?: number;
  pramukaPerJam?: number; // Nilai per jam dari guru
  jmlJamInsentifEkskul?: number;
  ekskulPerJam?: number; // Nilai per jam dari guru
  jmlJamInsentifBimbel?: number;
  bimbelPerJam?: number; // Nilai per jam dari guru
  jmlJamInsentifProyek?: number;
  proyekPerJam?: number; // Nilai per jam dari guru
  
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
      const items: Array<{ label: string; value: number; showDetail?: boolean; jumlahHari?: number; nilaiPerHari?: number; multiplier?: number; multiplierLabel?: string }> = [];
      
      if (data.gajiPokok > 0) items.push({ label: 'Gaji Pokok', value: data.gajiPokok });
      if (data.overtime > 0 || data.gajiLembur > 0) {
        items.push({ 
          label: 'Lembur', 
          value: data.overtime || data.gajiLembur,
          multiplier: data.overtimeHari,
          multiplierLabel: 'hari'
        });
      }
      if (data.tunjanganJabatan > 0) items.push({ label: 'T.Jabatan', value: data.tunjanganJabatan });
       // Tunjangan lain-lain
       if (data.masaKerja > 0) items.push({ label: 'T.Masa Kerja', value: data.masaKerja });
       if (data.waliKelas > 0) items.push({ label: 'T.Wali Kelas', value: data.waliKelas });
       if (data.koordinator > 0) items.push({ label: 'T.Koordinator', value: data.koordinator });
       if (data.tatapmuka > 0) items.push({ label: 'T.Tatap Muka', value: data.tatapmuka });
       // Tunjangan Tatap Muka Pengganti - format khusus dengan jml_jam_t_muka_pengganti x nilai per hari
       // Gunakan nilai per hari dari guru, bukan total dari payroll
       const jmlJamTMP = data.jmlJamTMukaPengganti !== undefined && data.jmlJamTMukaPengganti !== null ? data.jmlJamTMukaPengganti : 0;
       const baseTMP = data.baseTatapMukaPengganti || 0;
       const totalTMP = data.tatapMukaPengganti !== undefined && data.tatapMukaPengganti !== null ? data.tatapMukaPengganti : 0;
       // Prioritas: gunakan nilai per hari dari guru, jika tidak ada hitung dari total atau base
       const nilaiPerHariTMP = data.tatapMukaPenggantiPerHari !== undefined && data.tatapMukaPenggantiPerHari !== null && data.tatapMukaPenggantiPerHari > 0
         ? data.tatapMukaPenggantiPerHari
         : (jmlJamTMP > 0 && totalTMP > 0 ? Math.round(totalTMP / jmlJamTMP) : (baseTMP || 0));
       items.push({ 
         label: 'T.Tatap Muka Pengganti', 
         value: nilaiPerHariTMP,
         multiplier: jmlJamTMP,
         multiplierLabel: 'Hari'
       });
       if (data.tunjanganKeluarga > 0) items.push({ label: 'T.Keluarga', value: data.tunjanganKeluarga });
      // Transport - selalu tampilkan meskipun 0
      // Gunakan nilai transport per hari dari guru, bukan total dari payroll
      // Jika transport1PerHari dari guru tidak ada, hitung dari total transport1 dibagi jumlah hari
      const jmlHari1 = data.jmlHariTransport1 !== undefined && data.jmlHariTransport1 !== null ? data.jmlHariTransport1 : 0;
      const transport1Total = data.transport1 !== undefined && data.transport1 !== null ? data.transport1 : 0;
      const transport1PerHari = data.transport1PerHari !== undefined && data.transport1PerHari !== null && data.transport1PerHari > 0
        ? data.transport1PerHari 
        : (jmlHari1 > 0 && transport1Total > 0 ? Math.round(transport1Total / jmlHari1) : transport1Total);
      items.push({ 
        label: 'T.Transport 1', 
        value: transport1PerHari,
        multiplier: jmlHari1,
        multiplierLabel: 'Hari'
      });
      
      const jmlHari2 = data.jmlHariTransport2 !== undefined && data.jmlHariTransport2 !== null ? data.jmlHariTransport2 : 0;
      const transport2Total = data.transport2 !== undefined && data.transport2 !== null ? data.transport2 : 0;
      const transport2PerHari = data.transport2PerHari !== undefined && data.transport2PerHari !== null && data.transport2PerHari > 0
        ? data.transport2PerHari 
        : (jmlHari2 > 0 && transport2Total > 0 ? Math.round(transport2Total / jmlHari2) : transport2Total);
      items.push({ 
        label: 'T.Transport 2', 
        value: transport2PerHari,
        multiplier: jmlHari2,
        multiplierLabel: 'Hari'
      });
      
      // Makan - selalu tampilkan meskipun 0
      // Gunakan nilai per hari dari guru, bukan total dari payroll
      const makanHariCount = data.makanHari !== undefined && data.makanHari !== null ? data.makanHari : 0;
      const makanTotal = data.makan !== undefined && data.makan !== null ? data.makan : 0;
      const makanPerHari = data.makanPerHari !== undefined && data.makanPerHari !== null && data.makanPerHari > 0
        ? data.makanPerHari
        : (makanHariCount > 0 && makanTotal > 0 ? Math.round(makanTotal / makanHariCount) : makanTotal);
      items.push({ 
        label: 'T.Makan', 
        value: makanPerHari,
        multiplier: makanHariCount,
        multiplierLabel: 'Hari'
      });
      
      // Over Time - selalu tampilkan meskipun 0
      // Gunakan nilai per hari dari guru, bukan total dari payroll
      const overtimeHariCount = data.overtimeHari !== undefined && data.overtimeHari !== null ? data.overtimeHari : 0;
      const overtimeTotal = data.overtime !== undefined && data.overtime !== null ? (data.overtime || data.gajiLembur || 0) : (data.gajiLembur || 0);
      const overtimePerHari = data.overtimePerHari !== undefined && data.overtimePerHari !== null && data.overtimePerHari > 0
        ? data.overtimePerHari
        : (overtimeHariCount > 0 && overtimeTotal > 0 ? Math.round(overtimeTotal / overtimeHariCount) : overtimeTotal);
      items.push({ 
        label: 'Over Time', 
        value: overtimePerHari,
        multiplier: overtimeHariCount,
        multiplierLabel: 'Hari'
      });

      // Insentif Pramuka - selalu tampilkan meskipun 0
      // Gunakan nilai per jam dari guru, bukan total dari payroll
      const jmlJamPramuka = data.jmlJamPramuka !== undefined && data.jmlJamPramuka !== null ? data.jmlJamPramuka : 0;
      const pramukaTotal = data.pramuka !== undefined && data.pramuka !== null ? data.pramuka : 0;
      const pramukaPerJam = data.pramukaPerJam !== undefined && data.pramukaPerJam !== null && data.pramukaPerJam > 0
        ? data.pramukaPerJam
        : (jmlJamPramuka > 0 && pramukaTotal > 0 ? Math.round(pramukaTotal / jmlJamPramuka) : pramukaTotal);
      items.push({ 
        label: 'Insentif Pramuka', 
        value: pramukaPerJam,
        multiplier: jmlJamPramuka,
        multiplierLabel: ' '
      });
     
      if (data.tunjanganLain > 0) items.push({ label: 'Tunj. Lain', value: data.tunjanganLain });
      
      
      // Insentif Ekskul - selalu tampilkan meskipun 0
      // Gunakan nilai per jam dari guru, bukan total dari payroll
      const jmlJamEkskul = data.jmlJamInsentifEkskul !== undefined && data.jmlJamInsentifEkskul !== null ? data.jmlJamInsentifEkskul : 0;
      const ekskulTotal = data.ekskul !== undefined && data.ekskul !== null ? data.ekskul : 0;
      const ekskulPerJam = data.ekskulPerJam !== undefined && data.ekskulPerJam !== null && data.ekskulPerJam > 0
        ? data.ekskulPerJam
        : (jmlJamEkskul > 0 && ekskulTotal > 0 ? Math.round(ekskulTotal / jmlJamEkskul) : ekskulTotal);
      items.push({ 
        label: 'Insentif EKSKUL', 
        value: ekskulPerJam,
        multiplier: jmlJamEkskul,
        multiplierLabel: 'jam'
      });
      
      // Insentif Bimbel - selalu tampilkan meskipun 0
      // Gunakan nilai per jam dari guru, bukan total dari payroll
      const jmlJamBimbel = data.jmlJamInsentifBimbel !== undefined && data.jmlJamInsentifBimbel !== null ? data.jmlJamInsentifBimbel : 0;
      const bimbelTotal = data.bimbel !== undefined && data.bimbel !== null ? data.bimbel : 0;
      const bimbelPerJam = data.bimbelPerJam !== undefined && data.bimbelPerJam !== null && data.bimbelPerJam > 0
        ? data.bimbelPerJam
        : (jmlJamBimbel > 0 && bimbelTotal > 0 ? Math.round(bimbelTotal / jmlJamBimbel) : bimbelTotal);
      items.push({ 
        label: 'Insentif Bimbel', 
        value: bimbelPerJam,
        multiplier: jmlJamBimbel,
        multiplierLabel: 'jam'
      });

      // Insentif Proyek - selalu tampilkan meskipun 0
      // Gunakan nilai per jam dari guru, bukan total dari payroll
      const jmlJamProyek = data.jmlJamInsentifProyek !== undefined && data.jmlJamInsentifProyek !== null ? data.jmlJamInsentifProyek : 0;
      const proyekTotal = data.proyek !== undefined && data.proyek !== null ? data.proyek : 0;
      const proyekPerJam = data.proyekPerJam !== undefined && data.proyekPerJam !== null && data.proyekPerJam > 0
        ? data.proyekPerJam
        : (jmlJamProyek > 0 && proyekTotal > 0 ? Math.round(proyekTotal / jmlJamProyek) : proyekTotal);
      if (jmlJamProyek > 0) {
        items.push({ 
          label: 'Insentif Proyek', 
          value: proyekPerJam,
          multiplier: jmlJamProyek,
          multiplierLabel: 'jam'
        });
      } else {
        items.push({ label: 'Insentif Proyek', value: proyekTotal });
      }

      // BPJS Kesehatan - selalu tampilkan meskipun 0
      const bpjsKesehatan = data.bpjs || data.potonganBPJS || data.jamsostek || 0;
      items.push({ label: 'BPJS Kesehatan', value: bpjsKesehatan });
      // Insentif Pengurus Pramuka - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Pramuka', value: data.insentifPramuka || 0 });
      // Insentif Pengurus Ekskul - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Ekskul', value: data.insentifEkskul || 0 });
      // Insentif Pengurus Bimbel - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Bimbel', value: data.insentifBimbel || 0 });
      // Insentif Pengurus Proyek - selalu tampilkan meskipun 0
      items.push({ label: 'Insentif Pengurus Proyek', value: data.insentifProyek || 0 });
      if (data.insentifLain > 0) items.push({ label: 'Insentif Lain', value: data.insentifLain });
      
      return items;
    };

    // Helper untuk mendapatkan semua potongan (tampilkan meskipun 0)
    const getPotonganItems = () => {
      const safeValue = (value: number | undefined | null) => Number(value ?? 0);

      return [
        { label: 'Jaminan Hari Tua (JHT)', value: safeValue(data.potonganJHT) },
        { label: 'Pajak PPh 21', value: safeValue(data.potonganPPH21 ?? data.potonganPajak) },
        // { label: 'Potongan Absen', value: safeValue(data.potonganAbsen) },
        { label: 'Angsuran Pinjaman ke Yayasan', value: safeValue(data.potonganYayasan) },
        { label: 'Angsuran Pinjaman ke Koperasi', value: safeValue(data.potonganAngsuranKoperasi) },
        { label: 'Deposit ANNUR MART', value: safeValue(data.depositAnnurmart) },
        { label: 'Iuran Wajib Koperasi', value: safeValue(data.potonganKoperasiWajib) },
        { label: 'Iuran Sukarela Koperasi', value: safeValue(data.potonganKoperasiSukarela) },
        { label: 'Potongan Uang Makan', value: safeValue(data.makan) },
        { label: 'Potongan Lain-lain', value: safeValue(data.potonganLain) },
        { label: 'Potongan Pengganti', value: safeValue(data.potonganTMukaPengganti) },
      ];
    };

    return (
      <div
        ref={ref}
        className="relative min-h-screen bg-white print:p-0 print:m-0"
      >
        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-3 print:max-w-none print:px-3 print:py-2">
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            {/* Left: Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center print:w-6 print:h-6">
                  <svg className="w-5 h-5 text-white print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 print:text-[10px]">YAYASAN NURRAHIM ANNUR</h2>
                  <p className="text-[10px] text-slate-600 print:text-[9px]">Cikarang, Indonesia</p>
                </div>
              </div>
            </div>

            {/* Right: Employee Info & Title */}
            <div className="flex-1 flex flex-col items-end">
              <h1 className="text-lg font-bold text-slate-900 mb-2 print:text-base">Slip Gaji</h1>
              
              {/* Employee Information */}
              <div className="text-right space-y-0.5 text-xs print:text-[10px]">
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
          <div className="grid grid-cols-2 gap-2 mb-3 print:gap-1.5">
            {/* Left Column: Pendapatan */}
            <div className="border border-slate-200">
              <div className="bg-slate-100 px-2 py-1 border-b border-slate-200 print:px-1.5 print:py-0.5">
                <h3 className="text-xs font-bold text-slate-900 print:text-[10px]">Pendapatan</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {getPendapatanItems().map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-1 items-center px-2 py-1 print:px-1 print:py-0.5">
                    <span className="text-xs text-slate-700 print:text-[10px]">{item.label}</span>
                    {item.multiplier !== undefined && item.multiplier !== null && item.multiplierLabel ? (
                      <>
                        <span className="text-xs font-medium text-slate-800 text-center print:text-[9px]">
                          {item.multiplier || 0} {item.multiplierLabel} × {formatCurrency(item.value)}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 text-right print:text-[10px]">
                          {formatCurrency((item.multiplier || 0) * item.value)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-500 text-center"></span>
                        <span className="text-xs font-semibold text-slate-900 text-right print:text-[10px]">{formatCurrency(item.value)}</span>
                      </>
                    )}
                  </div>
                ))}
                {/* Total Pendapatan */}
                <div className="bg-slate-100 flex justify-between items-center px-2 py-1 print:px-1.5 print:py-0.5">
                  <span className="text-xs font-bold text-slate-900 print:text-[10px]">Total Pendapatan</span>
                  <span className="text-xs font-bold text-slate-900 print:text-[10px]">{formatCurrency(data.totalGaji || data.totalPendapatan)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Potongan */}
            <div className="border border-slate-200">
              <div className="bg-slate-100 px-2 py-1 border-b border-slate-200 print:px-1.5 print:py-0.5">
                <h3 className="text-xs font-bold text-slate-900 print:text-[10px]">Potongan</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {getPotonganItems().map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-1 print:px-1 print:py-0.5">
                    <span className="text-xs text-slate-700 print:text-[10px]">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-900 print:text-[10px]">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                {/* Total Potongan */}
                <div className="bg-slate-100 flex justify-between items-center px-2 py-1 print:px-1.5 print:py-0.5">
                  <span className="text-xs font-bold text-slate-900 print:text-[10px]">Total Potongan</span>
                  <span className="text-xs font-bold text-slate-900 print:text-[10px]">{formatCurrency(data.totalPotongan)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Gaji Diterima */}
          <div className="mb-3 print:mb-2">
            <div className="bg-slate-50 border border-slate-200 px-2 py-1.5 print:px-1.5 print:py-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 print:text-xs">Total Gaji Diterima</span>
                <span className="text-base font-bold text-green-700 print:text-sm">{formatCurrency(data.gajiDiterima)}</span>
              </div>
            </div>
          </div>


          {/* Memo Section */}
          {data.memo && (
            <div className="mb-3 print:mb-2">
              <div className="bg-slate-100 px-2 py-1 border border-slate-200 border-b-0 print:px-1.5 print:py-0.5">
                <h3 className="text-xs font-bold text-slate-900 print:text-[10px]">Memo</h3>
              </div>
              <div className="border border-slate-200 px-2 py-1.5 print:px-1.5 print:py-1">
                <p className="text-xs text-slate-700 whitespace-pre-wrap print:text-[10px]">{data.memo}</p>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-4 mb-2 print:mt-2 print:mb-1">
            <div className="grid grid-cols-2 gap-6 print:gap-4">
              <div className="text-center">
                <p className="font-semibold text-slate-900 mb-10 text-xs print:mb-8 print:text-[10px]">Bendahara</p>
                <div className="border-t border-slate-400 pt-1 print:pt-0.5">
                  <p className="text-[10px] text-slate-600 print:text-[9px]">(________________________)</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900 mb-10 text-xs print:mb-8 print:text-[10px]">Penerima</p>
                <div className="border-t border-slate-400 pt-1 print:pt-0.5">
                  <p className="text-xs font-bold text-slate-900 uppercase print:text-[10px]">{data.nama}</p>
                  <p className="text-[10px] text-slate-600 print:text-[9px]">{data.nip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-slate-500 mt-3 print:mt-2 print:text-[9px]">
            <p>©2025 YPI An-Nur Cikarang. Dokumen digenerate secara otomatis dan resmi.</p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              margin: 0.3cm;
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
