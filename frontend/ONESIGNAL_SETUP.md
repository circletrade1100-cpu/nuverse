# OneSignal Push Notification - Setup Documentation

## 📋 Setup yang Telah Dilakukan

### 1. Script OneSignal di HTML
File: `index.html`
- Menambahkan OneSignal SDK v16

### 2. OneSignal Service
File: `src/services/oneSignalService.ts`
- Service lengkap untuk mengelola OneSignal
- Singleton pattern untuk konsistensi

### 3. Inisialisasi di App
File: `src/App.tsx`
- Auto-initialize OneSignal saat aplikasi dimuat
- Menggunakan useEffect hook

### 4. Service Worker
File: `public/OneSignalSDKWorker.js`
- Worker untuk menangani notifikasi background

## 🚀 Cara Menggunakan

### Import Service
```typescript
import oneSignalService from '@/services/oneSignalService';
```

### Set User ID (saat login)
```typescript
// Contoh di authService atau component login
const handleLogin = async () => {
  // ... login logic
  const userId = response.data.user.id;
  
  // Set external user ID untuk OneSignal
  await oneSignalService.setExternalUserId(userId);
  
  // Optional: Set tags untuk segmentasi
  await oneSignalService.sendTags({
    role: 'guru',
    unit_kerja: 'TK',
    status: 'active'
  });
};
```

### Remove User ID (saat logout)
```typescript
const handleLogout = async () => {
  // Remove OneSignal user ID
  await oneSignalService.removeExternalUserId();
  
  // ... logout logic lainnya
};
```

### Request Permission
```typescript
// Request izin notifikasi dari user
const requestNotification = async () => {
  const granted = await oneSignalService.requestPermission();
  if (granted) {
    console.log('Notifikasi diizinkan!');
  }
};
```

### Check Status
```typescript
// Cek apakah user sudah subscribe
const isSubscribed = await oneSignalService.isPushSubscribed();

// Cek permission
const hasPermission = await oneSignalService.isNotificationPermissionGranted();

// Get OneSignal User ID
const userId = await oneSignalService.getUserId();
```

### Send Tags untuk Segmentasi
```typescript
// Single tag
await oneSignalService.sendTag('department', 'payroll');

// Multiple tags
await oneSignalService.sendTags({
  role: 'admin',
  unit: 'SD',
  grade: 'teacher',
  status: 'active'
});
```

## 📱 Konfigurasi OneSignal

### App ID dan Safari Web ID
```typescript
appId: "49f7341a-a53d-4a22-96bb-8cff716b5691"
safari_web_id: "web.onesignal.auto.1f13959d-363e-4480-ae37-ce4b59dbb72b"
```

### Notify Button
- Tombol notifikasi OneSignal enabled secara default
- User bisa langsung subscribe dari button tersebut

## 🔧 Integrasi dengan Backend

### Endpoint untuk Kirim Notifikasi (Backend)
Buat endpoint di Laravel untuk mengirim notifikasi:

```php
// app/Http/Controllers/Api/NotificationController.php

use OneSignal\Laravel\OneSignalFacade;

public function sendToUser(Request $request)
{
    $externalUserId = $request->user_id; // User ID dari database
    
    OneSignal::sendNotificationToExternalUser(
        $request->message,
        $externalUserId,
        $url = null,
        $data = null,
        $buttons = null,
        $schedule = null,
        $headings = $request->title
    );
    
    return response()->json(['success' => true]);
}

public function sendToSegment(Request $request)
{
    // Kirim ke segment berdasarkan tags
    OneSignal::sendNotificationUsingTags(
        $request->message,
        [
            ['key' => 'role', 'relation' => '=', 'value' => 'guru'],
            ['key' => 'unit_kerja', 'relation' => '=', 'value' => 'TK']
        ],
        $url = null,
        $data = null,
        $buttons = null,
        $schedule = null,
        $headings = $request->title
    );
}
```

### Install OneSignal Laravel Package
```bash
composer require onesignal/onesignal-laravel
```

### Config OneSignal di .env
```env
ONESIGNAL_APP_ID=49f7341a-a53d-4a22-96bb-8cff716b5691
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

## 📝 Contoh Use Cases

### 1. Notifikasi Slip Gaji Baru
```typescript
// Di backend saat generate slip gaji
OneSignal::sendNotificationToExternalUser(
    "Slip gaji bulan ini sudah tersedia!",
    $guru->id,
    "https://nurverse.id/guru/payroll"
);
```

### 2. Notifikasi Pengajuan Cuti
```typescript
// Kirim ke admin payroll
OneSignal::sendNotificationUsingTags(
    "{$guru->nama} mengajukan cuti",
    [['key' => 'role', 'relation' => '=', 'value' => 'admin_payroll']]
);
```

### 3. Broadcast Pengumuman
```typescript
// Kirim ke semua guru
OneSignal::sendNotificationUsingTags(
    "Pengumuman: Rapat besok pukul 08:00",
    [['key' => 'role', 'relation' => '=', 'value' => 'guru']]
);
```

## 🔐 Security Notes

1. **External User ID**: Selalu set external user ID setelah login untuk mapping dengan database
2. **Tags**: Gunakan tags untuk segmentasi yang efektif
3. **Remove User ID**: Jangan lupa remove user ID saat logout
4. **HTTPS Required**: OneSignal hanya bekerja di HTTPS (development bisa localhost)

## 🧪 Testing

### Test di Development
1. Buka aplikasi di browser
2. Cek console untuk melihat log inisialisasi OneSignal
3. Klik tombol notifikasi OneSignal untuk subscribe
4. Kirim test notification dari OneSignal dashboard

### Test Notification
1. Login ke [OneSignal Dashboard](https://onesignal.com/)
2. Pilih app: Manajemen Annur
3. Buka "Messages" > "New Push"
4. Pilih audience atau test ke specific user
5. Send notification

## 📊 Analytics

OneSignal dashboard menyediakan analytics:
- Delivery rate
- Click-through rate
- Engagement metrics
- Device segmentation
- Time zone optimization

## 🐛 Troubleshooting

### Notifikasi tidak muncul
1. Cek permission browser (allow notification)
2. Cek HTTPS aktif (production)
3. Cek service worker registered
4. Cek console untuk error
5. Verify user subscribed: `oneSignalService.isPushSubscribed()`

### External User ID tidak set
1. Pastikan `setExternalUserId()` dipanggil setelah login
2. Cek user ID valid
3. Verifikasi di OneSignal dashboard > Audience

### Tags tidak muncul
1. Tags butuh waktu sync (~1 menit)
2. Cek format tags (key-value string)
3. Verifikasi di OneSignal dashboard > Audience > Tags

## 📚 Resources

- [OneSignal Docs](https://documentation.onesignal.com/docs)
- [OneSignal Web SDK](https://documentation.onesignal.com/docs/web-push-sdk)
- [OneSignal Laravel](https://github.com/OneSignal/onesignal-laravel)

