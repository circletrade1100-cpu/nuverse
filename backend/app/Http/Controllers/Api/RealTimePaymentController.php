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

class RealTimePaymentController extends Controller
{
    protected $midtrans;

    public function __construct(MidtransService $midtrans)
    {
        $this->midtrans = $midtrans;
    }

    /**
     * Real-time payment status checker
     * Called by frontend every 30 seconds for active payments
     */
    public function checkActivePayments(Request $request)
    {
        try {
            $studentId = $request->user()->id;
            
            // Get pending transactions for this student
            $pendingTransactions = MidtransTransaction::where('student_id', $studentId)
                ->where('transaction_status', 'pending')
                ->where('created_at', '>', now()->subHours(24)) // Only check recent transactions
                ->get();

            $results = [];
            
            foreach ($pendingTransactions as $transaction) {
                // Use cache to avoid hitting Midtrans API too frequently
                $cacheKey = "midtrans_status_{$transaction->order_id}";
                $cachedStatus = Cache::get($cacheKey);
                
                if (!$cachedStatus || now()->diffInMinutes($cachedStatus['checked_at']) > 2) {
                    // Check status from Midtrans (max every 2 minutes)
                    $status = $this->midtrans->getStatus($transaction->order_id);
                    
                    Cache::put($cacheKey, [
                        'status' => $status,
                        'checked_at' => now()
                    ], 300); // Cache for 5 minutes
                } else {
                    $status = $cachedStatus['status'];
                }
                
                $results[] = [
                    'order_id' => $transaction->order_id,
                    'amount' => $transaction->gross_amount,
                    'current_status' => $transaction->transaction_status,
                    'midtrans_status' => $status['transaction_status'] ?? 'unknown',
                    'needs_processing' => ($status['transaction_status'] ?? '') === 'settlement' && $transaction->transaction_status === 'pending',
                    'bill_type' => $transaction->studentBill->billType->name ?? 'Unknown'
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => $results
            ]);
            
        } catch (\Exception $e) {
            Log::error('Real-time payment check error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error checking payment status'
            ], 500);
        }
    }

    /**
     * Process payment immediately when detected as settled
     */
    public function processSettledPayment(Request $request)
    {
        try {
            $orderId = $request->input('order_id');
            $studentId = $request->user()->id;
            
            $transaction = MidtransTransaction::where('order_id', $orderId)
                ->where('student_id', $studentId)
                ->first();
                
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }
            
            // Get fresh status from Midtrans
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
                $this->processPayment($transaction, $status);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'data' => [
                        'amount' => $transaction->gross_amount,
                        'bill_type' => $transaction->studentBill->billType->name,
                        'remaining_amount' => $transaction->studentBill->remaining_amount
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not settled yet',
                    'status' => $status['transaction_status'] ?? 'unknown'
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Process settled payment error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment'
            ], 500);
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
     * Process payment (extracted from PaymentController)
     */
    private function processPayment($transaction, $status)
    {
        $bill = $transaction->studentBill;
        
        if (!$bill) {
            Log::error('Student bill not found for transaction: ' . $transaction->order_id);
            return;
        }

        $amount = $transaction->gross_amount;
        $referenceNumber = $transaction->transaction_id;
        
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
            'payment_date' => $status['transaction_time'] ?? now(),
            'payment_method' => 'midtrans',
            'reference_number' => $referenceNumber,
            'is_installment' => $bill->remaining_amount > 0 || $bill->installment_count > 1,
            'installment_number' => $bill->installment_count,
            'notes' => "Pembayaran cicilan ke-{$bill->installment_count} via Midtrans - " . strtoupper($transaction->bank ?? 'Transfer'),
            'processed_by' => $transaction->student_id,
        ]);

        // Create income record
        Transaction::create([
            'user_id' => 1,
            'category_id' => $this->resolveCategoryId($bill->billType->name ?? ''),
            'type' => 'income',
            'title' => "Pembayaran {$bill->billType->name} - {$bill->student->nama_lengkap}",
            'description' => "Pembayaran cicilan ke-{$bill->installment_count} untuk {$bill->billType->name} dari {$bill->student->nama_lengkap} (BILL-{$bill->id})",
            'amount' => $amount,
            'transaction_date' => $status['transaction_time'] ?? now(),
            'status' => 'completed',
            'metadata' => [
                'bill_id' => $bill->id,
                'transaction_id' => $transaction->transaction_id,
                'bank' => $transaction->bank ?? 'Online',
                'payment_method' => 'Midtrans',
                'paidBy' => $bill->student->nama_lengkap,
                'student_name' => $bill->student->nama_lengkap,
                'bill_type_name' => $bill->billType->name ?? ''
            ]
        ]);

        Log::info("Real-time payment processed: {$transaction->order_id}");
    }
}
