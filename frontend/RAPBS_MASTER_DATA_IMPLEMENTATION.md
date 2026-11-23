# RAPBS Master Data Implementation

## 📋 Overview

Submenu Master Data telah ditambahkan di menu RAPBS dengan 3 halaman CRUD yang modern dan profesional.

## 🎯 Struktur Menu Baru

```
📊 RAPBS
├── 📈 Dashboard
├── 📝 Rencana RAPBS
├── 💰 Realisasi
├── 📊 Laporan
└── ⚙️ Master Data
    ├── 📅 Tahun Ajaran
    ├── 📋 Kategori Kegiatan
    └── 💵 Sumber Dana
```

## 📁 File yang Dibuat

### 1. **Halaman Master Data** (3 files)

#### `/pages/RAPBS/MasterData/TahunAjaran.tsx`
**Fitur:**
- ✅ CRUD lengkap untuk Academic Years
- ✅ Search & filter by status
- ✅ Modal form untuk tambah/edit
- ✅ Tabel dengan status badge (Aktif/Tidak Aktif)
- ✅ Date formatting Indonesia
- ✅ Validation & error handling

**Route:** `/rapbs/master-data/tahun-ajaran`

#### `/pages/RAPBS/MasterData/KategoriKegiatan.tsx`
**Fitur:**
- ✅ CRUD lengkap untuk Activity Categories
- ✅ Search & filter by budget type
- ✅ Modal form untuk tambah/edit
- ✅ Badge warna untuk jenis (Pemasukan/Pengeluaran)
- ✅ Support parent category (untuk sub-kategori)
- ✅ Validation & error handling

**Route:** `/rapbs/master-data/kategori-kegiatan`

#### `/pages/RAPBS/MasterData/SumberDana.tsx`
**Fitur:**
- ✅ CRUD lengkap untuk Funding Sources
- ✅ Search & filter by type & status
- ✅ Modal form untuk tambah/edit
- ✅ Badge warna untuk jenis (BOS, SPP, Donasi, Lainnya)
- ✅ Status active/inactive
- ✅ Validation & error handling

**Route:** `/rapbs/master-data/sumber-dana`

## 🎨 Design Features

### Color Scheme
- **Primary**: Orange 600 (#EA580C) - Konsisten dengan menu RAPBS
- **Success**: Green (untuk active/income)
- **Danger**: Red (untuk expense/delete)
- **Gray**: Untuk neutral elements

### UI Components
- ✅ **Modal Forms** dengan gradient header
- ✅ **Tabel** dengan hover effects
- ✅ **Badges** dengan color coding
- ✅ **Filter Panel** dengan search & dropdowns
- ✅ **Loading States** dengan spinner
- ✅ **Empty States** dengan helpful messages
- ✅ **Action Buttons** dengan icons (Edit, Delete)

### Responsive Design
- Mobile: Stack filters vertically
- Tablet: 2 kolom
- Desktop: Full width dengan optimal spacing

## 🔌 Backend Integration

### API Service Methods

Semua halaman menggunakan `rapbsService` yang sudah terintegrasi dengan backend:

#### Academic Years
```tsx
rapbsService.getAcademicYears()
rapbsService.createAcademicYear(data)
rapbsService.updateAcademicYear(id, data)
rapbsService.deleteAcademicYear(id)
```

#### Activity Categories
```tsx
rapbsService.getActivityCategories()
rapbsService.createActivityCategory(data)
rapbsService.updateActivityCategory(id, data)
rapbsService.deleteActivityCategory(id)
```

#### Funding Sources
```tsx
rapbsService.getFundingSources()
rapbsService.createFundingSource(data)
rapbsService.updateFundingSource(id, data)
rapbsService.deleteFundingSource(id)
```

### Backend Endpoints

```
GET    /api/rapbs/academic-years
POST   /api/rapbs/academic-years
PUT    /api/rapbs/academic-years/{id}
DELETE /api/rapbs/academic-years/{id}

GET    /api/rapbs/activity-categories
POST   /api/rapbs/activity-categories
PUT    /api/rapbs/activity-categories/{id}
DELETE /api/rapbs/activity-categories/{id}

GET    /api/rapbs/funding-sources
POST   /api/rapbs/funding-sources
PUT    /api/rapbs/funding-sources/{id}
DELETE /api/rapbs/funding-sources/{id}
```

## 📊 Data Fields

### Academic Year (Tahun Ajaran)
```tsx
{
  year: string;          // "2024/2025"
  start_date: string;    // "2024-07-01"
  end_date: string;      // "2025-06-30"
  status: 'active' | 'inactive';
}
```

### Activity Category (Kategori Kegiatan)
```tsx
{
  name: string;          // "Belanja Operasional"
  description: string;   // Deskripsi kategori
  parent_id: number | null;  // ID parent category
  budget_type: 'income' | 'expense';
}
```

### Funding Source (Sumber Dana)
```tsx
{
  name: string;          // "BOS Pusat"
  type: 'bos' | 'spp' | 'donation' | 'other';
  description: string;   // Deskripsi sumber dana
  status: 'active' | 'inactive';
}
```

## 🚀 Cara Penggunaan

### Akses Halaman

1. **Via Sidebar:**
   - Klik menu **RAPBS**
   - Expand menu
   - Klik **Master Data**
   - Pilih submenu (Tahun Ajaran / Kategori Kegiatan / Sumber Dana)

2. **Via URL Direct:**
   - `/rapbs/master-data/tahun-ajaran`
   - `/rapbs/master-data/kategori-kegiatan`
   - `/rapbs/master-data/sumber-dana`

### CRUD Operations

#### Tambah Data:
1. Klik tombol "Tambah ..." di kanan atas
2. Isi form di modal
3. Klik "Simpan"
4. Data otomatis ter-refresh

#### Edit Data:
1. Klik icon pensil di kolom Aksi
2. Modal form terbuka dengan data terisi
3. Edit data yang diinginkan
4. Klik "Update"

#### Hapus Data:
1. Klik icon trash di kolom Aksi
2. Konfirmasi dialog muncul
3. Klik OK untuk menghapus
4. Data terhapus dan tabel ter-refresh

#### Filter & Search:
1. Gunakan search box untuk cari by name
2. Gunakan dropdown filter untuk filter by type/status
3. Data otomatis ter-filter saat ketik/pilih

## ✨ Key Features

### Tahun Ajaran
- ✅ Format tahun Indonesia (2024/2025)
- ✅ Date picker untuk start/end date
- ✅ Status active/inactive
- ✅ Date formatting dengan locale Indonesia
- ✅ Validation tanggal akhir > tanggal mulai

### Kategori Kegiatan
- ✅ Jenis pemasukan/pengeluaran
- ✅ Support hierarchical categories (parent-child)
- ✅ Deskripsi optional
- ✅ Color-coded badges (hijau=income, merah=expense)

### Sumber Dana
- ✅ 4 tipe sumber dana (BOS, SPP, Donasi, Lainnya)
- ✅ Status active/inactive
- ✅ Multi-filter (type + status)
- ✅ Color-coded badges per type

## 🔐 Security

- ✅ Authentication required (via auth middleware)
- ✅ Module permission check (rapbs)
- ✅ Confirmation dialog sebelum delete
- ✅ Input validation on client & server

## 📈 Sample Data

Data sample sudah tersedia via seeder:

### Academic Years: 3 records
- 2023/2024 (inactive)
- 2024/2025 (active)
- 2025/2026 (inactive)

### Activity Categories: 11 records
- Pendapatan dari Siswa (income)
- Belanja Operasional (expense)
- Belanja Sarana Prasarana (expense)
- dll

### Funding Sources: 7 records
- BOS Pusat (bos)
- SPP Siswa (spp)
- Donasi Alumni (donation)
- dll

## 🎯 Integration Points

### Used in:
1. **RAPBSPlanForm** - Dropdown untuk pilih tahun ajaran, kategori, sumber dana
2. **Dashboard** - Analytics per kategori & sumber dana
3. **Reports** - Filter & grouping by categories & funding sources

### Updates Cascade to:
- ✅ Form dropdown options ter-update otomatis
- ✅ Dashboard charts ter-update
- ✅ Reports ter-update

## 🐛 Error Handling

### Client Side:
- Required field validation
- Date range validation
- Form reset on cancel
- Error alerts on save failure

### Server Side:
- 422 Validation errors
- 404 Not found
- 500 Server errors
- Proper error messages

## 📝 Next Steps

Future enhancements:
- [ ] Bulk import tahun ajaran
- [ ] Category tree view untuk parent-child
- [ ] Budget allocation per funding source
- [ ] Audit log untuk perubahan master data
- [ ] Export master data to Excel

---

**Status**: ✅ Master Data Implementation Complete
**Date**: October 2024
**Version**: 1.0.0

