# Alur Approval Rencana RAPBS (Multi-Level Approval)

## 📊 Flowchart Approval RAPBS

Berdasarkan flowchart yang diberikan, alur approval RAPBS menggunakan **Multi-Level Approval** dengan 3 tahap:

```
UNIT KERJA
    ↓
MEMBUAT RENCANA RAPBS
    ↓
CHECKER: User dengan Role MANAJER UNIT (berdasarkan unit kerjanya)
    ↓
APPROVAL (Level 1)
    ↓
CHECKER: User dengan Role KEPALA SEKOLAH (berdasarkan unit kerjanya)
    ↓
APPROVAL (Level 2)
    ↓
APPROVE: User dengan Role DIREKTUR KEUANGAN
    ↓
APPROVAL FINAL (Level 3)
```

---

## 🔄 Alur Approval yang Benar

### **Tahap 1: Pembuatan Rencana**
- **Actor**: Unit Kerja (User dari unit kerja tertentu)
- **Action**: Membuat rencana RAPBS
- **Status**: `DRAFT`

### **Tahap 2: Approval Level 1 - Manajer Unit**
- **Actor**: User dengan role **"Manajer Unit"**
- **Condition**: Harus dari **unit kerja yang sama** dengan rencana
- **Action**: Review dan approve
- **Status**: `SUBMITTED` → `APPROVED_BY_MANAGER` (atau status baru)

### **Tahap 3: Approval Level 2 - Kepala Sekolah**
- **Actor**: User dengan role **"Kepala Sekolah"**
- **Condition**: Harus dari **unit kerja yang sama** dengan rencana
- **Action**: Review dan approve
- **Status**: `APPROVED_BY_MANAGER` → `APPROVED_BY_PRINCIPAL` (atau status baru)

### **Tahap 4: Approval Level 3 - Direktur Keuangan**
- **Actor**: User dengan role **"Direktur Keuangan"**
- **Condition**: Tidak perlu dari unit kerja yang sama (bisa global)
- **Action**: Review dan approve final
- **Status**: `APPROVED_BY_PRINCIPAL` → `APPROVED` (final)

---

## ⚠️ Perbandingan: Implementasi Saat Ini vs Flowchart

### **Implementasi Saat Ini:**

```
DRAFT → SUBMITTED → APPROVED
         ↓
      REJECTED
```

**Masalah:**
- ❌ Hanya 1 tahap approval (SUBMITTED → APPROVED)
- ❌ Tidak ada multi-level approval
- ❌ Tidak ada pengecekan role berdasarkan unit kerja
- ❌ Tidak ada tracking per level approval

### **Flowchart (Yang Seharusnya):**

```
DRAFT → SUBMITTED → APPROVED_BY_MANAGER → APPROVED_BY_PRINCIPAL → APPROVED
         ↓              ↓                        ↓
      REJECTED    REJECTED                 REJECTED
```

**Yang Diperlukan:**
- ✅ 3 tahap approval (Manajer Unit → Kepala Sekolah → Direktur Keuangan)
- ✅ Pengecekan role berdasarkan unit kerja untuk Level 1 & 2
- ✅ Tracking siapa yang approve di setiap level
- ✅ Bisa reject di setiap level

---

## 🔧 Rekomendasi Implementasi

### **1. Update Database Schema**

**Migration**: Tambahkan field untuk multi-level approval

```php
Schema::table('rapbs_plans', function (Blueprint $table) {
    // Status untuk multi-level
    $table->enum('status', [
        'draft', 
        'submitted',
        'approved_by_manager',      // Level 1
        'approved_by_principal',    // Level 2
        'approved',                 // Level 3 (Final)
        'rejected_by_manager',
        'rejected_by_principal',
        'rejected_by_director',
        'rejected'                  // Generic rejection
    ])->default('draft')->change();
    
    // Tracking per level
    $table->foreignId('approved_by_manager')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('approved_by_manager_at')->nullable();
    
    $table->foreignId('approved_by_principal')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('approved_by_principal_at')->nullable();
    
    $table->foreignId('approved_by_director')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('approved_by_director_at')->nullable();
    
    // Rejection notes per level
    $table->text('rejection_notes_manager')->nullable();
    $table->text('rejection_notes_principal')->nullable();
    $table->text('rejection_notes_director')->nullable();
});
```

---

### **2. Update Controller - Multi-Level Approval**

**File**: `backend/app/Http/Controllers/RAPBSPlanController.php`

#### **A. Approval Level 1 - Manajer Unit**

```php
public function approveByManager($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Cek status
    if ($plan->status !== 'submitted') {
        return response()->json([
            'success' => false,
            'message' => 'Only submitted plans can be approved by manager'
        ], 403);
    }
    
    $user = Auth::user();
    
    // ✅ Cek role: Harus "Manajer Unit"
    $hasManagerRole = $user->roles()->where('name', 'Manajer Unit')->exists();
    if (!$hasManagerRole) {
        return response()->json([
            'success' => false,
            'message' => 'Only Unit Manager can approve at this level'
        ], 403);
    }
    
    // ✅ Cek unit kerja: Harus dari unit kerja yang sama
    if ($user->profile && $user->profile->unit_kerja) {
        $unitKerja = UnitKerja::where('nama', $user->profile->unit_kerja)->first();
        if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve plans from your own unit'
            ], 403);
        }
    }
    
    $plan->update([
        'status' => 'approved_by_manager',
        'approved_by_manager' => $user->id,
        'approved_by_manager_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved by manager',
        'data' => $plan
    ]);
}
```

#### **B. Approval Level 2 - Kepala Sekolah**

```php
public function approveByPrincipal($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Cek status: Harus sudah approved by manager
    if ($plan->status !== 'approved_by_manager') {
        return response()->json([
            'success' => false,
            'message' => 'Plan must be approved by manager first'
        ], 403);
    }
    
    $user = Auth::user();
    
    // ✅ Cek role: Harus "Kepala Sekolah"
    $hasPrincipalRole = $user->roles()->where('name', 'Kepala Sekolah')->exists();
    if (!$hasPrincipalRole) {
        return response()->json([
            'success' => false,
            'message' => 'Only School Principal can approve at this level'
        ], 403);
    }
    
    // ✅ Cek unit kerja: Harus dari unit kerja yang sama
    if ($user->profile && $user->profile->unit_kerja) {
        $unitKerja = UnitKerja::where('nama', $user->profile->unit_kerja)->first();
        if (!$unitKerja || $plan->unit_kerja_id != $unitKerja->id) {
            return response()->json([
                'success' => false,
                'message' => 'Can only approve plans from your own unit'
            ], 403);
        }
    }
    
    $plan->update([
        'status' => 'approved_by_principal',
        'approved_by_principal' => $user->id,
        'approved_by_principal_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved by principal',
        'data' => $plan
    ]);
}
```

#### **C. Approval Level 3 - Direktur Keuangan (Final)**

```php
public function approveByDirector($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Cek status: Harus sudah approved by principal
    if ($plan->status !== 'approved_by_principal') {
        return response()->json([
            'success' => false,
            'message' => 'Plan must be approved by principal first'
        ], 403);
    }
    
    $user = Auth::user();
    
    // ✅ Cek role: Harus "Direktur Keuangan"
    $hasDirectorRole = $user->roles()->where('name', 'Direktur Keuangan')->exists();
    if (!$hasDirectorRole) {
        return response()->json([
            'success' => false,
            'message' => 'Only Finance Director can give final approval'
        ], 403);
    }
    
    // ✅ Tidak perlu cek unit kerja (bisa global)
    
    $plan->update([
        'status' => 'approved',
        'approved_by_director' => $user->id,
        'approved_by_director_at' => now(),
        'approved_by' => $user->id,  // Keep for backward compatibility
        'approved_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved by finance director (final)',
        'data' => $plan
    ]);
}
```

---

### **3. Update Routes**

```php
// RAPBS Plans
Route::get('/plans', [RAPBSPlanController::class, 'index']);
Route::get('/plans/{id}', [RAPBSPlanController::class, 'show']);
Route::post('/plans', [RAPBSPlanController::class, 'store']);
Route::put('/plans/{id}', [RAPBSPlanController::class, 'update']);
Route::delete('/plans/{id}', [RAPBSPlanController::class, 'destroy']);
Route::put('/plans/{id}/submit', [RAPBSPlanController::class, 'submit']);

// Multi-Level Approval
Route::put('/plans/{id}/approve-by-manager', [RAPBSPlanController::class, 'approveByManager']);
Route::put('/plans/{id}/approve-by-principal', [RAPBSPlanController::class, 'approveByPrincipal']);
Route::put('/plans/{id}/approve-by-director', [RAPBSPlanController::class, 'approveByDirector']);

// Rejection per level
Route::put('/plans/{id}/reject-by-manager', [RAPBSPlanController::class, 'rejectByManager']);
Route::put('/plans/{id}/reject-by-principal', [RAPBSPlanController::class, 'rejectByPrincipal']);
Route::put('/plans/{id}/reject-by-director', [RAPBSPlanController::class, 'rejectByDirector']);

// Backward compatibility (optional)
Route::put('/plans/{id}/approve', [RAPBSPlanController::class, 'approve']); // Deprecated
Route::put('/plans/{id}/reject', [RAPBSPlanController::class, 'reject']); // Deprecated
```

---

### **4. Update Frontend**

**File**: `frontend/src/components/RAPBS/RAPBSPlanList.tsx`

```typescript
// Helper untuk cek apakah user bisa approve di level tertentu
const canApproveByManager = (plan: RAPBSPlan): boolean => {
  if (plan.status !== 'submitted') return false;
  
  const userRole = getUserRole(); // Function untuk get user role
  if (userRole !== 'Manajer Unit') return false;
  
  // Cek unit kerja
  const userUnitKerja = user?.profile?.unit_kerja;
  const planUnitKerja = plan.unitKerja?.nama;
  return userUnitKerja === planUnitKerja;
};

const canApproveByPrincipal = (plan: RAPBSPlan): boolean => {
  if (plan.status !== 'approved_by_manager') return false;
  
  const userRole = getUserRole();
  if (userRole !== 'Kepala Sekolah') return false;
  
  // Cek unit kerja
  const userUnitKerja = user?.profile?.unit_kerja;
  const planUnitKerja = plan.unitKerja?.nama;
  return userUnitKerja === planUnitKerja;
};

const canApproveByDirector = (plan: RAPBSPlan): boolean => {
  if (plan.status !== 'approved_by_principal') return false;
  
  const userRole = getUserRole();
  return userRole === 'Direktur Keuangan';
};
```

---

## 📊 Status Flow yang Benar

```
DRAFT
  ↓ (submit)
SUBMITTED
  ↓ (approve by manager)     ↓ (reject by manager)
APPROVED_BY_MANAGER      REJECTED_BY_MANAGER → (bisa edit & submit ulang)
  ↓ (approve by principal)   ↓ (reject by principal)
APPROVED_BY_PRINCIPAL    REJECTED_BY_PRINCIPAL → (bisa edit & submit ulang)
  ↓ (approve by director)     ↓ (reject by director)
APPROVED (FINAL)         REJECTED_BY_DIRECTOR → (bisa edit & submit ulang)
```

---

## 🎯 Summary

### **Alur yang Benar (Sesuai Flowchart):**

1. **Unit Kerja** → Membuat rencana (DRAFT)
2. **Submit** → Status: SUBMITTED
3. **Manajer Unit** (dari unit yang sama) → Approve → Status: APPROVED_BY_MANAGER
4. **Kepala Sekolah** (dari unit yang sama) → Approve → Status: APPROVED_BY_PRINCIPAL
5. **Direktur Keuangan** → Approve Final → Status: APPROVED

### **Yang Perlu Diimplementasikan:**

1. ✅ Update database schema (tambah field untuk multi-level)
2. ✅ Update controller (3 method approval terpisah)
3. ✅ Update routes (3 endpoint approval)
4. ✅ Update frontend (cek role dan status per level)
5. ✅ Update model (tambah relationships)
6. ✅ Update dokumentasi

---

**Last Updated**: 2024
**Version**: 2.0.0 (Multi-Level Approval)

