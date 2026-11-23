# Payroll Integration dengan Backend

## Overview

Komponen Payroll telah diintegrasikan dengan backend Laravel untuk mengambil data payroll real-time berdasarkan `guruId` dari data login guru.

## Fitur yang Diintegrasikan

### 1. Data Payroll Terbaru
- Mengambil data payroll terbaru menggunakan `getGuruPayroll(guruId)`
- Menampilkan gaji pokok, tunjangan, dan potongan dari database
- Data diambil berdasarkan periode terbaru

### 2. Riwayat Payroll
- Fitur riwayat payroll sedang dalam pengembangan
- Saat ini menampilkan pesan bahwa fitur sedang dikembangkan

### 3. Loading States & Error Handling
- Loading spinner saat mengambil data
- Error handling jika gagal mengambil data
- Empty state jika tidak ada data payroll

## Struktur Data

### PayrollData Interface
```typescript
interface PayrollData {
  guru: {
    id: number;
    nama_lengkap: string;
    nip: string;
    email: string;
    jabatan: { id: number; nama: string };
  };
  periode: {
    bulan: string;
    tahun: string;
    status: string;
  };
  gaji_pokok: number;
  tunjangan: {
    jabatan: number;
    masa_kerja: number;
    wali_kelas: number;
    // ... dan tunjangan lainnya
    total: number;
  };
  potongan: Array<{
    nama_potongan: string;
    jumlah: number;
  }>;
  total_potongan: number;
  gaji_bersih: number;
  created_date: string;
  created_by: string;
}
```

### PayrollHistoryItem Interface
```typescript
interface PayrollHistoryItem {
  id: number;
  periode: string;
  periode_bulan: string;
  periode_tahun: string;
  gaji_pokok: number;
  total_gaji: number;
  total_potongan: number;
  gaji_bersih: number;
  status: string;
  created_date: string;
}
```

## API Endpoints

### 1. Data Payroll Terbaru
```
GET /master-data/payroll/guru/{guruId}
```

### 2. Riwayat Payroll (Dalam Pengembangan)
```
GET /master-data/payroll/guru/{guruId}/history
```

## Cara Penggunaan

### 1. Import Komponen
```typescript
import Payroll from '../pages/Dashboard-Guru/Payroll';
```

### 2. Pastikan Guru Sudah Login
Komponen akan otomatis mengambil `guruId` dari `useGuruAuth` hook.

### 3. Komponen akan Otomatis:
- Mengambil data payroll saat component mount menggunakan `getGuruPayroll(guruId)`
- Menampilkan loading state
- Handle error jika gagal mengambil data
- Menampilkan data real-time dari backend

## Error Handling

### 1. Data Guru Tidak Ditemukan
```typescript
if (!guru?.id) {
  setError('Data guru tidak ditemukan');
  setLoading(false);
  return;
}
```

### 2. Gagal Mengambil Data
```typescript
catch (err) {
  console.error('❌ Error fetching payroll data:', err);
  setError('Gagal mengambil data payroll. Silakan coba lagi.');
}
```

### 3. Data Payroll Tidak Ditemukan
```typescript
if (!payrollData) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Payroll Tidak Ditemukan</h3>
        <p className="text-gray-600">Belum ada data payroll untuk guru ini.</p>
      </div>
    </div>
  );
}
```

## Dependencies

### Required Services
- `guruPayrollService` - Service untuk mengambil data payroll
- `useGuruAuth` - Hook untuk data authentication guru

### Required Types
- `PayrollData` - Interface untuk data payroll
- `PayrollHistoryItem` - Interface untuk riwayat payroll

## Testing

### 1. Test Data Loading
```typescript
// Pastikan data guru tersedia
const { guru } = useGuruAuth();
console.log('Guru ID:', guru?.id);

// Test API call
const payrollData = await guruPayrollService.getGuruPayroll(guru.id);
console.log('Payroll Data:', payrollData);
```

### 2. Test Error Handling
- Test dengan guru yang belum login
- Test dengan guru yang tidak memiliki data payroll
- Test dengan koneksi internet yang bermasalah

## Troubleshooting

### 1. Data Tidak Muncul
- Pastikan guru sudah login
- Cek console untuk error messages
- Pastikan API endpoint tersedia
- Cek token authentication

### 2. Loading Terus Menerus
- Cek network connection
- Cek API response
- Cek error di console

### 3. Error "Data guru tidak ditemukan"
- Pastikan `useGuruAuth` mengembalikan data guru
- Pastikan guru sudah login dengan benar
- Cek localStorage untuk data guru

## Future Enhancements

1. **Real-time Updates**: Implementasi WebSocket untuk update real-time
2. **Caching**: Implementasi caching untuk performa yang lebih baik
3. **Offline Support**: Support untuk mode offline
4. **Export Data**: Fitur export data payroll ke PDF/Excel
5. **Notifications**: Notifikasi untuk update payroll baru
