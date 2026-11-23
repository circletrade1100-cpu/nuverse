# RAPBS Menu Structure Update

## 📋 Perubahan Menu

Menu RAPBS telah diubah dari **single page** menjadi **menu dengan 4 submenu** terpisah.

### Struktur Menu Baru:

```
📊 RAPBS
├── 📈 Dashboard
├── 📝 Rencana RAPBS
├── 💰 Realisasi
└── 📊 Laporan
```

## 🗂️ File yang Dibuat/Diubah

### 1. **Halaman Baru** (4 files)

#### `/pages/RAPBS/DashboardPage.tsx`
- Menampilkan dashboard RAPBS
- Summary cards, charts, progress bars
- Route: `/rapbs/dashboard`

#### `/pages/RAPBS/RencanaPage.tsx`
- Daftar rencana RAPBS
- Form tambah/edit rencana
- Approval workflow
- Route: `/rapbs/rencana`

#### `/pages/RAPBS/RealisasiPage.tsx`
- Daftar realisasi anggaran
- Form input transaksi
- Upload dokumen
- Route: `/rapbs/realisasi`

#### `/pages/RAPBS/LaporanPage.tsx`
- 4 jenis laporan
- Export PDF
- Analytics & reporting
- Route: `/rapbs/laporan`

### 2. **File Diupdate**

#### `components/common/Layout/Sidebar.tsx`
```tsx
// Sebelum:
{ 
  name: 'RAPBS', 
  path: '/rapbs', 
  icon: ChartBarIcon,
  description: 'Budget Planning',
  color: 'text-orange-500',
  module: 'rapbs'
}

// Sesudah:
{ 
  name: 'RAPBS', 
  path: '/rapbs', 
  icon: ChartBarIcon,
  description: 'Budget Planning',
  color: 'text-orange-500',
  module: 'rapbs',
  submenu: [
    { name: 'Dashboard', path: '/rapbs/dashboard', module: 'rapbs' },
    { name: 'Rencana RAPBS', path: '/rapbs/rencana', module: 'rapbs' },
    { name: 'Realisasi', path: '/rapbs/realisasi', module: 'rapbs' },
    { name: 'Laporan', path: '/rapbs/laporan', module: 'rapbs' }
  ]
}
```

#### `App.tsx`
```tsx
// Import ditambahkan:
import RAPBSDashboardPage from './pages/RAPBS/DashboardPage';
import RAPBSRencanaPage from './pages/RAPBS/RencanaPage';
import RAPBSRealisasiPage from './pages/RAPBS/RealisasiPage';
import RAPBSLaporanPage from './pages/RAPBS/LaporanPage';

// Routes ditambahkan:
<Route path="rapbs" element={<RAPBSPage />} />
<Route path="rapbs/dashboard" element={<RAPBSDashboardPage />} />
<Route path="rapbs/rencana" element={<RAPBSRencanaPage />} />
<Route path="rapbs/realisasi" element={<RAPBSRealisasiPage />} />
<Route path="rapbs/laporan" element={<RAPBSLaporanPage />} />
```

#### `pages/RAPBSPage.tsx`
```tsx
// Diubah menjadi redirect component
const RAPBSPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/rapbs/dashboard', { replace: true });
  }, [navigate]);

  return null;
};
```

## 🎯 Cara Akses

### Dari Sidebar:
1. Klik menu **RAPBS** (akan expand)
2. Pilih submenu yang diinginkan:
   - **Dashboard** → Overview & metrics
   - **Rencana RAPBS** → Kelola rencana anggaran
   - **Realisasi** → Input realisasi penggunaan dana
   - **Laporan** → Lihat & export laporan

### URL Direct:
- `/rapbs` → Auto redirect ke `/rapbs/dashboard`
- `/rapbs/dashboard` → Dashboard RAPBS
- `/rapbs/rencana` → Halaman Rencana
- `/rapbs/realisasi` → Halaman Realisasi
- `/rapbs/laporan` → Halaman Laporan

## ✨ Fitur per Halaman

### 📈 Dashboard
- Summary cards (Budget, Realisasi, Sisa, Utilisasi)
- Chart sumber dana
- Breakdown kategori
- Progress bar utilisasi

### 📝 Rencana RAPBS
- Tabel rencana dengan filter
- Tambah/Edit rencana
- Submit untuk approval
- Approve/Reject workflow
- Status & priority badges

### 💰 Realisasi
- Tabel transaksi realisasi
- Filter by date range & payment method
- Input transaksi baru
- Upload dokumen pendukung
- Edit/Delete transaksi

### 📊 Laporan
- Plan vs Realization
- Realization Summary
- Variance Analysis
- Performance Report
- Export PDF (Summary & Detailed)

## 🎨 UI/UX

- ✅ Sidebar dengan expand/collapse submenu
- ✅ Auto-open menu berdasarkan active path
- ✅ Highlight active submenu
- ✅ Smooth transitions & animations
- ✅ Responsive design (mobile, tablet, desktop)

## 🔐 Permissions

Semua submenu menggunakan module `rapbs`, sehingga:
- User dengan akses module `rapbs` dapat melihat semua submenu
- Super admin otomatis dapat akses semua
- User tanpa akses tidak melihat menu RAPBS

## 🚀 Next Steps

Setelah update ini:
1. ✅ Menu RAPBS sudah terstruktur dengan baik
2. ✅ Setiap fitur punya halaman sendiri
3. ✅ Navigasi lebih jelas dan user-friendly
4. ⏳ Backend API sudah ready untuk integrasi
5. ⏳ Testing flow lengkap dari dashboard sampai laporan

---

**Status**: ✅ Menu Structure Updated
**Date**: October 2024
**Version**: 2.0.0

