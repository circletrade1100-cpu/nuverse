# 📱 OneSignal - Notifikasi Tagihan Siswa Otomatis

## 📋 Fitur Notifikasi Tagihan

Sistem akan **otomatis mengirim notifikasi OneSignal** ke parent/wali murid untuk:

### 1. 📅 Tagihan Baru
- **Trigger**: Saat admin buat tagihan baru (single/bulk)
- **Waktu**: Langsung saat tagihan dibuat
- **Notifikasi**: Info tagihan baru + jumlah + jatuh tempo

### 2. ⏰ Reminder Jatuh Tempo (H-3)
- **Trigger**: Otomatis setiap hari jam 09:00 WIB
- **Target**: Tagihan yang jatuh tempo 3 hari lagi
- **Notifikasi**: Reminder untuk bayar sebelum jatuh tempo

### 3. 🚨 Reminder Jatuh Tempo Hari Ini (H-0)
- **Trigger**: Otomatis setiap hari jam 09:00 WIB
- **Target**: Tagihan yang jatuh tempo HARI INI
- **Notifikasi**: Urgent reminder pembayaran

### 4. 💰 Tagihan Overdue (Terlambat)
- **Trigger**: Otomatis setiap hari jam 10:00 WIB
- **Target**: Tagihan yang sudah lewat jatuh tempo
- **Notifikasi**: Alert tagihan terlambat + jumlah hari

## 🗂️ File yang Dibuat

### 1. Commands
**File**: `app/Console/Commands/CheckTagihanJatuhTempo.php`

**Fungsi**:
- Cek tagihan H-3 (3 hari sebelum jatuh tempo)
- Cek tagihan H-0 (jatuh tempo hari ini)
- Kirim notifikasi OneSignal ke parent

**Notifikasi H-3**:
- **Title**: "⏰ Reminder Tagihan (H-3)"
- **Message**: "Tagihan [nama] akan jatuh tempo 3 hari lagi. Sisa: Rp XXX 💳"

**Notifikasi H-0**:
- **Title**: "🚨 Tagihan Jatuh Tempo Hari Ini!"
- **Message**: "URGENT! Tagihan [nama] jatuh tempo HARI INI! Sisa: Rp XXX 🚨"

---

**File**: `app/Console/Commands/CheckTagihanOverdue.php`

**Fungsi**:
- Cek tagihan yang sudah lewat jatuh tempo
- Auto-update status ke "overdue"
- Kirim notifikasi peringatan

**Notifikasi**:
- **Title**: "🚨 Tagihan Terlambat!"
- **Message**: "Tagihan [nama] sudah terlambat X hari! Mohon segera dibayar. Sisa: Rp XXX 💰"

### 2. Helper Class
**File**: `app/Helpers/TagihanNotificationHelper.php`

**Methods**:
- `sendNewBillNotification($bill)` - Kirim notif tagihan baru
- `sendPaymentSuccessNotification($bill, $payment)` - Kirim notif pembayaran sukses
- `sendBulkNewBillNotification($bills)` - Kirim bulk notif untuk tagihan massal

### 3. Controller Integration
**File**: `app/Http/Controllers/Api/TagihanController.php`

**Updated Methods**:
- `store()` - Kirim notif saat tagihan single dibuat
- `bulkCreate()` - Kirim bulk notif saat tagihan massal dibuat

### 4. Scheduler
**File**: `routes/console.php`

**Schedule**:
```php
// Jam 09:00 WIB - Cek tagihan jatuh tempo (H-3 & H-0)
Schedule::command('tagihan:check-jatuh-tempo')
    ->dailyAt('09:00')
    ->timezone('Asia/Jakarta');

// Jam 10:00 WIB - Cek tagihan overdue
Schedule::command('tagihan:check-overdue')
    ->dailyAt('10:00')
    ->timezone('Asia/Jakarta');
```

## 🚀 Cara Kerja

### Flow Notifikasi Tagihan Baru

```
Admin buat tagihan
    ↓
TagihanController::store() atau bulkCreate()
    ↓
StudentBill created
    ↓
TagihanNotificationHelper::sendNewBillNotification()
    ↓
OneSignal API call
    ↓
📱 Push notification ke parent!
```

### Flow Notifikasi Otomatis Harian

```
Cron Job trigger schedule:run (setiap menit)
    ↓
Laravel Scheduler check waktu
    ↓
09:00 WIB → tagihan:check-jatuh-tempo
    ├─ Cek tagihan H-3
    ├─ Cek tagihan H-0
    └─ Kirim notifikasi
    ↓
10:00 WIB → tagihan:check-overdue
    ├─ Cek tagihan terlambat
    ├─ Update status ke "overdue"
    └─ Kirim notifikasi
    ↓
📱 Push notification ke parent!
```

## 🧪 Testing

### 1. Test Command Manual

**Test Check Jatuh Tempo:**
```bash
php artisan tagihan:check-jatuh-tempo
```

**Output:**
```
🔍 Checking tagihan jatuh tempo untuk tanggal: 2025-10-24

📅 Cek tagihan H-3 (jatuh tempo: 2025-10-27)
   Total tagihan H-3: 5
   ⚠️ Student A - SPP (Rp 500.000)
      ✅ Notifikasi H-3 terkirim
   
📅 Cek tagihan jatuh tempo HARI INI
   Total tagihan hari ini: 2
   ⚠️ Student B - Uang Pangkal (Rp 2.000.000)
      ✅ Notifikasi H-0 terkirim
```

**Test Check Overdue:**
```bash
php artisan tagihan:check-overdue
```

**Output:**
```
🔍 Checking tagihan overdue untuk tanggal: 2025-10-24
📊 Total tagihan overdue: 26
⚠️ Student C - SPP
   Terlambat: 10 hari | Sisa: Rp 500.000
   ✅ Notifikasi overdue terkirim
```

### 2. Test Create Tagihan Baru

**Via API/Postman:**
```json
POST /api/tagihan
{
  "student_id": 1,
  "bill_type_id": 1,
  "total_amount": 500000,
  "due_date": "2025-11-01",
  "period_month": 11,
  "period_year": 2025
}
```

**Expected:** Notifikasi langsung terkirim ke parent student ID 1

### 3. Test Bulk Create

```json
POST /api/tagihan/bulk
{
  "student_ids": [1, 2, 3],
  "bill_items": [
    {"bill_type_id": 1, "total_amount": 500000}
  ],
  "due_date": "2025-11-01",
  "period_month": 11,
  "period_year": 2025
}
```

**Expected:** Notifikasi terkirim ke 3 parent

## 📱 Notifikasi yang Akan Diterima Parent

### Tagihan Baru
```
╔════════════════════════════════════════════╗
║ 🔔 Tagihan Baru untuk Ahmad Rizki          ║
║                                            ║
║ Tagihan baru: SPP                          ║
║ Jumlah: Rp 500.000                         ║
║ Jatuh tempo: 01/11/2025 📅                 ║
║                                            ║
║ from Manajemen Annur - Sistem...          ║
║ [Tap untuk lihat detail tagihan]          ║
╚════════════════════════════════════════════╝
```

### Reminder H-3
```
╔════════════════════════════════════════════╗
║ ⏰ Reminder Tagihan (H-3)                  ║
║                                            ║
║ Tagihan SPP akan jatuh tempo 3 hari lagi  ║
║ Sisa tagihan: Rp 500.000 💳                ║
║                                            ║
║ [Tap untuk bayar sekarang]                ║
╚════════════════════════════════════════════╝
```

### Reminder H-0 (Hari Ini)
```
╔════════════════════════════════════════════╗
║ 🚨 Tagihan Jatuh Tempo Hari Ini!           ║
║                                            ║
║ URGENT! Tagihan SPP jatuh tempo HARI INI!  ║
║ Sisa: Rp 500.000 🚨                        ║
║                                            ║
║ [Tap untuk bayar segera]                  ║
╚════════════════════════════════════════════╝
```

### Tagihan Overdue
```
╔════════════════════════════════════════════╗
║ 🚨 Tagihan Terlambat!                      ║
║                                            ║
║ Tagihan SPP sudah terlambat 5 hari!       ║
║ Mohon segera dibayar                       ║
║ Sisa: Rp 500.000 💰                        ║
║                                            ║
║ [Tap untuk bayar sekarang]                ║
╚════════════════════════════════════════════╝
```

## 🎯 Use Cases

### 1. Admin Buat Tagihan SPP Bulan November

**Action**: Admin klik "Buat Tagihan Massal"
- Pilih semua siswa kelas 7
- Pilih jenis: SPP
- Jumlah: Rp 500.000
- Jatuh tempo: 10 November 2025

**Result**: 
- ✅ 30 tagihan dibuat
- 📱 30 notifikasi terkirim ke parent
- 💬 "Tagihan baru: SPP..."

### 2. Tanggal 7 November (H-3)

**09:00 WIB**:
- Sistem auto-check
- Ditemukan 30 tagihan jatuh tempo tanggal 10 Nov
- 📱 Kirim reminder ke 30 parent
- 💬 "Tagihan SPP akan jatuh tempo 3 hari lagi..."

### 3. Tanggal 10 November (H-0)

**09:00 WIB**:
- Sistem auto-check
- Ada 10 tagihan yang belum dibayar (jatuh tempo hari ini)
- 📱 Kirim urgent reminder ke 10 parent
- 💬 "URGENT! Tagihan jatuh tempo HARI INI!"

### 4. Tanggal 11 November (Overdue)

**10:00 WIB**:
- Sistem auto-check
- Ditemukan 10 tagihan yang lewat jatuh tempo
- Auto-update status ke "overdue"
- 📱 Kirim alert ke 10 parent
- 💬 "Tagihan sudah terlambat 1 hari!"

### 5. Parent Bayar Tagihan

**Action**: Parent bayar via Midtrans/QRIS

**Result**:
- ✅ Payment recorded
- ✅ Bill status updated
- 📱 Notifikasi pembayaran sukses (future feature)
- 💬 "Pembayaran SPP berhasil! Sisa: Rp 0"

## ⚙️ Configuration

### Jadwal Notifikasi (Dapat Disesuaikan)

Edit `routes/console.php`:

```php
// Ubah jam check jatuh tempo (default: 09:00)
Schedule::command('tagihan:check-jatuh-tempo')
    ->dailyAt('08:00')  // ← Ubah disini
    ->timezone('Asia/Jakarta');

// Ubah jam check overdue (default: 10:00)
Schedule::command('tagihan:check-overdue')
    ->dailyAt('17:00')  // ← Ubah disini
    ->timezone('Asia/Jakarta');
```

### Ubah Pesan Notifikasi

Edit file:
- `CheckTagihanJatuhTempo.php` (line ~68 & ~104)
- `CheckTagihanOverdue.php` (line ~64)
- `TagihanNotificationHelper.php` (line ~43, ~82)

## 🧪 Testing

### Test Command Manual
```bash
# Test reminder jatuh tempo
php artisan tagihan:check-jatuh-tempo

# Test check overdue
php artisan tagihan:check-overdue
```

### Test Create Tagihan Baru
```bash
# Via web interface atau API
# Notifikasi akan terkirim otomatis setelah tagihan dibuat
```

## 📊 Monitoring

### Real-time Logs
```bash
# Watch tagihan logs
tail -f storage/logs/laravel.log | grep "Tagihan"

# Watch OneSignal logs
tail -f storage/logs/laravel.log | grep "OneSignal"
```

### OneSignal Dashboard
- Login: https://onesignal.com/
- Messages → Delivery → Filter by date
- View delivery statistics

## 📚 External User ID Format

```
student_{student_id}
```

**Contoh**:
- Student ID 1 → `student_1`
- Student ID 25 → `student_25`

## 📝 Tags untuk Segmentasi

Parent/Student sudah auto-tagged saat login dengan:
```json
{
  "user_type": "student",
  "student_id": "25",
  "nama": "Ahmad Rizki",
  "nisn": "123456",
  "status": "active",
  "unit_sekolah": "SD",
  "unit_kelas": "Kelas 3"
}
```

## 🔍 Troubleshooting

### Notifikasi Tidak Terkirim

**Cek**:
1. Parent sudah login & allow notification?
2. External user ID ter-set? (student_X)
3. OneSignal REST API Key benar?
4. Check logs: `tail -f storage/logs/laravel.log`

### Command Error

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Test manual
php artisan tagihan:check-jatuh-tempo
php artisan tagihan:check-overdue
```

## ✅ Status

**Frontend**: ✅ Student auth sudah integrate OneSignal
**Backend**: ✅ Commands & Helper ready
**Scheduler**: ✅ Active (09:00 & 10:00)
**Notifications**: ✅ Tested & Working

---

**Created**: Oktober 2025
**Version**: 1.0
**Status**: ✅ Production Ready

