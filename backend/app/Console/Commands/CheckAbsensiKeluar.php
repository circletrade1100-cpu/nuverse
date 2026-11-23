<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Guru;
use App\Models\Absensi;
use Carbon\Carbon;
use App\Services\OneSignalService;

class CheckAbsensiKeluar extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'absensi:check-keluar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cek guru yang sudah absen masuk tapi belum absen keluar dan kirim notifikasi OneSignal';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $this->info("🔍 Checking absensi keluar untuk tanggal: {$today->format('Y-m-d')}");

        // Ambil semua guru yang aktif
        $gurusAktif = Guru::where('status', 'Aktif')->get();
        $totalGuru = $gurusAktif->count();
        
        $this->info("📊 Total guru aktif: {$totalGuru}");

        $belumAbsenKeluar = 0;
        $notificationsSent = 0;
        $errors = 0;

        foreach ($gurusAktif as $guru) {
            // Cek apakah guru sudah absen masuk tapi belum absen keluar
            $absensi = Absensi::where('id_guru', $guru->id)
                ->whereDate('tanggal', $today)
                ->whereNotNull('jam_masuk') // Sudah absen masuk
                ->whereNull('jam_keluar')   // Tapi belum absen keluar
                ->first();

            if ($absensi) {
                $belumAbsenKeluar++;
                
                $jamMasuk = $absensi->jam_masuk;
                $this->warn("⚠️  Guru: {$guru->nama_lengkap} (ID: {$guru->id}) belum absen keluar (Masuk: {$jamMasuk})");

                // Kirim notifikasi OneSignal
                try {
                    $externalUserId = "guru_{$guru->id}";
                    $oneSignal = new OneSignalService();
                    
                    $result = $oneSignal->sendToExternalUser(
                        "Jangan lupa absen keluar sebelum pulang ya! 🙏",
                        $externalUserId,
                        "⏰ Reminder Absen Keluar",
                        "https://nurverse.id/guru/absensi",
                        [
                            'type' => 'absensi_reminder',
                            'action' => 'check_out',
                            'date' => $today->format('Y-m-d'),
                            'jam_masuk' => $jamMasuk
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
                    \Log::error("OneSignal notification error (absen keluar)", [
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
        $this->info("📊 SUMMARY - Cek Absensi Keluar");
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("🗓️  Tanggal: {$today->format('d/m/Y')}");
        $this->info("👥 Total guru aktif: {$totalGuru}");
        $this->info("⚠️  Belum absen keluar: {$belumAbsenKeluar}");
        $this->info("📤 Notifikasi terkirim: {$notificationsSent}");
        
        if ($errors > 0) {
            $this->error("❌ Gagal kirim: {$errors}");
        }
        
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Log ke database/file
        \Log::info("Absensi Keluar Check Completed", [
            'date' => $today->format('Y-m-d'),
            'total_guru' => $totalGuru,
            'belum_absen_keluar' => $belumAbsenKeluar,
            'notifications_sent' => $notificationsSent,
            'errors' => $errors
        ]);

        return Command::SUCCESS;
    }
}

