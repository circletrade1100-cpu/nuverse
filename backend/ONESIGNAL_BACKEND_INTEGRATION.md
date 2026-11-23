# OneSignal Backend Integration - Laravel

## 📋 Setup Backend

### 1. Install OneSignal Laravel Package

```bash
composer require onesignal/onesignal-laravel
```

### 2. Publish Config

```bash
php artisan vendor:publish --provider="OneSignal\Laravel\OneSignalServiceProvider"
```

### 3. Environment Variables

Tambahkan di `.env`:

```env
ONESIGNAL_APP_ID=49f7341a-a53d-4a22-96bb-8cff716b5691
ONESIGNAL_REST_API_KEY=your_rest_api_key_here
```

**Cara mendapatkan REST API Key:**
1. Login ke [OneSignal Dashboard](https://onesignal.com/)
2. Pilih App: Manajemen Annur
3. Settings > Keys & IDs
4. Copy "REST API Key"

## 🚀 Cara Menggunakan

### Import OneSignal

```php
use OneSignal\Laravel\OneSignalFacade as OneSignal;
```

### 1. Kirim ke Specific User (External User ID)

```php
/**
 * Kirim notifikasi ke user tertentu
 * External User ID sudah di-set di frontend saat login
 */
public function sendToUser(Request $request)
{
    $userId = $request->user_id; // ID dari database
    
    // Untuk admin/user biasa
    $externalUserId = (string) $userId;
    
    // Untuk guru
    $externalUserId = "guru_{$userId}";
    
    // Untuk student
    $externalUserId = "student_{$userId}";
    
    try {
        OneSignal::sendNotificationToExternalUser(
            $message = "Slip gaji bulan ini sudah tersedia!",
            $userId = $externalUserId,
            $url = "https://nurverse.id/guru/payroll", // Optional
            $data = ['type' => 'payroll', 'id' => 123], // Optional
            $buttons = null, // Optional
            $schedule = null, // Optional
            $headings = "Notifikasi Payroll" // Title
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dikirim'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengirim notifikasi',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

### 2. Kirim ke Multiple Users

```php
public function sendToMultipleUsers(Request $request)
{
    $userIds = $request->user_ids; // Array of IDs [1, 2, 3]
    
    // Convert ke external user IDs
    $externalUserIds = array_map(function($id) {
        return "guru_{$id}";
    }, $userIds);
    
    try {
        OneSignal::sendNotificationToExternalUser(
            $message = "Rapat akan dimulai 30 menit lagi",
            $userId = $externalUserIds, // Array
            $url = null,
            $data = null,
            $buttons = null,
            $schedule = null,
            $headings = "Reminder Rapat"
        );
        
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
```

### 3. Kirim Berdasarkan Tags (Segmentasi)

```php
public function sendToSegment(Request $request)
{
    // Contoh: Kirim ke semua guru yang active
    try {
        OneSignal::sendNotificationUsingTags(
            $message = "Pengumuman: Libur Nasional besok",
            $tags = [
                ['key' => 'user_type', 'relation' => '=', 'value' => 'guru'],
                ['operator' => 'AND'],
                ['key' => 'status', 'relation' => '=', 'value' => 'Aktif']
            ],
            $url = "https://nurverse.id/guru/pengumuman",
            $data = null,
            $buttons = null,
            $schedule = null,
            $headings = "Pengumuman Penting"
        );
        
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// Contoh lain: Kirim ke guru di unit tertentu
public function sendToUnitSekolah($unitSekolahNama)
{
    OneSignal::sendNotificationUsingTags(
        $message = "Rapat koordinasi unit {$unitSekolahNama}",
        $tags = [
            ['key' => 'user_type', 'relation' => '=', 'value' => 'guru'],
            ['operator' => 'AND'],
            ['key' => 'unit_sekolah', 'relation' => '=', 'value' => $unitSekolahNama]
        ],
        $url = null,
        $data = null,
        $buttons = null,
        $schedule = null,
        $headings = "Rapat Unit"
    );
}
```

### 4. Kirim ke Semua Users

```php
public function sendToAll(Request $request)
{
    try {
        OneSignal::sendNotificationToAll(
            $message = "Sistem akan maintenance pada hari Minggu pukul 00:00",
            $url = null,
            $data = null,
            $buttons = null,
            $schedule = null,
            $headings = "Maintenance Schedule"
        );
        
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
```

### 5. Scheduled Notification

```php
public function sendScheduled(Request $request)
{
    // Schedule untuk kirim nanti
    $scheduleTime = now()->addHours(2); // 2 jam dari sekarang
    
    try {
        OneSignal::sendNotificationToExternalUser(
            $message = "Deadline pengajuan cuti besok!",
            $userId = "guru_123",
            $url = null,
            $data = null,
            $buttons = null,
            $schedule = $scheduleTime->toIso8601String(), // ISO 8601 format
            $headings = "Reminder Deadline"
        );
        
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
```

### 6. Notification dengan Action Buttons

```php
public function sendWithButtons(Request $request)
{
    $buttons = [
        [
            'id' => 'approve-button',
            'text' => 'Setujui',
            'icon' => 'ic_menu_share',
        ],
        [
            'id' => 'reject-button',
            'text' => 'Tolak',
            'icon' => 'ic_menu_close_clear_cancel'
        ]
    ];
    
    try {
        OneSignal::sendNotificationToExternalUser(
            $message = "Ada pengajuan cuti baru dari John Doe",
            $userId = "user_1", // ID admin payroll
            $url = "https://nurverse.id/payroll/cuti-karyawan/pengajuan",
            $data = ['cuti_id' => 456, 'action' => 'review'],
            $buttons = $buttons,
            $schedule = null,
            $headings = "Pengajuan Cuti Baru"
        );
        
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
```

## 📝 Contoh Implementasi Praktis

### NotificationController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OneSignal\Laravel\OneSignalFacade as OneSignal;

class NotificationController extends Controller
{
    /**
     * Kirim notifikasi slip gaji sudah tersedia
     */
    public function notifySlipGajiReady($guruId)
    {
        try {
            OneSignal::sendNotificationToExternalUser(
                "Slip gaji Anda sudah tersedia untuk dilihat",
                "guru_{$guruId}",
                "https://nurverse.id/guru/payroll",
                ['type' => 'payroll', 'action' => 'view'],
                null,
                null,
                "Slip Gaji Tersedia"
            );
            
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('OneSignal notification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Notifikasi pengajuan cuti disetujui
     */
    public function notifyCutiApproved($guruId, $cutiData)
    {
        try {
            OneSignal::sendNotificationToExternalUser(
                "Pengajuan cuti Anda telah disetujui",
                "guru_{$guruId}",
                "https://nurverse.id/guru/cuti",
                [
                    'type' => 'cuti',
                    'action' => 'approved',
                    'cuti_id' => $cutiData['id']
                ],
                null,
                null,
                "Pengajuan Cuti Disetujui"
            );
            
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('OneSignal notification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Notifikasi ada pengajuan cuti baru ke admin
     */
    public function notifyNewCutiToAdmin($cutiData)
    {
        try {
            // Kirim ke semua admin payroll
            OneSignal::sendNotificationUsingTags(
                "{$cutiData['nama_guru']} mengajukan cuti",
                [
                    ['key' => 'role', 'relation' => '=', 'value' => 'admin_payroll']
                ],
                "https://nurverse.id/payroll/cuti-karyawan/pengajuan",
                [
                    'type' => 'cuti_review',
                    'cuti_id' => $cutiData['id']
                ],
                null,
                null,
                "Pengajuan Cuti Baru"
            );
            
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('OneSignal notification error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Broadcast pengumuman ke semua guru
     */
    public function broadcastToGuru(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'url' => 'nullable|url'
        ]);
        
        try {
            OneSignal::sendNotificationUsingTags(
                $request->message,
                [
                    ['key' => 'user_type', 'relation' => '=', 'value' => 'guru']
                ],
                $request->url,
                ['type' => 'announcement'],
                null,
                null,
                $request->title
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Pengumuman berhasil dikirim ke semua guru'
            ]);
        } catch (\Exception $e) {
            \Log::error('OneSignal broadcast error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Routes (api.php)

```php
// OneSignal Notification Routes
Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::post('/slip-gaji-ready/{guruId}', [NotificationController::class, 'notifySlipGajiReady']);
    Route::post('/cuti-approved/{guruId}', [NotificationController::class, 'notifyCutiApproved']);
    Route::post('/new-cuti-to-admin', [NotificationController::class, 'notifyNewCutiToAdmin']);
    Route::post('/broadcast-to-guru', [NotificationController::class, 'broadcastToGuru']);
});
```

## 🔧 Integration dengan Event System

### PayrollGeneratedEvent.php

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PayrollGeneratedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $guruId;
    public $payrollData;

    public function __construct($guruId, $payrollData)
    {
        $this->guruId = $guruId;
        $this->payrollData = $payrollData;
    }
}
```

### SendPayrollNotificationListener.php

```php
<?php

namespace App\Listeners;

use App\Events\PayrollGeneratedEvent;
use OneSignal\Laravel\OneSignalFacade as OneSignal;

class SendPayrollNotificationListener
{
    public function handle(PayrollGeneratedEvent $event)
    {
        try {
            OneSignal::sendNotificationToExternalUser(
                "Slip gaji bulan {$event->payrollData['bulan']} sudah tersedia",
                "guru_{$event->guruId}",
                "https://nurverse.id/guru/payroll",
                [
                    'type' => 'payroll',
                    'payroll_id' => $event->payrollData['id']
                ],
                null,
                null,
                "Slip Gaji Tersedia"
            );
        } catch (\Exception $e) {
            \Log::error('OneSignal notification error: ' . $e->getMessage());
        }
    }
}
```

### EventServiceProvider.php

```php
protected $listen = [
    PayrollGeneratedEvent::class => [
        SendPayrollNotificationListener::class,
    ],
];
```

### Trigger Event (di PayrollController.php)

```php
use App\Events\PayrollGeneratedEvent;

public function store(Request $request)
{
    // ... save payroll logic
    
    // Trigger event untuk kirim notifikasi
    event(new PayrollGeneratedEvent($guru->id, $payroll->toArray()));
    
    return response()->json([
        'success' => true,
        'message' => 'Payroll berhasil dibuat dan notifikasi dikirim'
    ]);
}
```

## 🎯 Tips & Best Practices

1. **Selalu gunakan try-catch** untuk handle error
2. **Log errors** untuk debugging
3. **Gunakan Queue** untuk notifikasi yang banyak
4. **Set rate limiting** untuk prevent spam
5. **Validate data** sebelum kirim notifikasi
6. **Gunakan tags** untuk segmentasi yang efektif
7. **Test di development** sebelum production

## 📊 Tag Structure yang Disarankan

### Untuk Admin/User
```php
[
    'email' => 'user@example.com',
    'name' => 'John Doe',
    'role' => 'admin_payroll' // atau admin, manager, etc
]
```

### Untuk Guru
```php
[
    'user_type' => 'guru',
    'guru_id' => '123',
    'nama' => 'John Doe',
    'nip' => '123456',
    'status' => 'Aktif',
    'unit_sekolah' => 'TK',
    'jabatan' => 'Guru Kelas'
]
```

### Untuk Student
```php
[
    'user_type' => 'student',
    'student_id' => '456',
    'nama' => 'Jane Doe',
    'nisn' => '987654',
    'status' => 'active',
    'unit_sekolah' => 'SD',
    'unit_kelas' => 'Kelas 3'
]
```

## 🔍 Testing

### Test dengan Tinker

```bash
php artisan tinker
```

```php
// Test kirim ke specific user
\OneSignal::sendNotificationToExternalUser(
    "Test notification",
    "guru_1",
    null,
    null,
    null,
    null,
    "Test"
);

// Test kirim ke all
\OneSignal::sendNotificationToAll("Test broadcast", null, null, null, null, "Test");
```

## 📚 Resources

- [OneSignal Laravel Package](https://github.com/OneSignal/onesignal-laravel)
- [OneSignal REST API Docs](https://documentation.onesignal.com/reference)
- [OneSignal Dashboard](https://onesignal.com/)

