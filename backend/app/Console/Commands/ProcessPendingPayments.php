<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MidtransTransaction;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\MidtransService;

class ProcessPendingPayments extends Command
{
    protected $signature = 'payments:process-pending';
    protected $description = 'Process pending Midtrans payments that have been settled';

    public function handle()
    {
        $this->info('Checking for pending payments...');
        
        $pendingTransactions = MidtransTransaction::where('transaction_status', 'pending')->get();
        $this->info("Found {$pendingTransactions->count()} pending transactions");
        
        $midtransService = new MidtransService();
        $processedCount = 0;
        
        foreach ($pendingTransactions as $transaction) {
            try {
                $status = $midtransService->getStatus($transaction->order_id);
                
                if (isset($status['transaction_status']) && $status['transaction_status'] === 'settlement') {
                    $this->info("Processing settled transaction: {$transaction->order_id}");
                    
                    // Update transaction
                    $transaction->update([
                        'transaction_id' => $status['transaction_id'],
                        'transaction_status' => 'settlement',
                        'settlement_time' => $status['settlement_time'],
                        'raw_response' => json_encode($status)
                    ]);
                    
                    // Process payment
                    $this->processPayment($transaction, $status);
                    $processedCount++;
                    
                } elseif (isset($status['transaction_status']) && in_array($status['transaction_status'], ['deny', 'cancel', 'expire'])) {
                    $this->warn("Transaction failed: {$transaction->order_id} - {$status['transaction_status']}");
                    $transaction->update(['transaction_status' => $status['transaction_status']]);
                }
                
            } catch (\Exception $e) {
                $this->error("Error processing {$transaction->order_id}: " . $e->getMessage());
            }
        }
        
        $this->info("Processed {$processedCount} payments successfully");
    }
    
    private function processPayment($transaction, $status)
    {
        $bill = $transaction->studentBill;
        if (!$bill) {
            $this->error("Student bill not found for transaction: {$transaction->order_id}");
            return;
        }
        
        $amount = $transaction->gross_amount;
        $referenceNumber = $transaction->transaction_id;
        
        // Check if payment already processed
        $existingPayment = Payment::where('reference_number', $referenceNumber)->first();
        if ($existingPayment) {
            $this->info("Payment already processed: {$referenceNumber}");
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
            'payment_date' => $status['transaction_time'],
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
            'category_id' => 1,
            'type' => 'income',
            'title' => "Pembayaran {$bill->billType->name} - {$bill->student->nama_lengkap}",
            'description' => "Pembayaran cicilan ke-{$bill->installment_count} untuk {$bill->billType->name} dari {$bill->student->nama_lengkap} (BILL-{$bill->id})",
            'amount' => $amount,
            'transaction_date' => $status['transaction_time'],
            'status' => 'completed',
            'metadata' => json_encode([
                'bill_id' => $bill->id,
                'transaction_id' => $transaction->transaction_id,
                'bank' => $transaction->bank ?? 'Online',
                'payment_method' => 'Midtrans',
                'paidBy' => $bill->student->nama_lengkap,
                'student_name' => $bill->student->nama_lengkap
            ])
        ]);
        
        $this->info("Payment processed: {$bill->student->nama_lengkap} - Rp " . number_format($amount));
    }
}
