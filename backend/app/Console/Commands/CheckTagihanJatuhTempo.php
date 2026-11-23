<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StudentBill;
use App\Models\Student;
use Carbon\Carbon;
use App\Services\OneSignalService;

class CheckTagihanJatuhTempo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tagihan:check-jatuh-tempo';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cek tagihan yang akan jatuh tempo dan kirim notifikasi OneSignal ke parent';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $this->info("🔍 Checking tagihan jatuh tempo untuk tanggal: {$today->format('Y-m-d')}");

        // Cek tagihan yang jatuh tempo hari ini atau H-3 (3 hari sebelum jatuh tempo)
        $threeDaysLater = $today->copy()->addDays(3);
        
        $notificationsSent = 0;
        $errors = 0;

        // === CEK TAGIHAN H-3 (3 HARI SEBELUM JATUH TEMPO) ===
        $this->info("\n📅 Cek tagihan H-3 (jatuh tempo: {$threeDaysLater->format('Y-m-d')})");
        
        $tagihanH3 = StudentBill::with(['student', 'billType'])
            ->whereDate('due_date', $threeDaysLater)
            ->whereIn('status', ['unpaid', 'partial'])
            ->get();

        $this->info("   Total tagihan H-3: {$tagihanH3->count()}");

        foreach ($tagihanH3 as $tagihan) {
            $student = $tagihan->student;
            if (!$student) continue;

            $this->warn("   ⚠️  {$student->nama_lengkap} - {$tagihan->billType->name} (Rp " . number_format($tagihan->remaining_amount, 0, ',', '.') . ")");

            try {
                $externalUserId = "student_{$student->id}";
                $oneSignal = new OneSignalService();
                
                $result = $oneSignal->sendToExternalUser(
                    "Tagihan {$tagihan->billType->name} akan jatuh tempo 3 hari lagi. Sisa tagihan: Rp " . number_format($tagihan->remaining_amount, 0, ',', '.') . " 💳",
                    $externalUserId,
                    "⏰ Reminder Tagihan (H-3)",
                    "https://nurverse.id/parent/tagihan",
                    [
                        'type' => 'tagihan_reminder',
                        'reminder_type' => 'H-3',
                        'bill_id' => $tagihan->id,
                        'due_date' => $tagihan->due_date->format('Y-m-d'),
                        'amount' => $tagihan->remaining_amount
                    ]
                );
                
                if ($result['success']) {
                    $notificationsSent++;
                    $this->info("      ✅ Notifikasi H-3 terkirim");
                } else {
                    $errors++;
                    $this->error("      ❌ Gagal kirim: " . ($result['error']['errors'][0] ?? 'Unknown'));
                }
                
            } catch (\Exception $e) {
                $errors++;
                $this->error("      ❌ Exception: {$e->getMessage()}");
            }
        }

        // === CEK TAGIHAN HARI INI (JATUH TEMPO HARI INI) ===
        $this->info("\n📅 Cek tagihan jatuh tempo HARI INI ({$today->format('Y-m-d')})");
        
        $tagihanToday = StudentBill::with(['student', 'billType'])
            ->whereDate('due_date', $today)
            ->whereIn('status', ['unpaid', 'partial'])
            ->get();

        $this->info("   Total tagihan hari ini: {$tagihanToday->count()}");

        foreach ($tagihanToday as $tagihan) {
            $student = $tagihan->student;
            if (!$student) continue;

            $this->warn("   ⚠️  {$student->nama_lengkap} - {$tagihan->billType->name} (Rp " . number_format($tagihan->remaining_amount, 0, ',', '.') . ")");

            try {
                $externalUserId = "student_{$student->id}";
                $oneSignal = new OneSignalService();
                
                $result = $oneSignal->sendToExternalUser(
                    "URGENT! Tagihan {$tagihan->billType->name} jatuh tempo HARI INI! Sisa: Rp " . number_format($tagihan->remaining_amount, 0, ',', '.') . " 🚨",
                    $externalUserId,
                    "🚨 Tagihan Jatuh Tempo Hari Ini!",
                    "https://nurverse.id/parent/tagihan",
                    [
                        'type' => 'tagihan_reminder',
                        'reminder_type' => 'H-0',
                        'bill_id' => $tagihan->id,
                        'due_date' => $tagihan->due_date->format('Y-m-d'),
                        'amount' => $tagihan->remaining_amount
                    ]
                );
                
                if ($result['success']) {
                    $notificationsSent++;
                    $this->info("      ✅ Notifikasi H-0 terkirim");
                } else {
                    $errors++;
                    $this->error("      ❌ Gagal kirim: " . ($result['error']['errors'][0] ?? 'Unknown'));
                }
                
            } catch (\Exception $e) {
                $errors++;
                $this->error("      ❌ Exception: {$e->getMessage()}");
            }
        }

        // Summary
        $this->newLine();
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("📊 SUMMARY - Cek Tagihan Jatuh Tempo");
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("🗓️  Tanggal: {$today->format('d/m/Y')}");
        $this->info("📋 Tagihan H-3: {$tagihanH3->count()}");
        $this->info("🚨 Tagihan hari ini: {$tagihanToday->count()}");
        $this->info("📤 Notifikasi terkirim: {$notificationsSent}");
        
        if ($errors > 0) {
            $this->error("❌ Gagal kirim: {$errors}");
        }
        
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Log
        \Log::info("Tagihan Jatuh Tempo Check Completed", [
            'date' => $today->format('Y-m-d'),
            'tagihan_h3' => $tagihanH3->count(),
            'tagihan_today' => $tagihanToday->count(),
            'notifications_sent' => $notificationsSent,
            'errors' => $errors
        ]);

        return Command::SUCCESS;
    }
}

