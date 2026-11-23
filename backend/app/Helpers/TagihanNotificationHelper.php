<?php

namespace App\Helpers;

use App\Models\StudentBill;
use App\Services\OneSignalService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TagihanNotificationHelper
{
    /**
     * Kirim notifikasi reminder tagihan berdasarkan due date
     * 
     * @param StudentBill $bill
     * @return bool
     */
    public static function sendReminderNotification($bill)
    {
        try {
            $student = $bill->student;
            if (!$student) {
                Log::warning("Student not found for bill ID: {$bill->id}");
                return false;
            }

            $billType = $bill->billType;
            $externalUserId = "student_{$student->id}";
            $oneSignal = new OneSignalService();
            
            // Hitung hari ke jatuh tempo (INTEGER saja, bukan decimal!)
            $today = Carbon::today();
            $dueDate = Carbon::parse($bill->due_date);
            $daysUntilDue = $today->diffInDays($dueDate, false); // false = bisa negatif
            $daysUntilDueInt = (int) ceil(abs($daysUntilDue)); // Bulatkan ke atas, ambil absolute
            
            // Tentukan title dan message berdasarkan hari
            if ($daysUntilDue > 3) {
                // Lebih dari 3 hari
                $title = "⏰ Reminder Tagihan (H-{$daysUntilDueInt})";
                $message = "Reminder: Tagihan {$billType->name} akan jatuh tempo {$daysUntilDueInt} hari lagi!\n";
                $message .= "Sisa tagihan: Rp " . number_format($bill->remaining_amount, 0, ',', '.') . "\n";
                $message .= "Jatuh tempo: " . $dueDate->format('d/m/Y') . " 💳";
                $type = "reminder_h{$daysUntilDueInt}";
            } elseif ($daysUntilDue > 0 && $daysUntilDue <= 3) {
                // H-3, H-2, H-1
                $title = "⚠️ Reminder Tagihan (H-{$daysUntilDueInt})";
                $message = "PERHATIAN: Tagihan {$billType->name} akan jatuh tempo {$daysUntilDueInt} hari lagi!\n";
                $message .= "Sisa tagihan: Rp " . number_format($bill->remaining_amount, 0, ',', '.') . "\n";
                $message .= "Jatuh tempo: " . $dueDate->format('d/m/Y') . " ⚠️";
                $type = "reminder_h{$daysUntilDueInt}";
            } elseif ($daysUntilDue == 0) {
                // Jatuh tempo hari ini
                $title = "🚨 Tagihan Jatuh Tempo Hari Ini!";
                $message = "URGENT! Tagihan {$billType->name} jatuh tempo HARI INI!\n";
                $message .= "Sisa: Rp " . number_format($bill->remaining_amount, 0, ',', '.') . " 🚨";
                $type = "reminder_h0";
            } else {
                // Sudah lewat jatuh tempo (overdue)
                $title = "🚨 Tagihan Terlambat!";
                $message = "Tagihan {$billType->name} sudah terlambat {$daysUntilDueInt} hari!\n";
                $message .= "Mohon segera dibayar. Sisa: Rp " . number_format($bill->remaining_amount, 0, ',', '.') . " 💰";
                $type = "overdue";
            }
            
            $result = $oneSignal->sendToExternalUser(
                $message,
                $externalUserId,
                $title,
                "https://nurverse.id/parent/tagihan",
                [
                    'type' => $type,
                    'bill_id' => $bill->id,
                    'student_id' => $student->id,
                    'student_name' => $student->nama_lengkap,
                    'bill_type' => $billType->name,
                    'amount' => $bill->remaining_amount,
                    'due_date' => $bill->due_date->format('Y-m-d'),
                    'days_until_due' => $daysUntilDueInt
                ]
            );
            
            if ($result['success']) {
                Log::info("✅ Notifikasi reminder tagihan terkirim", [
                    'bill_id' => $bill->id,
                    'student_id' => $student->id,
                    'student_name' => $student->nama_lengkap,
                    'type' => $type,
                    'days_until_due' => $daysUntilDueInt
                ]);
                return true;
            } else {
                Log::error("❌ Gagal kirim notifikasi reminder tagihan", [
                    'bill_id' => $bill->id,
                    'error' => $result['error'] ?? 'Unknown'
                ]);
                return false;
            }
            
        } catch (\Exception $e) {
            Log::error("Exception saat kirim notifikasi reminder tagihan", [
                'bill_id' => $bill->id ?? null,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Kirim notifikasi tagihan baru ke parent
     */
    public static function sendNewBillNotification($bill)
    {
        try {
            $student = $bill->student;
            if (!$student) {
                Log::warning("Student not found for bill ID: {$bill->id}");
                return false;
            }

            $billType = $bill->billType;
            $externalUserId = "student_{$student->id}";
            $oneSignal = new OneSignalService();
            
            $message = "Tagihan baru: {$billType->name}\n";
            $message .= "Jumlah: Rp " . number_format($bill->total_amount, 0, ',', '.') . "\n";
            $message .= "Jatuh tempo: " . $bill->due_date->format('d/m/Y') . " 📅";
            
            $result = $oneSignal->sendToExternalUser(
                $message,
                $externalUserId,
                "🔔 Tagihan Baru untuk {$student->nama_lengkap}",
                "https://nurverse.id/parent/tagihan",
                [
                    'type' => 'tagihan_new',
                    'bill_id' => $bill->id,
                    'student_id' => $student->id,
                    'student_name' => $student->nama_lengkap,
                    'bill_type' => $billType->name ?? 'Tagihan',
                    'amount' => $bill->total_amount,
                    'due_date' => $bill->due_date->format('Y-m-d')
                ]
            );
            
            if ($result['success']) {
                Log::info("✅ Notifikasi tagihan baru terkirim", [
                    'bill_id' => $bill->id,
                    'student_id' => $student->id,
                    'student_name' => $student->nama_lengkap
                ]);
                return true;
            } else {
                Log::error("❌ Gagal kirim notifikasi tagihan baru", [
                    'bill_id' => $bill->id,
                    'error' => $result['error'] ?? 'Unknown'
                ]);
                return false;
            }
            
        } catch (\Exception $e) {
            Log::error("Exception saat kirim notifikasi tagihan baru", [
                'bill_id' => $bill->id ?? null,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Kirim notifikasi pembayaran berhasil ke parent
     */
    public static function sendPaymentSuccessNotification($bill, $payment)
    {
        try {
            $student = $bill->student;
            if (!$student) {
                return false;
            }

            $billType = $bill->billType;
            $externalUserId = "student_{$student->id}";
            $oneSignal = new OneSignalService();
            
            $message = "Pembayaran {$billType->name} berhasil! 🎉\n";
            $message .= "Jumlah: Rp " . number_format($payment->amount, 0, ',', '.') . "\n";
            $message .= "Sisa tagihan: Rp " . number_format($bill->remaining_amount, 0, ',', '.');
            
            $result = $oneSignal->sendToExternalUser(
                $message,
                $externalUserId,
                "✅ Pembayaran Berhasil!",
                "https://nurverse.id/parent/tagihan",
                [
                    'type' => 'payment_success',
                    'bill_id' => $bill->id,
                    'payment_id' => $payment->id,
                    'amount_paid' => $payment->amount,
                    'remaining' => $bill->remaining_amount
                ]
            );
            
            if ($result['success']) {
                Log::info("✅ Notifikasi pembayaran sukses terkirim", [
                    'bill_id' => $bill->id,
                    'payment_id' => $payment->id,
                    'student_name' => $student->nama_lengkap
                ]);
                return true;
            }
            
            return false;
            
        } catch (\Exception $e) {
            Log::error("Exception notifikasi pembayaran sukses", [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Kirim notifikasi ke multiple students sekaligus (untuk tagihan massal)
     */
    public static function sendBulkNewBillNotification($bills)
    {
        $successCount = 0;
        $failCount = 0;

        foreach ($bills as $bill) {
            $result = self::sendNewBillNotification($bill);
            if ($result) {
                $successCount++;
            } else {
                $failCount++;
            }
            
            // Delay untuk prevent rate limiting
            usleep(100000); // 0.1 second delay
        }

        Log::info("Bulk notifikasi tagihan selesai", [
            'total' => count($bills),
            'success' => $successCount,
            'failed' => $failCount
        ]);

        return [
            'success' => $successCount,
            'failed' => $failCount
        ];
    }
}
