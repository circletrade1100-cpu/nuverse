<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MidtransTransaction;
use App\Models\StudentBill;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RobustWebhookController extends Controller
{
    protected $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * Enhanced webhook with retry mechanism
     */
    public function webhook(Request $request)
    {
        try {
            $notification = $request->all();
            
            Log::info('Enhanced Webhook Received', $notification);

            $orderId = $notification['order_id'] ?? null;
            $transactionStatus = $notification['transaction_status'] ?? null;
            $fraudStatus = $notification['fraud_status'] ?? null;
            $statusCode = $notification['status_code'] ?? null;
            $grossAmount = $notification['gross_amount'] ?? null;
            $signatureKey = $notification['signature_key'] ?? null;

            if (!$orderId) {
                Log::error('No order_id in webhook notification');
                return response()->json(['message' => 'No order_id'], 400);
            }

            // Get transaction
            $transaction = MidtransTransaction::where('order_id', $orderId)->first();
            
            if (!$transaction) {
                Log::error('Transaction not found: ' . $orderId);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Update transaction with notification data
            $transaction->update([
                'transaction_id' => $notification['transaction_id'] ?? $transaction->transaction_id ?? 'MT-' . time(),
                'transaction_status' => $transactionStatus,
                'settlement_time' => $notification['settlement_time'] ?? null,
                'raw_response' => $notification,
            ]);

            // Handle payment settlement
            if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
                if ($fraudStatus === 'accept' || !$fraudStatus) {
                    $this->processPaymentWithRetry($transaction, $notification);
                }
            } elseif ($transactionStatus === 'pending') {
                Log::info('Payment pending: ' . $orderId);
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                Log::info('Payment failed: ' . $orderId . ' - Status: ' . $transactionStatus);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Enhanced Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Get category ID based on bill type name
     */
    private function resolveCategoryId($billTypeName)
    {
        $name = strtolower($billTypeName);
        
        if (str_contains($name, 'spp')) return 1;
        if (str_contains($name, 'ekskul') || str_contains($name, 'ekstrakurikuler')) return 2;
        if (str_contains($name, 'buku')) return 3;
        if (str_contains($name, 'kegiatan')) return 4;
        if (str_contains($name, 'ajp')) return 5;
        if (str_contains($name, 'seragam')) return 6;
        if (str_contains($name, 'infaq') || str_contains($name, 'sumbangan')) return 7;
        if (str_contains($name, 'koperasi')) return 8;
        if (str_contains($name, 'daftar') || str_contains($name, 'pendaftaran')) return 9;
        
        return 1; // Default to SPP Siswa if unknown
    }

    /**
     * Process payment with retry mechanism
     */
    private function processPaymentWithRetry($transaction, $notification, $retryCount = 0)
    {
        try {
            $bill = $transaction->studentBill;
            
            if (!$bill) {
                Log::error('Student bill not found for transaction: ' . $transaction->order_id);
                return;
            }

            $amount = $transaction->gross_amount;
            $referenceNumber = $transaction->transaction_id ?? 'MT-' . time();
            
            // Check if payment already processed
            $existingPayment = Payment::where('reference_number', $referenceNumber)->first();
            if ($existingPayment) {
                Log::info('Payment already processed: ' . $referenceNumber);
                return;
            }

            // Update student bill
            $bill->paid_amount += $amount;
            $bill->remaining_amount -= $amount;
            $bill->installment_count = ($bill->installment_count ?? 0) + 1;
            
            if ($bill->remaining_amount <= 0) {
                $bill->status = 'paid';
            } else {
                $bill->status = 'partial';
            }
            $bill->save();

            // Create payment record
            Payment::create([
                'student_bill_id' => $bill->id,
                'amount' => $amount,
                'payment_date' => $notification['transaction_time'] ?? now(),
                'payment_method' => 'midtrans',
                'reference_number' => $referenceNumber,
                'is_installment' => $bill->remaining_amount > 0 || $bill->installment_count > 1,
                'installment_number' => $bill->installment_count,
                'notes' => "Pembayaran cicilan ke-{$bill->installment_count} via Midtrans - " . strtoupper($transaction->bank ?? 'Transfer'),
                'processed_by' => $transaction->student_id,
            ]);

            // Get student unit sekolah information
            $student = $bill->student;
            $unitSekolahId = null;
            $studentUnitSekolah = null;

            if ($student) {
                $studentUnitSekolah = $student->unit_sekolah;
                if ($studentUnitSekolah) {
                    $unit = \App\Models\UnitSekolah::where('nama', $studentUnitSekolah)
                        ->orWhere('nama', 'like', $studentUnitSekolah . '%')
                        ->first();
                    if ($unit) {
                        $unitSekolahId = $unit->id;
                    }
                }

            }

            // Create income record
            Transaction::create([
                'user_id' => 1, // Central admin
                'category_id' => $this->resolveCategoryId($bill->billType->name ?? ''),
                'unit_sekolah_id' => $unitSekolahId,
                'type' => 'income',
                'title' => "Pembayaran {$bill->billType->name} - {$student->nama_lengkap}",
                'description' => "Pembayaran cicilan ke-{$bill->installment_count} untuk {$bill->billType->name} dari {$student->nama_lengkap} (BILL-{$bill->id})",
                'amount' => $amount,
                'transaction_date' => $notification['transaction_time'] ?? now(),
                'status' => 'completed',
                'metadata' => [
                    'bill_id' => $bill->id,
                    'transaction_id' => $transaction->transaction_id,
                    'bank' => $transaction->bank ?? 'Online',
                    'payment_method' => 'Midtrans',
                    'paidBy' => $student->nama_lengkap,
                    'student_name' => $student->nama_lengkap,
                    'student_unit_sekolah' => $studentUnitSekolah,
                    'bill_type_name' => $bill->billType->name ?? ''
                ]
            ]);


            Log::info("Payment processed successfully: {$transaction->order_id} - {$bill->student->nama_lengkap} - Rp " . number_format($amount));

        } catch (\Exception $e) {
            Log::error('Payment processing error: ' . $e->getMessage());
            
            // Retry mechanism
            if ($retryCount < 3) {
                Log::info("Retrying payment processing (attempt " . ($retryCount + 1) . ")");
                sleep(2); // Wait 2 seconds before retry
                $this->processPaymentWithRetry($transaction, $notification, $retryCount + 1);
            } else {
                Log::error('Payment processing failed after 3 retries: ' . $transaction->order_id);
            }
        }
    }

    /**
     * Force process all pending settlements
     */
    public function forceProcessPending(Request $request)
    {
        try {
            $pendingTransactions = MidtransTransaction::where('transaction_status', 'pending')
                ->where('created_at', '>', now()->subHours(24))
                ->get();

            $processedCount = 0;
            
            foreach ($pendingTransactions as $transaction) {
                $status = $this->midtrans->getStatus($transaction->order_id);
                
                if (isset($status['transaction_status']) && $status['transaction_status'] === 'settlement') {
                    $this->processPaymentWithRetry($transaction, $status);
                    $processedCount++;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "Processed {$processedCount} payments",
                'processed_count' => $processedCount
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
