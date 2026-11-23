# Modul RAPBS Frontend

## 📋 Overview

Modul RAPBS (Rencana Anggaran Pendapatan dan Belanja Sekolah) adalah sistem manajemen anggaran dan realisasi keuangan sekolah yang lengkap dan modern.

## 🎨 Komponen

### 1. **RAPBSDashboard**
Dashboard utama dengan visualisasi data:
- Summary cards (Total Anggaran, Realisasi, Sisa, Utilisasi)
- Chart sumber dana
- Breakdown kategori
- Progress bar utilisasi anggaran

### 2. **RAPBSPlanList**
Daftar rencana RAPBS dengan fitur:
- Search dan filter (status, prioritas)
- Tabel dengan pagination
- Actions: View, Edit, Delete, Approve, Reject
- Status badges (Draft, Diajukan, Disetujui, Ditolak)
- Priority badges (Rendah, Sedang, Tinggi, Urgent)

### 3. **RAPBSPlanForm**
Form untuk membuat/edit rencana:
- Pilih tahun ajaran
- Pilih kategori kegiatan
- Pilih sumber dana
- Input judul, deskripsi, anggaran
- Set prioritas
- Modal dengan design modern

### 4. **RealizationList**
Daftar realisasi anggaran dengan:
- Filter tanggal range
- Filter metode pembayaran
- Tabel transaksi lengkap
- Actions: Edit, Delete, Lihat Dokumen

### 5. **RealizationForm**
Form input realisasi:
- Pilih rencana RAPBS
- Tanggal transaksi
- Jumlah realisasi
- Nama vendor
- Metode pembayaran
- Nomor referensi

### 6. **RAPBSReports**
Laporan lengkap dengan:
- Rencana vs Realisasi
- Ringkasan Realisasi
- Analisis Varians
- Laporan Performa
- Export PDF (Summary & Detailed)

### 7. **RAPBSPage**
Main page dengan tabs:
- Dashboard
- Rencana RAPBS
- Realisasi
- Laporan

## 🔧 Service API

File: `services/rapbsService.ts`

### Endpoints yang tersedia:

#### Dashboard
- `getDashboard()` - Data dashboard

#### Master Data
- `getAcademicYears()` - Daftar tahun ajaran
- `getActivityCategories()` - Daftar kategori kegiatan
- `getFundingSources()` - Daftar sumber dana

#### Rencana RAPBS
- `getPlans()` - Daftar rencana
- `getPlan(id)` - Detail rencana
- `createPlan(data)` - Buat rencana
- `updatePlan(id, data)` - Update rencana
- `deletePlan(id)` - Hapus rencana
- `approvePlan(id)` - Approve rencana
- `rejectPlan(id, notes)` - Reject rencana

#### Breakdown Anggaran
- `getBreakdown(planId)` - Daftar breakdown
- `createBreakdown(planId, data)` - Tambah item
- `updateBreakdown(planId, id, data)` - Update item
- `deleteBreakdown(planId, id)` - Hapus item

#### Dokumen
- `uploadDocument(planId, formData)` - Upload dokumen
- `deleteDocument(planId, id)` - Hapus dokumen
- `getDocuments(planId)` - Daftar dokumen

#### Realisasi
- `getRealizations()` - Daftar realisasi
- `createRealization(data)` - Tambah realisasi
- `updateRealization(id, data)` - Update realisasi
- `deleteRealization(id)` - Hapus realisasi

#### Laporan
- `getPlanVsRealization()` - Laporan rencana vs realisasi
- `getRealizationSummary()` - Ringkasan realisasi
- `getVarianceAnalysis()` - Analisis varians
- `getPerformanceReport()` - Laporan performa
- `printSummary()` - Export PDF summary
- `printDetailed()` - Export PDF detailed

## 📦 Types

File: `types/rapbs.ts`

Interfaces yang tersedia:
- `AcademicYear` - Tahun ajaran
- `ActivityCategory` - Kategori kegiatan
- `FundingSource` - Sumber dana
- `RAPBSPlan` - Rencana RAPBS
- `BudgetBreakdown` - Breakdown anggaran
- `RAPBSDocument` - Dokumen
- `RAPBSRealization` - Realisasi
- `RealizationDocument` - Dokumen realisasi
- `ActivityNote` - Catatan kegiatan
- `DashboardData` - Data dashboard
- `PlanFormData` - Form data rencana
- `RealizationFormData` - Form data realisasi

## 🎨 Design System

### Colors
- **Primary**: Blue 600 (#2563EB)
- **Success**: Green 600 (#059669)
- **Warning**: Orange 500 (#F97316)
- **Danger**: Red 600 (#DC2626)
- **Gray**: Gray 50-900

### Components Style
- **Rounded corners**: xl (12px)
- **Shadows**: md, lg
- **Transitions**: all duration-300
- **Hover effects**: -translate-y-1, shadow-lg

## 🚀 Cara Penggunaan

### 1. Import di Route
```tsx
import RAPBSPage from './pages/RAPBSPage';

// Di routing
<Route path="/rapbs" element={<RAPBSPage />} />
```

### 2. Akses Halaman
```
http://localhost:3000/rapbs
```

### 3. Flow Penggunaan

#### Membuat Rencana RAPBS:
1. Buka tab "Rencana RAPBS"
2. Klik "Tambah Rencana"
3. Isi form (tahun ajaran, kategori, sumber dana, dll)
4. Klik "Simpan"
5. Status awal: Draft

#### Approval Workflow:
1. Planner submit rencana (status: Submitted)
2. Approver review dan approve/reject
3. Jika approved, status: Approved
4. Jika rejected, status: Rejected

#### Input Realisasi:
1. Buka tab "Realisasi"
2. Klik "Tambah Realisasi"
3. Pilih rencana RAPBS yang approved
4. Input detail transaksi
5. Upload dokumen pendukung

#### Lihat Laporan:
1. Buka tab "Laporan"
2. Set filter periode
3. Pilih jenis laporan
4. Lihat visualisasi atau export PDF

## 📱 Responsive Design

- **Mobile**: 1 kolom
- **Tablet**: 2 kolom
- **Desktop**: 3-4 kolom

## ⚡ Fitur Utama

### Dashboard
✅ Real-time metrics
✅ Visualisasi chart
✅ Progress bars
✅ Color-coded status

### Rencana RAPBS
✅ CRUD lengkap
✅ Search & filter
✅ Status workflow
✅ Priority levels
✅ Approval system

### Realisasi
✅ Input transaksi
✅ Upload dokumen
✅ Validasi dokumen
✅ Multiple payment methods

### Laporan
✅ Plan vs Realization
✅ Variance analysis
✅ Performance metrics
✅ PDF export

## 🔐 Backend Integration

Service menggunakan base API: `https://nurverse.id/api`

Semua endpoints memerlukan authentication token yang disimpan di localStorage.

Format response API:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* data object */ }
}
```

## 🛠️ Development

### Prerequisites
- React 18+
- TypeScript
- Tailwind CSS v4
- Heroicons
- Axios

### Running
```bash
cd frontend
npm run dev
```

### Build
```bash
npm run build
```

## 📝 Notes

- Semua komponen sudah responsive
- Menggunakan TypeScript untuk type safety
- Error handling sudah terimplementasi
- Loading states tersedia
- Form validation included
- Modern UI/UX dengan gradient dan animations

## 🎯 Next Steps

Untuk implementasi backend, pastikan endpoints berikut tersedia:
- `/api/rapbs/dashboard`
- `/api/rapbs/plans`
- `/api/rapbs/realizations`
- `/api/rapbs/reports/*`

Sesuaikan dengan dokumentasi di `docs/modules/RAPBS.md`

