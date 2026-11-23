# Alur Rencana RAPBS Saat Ini

## 📊 Overview

Sistem RAPBS menggunakan **Multi-Level Approval** dengan 3 tahap approval yang harus dilalui secara berurutan sebelum rencana mendapatkan status **APPROVED (Final)**.

---

## 🔄 Alur Lengkap Rencana RAPBS

### **Flowchart Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TAHAP 1: PEMBUATAN                       │
│  User dari Unit Kerja membuat rencana RAPBS                 │
│  Status: DRAFT                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ User Submit
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    TAHAP 2: SUBMITTED                       │
│  Status: SUBMITTED                                           │
│  - Hanya creator yang bisa lihat (jika masih draft)         │
│  - Manajer Unit bisa lihat & approve                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│ APPROVE          │        │ REJECT           │
│ (Manajer Unit)   │        │ (Manajer Unit)   │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │                           ▼
         │                  Status: REJECTED_BY_MANAGER
         │                  (Bisa edit & submit ulang)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              TAHAP 3: APPROVAL LEVEL 1                       │
│  Status: APPROVED_BY_MANAGER                                │
│  - Approved by: Manajer Unit (dari unit yang sama)          │
│  - Kepala Sekolah bisa lihat & approve                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│ APPROVE          │        │ REJECT           │
│ (Kepala Sekolah) │        │ (Kepala Sekolah) │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │                           ▼
         │                  Status: REJECTED_BY_PRINCIPAL
         │                  (Bisa edit & submit ulang)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              TAHAP 4: APPROVAL LEVEL 2                       │
│  Status: APPROVED_BY_PRINCIPAL                               │
│  - Approved by: Kepala Sekolah (dari unit yang sama)        │
│  - Direktur Keuangan bisa lihat & approve                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────────┐        ┌──────────────────┐
│ APPROVE          │        │ REJECT           │
│ (Direktur)       │        │ (Direktur)       │
└────────┬─────────┘        └────────┬─────────┘
         │                           │
         │                           ▼
         │                  Status: REJECTED_BY_DIRECTOR
         │                  (Bisa edit & submit ulang)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              TAHAP 5: APPROVAL FINAL                         │
│  Status: APPROVED (FINAL)                                    │
│  - Approved by: Direktur Keuangan                            │
│  - Rencana siap untuk direalisasikan                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Detail Setiap Tahap

### **1. TAHAP PEMBUATAN (DRAFT)**

**Actor:** User dari Unit Kerja tertentu

**Aksi:**
- Membuat rencana RAPBS baru
- Input data:
  - Tahun Anggaran
  - Judul Rencana
  - Deskripsi
  - Jumlah Anggaran
  - Kategori Kegiatan
  - Sumber Dana
  - Prioritas (low, medium, high, urgent)
  - **Upload Proposal** (minimal 1 file PDF, maksimal 5 MB per file, multiple upload diperbolehkan)

**Status:** `DRAFT`

**Visibility:**
- ✅ Hanya **creator** yang bisa melihat rencana dengan status DRAFT
- ❌ Manajer, Kepala Sekolah, dan Direktur **TIDAK** bisa melihat rencana DRAFT

**Aksi yang bisa dilakukan:**
- ✅ Edit rencana
- ✅ Delete rencana
- ✅ Submit untuk approval
- ✅ Upload proposal files

---

### **2. TAHAP PENGAJUAN (SUBMITTED)**

**Actor:** Creator (User yang membuat rencana)

**Aksi:**
- Klik tombol "Submit" pada rencana DRAFT
- Status berubah: `DRAFT` → `SUBMITTED`

**Status:** `SUBMITTED`

**Visibility:**
- ✅ Creator bisa melihat
- ✅ **Manajer Unit** (dari unit yang sama) bisa melihat dan approve/reject
- ❌ Kepala Sekolah dan Direktur belum bisa melihat (kecuali sudah di-approve manajer)

**Aksi yang bisa dilakukan:**
- ✅ **Manajer Unit** (dari unit yang sama):
  - Approve → Status: `APPROVED_BY_MANAGER`
  - Reject → Status: `REJECTED_BY_MANAGER` (dengan catatan rejection)
- ✅ Creator bisa edit jika di-reject

**Validasi Approval Level 1:**
- ✅ User harus punya role: `Manajer Unit` (atau variasi: `manajer_unit`, `Manajer_Unit`, dll)
- ✅ User harus dari **unit kerja yang sama** dengan rencana
- ✅ Status rencana harus `SUBMITTED`

---

### **3. TAHAP APPROVAL LEVEL 1 (APPROVED_BY_MANAGER)**

**Actor:** Manajer Unit (dari unit yang sama dengan rencana)

**Aksi:**
- Review rencana yang sudah di-submit
- Klik tombol "Approve" → Status: `SUBMITTED` → `APPROVED_BY_MANAGER`

**Status:** `APPROVED_BY_MANAGER`

**Tracking:**
- `approved_by_manager`: ID user yang approve
- `approved_by_manager_at`: Timestamp approval

**Visibility:**
- ✅ Creator bisa melihat
- ✅ Manajer Unit bisa melihat
- ✅ **Kepala Sekolah** (dari unit yang sama) bisa melihat dan approve/reject
- ❌ Direktur belum bisa approve (kecuali sudah di-approve kepala sekolah)

**Aksi yang bisa dilakukan:**
- ✅ **Kepala Sekolah** (dari unit yang sama):
  - Approve → Status: `APPROVED_BY_PRINCIPAL`
  - Reject → Status: `REJECTED_BY_PRINCIPAL` (dengan catatan rejection)

**Validasi Approval Level 2:**
- ✅ User harus punya role: `Kepala Sekolah` atau `kepsek_rapbs_&_divisi_unit` (atau variasi lainnya)
- ✅ User harus dari **unit kerja yang sama** dengan rencana
- ✅ Status rencana harus `APPROVED_BY_MANAGER`

---

### **4. TAHAP APPROVAL LEVEL 2 (APPROVED_BY_PRINCIPAL)**

**Actor:** Kepala Sekolah (dari unit yang sama dengan rencana)

**Aksi:**
- Review rencana yang sudah di-approve manajer
- Klik tombol "Approve" → Status: `APPROVED_BY_MANAGER` → `APPROVED_BY_PRINCIPAL`

**Status:** `APPROVED_BY_PRINCIPAL`

**Tracking:**
- `approved_by_principal`: ID user yang approve
- `approved_by_principal_at`: Timestamp approval

**Visibility:**
- ✅ Creator, Manajer, Kepala Sekolah bisa melihat
- ✅ **Direktur Keuangan** (bisa dari unit manapun) bisa melihat dan approve/reject

**Aksi yang bisa dilakukan:**
- ✅ **Direktur Keuangan** (tidak perlu dari unit yang sama):
  - Approve → Status: `APPROVED` (FINAL)
  - Reject → Status: `REJECTED_BY_DIRECTOR` (dengan catatan rejection)

**Validasi Approval Level 3:**
- ✅ User harus punya role: `Direktur Keuangan` (atau variasi: `direktur_keuangan`, `Direktur_Keuangan`, dll)
- ✅ **TIDAK** perlu cek unit kerja (bisa global)
- ✅ Status rencana harus `APPROVED_BY_PRINCIPAL`

---

### **5. TAHAP APPROVAL FINAL (APPROVED)**

**Actor:** Direktur Keuangan

**Aksi:**
- Review rencana yang sudah di-approve kepala sekolah
- Klik tombol "Approve" → Status: `APPROVED_BY_PRINCIPAL` → `APPROVED`

**Status:** `APPROVED` (FINAL)

**Tracking:**
- `approved_by_director`: ID user yang approve
- `approved_by_director_at`: Timestamp approval
- `approved_by`: ID user (backward compatibility)
- `approved_at`: Timestamp (backward compatibility)

**Visibility:**
- ✅ Semua user bisa melihat rencana yang sudah APPROVED

**Aksi yang bisa dilakukan:**
- ✅ Rencana sudah **FINAL** dan siap untuk direalisasikan
- ✅ Bisa dibuat realisasi berdasarkan rencana ini

---

## ❌ Alur Rejection

### **Rejection di Level 1 (REJECTED_BY_MANAGER)**

**Actor:** Manajer Unit

**Aksi:**
- Klik tombol "Reject" pada rencana `SUBMITTED`
- Input catatan rejection (wajib)
- Status: `SUBMITTED` → `REJECTED_BY_MANAGER`

**Status:** `REJECTED_BY_MANAGER`

**Tracking:**
- `rejection_notes_manager`: Catatan rejection

**Aksi yang bisa dilakukan:**
- ✅ Creator bisa **edit** rencana dan **submit ulang**
- ✅ Status akan kembali ke `SUBMITTED` setelah submit ulang

---

### **Rejection di Level 2 (REJECTED_BY_PRINCIPAL)**

**Actor:** Kepala Sekolah

**Aksi:**
- Klik tombol "Reject" pada rencana `APPROVED_BY_MANAGER`
- Input catatan rejection (wajib)
- Status: `APPROVED_BY_MANAGER` → `REJECTED_BY_PRINCIPAL`

**Status:** `REJECTED_BY_PRINCIPAL`

**Tracking:**
- `rejection_notes_principal`: Catatan rejection

**Aksi yang bisa dilakukan:**
- ✅ Creator bisa **edit** rencana dan **submit ulang**
- ✅ Status akan kembali ke `SUBMITTED` setelah submit ulang

---

### **Rejection di Level 3 (REJECTED_BY_DIRECTOR)**

**Actor:** Direktur Keuangan

**Aksi:**
- Klik tombol "Reject" pada rencana `APPROVED_BY_PRINCIPAL`
- Input catatan rejection (wajib)
- Status: `APPROVED_BY_PRINCIPAL` → `REJECTED_BY_DIRECTOR`

**Status:** `REJECTED_BY_DIRECTOR`

**Tracking:**
- `rejection_notes_director`: Catatan rejection

**Aksi yang bisa dilakukan:**
- ✅ Creator bisa **edit** rencana dan **submit ulang**
- ✅ Status akan kembali ke `SUBMITTED` setelah submit ulang

---

## 🔐 Role-Based Access Control

### **Roles yang Terlibat:**

1. **Creator (User dari Unit Kerja)**
   - ✅ Buat rencana (status: DRAFT)
   - ✅ Edit rencana (status: DRAFT, REJECTED_*)
   - ✅ Delete rencana (status: DRAFT, REJECTED_*)
   - ✅ Submit rencana
   - ✅ Upload proposal files

2. **Manajer Unit**
   - ✅ Lihat rencana dari unit kerjanya (status: SUBMITTED, APPROVED_BY_MANAGER, dll)
   - ✅ Approve/Reject rencana (status: SUBMITTED)
   - ❌ Tidak bisa lihat rencana DRAFT dari unit lain

3. **Kepala Sekolah**
   - ✅ Lihat rencana dari unit kerjanya (status: APPROVED_BY_MANAGER, APPROVED_BY_PRINCIPAL, dll)
   - ✅ Approve/Reject rencana (status: APPROVED_BY_MANAGER)
   - ❌ Tidak bisa lihat rencana DRAFT atau SUBMITTED (belum di-approve manajer)

4. **Direktur Keuangan**
   - ✅ Lihat semua rencana (status: APPROVED_BY_PRINCIPAL, APPROVED, dll)
   - ✅ Approve/Reject rencana (status: APPROVED_BY_PRINCIPAL)
   - ❌ Tidak perlu dari unit yang sama (bisa global)

---

## 📊 Status Enum

```typescript
type Status = 
  | 'draft'                    // Rencana baru dibuat, belum di-submit
  | 'submitted'                 // Sudah di-submit, menunggu approval manajer
  | 'approved_by_manager'       // Disetujui manajer unit (Level 1)
  | 'approved_by_principal'     // Disetujui kepala sekolah (Level 2)
  | 'approved'                 // Disetujui direktur keuangan (Level 3 - FINAL)
  | 'rejected_by_manager'       // Ditolak oleh manajer unit
  | 'rejected_by_principal'    // Ditolak oleh kepala sekolah
  | 'rejected_by_director'      // Ditolak oleh direktur keuangan
  | 'rejected';                 // Generic rejection (backward compatibility)
```

---

## 🔄 Status Transitions

### **Valid Transitions:**

```
DRAFT → SUBMITTED
  ↓
SUBMITTED → APPROVED_BY_MANAGER
SUBMITTED → REJECTED_BY_MANAGER → (edit) → SUBMITTED

APPROVED_BY_MANAGER → APPROVED_BY_PRINCIPAL
APPROVED_BY_MANAGER → REJECTED_BY_PRINCIPAL → (edit) → SUBMITTED

APPROVED_BY_PRINCIPAL → APPROVED (FINAL)
APPROVED_BY_PRINCIPAL → REJECTED_BY_DIRECTOR → (edit) → SUBMITTED
```

### **Invalid Transitions (akan error):**

```
❌ SUBMITTED → APPROVED_BY_PRINCIPAL (harus lewat manajer dulu)
❌ APPROVED_BY_MANAGER → APPROVED (harus lewat kepala sekolah dulu)
❌ APPROVED → (tidak bisa diubah lagi)
```

---

## 📁 File Proposal

### **Upload Requirements:**
- ✅ Format: PDF only
- ✅ Ukuran maksimal: 5 MB per file
- ✅ Multiple upload diperbolehkan
- ✅ Minimal 1 file untuk rencana baru (wajib)

### **Storage:**
- File disimpan di: `storage/app/public/rapbs/proposals/`
- URL download: `/api/storage/{file_path}`

### **Display:**
- File proposal ditampilkan di modal detail rencana
- Lokasi: Di bawah "Jumlah Anggaran"
- Menampilkan: Nama file, ukuran, tipe, dan tombol download

---

## 🎯 Timeline Approval

Di modal detail rencana, terdapat **Timeline Status Approval** yang menampilkan:

1. **Diajukan** (Submitted)
   - Status: Completed/Pending/Rejected
   - Tanggal: `created_at`

2. **Manajer Unit**
   - Status: Completed/Pending/Rejected
   - Tanggal: `approved_by_manager_at`
   - User: `approved_by_manager_user`
   - Catatan rejection: `rejection_notes_manager` (jika di-reject)

3. **Kepala Sekolah**
   - Status: Completed/Pending/Rejected
   - Tanggal: `approved_by_principal_at`
   - User: `approved_by_principal_user`
   - Catatan rejection: `rejection_notes_principal` (jika di-reject)

4. **Direktur Keuangan**
   - Status: Completed/Pending/Rejected
   - Tanggal: `approved_by_director_at`
   - User: `approved_by_director_user`
   - Catatan rejection: `rejection_notes_director` (jika di-reject)

---

## 🔍 Filtering & Visibility Rules

### **Draft Plans:**
- ✅ Hanya **creator** yang bisa melihat rencana dengan status `DRAFT`
- ❌ Manajer, Kepala Sekolah, dan Direktur **TIDAK** bisa melihat rencana DRAFT

### **Submitted Plans:**
- ✅ Creator bisa melihat
- ✅ **Manajer Unit** (dari unit yang sama) bisa melihat dan approve/reject
- ❌ Kepala Sekolah dan Direktur belum bisa melihat

### **Approved Plans:**
- ✅ Semua user yang berwenang bisa melihat sesuai level approval
- ✅ Visibility meningkat seiring dengan level approval

---

## 📝 Catatan Penting

1. **Unit Kerja Matching:**
   - Approval Level 1 & 2: **WAJIB** dari unit kerja yang sama
   - Approval Level 3: **TIDAK** perlu dari unit yang sama (global)

2. **Role Name Variations:**
   - Sistem mendukung berbagai format nama role (case-insensitive)
   - Contoh: `Manajer Unit`, `manajer_unit`, `Manajer_Unit`, `MANAJER_UNIT`, dll

3. **Rejection Notes:**
   - Wajib diisi saat reject
   - Disimpan di field: `rejection_notes_manager`, `rejection_notes_principal`, `rejection_notes_director`

4. **Edit After Rejection:**
   - Creator bisa edit rencana yang di-reject
   - Setelah edit, harus submit ulang (status kembali ke `SUBMITTED`)

5. **Final Approval:**
   - Status `APPROVED` adalah final
   - Rencana tidak bisa diubah lagi setelah approved
   - Rencana siap untuk dibuat realisasi

---

## 🚀 API Endpoints

### **CRUD:**
- `POST /api/rapbs/plans` - Create plan
- `GET /api/rapbs/plans` - List plans (dengan filtering)
- `GET /api/rapbs/plans/{id}` - Get plan detail
- `PUT /api/rapbs/plans/{id}` - Update plan
- `DELETE /api/rapbs/plans/{id}` - Delete plan

### **Workflow:**
- `PUT /api/rapbs/plans/{id}/submit` - Submit plan
- `PUT /api/rapbs/plans/{id}/approve-by-manager` - Approve by manager
- `PUT /api/rapbs/plans/{id}/approve-by-principal` - Approve by principal
- `PUT /api/rapbs/plans/{id}/approve-by-director` - Approve by director
- `PUT /api/rapbs/plans/{id}/reject-by-manager` - Reject by manager
- `PUT /api/rapbs/plans/{id}/reject-by-principal` - Reject by principal
- `PUT /api/rapbs/plans/{id}/reject-by-director` - Reject by director

### **Documents:**
- `POST /api/rapbs/plans/{planId}/upload-document` - Upload document
- `GET /api/rapbs/plans/{planId}/documents` - Get documents
- `DELETE /api/rapbs/plans/{planId}/documents/{documentId}` - Delete document

---

## ✅ Summary

**Alur lengkap:**
1. **DRAFT** → User membuat rencana
2. **SUBMITTED** → User submit rencana
3. **APPROVED_BY_MANAGER** → Manajer Unit approve
4. **APPROVED_BY_PRINCIPAL** → Kepala Sekolah approve
5. **APPROVED** → Direktur Keuangan approve (FINAL)

**Rejection bisa terjadi di setiap level:**
- `REJECTED_BY_MANAGER` → Edit & submit ulang
- `REJECTED_BY_PRINCIPAL` → Edit & submit ulang
- `REJECTED_BY_DIRECTOR` → Edit & submit ulang

**Visibility:**
- Draft hanya visible ke creator
- Submitted visible ke creator & manajer unit
- Approved visible sesuai level approval

**File Proposal:**
- Wajib upload minimal 1 file PDF (max 5MB per file)
- Ditampilkan di modal detail rencana

