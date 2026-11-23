# 📱 OneSignal - Notifikasi Absensi Otomatis

## 📋 Fitur

Sistem akan **otomatis mengirim notifikasi OneSignal** ke guru yang:

1. ⏰ **08:30 WIB** (Senin-Jumat) → Cek guru yang **belum absen masuk**
2. ⏰ **16:00 WIB** (Senin-Jumat) → Cek guru yang **belum absen keluar**

## 🗂️ File yang Dibuat

### 1. Command untuk Cek Absen Masuk
**File**: `app/Console/Commands/CheckAbsensiMasuk.php`

**Fungsi**:
- Cek semua guru dengan status "Aktif"
- Cari guru yang belum punya record absensi hari ini ATAU jam_masuk masih null
- Kirim notifikasi OneSignal ke guru tersebut

**Notifikasi**:
- **Title**: "⏰ Reminder Absen Masuk"
- **Message**: "Jangan lupa absen masuk ya! 🙏"
- **URL**: https://nurverse.id/guru/absensi
- **Data**: type, action, date

### 2. Command untuk Cek Absen Keluar
**File**: `app/Console/Commands/CheckAbsensiKeluar.php`

**Fungsi**:
- Cek semua guru dengan status "Aktif"
- Cari guru yang sudah absen masuk (jam_masuk ada) tapi belum absen keluar (jam_keluar null)
- Kirim notifikasi OneSignal ke guru tersebut

**Notifikasi**:
- **Title**: "⏰ Reminder Absen Keluar"
- **Message**: "Jangan lupa absen keluar sebelum pulang ya! 🙏"
- **URL**: https://nurverse.id/guru/absensi
- **Data**: type, action, date, jam_masuk

### 3. Scheduler Configuration
**File**: `routes/console.php`

**Schedule**:
```php
// Senin-Jumat jam 08:30 WIB
Schedule::command('absensi:check-masuk')
    ->weekdays()
    ->dailyAt('08:30')
    ->timezone('Asia/Jakarta');

// Senin-Jumat jam 16:00 WIB
Schedule::command('absensi:check-keluar')
    ->weekdays()
    ->dailyAt('16:00')
    ->timezone('Asia/Jakarta');
```

## 🚀 Setup & Installation

### Prasyarat ✅

1. **OneSignal Laravel Package** sudah terinstall:
```bash
composer require onesignal/onesignal-laravel
```

2. **Environment Variables** sudah diset di `.env`:
```env
ONESIGNAL_APP_ID=49f7341a-a53d-4a22-96bb-8cff716b5691
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

3. **Frontend** sudah setup (user sudah bisa login dan set external user ID)

### Setup Cron Job

Agar scheduler Laravel berjalan, tambahkan cron job di server:

```bash
# Edit crontab
crontab -e
```

Tambahkan baris ini:
```bash
* * * * * cd /www/wwwroot/nurverse.id/manajemen-annur/backend && php artisan schedule:run >> /dev/null 2>&1
```

**Penjelasan**:
- `* * * * *` = Jalankan setiap menit
- Laravel scheduler akan cek apakah ada command yang perlu dijalankan
- Command akan dijalankan sesuai jadwal yang ditentukan

### Alternatif (Development/Testing)

Jika tidak bisa setup cron, jalankan manual:
```bash
# Jalankan scheduler di background (development only)
php artisan schedule:work
```

**⚠️ Warning**: `schedule:work` akan run terus-menerus, cocok untuk development saja. Di production HARUS pakai cron job.

## 🧪 Testing

### 1. Test Command Manual

Test command tanpa menunggu scheduler:

```bash
# Test check absen masuk
php artisan absensi:check-masuk

# Test check absen keluar
php artisan absensi:check-keluar
```

**Output yang diharapkan**:
```
🔍 Checking absensi masuk untuk tanggal: 2025-10-24
📊 Total guru aktif: 50
⚠️  Guru: John Doe (ID: 1) belum absen masuk
   ✅ Notifikasi terkirim ke: John Doe
⚠️  Guru: Jane Smith (ID: 2) belum absen masuk
   ✅ Notifikasi terkirim ke: Jane Smith

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY - Cek Absensi Masuk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗓️  Tanggal: 24/10/2025
👥 Total guru aktif: 50
⚠️  Belum absen masuk: 2
📤 Notifikasi terkirim: 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Test Scheduler

Cek apakah scheduler sudah terdaftar:
```bash
php artisan schedule:list
```

**Output yang diharapkan**:
```
  0 8:30  ........................................... absensi:check-masuk
  0 16:00 .......................................... absensi:check-keluar
```

### 3. Test dengan Data Dummy

Buat skenario test:

**Skenario 1: Guru Belum Absen Masuk**
1. Pastikan ada guru dengan status "Aktif"
2. Pastikan guru tersebut belum ada record absensi hari ini
3. Jalankan: `php artisan absensi:check-masuk`
4. Cek notifikasi di HP/browser guru tersebut

**Skenario 2: Guru Belum Absen Keluar**
1. Buat record absensi dengan `jam_masuk` terisi tapi `jam_keluar` null
```sql
INSERT INTO absensi (id_guru, tanggal, jam_masuk, jam_keluar, status) 
VALUES (1, CURDATE(), '08:00:00', NULL, 'hadir');
```
2. Jalankan: `php artisan absensi:check-keluar`
3. Cek notifikasi di HP/browser guru tersebut

### 4. Monitoring Logs

Cek log untuk memastikan scheduler berjalan:

```bash
# Log aplikasi
tail -f storage/logs/laravel.log

# Cari log scheduler
tail -f storage/logs/laravel.log | grep "Scheduler"

# Cari log absensi check
tail -f storage/logs/laravel.log | grep "Absensi"
```

## 📊 Logic Flow

### Check Absen Masuk (08:30 WIB)
```
1. Ambil semua guru dengan status = "Aktif"
2. Loop setiap guru:
   a. Cek apakah ada record absensi hari ini
   b. Jika tidak ada ATAU jam_masuk = NULL:
      - Guru belum absen masuk
      - Kirim notifikasi OneSignal
   c. Log hasil ke console dan database
3. Tampilkan summary
```

### Check Absen Keluar (16:00 WIB)
```
1. Ambil semua guru dengan status = "Aktif"
2. Loop setiap guru:
   a. Cek record absensi hari ini
   b. Jika jam_masuk ada DAN jam_keluar = NULL:
      - Guru belum absen keluar
      - Kirim notifikasi OneSignal
   c. Log hasil ke console dan database
3. Tampilkan summary
```

## 🔧 Kustomisasi

### Ubah Jadwal Notifikasi

Edit file `routes/console.php`:

```php
// Contoh: Ubah jam notifikasi absen masuk ke 07:00
Schedule::command('absensi:check-masuk')
    ->weekdays()
    ->dailyAt('07:00')  // ← Ubah disini
    ->timezone('Asia/Jakarta');

// Contoh: Kirim reminder 2x sehari
Schedule::command('absensi:check-masuk')
    ->weekdays()
    ->dailyAt('08:30')
    ->timezone('Asia/Jakarta');

Schedule::command('absensi:check-masuk')
    ->weekdays()
    ->dailyAt('10:00')  // Reminder ke-2
    ->timezone('Asia/Jakarta');
```

### Ubah Pesan Notifikasi

Edit file `app/Console/Commands/CheckAbsensiMasuk.php`:

```php
OneSignal::sendNotificationToExternalUser(
    "Selamat pagi! Jangan lupa absen masuk ya 🌅", // ← Ubah pesan
    $externalUserId,
    "https://nurverse.id/guru/absensi",
    [
        'type' => 'absensi_reminder',
        'action' => 'check_in',
        'date' => $today->format('Y-m-d')
    ],
    null,
    null,
    "⏰ Waktunya Absen Masuk!" // ← Ubah title
);
```

### Tambah Hari Sabtu

Ubah `->weekdays()` menjadi custom days:

```php
// Senin-Sabtu
Schedule::command('absensi:check-masuk')
    ->days([1, 2, 3, 4, 5, 6]) // 1=Senin, 6=Sabtu
    ->dailyAt('08:30')
    ->timezone('Asia/Jakarta');
```

### Filter Guru Berdasarkan Unit

Edit command, tambahkan filter unit:

```php
// Di CheckAbsensiMasuk.php
$gurusAktif = Guru::where('status', 'Aktif')
    ->whereHas('unitSekolah', function($query) {
        $query->where('nama', 'TK'); // Hanya guru TK
    })
    ->get();
```

## 🐛 Troubleshooting

### Notifikasi Tidak Terkirim

**Problem**: Command jalan tapi notifikasi tidak sampai

**Solusi**:
1. Cek `.env` → `ONESIGNAL_REST_API_KEY` benar?
2. Cek guru sudah login di frontend? (External user ID harus ter-set)
3. Cek guru sudah subscribe notifikasi?
4. Cek error di log: `tail -f storage/logs/laravel.log`
5. Test manual OneSignal:
```bash
php artisan tinker
\OneSignal::sendNotificationToExternalUser("Test", "guru_1", null, null, null, null, "Test");
```

### Scheduler Tidak Jalan

**Problem**: Cron job tidak trigger scheduler

**Solusi**:
1. Cek cron job aktif:
```bash
crontab -l
```

2. Cek log cron:
```bash
tail -f /var/log/cron
```

3. Cek path Laravel correct:
```bash
cd /www/wwwroot/nurverse.id/manajemen-annur/backend && pwd
```

4. Test manual scheduler:
```bash
php artisan schedule:run
```

### Command Error

**Problem**: Error saat jalankan command

**Solusi**:
1. Cek database connection
2. Cek table `absensi` dan `gurus` ada
3. Cek OneSignal package terinstall:
```bash
composer show onesignal/onesignal-laravel
```

4. Clear cache:
```bash
php artisan cache:clear
php artisan config:clear
```

## 📱 Testing Notifikasi di Device

### Di Browser (Desktop/Mobile)

1. Buka: https://nurverse.id/guru/login
2. Login dengan akun guru
3. Browser akan minta permission notifikasi → **Allow**
4. Klik tombol OneSignal bell (pojok kanan bawah)
5. Subscribe
6. Test kirim notifikasi dari backend

### Di Mobile App (PWA)

1. Buka browser mobile (Chrome/Safari)
2. Login guru di https://nurverse.id/guru/login
3. Allow notification permission
4. Add to Home Screen (untuk PWA)
5. Test notifikasi

### Verifikasi di OneSignal Dashboard

1. Login: https://onesignal.com/
2. Pilih App: **Manajemen Annur**
3. Menu **Audience** → Lihat subscribers
4. Cari external user ID: `guru_1`, `guru_2`, etc
5. Check tags dan subscription status

## 📈 Monitoring & Analytics

### View Notification History

1. OneSignal Dashboard → **Messages** → **Delivery**
2. Filter by date
3. View delivery rate, click rate

### Laravel Logs

```bash
# View real-time logs
tail -f storage/logs/laravel.log

# Search absensi logs
grep "Absensi" storage/logs/laravel.log

# Search OneSignal errors
grep "OneSignal notification error" storage/logs/laravel.log
```

### Database Logs (Optional)

Buat table untuk logging (opsional):

```sql
CREATE TABLE notification_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT UNSIGNED,
    notification_type VARCHAR(50),
    status VARCHAR(20),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📚 Referensi

- **OneSignal Dashboard**: https://onesignal.com/
- **Laravel Scheduler**: https://laravel.com/docs/scheduling
- **OneSignal Laravel Package**: https://github.com/OneSignal/onesignal-laravel

## ✅ Checklist Setup

- [ ] OneSignal package terinstall
- [ ] Environment variables configured
- [ ] Commands dibuat (CheckAbsensiMasuk.php, CheckAbsensiKeluar.php)
- [ ] Scheduler configured di routes/console.php
- [ ] Cron job ditambahkan di server
- [ ] Test manual command berhasil
- [ ] Test notifikasi terkirim ke device
- [ ] Monitoring logs berjalan
- [ ] Production deployment

---

**Created**: Oktober 2025
**Version**: 1.0
**Status**: ✅ Ready for Production

