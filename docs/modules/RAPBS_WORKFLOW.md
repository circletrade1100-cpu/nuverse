# Cara Kerja Modul RAPBS

## 📋 Overview

Modul RAPBS (Rencana Anggaran Pendapatan dan Belanja Sekolah) adalah sistem manajemen anggaran sekolah yang mengelola siklus lengkap dari perencanaan hingga realisasi anggaran dengan workflow approval yang terstruktur.

---

## 🔄 Alur Kerja Utama (Main Workflow)

### 1. **Perencanaan (Planning Phase)**

#### A. Setup Master Data
Sebelum membuat rencana, master data harus sudah tersedia:

1. **Tahun Ajaran (Academic Year)**
   - Admin membuat tahun ajaran (contoh: 2024/2025)
   - Set status: `active` atau `inactive`
   - Tentukan `start_date` dan `end_date`

2. **Kategori Kegiatan (Activity Category)**
   - Buat kategori untuk pengeluaran (expense) atau pendapatan (income)
   - Contoh: "Operasional", "Sarana Prasarana", "Pendidikan"
   - Bisa hierarkis (parent-child)

3. **Sumber Dana (Funding Source)**
   - Definisikan sumber dana: BOS Pusat, SPP, Donasi, dll
   - Set status: `active` atau `inactive`

#### B. Membuat Rencana RAPBS

**Langkah-langkah:**

1. **Planner** (User dengan role planner) membuat rencana baru:
   ```
   POST /api/rapbs/plans
   ```
   - Pilih tahun ajaran
   - Pilih kategori kegiatan
   - Pilih sumber dana
   - Input judul dan deskripsi
   - Input jumlah anggaran (planned_amount)
   - Set prioritas (low, medium, high, urgent)
   - Status otomatis: **DRAFT**

2. **Tambah Breakdown Anggaran** (Opsional):
   ```
   POST /api/rapbs/plans/{planId}/breakdown
   ```
   - Detail item per item
   - Quantity × Unit Price = Total Amount
   - Contoh: 20 komputer × Rp 2.500.000 = Rp 50.000.000

3. **Upload Dokumen Pendukung** (Opsional):
   ```
   POST /api/rapbs/plans/{planId}/upload-document
   ```
   - Proposal
   - Budget Detail
   - Supporting Documents

4. **Submit untuk Approval**:
   ```
   PUT /api/rapbs/plans/{id}/submit
   ```
   - Status berubah: **DRAFT** → **SUBMITTED**
   - Rencana siap direview oleh approver

---

### 2. **Approval Workflow**

#### A. Review & Approval

1. **Approver** (User dengan role approver) melihat daftar rencana yang **SUBMITTED**

2. **Approve Rencana**:
   ```
   PUT /api/rapbs/plans/{id}/approve
   ```
   - Status berubah: **SUBMITTED** → **APPROVED**
   - System mencatat: `approved_by` dan `approved_at`
   - Rencana siap dieksekusi

3. **Reject Rencana** (jika perlu revisi):
   ```
   PUT /api/rapbs/plans/{id}/reject
   ```
   - Status berubah: **SUBMITTED** → **REJECTED**
   - Wajib isi alasan penolakan (notes)
   - System otomatis membuat Activity Note dengan type "issue"
   - Planner bisa edit dan submit ulang

#### B. Edit & Delete Rules

**Aturan Edit:**
- ✅ Bisa edit: Status **DRAFT** atau **REJECTED**
- ❌ Tidak bisa edit: Status **SUBMITTED** atau **APPROVED**

**Aturan Delete:**
- ✅ Bisa delete: Status **DRAFT** atau **REJECTED**
- ❌ Tidak bisa delete: Status **SUBMITTED** atau **APPROVED**

---

### 3. **Realisasi (Realization Phase)**

#### A. Input Realisasi

Setelah rencana **APPROVED**, **Executor** (User dengan role executor) bisa input realisasi:

1. **Buat Realisasi**:
   ```
   POST /api/rapbs/realizations
   ```
   - Pilih rencana RAPBS yang sudah **APPROVED**
   - Input tanggal transaksi
   - Input jumlah realisasi (amount)
   - Input deskripsi
   - Input nama vendor
   - Pilih metode pembayaran: cash, transfer, check
   - Input nomor referensi (opsional)
   - Upload dokumen: receipt, invoice, FPU, dll
   - Status otomatis: **PENDING**

2. **Validasi Dokumen**:
   ```
   PUT /api/rapbs/realizations/{realizationId}/documents/{documentId}/validate
   ```
   - Validator mengecek dokumen
   - Status dokumen: **pending** → **validated** atau **rejected**

#### B. Approval Realisasi

1. **Approver** review realisasi yang **PENDING**

2. **Approve Realisasi**:
   ```
   PUT /api/rapbs/realizations/{id}/approve
   ```
   - System cek: Apakah sisa anggaran mencukupi?
   - Jika cukup:
     - Status: **PENDING** → **APPROVED**
     - System **otomatis mengurangi** `realized_amount` di plan
     - Formula: `plan.realized_amount += realization.amount`
   - Jika tidak cukup: Error "Realization amount exceeds remaining budget"

3. **Reject Realisasi**:
   ```
   PUT /api/rapbs/realizations/{id}/reject
   ```
   - Status: **PENDING** → **REJECTED**
   - Wajib isi alasan penolakan

#### C. Budget Tracking

System otomatis tracking anggaran:
- **Planned Amount**: Total anggaran yang direncanakan
- **Realized Amount**: Total realisasi yang sudah approved
- **Remaining Budget**: `planned_amount - realized_amount`

---

### 4. **Monitoring & Reporting**

#### A. Dashboard

Dashboard menampilkan data real-time:
```
GET /api/rapbs/dashboard
```

**Data yang ditampilkan:**

1. **Budget Summary**:
   - Total Anggaran (dari semua plan yang APPROVED)
   - Total Realisasi (dari semua realization yang APPROVED)
   - Sisa Anggaran
   - Utilization Rate (%)

2. **Funding Sources Breakdown**:
   - Per sumber dana (BOS, SPP, dll)
   - Budget vs Realization per sumber

3. **Category Breakdown**:
   - Per kategori kegiatan
   - Budget vs Realization per kategori

#### B. Laporan

1. **Plan vs Realization**:
   ```
   GET /api/rapbs/reports/plan-vs-realization
   ```
   - Perbandingan rencana vs realisasi
   - Variance analysis

2. **Realization Summary**:
   ```
   GET /api/rapbs/reports/realization/summary
   ```
   - Ringkasan realisasi per periode

3. **Variance Analysis**:
   ```
   GET /api/rapbs/reports/variance-analysis
   ```
   - Analisis selisih anggaran

4. **Performance Report**:
   ```
   GET /api/rapbs/reports/performance
   ```
   - KPI dan metrik performa

---

## 🔐 Role-Based Access Control

### Roles & Permissions

1. **Planner**:
   - ✅ Buat rencana RAPBS
   - ✅ Edit rencana (status: draft/rejected)
   - ✅ Delete rencana (status: draft/rejected)
   - ✅ Submit rencana untuk approval
   - ✅ Tambah breakdown anggaran
   - ✅ Upload dokumen
   - ✅ Tambah activity notes

2. **Approver**:
   - ✅ Approve/Reject rencana RAPBS
   - ✅ Approve/Reject realisasi
   - ✅ Validasi dokumen realisasi
   - ✅ Lihat semua data

3. **Executor**:
   - ✅ Input realisasi
   - ✅ Upload dokumen realisasi
   - ✅ Edit realisasi (sebelum approved)
   - ✅ Lihat rencana yang approved

4. **Viewer**:
   - ✅ Lihat dashboard
   - ✅ Lihat laporan
   - ✅ Lihat rencana dan realisasi
   - ❌ Tidak bisa edit/approve

---

## 📊 Status Flow Diagram

### RAPBS Plan Status Flow:
```
DRAFT → SUBMITTED → APPROVED
         ↓
      REJECTED → (bisa edit & submit ulang)
```

### Realization Status Flow:
```
PENDING → APPROVED (mengurangi budget plan)
         ↓
      REJECTED
```

### Document Validation Flow:
```
PENDING → VALIDATED
         ↓
      REJECTED
```

---

## 🔄 Data Flow & Relationships

### Entity Relationships:

```
AcademicYear (1) ──→ (N) RapbsPlan
ActivityCategory (1) ──→ (N) RapbsPlan
FundingSource (1) ──→ (N) RapbsPlan
UnitKerja (1) ──→ (N) RapbsPlan

RapbsPlan (1) ──→ (N) BudgetBreakdown
RapbsPlan (1) ──→ (N) RapbsDocument
RapbsPlan (1) ──→ (N) RapbsRealization
RapbsPlan (1) ──→ (N) ActivityNote

RapbsRealization (1) ──→ (N) RealizationDocument
```

### Budget Calculation:

1. **Total Budget** = Sum of `planned_amount` dari semua plan dengan status **APPROVED**

2. **Total Realization** = Sum of `amount` dari semua realization dengan status **APPROVED**

3. **Remaining Budget** = `Total Budget - Total Realization`

4. **Utilization Rate** = `(Total Realization / Total Budget) × 100%`

---

## 🛡️ Security & Validation

### 1. Authentication
- Semua endpoint memerlukan token authentication (Laravel Sanctum)
- Header: `Authorization: Bearer {token}`

### 2. Authorization
- Filter berdasarkan `unit_kerja_id` user (kecuali Super Admin)
- User hanya bisa melihat data dari unit kerjanya sendiri

### 3. Business Rules

**Plan Rules:**
- Hanya draft/rejected yang bisa di-edit/delete
- Hanya submitted yang bisa di-approve/reject
- Setelah approved, tidak bisa di-edit

**Realization Rules:**
- Hanya bisa input realisasi untuk plan yang statusnya **APPROVED**
- Jumlah realisasi tidak boleh melebihi sisa anggaran
- Setelah approved, `realized_amount` di plan otomatis bertambah

**Document Rules:**
- Max file size: 10MB
- Allowed types: PDF, JPG, JPEG, PNG
- Documents disimpan di `storage/app/public/rapbs/`

---

## 📝 Activity Notes

System mendukung activity notes untuk tracking:

1. **Progress Notes**:
   - Update progress kegiatan
   - Catatan perkembangan

2. **Issue Notes**:
   - Masalah yang ditemui
   - Otomatis dibuat saat plan di-reject

3. **Completion Notes**:
   - Catatan penyelesaian
   - Dokumentasi hasil

---

## 🎯 Key Features

### 1. Multi-Level Approval
- Draft → Submitted → Approved
- Realisasi: Pending → Approved

### 2. Budget Control
- Real-time tracking
- Automatic budget deduction
- Budget validation sebelum approval

### 3. Document Management
- Upload dokumen rencana
- Upload dokumen realisasi
- Document validation workflow

### 4. Comprehensive Reporting
- Dashboard analytics
- Plan vs Realization
- Variance analysis
- Performance metrics

### 5. Unit Kerja Isolation
- Data terpisah per unit kerja
- Super Admin bisa lihat semua

---

## 💡 Contoh Skenario Lengkap

### Skenario: Pengadaan Komputer Lab

1. **Setup** (Admin):
   - Tahun Ajaran: 2024/2025 (active)
   - Kategori: "Sarana Prasarana"
   - Sumber Dana: "BOS Pusat"

2. **Perencanaan** (Planner):
   - Buat rencana: "Pengadaan 20 Komputer Lab"
   - Anggaran: Rp 50.000.000
   - Tambah breakdown:
     - 20 unit × Rp 2.500.000 = Rp 50.000.000
   - Upload proposal
   - Submit untuk approval

3. **Approval** (Approver):
   - Review rencana
   - Approve → Status: APPROVED

4. **Realisasi** (Executor):
   - Input realisasi: Pembayaran DP 50%
   - Jumlah: Rp 25.000.000
   - Upload invoice
   - Approver approve realisasi
   - System: `plan.realized_amount = 25.000.000`

5. **Monitoring**:
   - Dashboard menampilkan:
     - Budget: Rp 50.000.000
     - Realisasi: Rp 25.000.000
     - Sisa: Rp 25.000.000
     - Utilization: 50%

6. **Realisasi Lanjutan**:
   - Input realisasi: Pelunasan 50%
   - Jumlah: Rp 25.000.000
   - Approve → `plan.realized_amount = 50.000.000`
   - Utilization: 100%

---

## 🔧 Technical Implementation

### Backend (Laravel):
- **Controllers**: 6 controllers untuk berbagai fungsi
- **Models**: 10 models dengan relationships
- **Migrations**: 10 tabel database
- **Routes**: 48+ API endpoints

### Frontend (React/TypeScript):
- **Components**: 7 komponen utama
- **Services**: API service layer
- **Types**: TypeScript interfaces
- **Pages**: Main page dengan tabs

---

## 📚 Referensi

- Dokumentasi lengkap: `docs/modules/RAPBS.md`
- Backend implementation: `backend/RAPBS_BACKEND_IMPLEMENTATION.md`
- Frontend components: `frontend/src/components/RAPBS/README.md`

---

**Last Updated**: 2024
**Version**: 1.0.0

