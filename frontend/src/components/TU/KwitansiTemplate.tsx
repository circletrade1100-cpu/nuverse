import { forwardRef } from 'react';

interface KwitansiItem {
  namaItem: string;
  kategori?: string;
  jumlah: number;
  keterangan?: string;
  nomorReferensi?: string;
}

interface KwitansiData {
  nomorKwitansi: string;
  tanggal: string;
  diterimaDari: string;
  jumlah: number;
  untukPembayaran: string;
  dibayarOleh?: string;
  kategori?: string;
  metodePembayaran?: string;
  dibuatOleh?: string;
  disetujuiOleh?: string;
  penerima?: string;
  items?: KwitansiItem[];
}

interface KwitansiTemplateProps {
  data: KwitansiData;
  showWatermark?: boolean;
}

// Fungsi terbilang untuk convert angka ke kata-kata bahasa Indonesia
const terbilang = (angka: number): string => {
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
  const belasan = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
  
  const konversi = (num: number): string => {
    if (num === 0) return '';
    
    if (num < 10) return satuan[num];
    if (num < 20) return belasan[num - 10];
    
    if (num < 100) {
      const puluhan = Math.floor(num / 10);
      const sisa = num % 10;
      if (puluhan === 1) {
        return 'Sepuluh' + (sisa > 0 ? ' ' + satuan[sisa] : '');
      }
      return satuan[puluhan] + ' Puluh' + (sisa > 0 ? ' ' + satuan[sisa] : '');
    }
    
    if (num < 1000) {
      const ratusan = Math.floor(num / 100);
      const sisa = num % 100;
      if (ratusan === 1) {
        return 'Seratus' + (sisa > 0 ? ' ' + konversi(sisa) : '');
      }
      return satuan[ratusan] + ' Ratus' + (sisa > 0 ? ' ' + konversi(sisa) : '');
    }
    
    if (num < 1000000) {
      const ribuan = Math.floor(num / 1000);
      const sisa = num % 1000;
      if (ribuan === 1) {
        return 'Seribu' + (sisa > 0 ? ' ' + konversi(sisa) : '');
      }
      return konversi(ribuan) + ' Ribu' + (sisa > 0 ? ' ' + konversi(sisa) : '');
    }
    
    if (num < 1000000000) {
      const jutaan = Math.floor(num / 1000000);
      const sisa = num % 1000000;
      return konversi(jutaan) + ' Juta' + (sisa > 0 ? ' ' + konversi(sisa) : '');
    }
    
    if (num < 1000000000000) {
      const milyaran = Math.floor(num / 1000000000);
      const sisa = num % 1000000000;
      return konversi(milyaran) + ' Milyar' + (sisa > 0 ? ' ' + konversi(sisa) : '');
    }
    
    return '';
  };
  
  const result = konversi(angka);
  return result || 'Nol';
};

const KwitansiTemplate = forwardRef<HTMLDivElement, KwitansiTemplateProps>(
  ({ data, showWatermark = true }, ref) => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        });
      } catch {
        return dateString;
      }
    };

    const hasItems = Array.isArray(data.items) && data.items.length > 0;
    const totalAmount = hasItems
      ? data.items!.reduce((sum, item) => sum + (item.jumlah || 0), 0)
      : data.jumlah;
    const terbilangText = terbilang(totalAmount);

    return (
      <div ref={ref} className="bg-white w-full max-w-4xl mx-auto p-6 print:p-4 print:max-w-none">
        {/* Watermark */}
        {showWatermark && (
          <div 
            className="fixed inset-0 pointer-events-none opacity-5 print:opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,0,0,0.05) 100px, rgba(0,0,0,0.05) 200px)',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-slate-400 transform rotate-45">
                YPI NURRAHIM
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10">
          {/* Header Section */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <h1 className="text-2xl print:text-3xl font-bold text-left text-amber-900 mb-3 tracking-wide">
                  YAYASAN PENDIDIKAN ISLAM NURRAHIM
                </h1>
                <div className="text-xs print:text-sm text-slate-700">
                  <p className="mb-1">
                    <strong>Sekretariat :</strong>Jalan Kelinci Raya, Blok R7 No 1, Cikarang Baru, kelurahan jaya mukti, kecamatan Cikarang pusat, kabupaten bekasi.
                  </p>
                  <p className="mb-1">
                    <strong>Telp :</strong> (021) 89834510, 29083210 (SDIT 89834509, TK. 92295284)
                  </p>
                  <p>
                    <strong>Fax. :</strong> (021) 29083210
                  </p>
                </div>
              </div>
              
              {/* Logo - Right aligned */}
              <div className="flex justify-end items-start">
                <img 
                  src={typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                    ? '/logo-annur.png' 
                    : 'https://nurverse.id/logo-annur.png'} 
                  alt="Logo YPI Nurrahim"
                  className="w-20 h-20 print:w-24 print:h-24 object-contain"
                  onError={(e) => {
                    // Fallback jika logo tidak ditemukan
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Receipt Title and Date/Number */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1"></div>
              <h2 className="text-4xl print:text-5xl font-bold text-center text-amber-900 flex-1">
                KWITANSI
              </h2>
              <div className="flex-1 text-right text-xs print:text-sm">
                <div className="mb-2">
                  <strong>Tanggal :</strong> {formatDate(data.tanggal)}
                </div>
                <div>
                  <strong>Nomor :</strong> {data.nomorKwitansi}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4 print:space-y-6 mb-6 print:mb-8">
            <div>
              <p className="font-bold text-sm print:text-base text-amber-900 mb-1 print:mb-2">TELAH TERIMA DARI :</p>
              <div className="border-b-2 border-amber-900 pb-1 print:pb-2">
                <p className="text-base print:text-lg text-slate-900 font-medium">{data.diterimaDari}</p>
              </div>
            </div>

            {hasItems && (
              <div>
                <p className="font-bold text-sm print:text-base text-amber-900 mb-2 print:mb-3">RINCIAN PEMBAYARAN :</p>
                <div className="border-2 border-amber-900 rounded-lg overflow-hidden">
                  <table className="w-full text-sm print:text-base text-slate-900">
                    <thead className="bg-amber-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold border-r border-amber-200 w-12">No</th>
                        <th className="px-3 py-2 text-left font-semibold border-r border-amber-200">Kategori</th>
                        <th className="px-3 py-2 text-right font-semibold w-40">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items!.map((item, index) => (
                        <tr key={`${item.namaItem}-${index}`} className="odd:bg-white even:bg-amber-50/40">
                          <td className="px-3 py-2 border-r border-amber-200 text-center">{index + 1}</td>
                          <td className="px-3 py-2 border-r border-amber-200 text-slate-700">
                            {item.kategori || '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            {formatCurrency(item.jumlah)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-amber-100/70">
                        <td colSpan={2} className="px-3 py-2 text-right font-bold text-amber-900 border-r border-amber-200">
                          Total
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-amber-900">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <p className="font-bold text-sm print:text-base text-amber-900 mb-1 print:mb-2">UANG SEJUMLAH :</p>
              <div className="border-b-2 border-amber-900 pb-1 print:pb-2">
                <p className="text-base print:text-lg font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm print:text-base text-amber-900 mb-1 print:mb-2">TERBILANG :</p>
              <div className="border-b-2 border-amber-900 pb-1 print:pb-2">
                <p className="text-base print:text-lg italic text-slate-900">
                  <strong>{terbilangText} Rupiah</strong>
                </p>
              </div>
            </div>

            <div>
              <p className="font-bold text-sm print:text-base text-amber-900 mb-1 print:mb-2">UNTUK PEMBAYARAN :</p>
              <div className="border-b-2 border-amber-900 pb-1 print:pb-2">
                <p className="text-base print:text-lg text-slate-900 font-medium whitespace-pre-wrap break-words">
                  {data.untukPembayaran?.trim() || data.kategori?.trim() || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-12 grid grid-cols-2 gap-8">
            {/* Left: Instructions */}
            <div>
              <div className="border-2 border-amber-900 p-4 mb-4 bg-amber-50">
                <p className="text-xs font-bold text-amber-900 text-center leading-tight">
                  KWITANSI INI SAH JIKA DITANDA TANGANI PEJABAT YANG BERWENANG
                </p>
              </div>
              <div className="text-xs text-slate-700 space-y-1">
                <p>Putih (Asli) : Orang Tua/Wali</p>
                <p>Merah (Copy) : YPI Nurrahim</p>
              </div>
            </div>

            {/* Right: Signature */}
            <div className="text-right">
              <div className="mb-12 print:mb-10">
                <p className="font-bold text-amber-900 mb-1 print:mb-2">PENERIMA,</p>
                <p className="text-sm print:text-base font-semibold text-slate-900 min-h-[1.25rem] mb-3 print:mb-4">
                  {(data.penerima || data.disetujuiOleh || '').trim() || '\u2014'}
                </p>
                <div className="border-b-2 border-amber-900 pb-16 print:pb-14">
                  {/* Ruang tanda tangan */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            @page {
              margin: 0.5cm;
              size: A4 landscape;
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
            
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }
);

KwitansiTemplate.displayName = 'KwitansiTemplate';

export default KwitansiTemplate;

