# Lokasi Tombol Approval RAPBS

## 📍 Dimana Letak Tombol Approval?

Tombol approval untuk **Manajer Unit** berada di kolom **"AKSI"** (Action) pada tabel Rencana RAPBS, di baris yang sesuai dengan rencana yang statusnya **"Diajukan" (submitted)**.

---

## 🔍 Kapan Tombol Approval Muncul?

### **Tombol Approval Manajer Unit Muncul Jika:**

1. ✅ **Status Plan = "Diajukan" (submitted)**
   - Plan harus sudah di-submit oleh pembuat rencana
   - Status tidak boleh "Draft"

2. ✅ **User Punya Role "Manajer Unit"**
   - User yang login harus memiliki role "Manajer Unit"
   - Cek di menu User Management → Roles

3. ✅ **Unit Kerja User = Unit Kerja Plan**
   - User dari unit kerja yang sama dengan rencana
   - Contoh: User dari "SMP ANNUR Pusat" hanya bisa approve plan dari "SMP ANNUR Pusat"

---

## 📊 Visualisasi Lokasi Tombol

```
┌─────────────────────────────────────────────────────────────┐
│ RENCANA RAPBS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Search]  [Status Filter]  [Priority Filter]              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ RENCANA │ ANGGARAN │ ... │ STATUS │ AKSI            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ BELANJA │ Rp 100M │ ... │ Draft  │ 👁️ ✏️ ✓ 🗑️     │  │
│  │ PEGAWAI │          │     │        │                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ BELANJA │ Rp 100M │ ... │ Diajukan│ 👁️ ✓ ❌        │  │
│  │ PEGAWAI │          │     │        │ ↑                │  │
│  │         │          │     │        │ Tombol Approval  │  │
│  │         │          │     │        │ (hanya muncul    │  │
│  │         │          │     │        │  jika kondisi    │  │
│  │         │          │     │        │  terpenuhi)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Langkah-langkah untuk Melihat Tombol Approval

### **Sebagai User Pembuat Rencana:**

1. **Buat Rencana RAPBS**
   - Login sebagai user dengan unit kerja (contoh: usertusmpit@nurverse.id)
   - Unit kerja: "SMP ANNUR Pusat"
   - Buat rencana: "BELANJA PEGAWAI"
   - Status: **Draft**

2. **Submit Rencana**
   - Klik tombol **✓ (CheckCircle)** di kolom AKSI
   - Konfirmasi: "Ajukan rencana ini untuk persetujuan?"
   - Status berubah: **Draft** → **Diajukan (submitted)**

### **Sebagai Manajer Unit:**

1. **Login sebagai Manajer Unit**
   - User dengan role **"Manajer Unit"**
   - Unit kerja harus sama dengan rencana (contoh: "SMP ANNUR Pusat")

2. **Buka Halaman Rencana RAPBS**
   - Menu: RAPBS → Rencana RAPBS

3. **Cari Rencana dengan Status "Diajukan"**
   - Filter status: Pilih "Diajukan"
   - Atau lihat badge status di tabel

4. **Lihat Kolom AKSI**
   - Di kolom **AKSI** (paling kanan), akan muncul 2 tombol:
     - **✓ (CheckCircle - hijau)**: Approve sebagai Manajer Unit
     - **✕ (XCircle - merah)**: Reject sebagai Manajer Unit

---

## ⚠️ Troubleshooting: Tombol Approval Tidak Muncul

### **Jika Tombol Approval Tidak Muncul, Cek:**

1. **Status Plan**
   - ❌ Status masih "Draft" → Submit dulu
   - ✅ Status harus "Diajukan" (submitted)

2. **Role User**
   - ❌ User tidak punya role "Manajer Unit"
   - ✅ Pastikan user punya role "Manajer Unit"
   - Cek: User Management → Edit User → Roles

3. **Unit Kerja**
   - ❌ Unit kerja user berbeda dengan unit kerja plan
   - ✅ Unit kerja harus sama
   - Contoh: User dari "SMP ANNUR Pusat" hanya bisa approve plan dari "SMP ANNUR Pusat"

4. **Data Unit Kerja di Plan**
   - ❌ Plan tidak punya unit_kerja_id
   - ✅ Pastikan plan dibuat dengan unit kerja yang benar

---

## 🔧 Debug Mode

Untuk debugging, buka **Browser Console** (F12) dan lihat log:

```javascript
// Console akan menampilkan:
Plan submitted - checking approval: {
  planId: 1,
  planStatus: "submitted",
  hasManagerRole: true/false,
  userUnitKerja: "SMP ANNUR Pusat",
  planUnitKerja: "SMP ANNUR Pusat",
  unitKerjaMatch: true/false,
  canApprove: true/false
}
```

---

## 📝 Contoh Skenario

### **Skenario 1: Tombol Approval Muncul**

**Kondisi:**
- User: Manajer Unit dari "SMP ANNUR Pusat"
- Plan: "BELANJA PEGAWAI" dari "SMP ANNUR Pusat"
- Status: "Diajukan" (submitted)

**Hasil:**
- ✅ Tombol **✓ (Approve)** muncul di kolom AKSI
- ✅ Tombol **✕ (Reject)** muncul di kolom AKSI

### **Skenario 2: Tombol Approval Tidak Muncul**

**Kondisi:**
- User: Manajer Unit dari "SMP ANNUR Pusat"
- Plan: "BELANJA PEGAWAI" dari "SMP ANNUR Pusat"
- Status: "Draft" (belum di-submit)

**Hasil:**
- ❌ Tombol approval **TIDAK MUNCUL**
- ✅ Tombol yang muncul: Edit, Submit, Delete

### **Skenario 3: Unit Kerja Berbeda**

**Kondisi:**
- User: Manajer Unit dari "SMP ANNUR Pusat"
- Plan: "BELANJA PEGAWAI" dari "SMP ANNUR Lain"
- Status: "Diajukan" (submitted)

**Hasil:**
- ❌ Tombol approval **TIDAK MUNCUL**
- ⚠️ User tidak bisa approve plan dari unit kerja lain

---

## 🎨 Icon Tombol Approval

| Icon | Warna | Fungsi | Muncul Jika |
|------|-------|--------|-------------|
| ✓ (CheckCircle) | Hijau | Approve | Status = submitted, Role = Manajer Unit, Unit kerja sama |
| ✕ (XCircle) | Merah | Reject | Status = submitted, Role = Manajer Unit, Unit kerja sama |

---

## 📍 Lokasi Tepat di UI

**Kolom AKSI** berada di:
- Posisi: **Paling kanan** di tabel
- Header: **"AKSI"**
- Isi: Icon-icon action (View, Edit, Approve, Reject, Delete)

**Urutan Icon di Kolom AKSI:**
1. 👁️ (Eye) - View Detail
2. ✏️ (Pencil) - Edit (jika status = draft/rejected)
3. ✓ (CheckCircle) - **Approve** (jika kondisi terpenuhi)
4. ✕ (XCircle) - **Reject** (jika kondisi terpenuhi)
5. 🗑️ (Trash) - Delete (jika status = draft/rejected)

---

## ✅ Checklist untuk Manajer Unit

Sebelum mencari tombol approval, pastikan:

- [ ] User sudah login dengan role "Manajer Unit"
- [ ] User dari unit kerja yang sama dengan rencana
- [ ] Rencana sudah di-submit (status = "Diajukan")
- [ ] Filter status tidak menyembunyikan rencana "Diajukan"
- [ ] Browser console tidak ada error

---

**Last Updated**: 2024
**Version**: 1.0.0

