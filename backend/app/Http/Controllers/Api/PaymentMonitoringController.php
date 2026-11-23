<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MidtransTransaction;
use App\Models\StudentBill;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentMonitoringController extends Controller
{
    /**
     * Get payment monitoring dashboard data
     */
    public function dashboard(Request $request)
    {
        try {
            // Pending transactions
            $pendingTransactions = MidtransTransaction::where('transaction_status', 'pending')
                ->with(['studentBill.student', 'studentBill.billType'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Recent payments
            $recentPayments = Payment::with(['studentBill.student', 'studentBill.billType'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Statistics
            $stats = [
                'pending_count' => $pendingTransactions->count(),
                'total_pending_amount' => $pendingTransactions->sum('gross_amount'),
                'recent_payments_count' => $recentPayments->count(),
                'total_recent_amount' => $recentPayments->sum('amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'pending_transactions' => $pendingTransactions,
                    'recent_payments' => $recentPayments
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed transaction status
     */
    public function transactionStatus($orderId)
    {
        try {
            $transaction = MidtransTransaction::where('order_id', $orderId)
                ->with(['studentBill.student', 'studentBill.billType'])
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            // Check if payment record exists
            $payment = Payment::where('reference_number', $transaction->transaction_id)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction' => $transaction,
                    'payment_record' => $payment,
                    'student_bill' => $transaction->studentBill,
                    'needs_processing' => $transaction->transaction_status === 'pending' && $payment === null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
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
            $midtransService = new \App\Services\MidtransService();
            $status = $midtransService->getStatus($orderId);

            if (isset($status['transaction_status']) && $status['transaction_status'] === 'settlement') {
                // Update transaction
                $transaction->update([
                    'transaction_id' => $status['transaction_id'],
                    'transaction_status' => 'settlement',
                    'settlement_time' => $status['settlement_time'],
                    'raw_response' => json_encode($status)
                ]);

                // Process payment using PaymentController logic
                $paymentController = new PaymentController($midtransService);
                $paymentController->handleSuccessPayment($transaction, $status);

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
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
