<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Guru;
use App\Models\Absensi;
use Carbon\Carbon;
use App\Services\OneSignalService;

class CheckAbsensiMasuk extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'absensi:check-masuk';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cek guru yang belum absen masuk hari ini dan kirim notifikasi OneSignal';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $this->info("🔍 Checking absensi masuk untuk tanggal: {$today->format('Y-m-d')}");

        // Ambil semua guru yang aktif
        $gurusAktif = Guru::where('status', 'Aktif')->get();
        $totalGuru = $gurusAktif->count();
        
        $this->info("📊 Total guru aktif: {$totalGuru}");

        $belumAbsen = 0;
        $notificationsSent = 0;
        $errors = 0;

        foreach ($gurusAktif as $guru) {
            // Cek apakah guru sudah punya record absensi hari ini
            $absensi = Absensi::where('id_guru', $guru->id)
                ->whereDate('tanggal', $today)
                ->first();

            // Jika belum ada record absensi ATAU jam_masuk masih null
            if (!$absensi || is_null($absensi->jam_masuk)) {
                $belumAbsen++;
                
                $this->warn("⚠️  Guru: {$guru->nama_lengkap} (ID: {$guru->id}) belum absen masuk");

                // Kirim notifikasi OneSignal
                try {
                    $externalUserId = "guru_{$guru->id}";
                    $oneSignal = new OneSignalService();
                    
                    $result = $oneSignal->sendToExternalUser(
                        "Jangan lupa absen masuk ya! 🙏",
                        $externalUserId,
                        "⏰ Reminder Absen Masuk",
                        "https://nurverse.id/guru/absensi",
                        [
                            'type' => 'absensi_reminder',
                            'action' => 'check_in',
                            'date' => $today->format('Y-m-d')
                        ]
                    );
                    
                    if ($result['success']) {
                        $notificationsSent++;
                        $this->info("   ✅ Notifikasi terkirim ke: {$guru->nama_lengkap}");
                    } else {
                        $errors++;
                        $this->error("   ❌ Gagal kirim ke {$guru->nama_lengkap}: " . ($result['error']['errors'][0] ?? 'Unknown error'));
                    }
                    
                } catch (\Exception $e) {
                    $errors++;
                    $this->error("   ❌ Gagal kirim notifikasi ke {$guru->nama_lengkap}: {$e->getMessage()}");
                    \Log::error("OneSignal notification error (absen masuk)", [
                        'guru_id' => $guru->id,
                        'guru_nama' => $guru->nama_lengkap,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        // Summary
        $this->newLine();
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("📊 SUMMARY - Cek Absensi Masuk");
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("🗓️  Tanggal: {$today->format('d/m/Y')}");
        $this->info("👥 Total guru aktif: {$totalGuru}");
        $this->info("⚠️  Belum absen masuk: {$belumAbsen}");
        $this->info("📤 Notifikasi terkirim: {$notificationsSent}");
        
        if ($errors > 0) {
            $this->error("❌ Gagal kirim: {$errors}");
        }
        
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Log ke database/file
        \Log::info("Absensi Masuk Check Completed", [
            'date' => $today->format('Y-m-d'),
            'total_guru' => $totalGuru,
            'belum_absen' => $belumAbsen,
            'notifications_sent' => $notificationsSent,
            'errors' => $errors
        ]);

        return Command::SUCCESS;
    }
}

