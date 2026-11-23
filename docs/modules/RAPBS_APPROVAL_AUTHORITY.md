# Siapa yang Bisa Approve Rencana RAPBS?

## 📋 Current Implementation

### 🔍 Analisis Implementasi Saat Ini

#### **Backend (Laravel Controller)**

**File**: `backend/app/Http/Controllers/RAPBSPlanController.php`

**Method**: `approve($id)`

```php
public function approve($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Hanya cek status plan
    if ($plan->status !== 'submitted') {
        return response()->json([
            'success' => false,
            'message' => 'Only submitted plans can be approved'
        ], 403);
    }
    
    $plan->update([
        'status' => 'approved',
        'approved_by' => Auth::id(),  // User yang login
        'approved_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved successfully',
        'data' => $plan
    ]);
}
```

**Status**: ⚠️ **TIDAK ADA PENGECEKAN ROLE**

- ❌ Tidak ada pengecekan apakah user punya role "approver"
- ❌ Tidak ada pengecekan apakah user adalah Super Admin
- ✅ Hanya cek: Plan harus berstatus `submitted`
- ✅ Siapa saja yang login bisa approve (asalkan plan statusnya `submitted`)

---

#### **Frontend (React Component)**

**File**: `frontend/src/components/RAPBS/RAPBSPlanList.tsx`

**Function**: `canApprovePlan(plan)`

```typescript
const canApprovePlan = (plan: RAPBSPlan): boolean => {
  // Hanya Super Admin yang bisa approve
  if (!isSuperAdmin()) return false;
  
  // Cek apakah bukan dari unit pembuat
  const userUnitKerja = user?.profile?.unit_kerja;
  const planUnitKerja = (plan as any).unitKerja?.nama || (plan as any).unit_kerja?.nama;
  
  // Jika plan tidak punya unit_kerja atau user tidak punya unit_kerja, allow
  if (!planUnitKerja || !userUnitKerja) return true;
  
  // Hanya allow jika user bukan dari unit pembuat
  return userUnitKerja !== planUnitKerja;
};
```

**Status**: ✅ **ADA PENGECEKAN DI FRONTEND**

- ✅ Hanya **Super Admin** yang bisa approve
- ✅ Tidak bisa approve plan dari **unit kerja sendiri**
- ✅ Bisa approve plan dari **unit kerja lain**

**UI Logic**:
```typescript
{plan.status === 'submitted' && canApprovePlan(plan) && (
  <>
    <button onClick={() => handleApprove(plan.id)}>Approve</button>
    <button onClick={() => handleReject(plan.id)}>Reject</button>
  </>
)}
```

---

## 🎯 Kesimpulan: Siapa yang Bisa Approve?

### **Saat Ini (Current Implementation):**

1. **Backend**: 
   - ⚠️ **Siapa saja yang login** bisa approve (tidak ada pengecekan role)
   - Hanya cek: Plan status = `submitted`

2. **Frontend**: 
   - ✅ **Hanya Super Admin** yang bisa approve
   - ✅ **Tidak bisa approve plan dari unit kerjanya sendiri**
   - ✅ **Bisa approve plan dari unit kerja lain**

3. **Dokumentasi**:
   - Menyebutkan role **"Approver"** yang bisa approve/reject
   - Tapi role ini **tidak digunakan** di implementasi

---

## ⚠️ **MASALAH: Inkonsistensi Backend vs Frontend**

### **Problem**:
- **Backend**: Tidak ada pengecekan role → siapa saja bisa approve
- **Frontend**: Hanya Super Admin yang bisa approve → button tidak muncul untuk non-Super Admin

### **Dampak**:
1. ✅ **Security**: Frontend sudah membatasi (hanya Super Admin), tapi backend tidak
2. ⚠️ **API Direct Call**: Jika ada yang call API langsung (bypass frontend), siapa saja bisa approve
3. ⚠️ **Inkonsistensi**: Backend dan frontend tidak selaras

---

## 📊 Role System yang Tersedia

### **Model RapbsUser**

Ada model `RapbsUser` dengan role:
- `planner` - Buat dan edit rencana
- `approver` - Approve/reject rencana
- `executor` - Input realisasi
- `viewer` - Lihat laporan

**Tapi role ini TIDAK DIGUNAKAN di controller!**

---

## 🔧 Rekomendasi Perbaikan

### **Opsi 1: Gunakan Role "Approver" (Recommended)**

**Backend**: Tambahkan pengecekan role

```php
public function approve($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    // Cek status
    if ($plan->status !== 'submitted') {
        return response()->json([
            'success' => false,
            'message' => 'Only submitted plans can be approved'
        ], 403);
    }
    
    // ✅ TAMBAHKAN: Cek apakah user punya role approver
    $user = Auth::user();
    $rapbsUser = RapbsUser::where('user_id', $user->id)
        ->where('role', 'approver')
        ->first();
    
    // Atau cek apakah Super Admin
    $isSuperAdmin = $user->roles()->where('name', 'Super Administrator')->exists();
    
    if (!$rapbsUser && !$isSuperAdmin) {
        return response()->json([
            'success' => false,
            'message' => 'Only approvers or Super Admin can approve plans'
        ], 403);
    }
    
    // ✅ TAMBAHKAN: Cek unit kerja (tidak bisa approve plan dari unit sendiri)
    if (!$isSuperAdmin && $user->profile && $user->profile->unit_kerja) {
        $unitKerja = UnitKerja::where('nama', $user->profile->unit_kerja)->first();
        if ($unitKerja && $plan->unit_kerja_id == $unitKerja->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot approve plan from your own unit'
            ], 403);
        }
    }
    
    $plan->update([
        'status' => 'approved',
        'approved_by' => Auth::id(),
        'approved_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved successfully',
        'data' => $plan
    ]);
}
```

**Frontend**: Update logic untuk cek role approver juga

```typescript
const canApprovePlan = (plan: RAPBSPlan): boolean => {
  // Super Admin bisa approve
  if (isSuperAdmin()) {
    // Tapi tidak bisa approve plan dari unit sendiri
    const userUnitKerja = user?.profile?.unit_kerja;
    const planUnitKerja = plan.unitKerja?.nama || plan.unit_kerja?.nama;
    
    if (userUnitKerja && planUnitKerja && userUnitKerja === planUnitKerja) {
      return false; // Tidak bisa approve plan dari unit sendiri
    }
    return true;
  }
  
  // ✅ TAMBAHKAN: Cek apakah user punya role approver
  // (perlu cek dari API atau context)
  const hasApproverRole = checkUserRole('approver');
  if (!hasApproverRole) return false;
  
  // Approver tidak bisa approve plan dari unit sendiri
  const userUnitKerja = user?.profile?.unit_kerja;
  const planUnitKerja = plan.unitKerja?.nama || plan.unit_kerja?.nama;
  
  if (userUnitKerja && planUnitKerja && userUnitKerja === planUnitKerja) {
    return false;
  }
  
  return true;
};
```

---

### **Opsi 2: Tetap Hanya Super Admin (Simpler)**

Jika ingin tetap hanya Super Admin yang bisa approve:

**Backend**: Tambahkan pengecekan Super Admin

```php
public function approve($id)
{
    $plan = RapbsPlan::findOrFail($id);
    
    if ($plan->status !== 'submitted') {
        return response()->json([
            'success' => false,
            'message' => 'Only submitted plans can be approved'
        ], 403);
    }
    
    // ✅ TAMBAHKAN: Hanya Super Admin
    $user = Auth::user();
    $isSuperAdmin = $user->roles()->where('name', 'Super Administrator')->exists();
    
    if (!$isSuperAdmin) {
        return response()->json([
            'success' => false,
            'message' => 'Only Super Admin can approve plans'
        ], 403);
    }
    
    // ✅ TAMBAHKAN: Tidak bisa approve plan dari unit sendiri
    if ($user->profile && $user->profile->unit_kerja) {
        $unitKerja = UnitKerja::where('nama', $user->profile->unit_kerja)->first();
        if ($unitKerja && $plan->unit_kerja_id == $unitKerja->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot approve plan from your own unit'
            ], 403);
        }
    }
    
    $plan->update([
        'status' => 'approved',
        'approved_by' => Auth::id(),
        'approved_at' => now()
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Plan approved successfully',
        'data' => $plan
    ]);
}
```

---

## 📝 Summary

### **Siapa yang Bisa Approve Saat Ini?**

**Frontend (UI)**:
- ✅ **Hanya Super Admin**
- ✅ **Tidak bisa approve plan dari unit kerjanya sendiri**
- ✅ **Bisa approve plan dari unit kerja lain**

**Backend (API)**:
- ⚠️ **Siapa saja yang login** (tidak ada pengecekan)
- ⚠️ **Tidak aman** jika ada yang call API langsung

### **Rekomendasi**:
1. ✅ **Tambahkan pengecekan role di backend** (Opsi 1 atau Opsi 2)
2. ✅ **Sinkronkan dengan frontend logic**
3. ✅ **Gunakan role "Approver"** jika ingin lebih fleksibel (Opsi 1)
4. ✅ **Tetap hanya Super Admin** jika ingin lebih sederhana (Opsi 2)

---

**Last Updated**: 2024
**Version**: 1.0.0

