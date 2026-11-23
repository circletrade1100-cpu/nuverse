# Adin Overtime Service

Service untuk menangani laporan lembur dan absensi karyawan dengan agregasi data per karyawan dan divisi.

## Fitur

1. **getLaporanLembur** - Mengambil data lembur dari backend dan mengagregasi per karyawan
2. **getRingkasanBulanan** - Membuat ringkasan per divisi
3. **exportLaporanLembur** - Export data ke format Excel/PDF

## Cara Penggunaan

### 1. Import Service

```typescript
import adinOvertimeService, { 
  type LaporanLemburAbsensi, 
  type RingkasanBulanan 
} from '../../services/adinOvertimeService';
```

### 2. Mengambil Data Laporan

```typescript
const response = await adinOvertimeService.getLaporanLembur({
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  status: 'approved',
  per_page: 1000
});

if (response.success) {
  const laporanData = response.data; // Array of LaporanLemburAbsensi
  setLaporanDetail(laporanData);
}
```

### 3. Generate Ringkasan Bulanan

```typescript
const ringkasan = await adinOvertimeService.getRingkasanBulanan(
  '2025-01',
  laporanData
);
setRingkasanBulanan(ringkasan);
```

### 4. Export Data

```typescript
const exportResult = await adinOvertimeService.exportLaporanLembur({
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  status: 'approved'
});

if (exportResult.success) {
  // exportResult.data berisi array siap export
  console.log(exportResult.data);
}
```

## Interface

### LaporanLemburAbsensi

```typescript
interface LaporanLemburAbsensi {
  nip: string;
  nama: string;
  divisi: string;
  jabatan: string;
  hariKerja: number;
  hariHadir: number;
  hariAlfa: number;
  hariIzin: number;
  hariSakit: number;
  hariCuti: number;
  totalJamKerja: number;
  totalJamLembur: number;
  jamLemburWeekday: number;
  jamLemburWeekend: number;
  jamLemburHoliday: number;
  terlambat: number;
  pulangCepat: number;
  persentaseKehadiran: number;
  gajiLembur: number;
  potonganAbsensi: number;
}
```

### RingkasanBulanan

```typescript
interface RingkasanBulanan {
  periode: string;
  divisi: string;
  totalKaryawan: number;
  rataRataKehadiran: number;
  totalJamLembur: number;
  totalGajiLembur: number;
  totalPotonganAbsensi: number;
  karyawanTeladan: string;
  karyawanPeringatan: string;
}
```

## Backend Endpoint

Service ini menggunakan endpoint:
- `GET /api/overtime` - dengan parameter:
  - `start_date`: Tanggal mulai (YYYY-MM-DD)
  - `end_date`: Tanggal akhir (YYYY-MM-DD)
  - `status`: Status lembur (approved/pending/rejected)
  - `per_page`: Jumlah data per halaman

## Struktur JSON dari Backend

Response dari backend memiliki struktur:
```json
{
  "success": true,
  "message": "Data lembur berhasil diambil",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "id_guru": 1,
        "tanggal": "2025-01-15",
        "jam_mulai": "17:00",
        "jam_selesai": "20:00",
        "durasi": 3,
        "jenis": "Mengajar Tambahan",
        "deskripsi": "Mengajar kelas tambahan",
        "status": "approved",
        "tarif": 50000,
        "total": 150000,
        "guru": {
          "id": 1,
          "nip": "123456",
          "nama_lengkap": "John Doe",
          "jabatan": {
            "id": 1,
            "nama": "Guru Kelas"
          },
          "unit_sekolah": {
            "id": 1,
            "nama": "SD An-Nur",
            "kode": "SD",
            "jenjang": "SD"
          }
        }
      }
    ],
    "total": 100,
    "per_page": 15,
    "last_page": 7
  }
}
```

**Penting:**
- Field nama guru menggunakan `nama_lengkap` (bukan `nama`)
- Relasi unit sekolah menggunakan `unit_sekolah` (dengan underscore)
- Relasi jabatan menggunakan `jabatan` (tanpa underscore)

## Catatan

1. Data kehadiran (hariHadir, hariAlfa, dll) saat ini menggunakan nilai default karena belum terintegrasi dengan API absensi
2. Service ini melakukan agregasi di frontend untuk fleksibilitas tampilan
3. Kategorisasi jam lembur (weekday/weekend/holiday) dilakukan otomatis berdasarkan tanggal berdasarkan hari dalam seminggu
4. Service menggunakan `phpApiMethods` untuk komunikasi dengan backend Laravel
5. Interface sudah disesuaikan dengan struktur JSON response dari backend Laravel

## Debugging

Service ini menyediakan console.log untuk debugging:
- `🔄 Fetching laporan lembur data...` - Saat mulai fetch data
- `📊 Sample overtime data:` - Menampilkan sample data dari backend untuk debugging
- `✅ Laporan lembur data fetched successfully` - Saat berhasil fetch data
- `❌ Error fetching laporan lembur:` - Saat terjadi error

Gunakan browser DevTools Console untuk melihat log dan memverifikasi struktur data.

