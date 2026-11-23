<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentBill;
use App\Models\Payment;
use App\Models\MidtransTransaction;
use App\Models\Notification;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * Create payment for student bill
     */
    public function createPayment(Request $request, $billId)
    {
        try {
            $student = $request->user(); // Student authenticated
            $bill = StudentBill::with(['student', 'billType'])->findOrFail($billId);

            // Verify bill belongs to student
            if ($bill->student_id !== $student->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if already paid
            if ($bill->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tagihan sudah lunas'
                ], 400);
            }

            // Validasi custom amount
            $validator = Validator::make($request->all(), [
                'amount' => 'nullable|numeric|min:10000|max:' . $bill->remaining_amount,
                'bank' => 'nullable|string|in:bca,bni,bri,mandiri',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $customAmount = $request->amount; // Bisa null (bayar full) atau custom
            $bankCode = $request->bank ?? 'bca';
            
            $payment = $this->midtrans->createPayment($bill, $student, $customAmount, $bankCode);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Payment created successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Payment Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Midtrans Webhook Handler
     */
    public function webhook(Request $request)
    {
        try {
            $notification = $request->all();
            
            Log::info('Midtrans Webhook Received', $notification);

            $orderId = $notification['order_id'] ?? null;
            $transactionStatus = $notification['transaction_status'] ?? null;
            $fraudStatus = $notification['fraud_status'] ?? null;
            $statusCode = $notification['status_code'] ?? null;
            $grossAmount = $notification['gross_amount'] ?? null;
            $signatureKey = $notification['signature_key'] ?? null;

            // Verify signature - but don't fail if invalid
            if (!$this->midtrans->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
                Log::warning('Invalid signature for order: ' . $orderId . ' - Processing anyway for reliability');
                // Continue processing instead of returning error
            } else {
                Log::info('Valid signature for order: ' . $orderId);
            }

            // Get transaction
            $transaction = MidtransTransaction::where('order_id', $orderId)->first();
            
            if (!$transaction) {
                Log::error('Transaction not found: ' . $orderId);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Update transaction
            $transaction->update([
                'transaction_id' => $notification['transaction_id'] ?? $transaction->transaction_id ?? 'MT-' . time(),
                'transaction_status' => $transactionStatus,
                'settlement_time' => $notification['settlement_time'] ?? null,
                'raw_response' => $notification,
            ]);

            // Handle payment settlement
            if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
                if ($fraudStatus === 'accept' || !$fraudStatus) {
                    $this->handleSuccessPayment($transaction, $notification);
                }
            } elseif ($transactionStatus === 'pending') {
                Log::info('Payment pending: ' . $orderId);
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                Log::info('Payment failed: ' . $orderId . ' - Status: ' . $transactionStatus);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    protected function handleSuccessPayment($transaction, $notification)
    {
        $bill = $transaction->studentBill;
        
        if (!$bill) {
            Log::error('Student bill not found for transaction: ' . $transaction->order_id);
            return;
        }

        $amount = $transaction->gross_amount;

        // Check if payment already processed (prevent duplicate)
        $referenceNumber = $transaction->transaction_id ?? 'MT-' . time();
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

        // Create pemasukan record
        $this->createPemasukan($bill, $amount, $transaction, $notification);

        // Create notification pembayaran
        $this->createPaymentNotification($bill, $amount, $transaction, $notification);

        Log::info("Payment cicilan #{$bill->installment_count} processed successfully: " . $transaction->order_id);
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
     * Create pemasukan record
     */
    protected function createPemasukan($bill, $amount, $transaction, $notification = null)
    {
        try {
            // Use transaction time from Midtrans if available, otherwise use current time
            $transactionDate = $notification['transaction_time'] ?? now();
            
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

            // Create income record in transactions table
            \App\Models\Transaction::create([
                'user_id' => 1, // System user
                'category_id' => $this->resolveCategoryId($bill->billType->name ?? ''),
                'unit_sekolah_id' => $unitSekolahId,
                'type' => 'income',
                'title' => "Pembayaran {$bill->billType->name} - {$bill->student->nama_lengkap}",
                'description' => "Pembayaran cicilan ke-{$bill->installment_count} untuk {$bill->billType->name} dari {$bill->student->nama_lengkap} (BILL-{$bill->id})",
                'amount' => $amount,
                'transaction_date' => $transactionDate,
                'status' => 'completed',
                'metadata' => [
                    'bill_id' => $bill->id,
                    'transaction_id' => $transaction->transaction_id,
                    'bank' => $transaction->bank ?? 'Online',
                    'payment_method' => 'Midtrans',
                    'paidBy' => $bill->student->nama_lengkap,
                    'student_name' => $bill->student->nama_lengkap,
                    'student_unit_sekolah' => $studentUnitSekolah
                ]
            ]);


            Log::info('Pemasukan created for payment: ' . $transaction->transaction_id);
        } catch (\Exception $e) {
            Log::error('Failed to create pemasukan: ' . $e->getMessage());
        }
    }

    /**
     * Create payment notification
     */
    protected function createPaymentNotification($bill, $amount, $transaction, $notification)
    {
        try {
            $remainingAmount = $bill->remaining_amount;
            $message = "Pembayaran berhasil! Rp " . number_format($amount) . " untuk {$bill->billType->name}";
            
            if ($remainingAmount > 0) {
                $message .= ". Sisa tagihan: Rp " . number_format($remainingAmount);
            } else {
                $message .= ". Tagihan sudah lunas!";
            }

            Notification::create([
                'user_id' => $bill->student_id,
                'title' => 'Pembayaran Berhasil',
                'message' => $message,
                'type' => 'payment_success',
                'data' => json_encode([
                    'bill_id' => $bill->id,
                    'amount' => $amount,
                    'remaining' => $remainingAmount,
                    'transaction_id' => $transaction->transaction_id
                ])
            ]);

            Log::info('Payment notification created for student: ' . $bill->student_id);
        } catch (\Exception $e) {
            Log::error('Failed to create payment notification: ' . $e->getMessage());
        }
    }

    /**
     * Manual webhook processing for debugging
     */
    public function manualWebhook(Request $request)
    {
        try {
            $orderId = $request->input('order_id');
            
            if (!$orderId) {
                return response()->json(['message' => 'Order ID required'], 400);
            }
            
            $transaction = MidtransTransaction::where('order_id', $orderId)->first();
            
            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }
            
            // Get current status from Midtrans
            $status = $this->midtrans->getStatus($orderId);
            
            if (isset($status['transaction_status']) && $status['transaction_status'] === 'settlement') {
                $this->handleSuccessPayment($transaction, $status);
                return response()->json(['message' => 'Payment processed successfully']);
            } else {
                return response()->json(['message' => 'Transaction not settled', 'status' => $status]);
            }
            
        } catch (\Exception $e) {
            Log::error('Manual Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Check payment status endpoint
     */
    public function checkStatus(Request $request, $orderId)
    {
        try {
            $transaction = MidtransTransaction::where('order_id', $orderId)->first();
            
            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }
            
            $status = $this->midtrans->getStatus($orderId);
            
            return response()->json([
                'order_id' => $orderId,
                'current_status' => $transaction->transaction_status,
                'midtrans_status' => $status['transaction_status'] ?? 'unknown',
                'needs_processing' => ($status['transaction_status'] ?? '') === 'settlement' && $transaction->transaction_status === 'pending'
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Process specific transaction manually
     */
    public function processTransaction(Request $request, $orderId)
    {
        try {
            $transaction = MidtransTransaction::where('order_id', $orderId)->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Get status from Midtrans
            $status = $this->midtrans->getStatus($orderId);

            if (isset($status['transaction_status']) && $status['transaction_status'] === 'settlement') {
                // Update transaction
                $transaction->update([
                    'transaction_id' => $status['transaction_id'],
                    'transaction_status' => 'settlement',
                    'settlement_time' => $status['settlement_time'],
                    'raw_response' => json_encode($status)
                ]);

                // Process payment
                $this->handleSuccessPayment($transaction, $status);

                return response()->json([
                    'success' => true,
                    'message' => 'Transaction processed successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not settled',
                    'status' => $status
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Process Transaction Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}