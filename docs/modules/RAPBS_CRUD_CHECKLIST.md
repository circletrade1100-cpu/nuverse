# Checklist CRUD Modul Rencana RAPBS

## 📋 Overview
Dokumen ini berisi checklist lengkap untuk memverifikasi operasi CRUD (Create, Read, Update, Delete) pada modul Rencana RAPBS.

---

## ✅ CREATE (Tambah Rencana)

### Backend (`RAPBSPlanController::store`)

**Status**: ✅ **BENAR**

**Fitur yang sudah ada:**
- ✅ Validation lengkap:
  - `academic_year_id` (required, exists)
  - `activity_category_id` (required, exists)
  - `funding_source_id` (required, exists)
  - `title` (required, string, max:200)
  - `description` (required, string)
  - `planned_amount` (required, numeric, min:0)
  - `priority` (required, in:low,medium,high,urgent)

- ✅ Auto-set status: `draft`
- ✅ Auto-set `submitted_by`: User yang login
- ✅ Auto-set `unit_kerja_id`: Dari profile user
- ✅ Response format: `{ success: true, message, data }`
- ✅ HTTP Status: 201 (Created)

**Route**: `POST /api/rapbs/plans`

**Frontend Integration**:
- ✅ Service: `rapbsService.createPlan(data)`
- ✅ Component: `RAPBSPlanForm` (create mode)
- ✅ Form validation: Semua field required
- ✅ Error handling: Alert jika gagal

**Catatan**:
- ✅ Unit kerja otomatis diambil dari user profile
- ✅ Super Admin bisa membuat tanpa unit kerja (unit_kerja_id = null)

---

## ✅ READ (Baca Rencana)

### A. List All Plans (`RAPBSPlanController::index`)

**Status**: ✅ **BENAR**

**Fitur yang sudah ada:**
- ✅ Pagination (default: 10 per page)
- ✅ Filter berdasarkan:
  - `search` (title, description)
  - `academic_year_id`
  - `activity_category_id`
  - `funding_source_id`
  - `status` (draft, submitted, approved, rejected)
  - `priority` (low, medium, high, urgent)
- ✅ Unit kerja filtering (kecuali Super Admin)
- ✅ Sorting: `latest()` (terbaru dulu)
- ✅ Response format: Paginated data

**Route**: `GET /api/rapbs/plans`

**Frontend Integration**:
- ✅ Service: `rapbsService.getPlans(params)`
- ✅ Component: `RAPBSPlanList`
- ✅ Filter UI: Search, Status, Priority
- ✅ Pagination UI: Prev/Next buttons

**Catatan**:
- ✅ User hanya melihat data dari unit kerjanya (kecuali Super Admin)
- ✅ Plans dengan `unit_kerja_id = null` juga ditampilkan untuk fleksibilitas

### B. Get Single Plan (`RAPBSPlanController::show`)

**Status**: ✅ **BENAR**

**Fitur yang sudah ada:**
- ✅ Eager loading relationships:
  - `budgetBreakdowns`
  - `documents`
  - `realizations`
  - `activityNotes.createdBy`
  - `submittedBy`
  - `approvedBy`
- ✅ Response format: `{ success: true, data: plan }`

**Route**: `GET /api/rapbs/plans/{id}`

**Frontend Integration**:
- ✅ Service: `rapbsService.getPlan(id)`
- ✅ Component: Detail view (jika ada)

---

## ✅ UPDATE (Edit Rencana)

### Backend (`RAPBSPlanController::update`)

**Status**: ✅ **BENAR**

**Fitur yang sudah ada:**
- ✅ Status validation: Hanya `draft` dan `rejected` yang bisa di-edit
- ✅ Validation: Semua field optional (`sometimes`)
- ✅ Update hanya field yang dikirim
- ✅ Response format: `{ success: true, message, data }`

**Route**: `PUT /api/rapbs/plans/{id}`

**Frontend Integration**:
- ✅ Service: `rapbsService.updatePlan(id, data)`
- ✅ Component: `RAPBSPlanForm` (edit mode)
- ✅ Pre-fill form dengan data existing
- ✅ Disable edit jika status bukan draft/rejected

**Business Rules**:
- ✅ **Draft**: Bisa edit ✅
- ✅ **Rejected**: Bisa edit ✅
- ❌ **Submitted**: Tidak bisa edit
- ❌ **Approved**: Tidak bisa edit

**Catatan**:
- ✅ Error 403 jika coba edit plan yang statusnya submitted/approved
- ✅ Message: "Only draft and rejected plans can be edited"

---

## ✅ DELETE (Hapus Rencana)

### Backend (`RAPBSPlanController::destroy`)

**Status**: ✅ **BENAR**

**Fitur yang sudah ada:**
- ✅ Status validation: Hanya `draft` dan `rejected` yang bisa di-hapus
- ✅ Soft delete: Tidak ada (hard delete)
- ✅ Response format: `{ success: true, message }`

**Route**: `DELETE /api/rapbs/plans/{id}`

**Frontend Integration**:
- ✅ Service: `rapbsService.deletePlan(id)`
- ✅ Component: `RAPBSPlanList` (delete button)
- ✅ Confirmation dialog sebelum delete
- ✅ Refresh list setelah delete

**Business Rules**:
- ✅ **Draft**: Bisa delete ✅
- ✅ **Rejected**: Bisa delete ✅
- ❌ **Submitted**: Tidak bisa delete
- ❌ **Approved**: Tidak bisa delete

**Catatan**:
- ✅ Error 403 jika coba delete plan yang statusnya submitted/approved
- ✅ Message: "Only draft and rejected plans can be deleted"
- ⚠️ **PERHATIAN**: Hard delete, tidak ada soft delete. Pastikan tidak ada realisasi yang sudah dibuat untuk plan ini.

---

## 🔍 ISSUES & RECOMMENDATIONS

### 1. ⚠️ **Update Breakdown - Total Amount**

**Status**: ✅ **SUDAH BENAR** (dengan catatan)

**Current Implementation**:
- Model `BudgetBreakdown` punya `boot()` method yang auto-calculate `total_amount` saat `saving`
- Controller `updateBreakdown` tidak update `total_amount` secara eksplisit

**Analysis**:
- ✅ **OK**: Karena ada boot method, `total_amount` akan otomatis ter-update saat `quantity` atau `unit_price` berubah
- ✅ Controller sudah benar, tidak perlu update manual

**Verification**:
```php
// Model BudgetBreakdown.php
protected static function boot()
{
    parent::boot();
    static::saving(function ($breakdown) {
        $breakdown->total_amount = $breakdown->quantity * $breakdown->unit_price;
    });
}
```

**Status**: ✅ **TIDAK PERLU PERBAIKAN**

---

### 2. ✅ **Validation Rules**

**Status**: ✅ **SUDAH LENGKAP**

**Create Validation**:
- ✅ Semua field required
- ✅ Foreign key validation (exists)
- ✅ Data type validation
- ✅ Min/max validation

**Update Validation**:
- ✅ Semua field optional (`sometimes`)
- ✅ Validation tetap jalan untuk field yang dikirim
- ✅ Status check sebelum update

---

### 3. ✅ **Error Handling**

**Status**: ✅ **SUDAH BENAR**

**Backend**:
- ✅ Validation errors: 422 dengan detail errors
- ✅ Authorization errors: 403 dengan message
- ✅ Not found: 404 (findOrFail)

**Frontend**:
- ✅ Try-catch di service calls
- ✅ Alert untuk error messages
- ✅ Console error untuk debugging

---

### 4. ⚠️ **Delete Safety Check**

**Status**: ⚠️ **PERLU DIPERHATIKAN**

**Current Implementation**:
- ❌ Tidak ada check apakah plan sudah punya realisasi
- ❌ Hard delete langsung

**Recommendation**:
```php
public function destroy($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Check status
    if (!in_array($plan->status, ['draft', 'rejected'])) {
        return response()->json([
            'success' => false,
            'message' => 'Only draft and rejected plans can be deleted'
        ], 403);
    }
    
    // ⚠️ TAMBAHKAN: Check apakah sudah ada realisasi
    if ($plan->realizations()->exists()) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot delete plan that has realizations'
        ], 422);
    }
    
    $plan->delete();
    // ...
}
```

**Status**: ⚠️ **REKOMENDASI PERBAIKAN** (optional, tergantung business logic)

---

### 5. ✅ **Response Format Consistency**

**Status**: ✅ **KONSISTEN**

**Success Response**:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* data object */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* validation errors */ }
}
```

---

### 6. ✅ **Frontend-Backend Integration**

**Status**: ✅ **SELARAS**

**Service Layer**:
- ✅ Semua CRUD operations ada di `rapbsService`
- ✅ Type safety dengan TypeScript
- ✅ Error handling

**Components**:
- ✅ Form untuk create/edit
- ✅ List dengan pagination
- ✅ Filter dan search
- ✅ Action buttons sesuai status

---

## 📊 Summary

| Operation | Backend | Frontend | Status | Notes |
|-----------|---------|----------|--------|-------|
| **CREATE** | ✅ | ✅ | ✅ **BENAR** | Validation lengkap, auto-set fields |
| **READ (List)** | ✅ | ✅ | ✅ **BENAR** | Filter, pagination, unit kerja isolation |
| **READ (Detail)** | ✅ | ✅ | ✅ **BENAR** | Eager loading relationships |
| **UPDATE** | ✅ | ✅ | ✅ **BENAR** | Status validation, partial update |
| **DELETE** | ✅ | ✅ | ⚠️ **OK** | Status validation, hard delete (consider safety check) |

---

## 🎯 Kesimpulan

### ✅ **Yang Sudah Benar:**
1. ✅ Semua CRUD operations sudah terimplementasi
2. ✅ Validation rules lengkap dan benar
3. ✅ Business rules (status-based edit/delete) sudah diterapkan
4. ✅ Error handling sudah ada
5. ✅ Response format konsisten
6. ✅ Frontend-Backend integration selaras
7. ✅ Unit kerja filtering sudah benar
8. ✅ Auto-calculation untuk breakdown sudah ada di model

### ⚠️ **Rekomendasi Perbaikan (Optional):**
1. ⚠️ Tambahkan safety check sebelum delete (cek apakah ada realisasi)
2. ⚠️ Pertimbangkan soft delete untuk audit trail
3. ⚠️ Tambahkan logging untuk audit (opsional)

### ✅ **Overall Status: CRUD SUDAH BENAR** ✅

Semua operasi CRUD sudah terimplementasi dengan benar sesuai business requirements. Tidak ada masalah kritis yang ditemukan.

---

**Last Updated**: 2024
**Version**: 1.0.0

