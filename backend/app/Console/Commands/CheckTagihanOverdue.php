<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\StudentBill;
use Carbon\Carbon;
use App\Services\OneSignalService;

class CheckTagihanOverdue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tagihan:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cek tagihan yang sudah lewat jatuh tempo dan kirim notifikasi OneSignal ke parent';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $this->info("🔍 Checking tagihan overdue untuk tanggal: {$today->format('Y-m-d')}");

        // Cek tagihan yang sudah lewat jatuh tempo tapi belum lunas
        $tagihanOverdue = StudentBill::with(['student', 'billType'])
            ->where('due_date', '<', $today)
            ->whereIn('status', ['unpaid', 'partial'])
            ->get();

        $this->info("📊 Total tagihan overdue: {$tagihanOverdue->count()}");

        $notificationsSent = 0;
        $errors = 0;
        $updated = 0;

        foreach ($tagihanOverdue as $tagihan) {
            $student = $tagihan->student;
            if (!$student) continue;

            // Hitung hari terlambat (INTEGER, bukan decimal!)
            $hariTerlambat = (int) $today->diffInDays($tagihan->due_date);
            
            $this->warn("⚠️  {$student->nama_lengkap} - {$tagihan->billType->name}");
            $this->warn("   Terlambat: {$hariTerlambat} hari | Sisa: Rp " . number_format($tagihan->remaining_amount, 0, ',', '.'));

            // Update status ke overdue jika belum
            if ($tagihan->status !== 'overdue') {
                $tagihan->status = 'overdue';
                $tagihan->save();
                $updated++;
            }

            // Kirim notifikasi overdue
            try {
                $externalUserId = "student_{$student->id}";
                $oneSignal = new OneSignalService();
                
                $result = $oneSignal->sendToExternalUser(
                    "Tagihan {$tagihan->billType->name} sudah terlambat {$hariTerlambat} hari! Mohon segera dibayar. Sisa: Rp " . number_format($tagihan->remaining_amount, 0, ',', '.') . " 💰",
                    $externalUserId,
                    "🚨 Tagihan Terlambat!",
                    "https://nurverse.id/parent/tagihan",
                    [
                        'type' => 'tagihan_overdue',
                        'bill_id' => $tagihan->id,
                        'due_date' => $tagihan->due_date->format('Y-m-d'),
                        'days_overdue' => $hariTerlambat,
                        'amount' => $tagihan->remaining_amount
                    ]
                );
                
                if ($result['success']) {
                    $notificationsSent++;
                    $this->info("   ✅ Notifikasi overdue terkirim");
                } else {
                    $errors++;
                    $this->error("   ❌ Gagal kirim: " . ($result['error']['errors'][0] ?? 'Unknown'));
                }
                
            } catch (\Exception $e) {
                $errors++;
                $this->error("   ❌ Exception: {$e->getMessage()}");
                \Log::error("OneSignal notification error (tagihan overdue)", [
                    'student_id' => $student->id,
                    'bill_id' => $tagihan->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Summary
        $this->newLine();
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("📊 SUMMARY - Cek Tagihan Overdue");
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        $this->info("🗓️  Tanggal: {$today->format('d/m/Y')}");
        $this->info("📋 Total tagihan overdue: {$tagihanOverdue->count()}");
        $this->info("🔄 Status updated: {$updated}");
        $this->info("📤 Notifikasi terkirim: {$notificationsSent}");
        
        if ($errors > 0) {
            $this->error("❌ Gagal kirim: {$errors}");
        }
        
        $this->info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        // Log
        \Log::info("Tagihan Overdue Check Completed", [
            'date' => $today->format('Y-m-d'),
            'total_overdue' => $tagihanOverdue->count(),
            'status_updated' => $updated,
            'notifications_sent' => $notificationsSent,
            'errors' => $errors
        ]);

        return Command::SUCCESS;
    }
}

