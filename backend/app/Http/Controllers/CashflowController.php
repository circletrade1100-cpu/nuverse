<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Category;
use App\Models\StudentBill;
use App\Models\BillPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CashflowController extends Controller
{
    public function getIncome(Request $request)
    {
        $query = Transaction::income()->with(['user', 'category', 'approvedBy']);

        // Filter berdasarkan unit_sekolah user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_sekolah) {
            $userUnitSekolah = $user->profile->unit_sekolah;
            
            // Filter berdasarkan unit_sekolah creator atau student_unit_sekolah dalam metadata
            $query->where(function($q) use ($userUnitSekolah) {
                // Filter by creator's unit_sekolah
                $q->whereHas('user.profile', function($subQ) use ($userUnitSekolah) {
                    $subQ->where('unit_sekolah', $userUnitSekolah);
                })
                // OR filter by student_unit_sekolah in metadata
                ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolah);
            });
        }

        // Filter berdasarkan parameter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan periode
        $period = $request->get('period', 'all');
        
        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', \Carbon\Carbon::today()->toDateString());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    \Carbon\Carbon::now()->startOfWeek()->toDateString(),
                    \Carbon\Carbon::now()->endOfWeek()->toDateString()
                ]);
                break;
            case 'monthly':
                $month = $request->get('month'); // Expecting 'YYYY-MM'
                if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
                    [$year, $m] = explode('-', $month);
                    $query->whereYear('transaction_date', $year)
                          ->whereMonth('transaction_date', $m);
                } else {
                    $query->whereMonth('transaction_date', \Carbon\Carbon::now()->month)
                          ->whereYear('transaction_date', \Carbon\Carbon::now()->year);
                }
                break;
            case 'yearly':
                $year = $request->get('year', \Carbon\Carbon::now()->year);
                $query->whereYear('transaction_date', $year);
                break;
            case 'custom':
                if ($request->has('date_from')) {
                    $query->whereDate('transaction_date', '>=', $request->date_from);
                }
                if ($request->has('date_to')) {
                    $query->whereDate('transaction_date', '<=', $request->date_to);
                }
                break;
            default:
                // Fallback for old filtering
                if ($request->has('date_from')) {
                    $query->whereDate('transaction_date', '>=', $request->date_from);
                }
                if ($request->has('date_to')) {
                    $query->whereDate('transaction_date', '<=', $request->date_to);
                }
                break;
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                            ->orderBy('id', 'desc')
                            ->paginate($request->get('per_page', 15));

        // Ensure metadata is properly decoded for all transactions and format dates
        $transactions->getCollection()->transform(function ($transaction) {
            if (is_string($transaction->metadata)) {
                $transaction->metadata = json_decode($transaction->metadata, true);
            }
            // Format transaction_date as Y-m-d to avoid timezone issues
            if ($transaction->transaction_date) {
                $transaction->transaction_date = $transaction->transaction_date->format('Y-m-d');
            }
            return $transaction;
        });

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function createIncome(Request $request)
    {
        // Parse metadata JSON string BEFORE validation
        $requestData = $request->all();
        if (isset($requestData['metadata']) && is_string($requestData['metadata'])) {
            $decoded = json_decode($requestData['metadata'], true);
            if ($decoded !== null) {
                $requestData['metadata'] = $decoded;
            }
        }
        
        $validator = Validator::make($requestData, [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use parsed requestData instead of request->only()
        $transactionData = collect($requestData)->only([
            'category_id', 'title', 'description', 'amount', 
            'transaction_date', 'metadata'
        ])->toArray();

        // Ensure transaction_date is saved correctly without timezone conversion
        // Validate and keep as-is if already in Y-m-d format
        if (isset($transactionData['transaction_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $transactionData['transaction_date'])) {
            // Already in correct format, keep it as-is to avoid timezone conversion
            // No need to convert
        }

        $transactionData['user_id'] = $request->user()->id;
        $transactionData['type'] = 'income';
        $transactionData['status'] = 'approved'; // Income transactions don't need approval
        $transactionData['approved_by'] = $request->user()->id; // Auto-approved by creator
        $transactionData['approved_at'] = now(); // Auto-approved timestamp
        
        // Add student unit sekolah to metadata if student ID is provided
        $studentId = null;
        if (isset($transactionData['metadata']['student'])) {
            $studentId = $transactionData['metadata']['student'];
            $student = \App\Models\Student::find($studentId);
            if ($student && $student->unit_sekolah) {
                $transactionData['metadata']['student_unit_sekolah'] = $student->unit_sekolah;
            }
        }

        // Handle file upload
        if ($request->hasFile('receipt_file')) {
            $receiptPath = $request->file('receipt_file')->store('receipts', 'public');
            $transactionData['receipt_file'] = $receiptPath;
        }

        // Check if this transaction is related to student bills
        $studentBills = $transactionData['metadata']['student_bills'] ?? null;
        $studentBillId = $transactionData['metadata']['student_bill_id'] ?? null;
        
        // Process student bill payments if metadata contains student_bills or student_bill_id
        if ($studentBills && is_array($studentBills) && count($studentBills) > 0) {
            // Multiple bills payment
            return $this->processMultipleBillPayments($transactionData, $request, $studentBills);
        } elseif ($studentBillId) {
            // Single bill payment
            return $this->processSingleBillPayment($transactionData, $request, $studentBillId);
        }

        // Regular transaction (no student bill integration)
        $transaction = Transaction::create($transactionData);

        return response()->json([
            'success' => true,
            'message' => 'Income transaction created successfully',
            'data' => $transaction->load(['user', 'category'])
        ], 201);
    }

    /**
     * Process single student bill payment
     */
    private function processSingleBillPayment($transactionData, $request, $studentBillId)
    {
        DB::beginTransaction();
        
        try {
            $studentBill = StudentBill::with(['student', 'billType'])->find($studentBillId);
            
            if (!$studentBill) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Student bill not found'
                ], 404);
            }

            $amount = $transactionData['amount'];
            $paymentDate = $transactionData['transaction_date'];
            $paymentMethodRaw = $transactionData['metadata']['paymentMethod'] ?? 'cash';
            
            // Map payment method to valid ENUM values
            $paymentMethod = $this->normalizePaymentMethod($paymentMethodRaw);
            $referenceNumber = $transactionData['metadata']['reference_number'] ?? null;
            
            // If payment method contains bank info (e.g., "BCA SYARIAH - 0"), extract it
            if (preg_match('/^(.+?)\s*-\s*(.+)$/', $paymentMethodRaw, $matches)) {
                $bankName = trim($matches[1]);
                $accountNumber = trim($matches[2]);
                // Use bank info as reference number if reference_number is not provided
                if (!$referenceNumber) {
                    $referenceNumber = "{$bankName} - {$accountNumber}";
                }
            }
            
            $notes = $transactionData['description'] ?? "Pembayaran {$studentBill->billType->name}";

            // Calculate installment number
            $lastPayment = BillPayment::where('student_bill_id', $studentBillId)
                ->where('is_installment', true)
                ->max('installment_number');
            $installmentNumber = ($lastPayment ?? 0) + 1;

            // Update student bill
            $studentBill->paid_amount += $amount;
            $studentBill->remaining_amount = $studentBill->total_amount - $studentBill->paid_amount;
            $studentBill->updateStatus();
            $studentBill->save();

            // Create bill payment record
            $billPayment = BillPayment::create([
                'student_bill_id' => $studentBillId,
                'amount' => $amount,
                'payment_date' => $paymentDate,
                'payment_method' => $paymentMethod,
                'reference_number' => $referenceNumber,
                'processed_by' => $request->user()->id ?? 1,
                'is_installment' => $studentBill->remaining_amount > 0,
                'installment_number' => $installmentNumber,
                'notes' => $notes
            ]);

            // Update transaction metadata with bill payment info
            if (!is_array($transactionData['metadata'])) {
                $transactionData['metadata'] = [];
            }
            
            // Get student unit sekolah information
            $student = $studentBill->student;
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

            $transactionData['unit_sekolah_id'] = $unitSekolahId;
            $transactionData['metadata']['student_bill_id'] = $studentBillId;
            $transactionData['metadata']['payment_id'] = $billPayment->id;
            $transactionData['metadata']['student_name'] = $studentBill->student->nama_lengkap ?? '';
            $transactionData['metadata']['bill_type_name'] = $studentBill->billType->name ?? '';
            $transactionData['metadata']['student_unit_sekolah'] = $studentUnitSekolah;
            // Keep original payment method in metadata
            $transactionData['metadata']['paymentMethod'] = $paymentMethodRaw;

            // Create transaction
            $transaction = Transaction::create($transactionData);


            // Link bill payment to transaction
            $billPayment->update(['transaction_id' => $transaction->id]);

            DB::commit();

            Log::info('Student bill payment processed', [
                'student_bill_id' => $studentBillId,
                'payment_id' => $billPayment->id,
                'transaction_id' => $transaction->id,
                'amount' => $amount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Income transaction and student bill payment created successfully',
                'data' => [
                    'transaction' => $transaction->load(['user', 'category']),
                    'bill_payment' => $billPayment->load(['studentBill.student', 'studentBill.billType']),
                    'student_bill' => $studentBill
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing student bill payment', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'student_bill_id' => $studentBillId ?? null,
                'transaction_data' => $transactionData ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process student bill payment: ' . $e->getMessage(),
                'error_details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    /**
     * Process multiple student bill payments
     */
    private function processMultipleBillPayments($transactionData, $request, $studentBills)
    {
        DB::beginTransaction();
        
        try {
            $mainTransaction = null;
            $billPayments = [];
            $totalAmount = 0;
            
            // Get payment method from metadata (once, outside loop)
            $paymentMethodRaw = $transactionData['metadata']['paymentMethod'] ?? 'cash';
            $baseReferenceNumber = $transactionData['metadata']['reference_number'] ?? null;

            foreach ($studentBills as $billData) {
                $studentBillId = $billData['bill_id'] ?? $billData['student_bill_id'] ?? null;
                $amount = $billData['amount'] ?? $transactionData['amount'];
                
                if (!$studentBillId) {
                    continue;
                }

                $studentBill = StudentBill::with(['student', 'billType'])->find($studentBillId);
                
                if (!$studentBill) {
                    Log::warning('Student bill not found', ['student_bill_id' => $studentBillId]);
                    continue;
                }

                $paymentDate = $transactionData['transaction_date'];
                
                // Map payment method to valid ENUM values
                $paymentMethod = $this->normalizePaymentMethod($paymentMethodRaw);
                $referenceNumber = $baseReferenceNumber;
                
                // If payment method contains bank info (e.g., "BCA SYARIAH - 0"), extract it
                if (preg_match('/^(.+?)\s*-\s*(.+)$/', $paymentMethodRaw, $matches)) {
                    $bankName = trim($matches[1]);
                    $accountNumber = trim($matches[2]);
                    // Use bank info as reference number if reference_number is not provided
                    if (!$referenceNumber) {
                        $referenceNumber = "{$bankName} - {$accountNumber}";
                    }
                }
                
                $notes = $billData['notes'] ?? $transactionData['description'] ?? "Pembayaran {$studentBill->billType->name}";

                // Calculate installment number
                $lastPayment = BillPayment::where('student_bill_id', $studentBillId)
                    ->where('is_installment', true)
                    ->max('installment_number');
                $installmentNumber = ($lastPayment ?? 0) + 1;

                // Update student bill
                $studentBill->paid_amount += $amount;
                $studentBill->remaining_amount = $studentBill->total_amount - $studentBill->paid_amount;
                $studentBill->updateStatus();
                $studentBill->save();

                // Create bill payment record
                $billPayment = BillPayment::create([
                    'student_bill_id' => $studentBillId,
                    'amount' => $amount,
                    'payment_date' => $paymentDate,
                    'payment_method' => $paymentMethod,
                    'reference_number' => $referenceNumber,
                    'processed_by' => $request->user()->id ?? 1,
                    'is_installment' => $studentBill->remaining_amount > 0,
                    'installment_number' => $installmentNumber,
                    'notes' => $notes
                ]);

                $billPayments[] = $billPayment;
                $totalAmount += $amount;
            }

            // Update transaction amount to match total of all bill payments
            $transactionData['amount'] = $totalAmount;
            
            // Get student unit sekolah from first bill (assuming same unit for multiple bills)
            $firstBill = count($billPayments) > 0 ? StudentBill::with('student')->find($billPayments[0]->student_bill_id) : null;
            $unitSekolahId = null;
            $studentUnitSekolah = null;
            
            if ($firstBill && $firstBill->student) {
                $studentUnitSekolah = $firstBill->student->unit_sekolah;
                if ($studentUnitSekolah) {
                    $unit = \App\Models\UnitSekolah::where('nama', $studentUnitSekolah)
                        ->orWhere('nama', 'like', $studentUnitSekolah . '%')
                        ->first();
                    if ($unit) {
                        $unitSekolahId = $unit->id;
                    }
                }
            }


            // Update transaction metadata
            if (!is_array($transactionData['metadata'])) {
                $transactionData['metadata'] = [];
            }
            
            $transactionData['unit_sekolah_id'] = $unitSekolahId;
            $transactionData['metadata']['student_unit_sekolah'] = $studentUnitSekolah;
            $transactionData['metadata']['student_bills'] = array_map(function($bp) {
                return [
                    'student_bill_id' => $bp->student_bill_id,
                    'payment_id' => $bp->id,
                    'amount' => $bp->amount
                ];
            }, $billPayments);
            // Keep original payment method in metadata if not already set
            if (!isset($transactionData['metadata']['paymentMethod'])) {
                $transactionData['metadata']['paymentMethod'] = $paymentMethodRaw;
            }

            // Create main transaction
            $mainTransaction = Transaction::create($transactionData);


            // Link all bill payments to main transaction
            foreach ($billPayments as $billPayment) {
                $billPayment->update(['transaction_id' => $mainTransaction->id]);
            }

            DB::commit();

            Log::info('Multiple student bill payments processed', [
                'transaction_id' => $mainTransaction->id,
                'bill_payments_count' => count($billPayments),
                'total_amount' => $totalAmount
            ]);

            // Reload bill payments with relationships
            $billPaymentIds = array_map(function($bp) {
                return $bp->id;
            }, $billPayments);
            
            $billPaymentsWithRelations = BillPayment::whereIn('id', $billPaymentIds)
                ->with(['studentBill.student', 'studentBill.billType', 'processedBy'])
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Income transaction and student bill payments created successfully',
                'data' => [
                    'transaction' => $mainTransaction->load(['user', 'category']),
                    'bill_payments' => $billPaymentsWithRelations,
                    'total_amount' => $totalAmount
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing multiple student bill payments', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'student_bills_count' => count($studentBills ?? []),
                'transaction_data' => $transactionData ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process student bill payments: ' . $e->getMessage(),
                'error_details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    public function getExpense(Request $request)
    {
        $query = Transaction::expense()->with(['user', 'category', 'approvedBy']);

        // Filter berdasarkan unit_sekolah user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_sekolah) {
            $userUnitSekolah = $user->profile->unit_sekolah;
            
            // Filter berdasarkan unit_sekolah creator atau student_unit_sekolah dalam metadata
            $query->where(function($q) use ($userUnitSekolah) {
                // Filter by creator's unit_sekolah
                $q->whereHas('user.profile', function($subQ) use ($userUnitSekolah) {
                    $subQ->where('unit_sekolah', $userUnitSekolah);
                })
                // OR filter by student_unit_sekolah in metadata
                ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolah);
            });
        }

        // Filter berdasarkan parameter (sama seperti getIncome)
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by category name (support from frontend)
        if ($request->has('category') && !$request->has('category_id')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan periode
        $period = $request->get('period', 'all');
        
        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', \Carbon\Carbon::today()->toDateString());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    \Carbon\Carbon::now()->startOfWeek()->toDateString(),
                    \Carbon\Carbon::now()->endOfWeek()->toDateString()
                ]);
                break;
            case 'monthly':
                $month = $request->get('month'); // Expecting 'YYYY-MM'
                if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
                    [$year, $m] = explode('-', $month);
                    $query->whereYear('transaction_date', $year)
                          ->whereMonth('transaction_date', $m);
                } else {
                    $query->whereMonth('transaction_date', \Carbon\Carbon::now()->month)
                          ->whereYear('transaction_date', \Carbon\Carbon::now()->year);
                }
                break;
            case 'yearly':
                $year = $request->get('year', \Carbon\Carbon::now()->year);
                $query->whereYear('transaction_date', $year);
                break;
            case 'custom':
                if ($request->has('date_from')) {
                    $query->whereDate('transaction_date', '>=', $request->date_from);
                }
                if ($request->has('date_to')) {
                    $query->whereDate('transaction_date', '<=', $request->date_to);
                }
                break;
            default:
                // Fallback for old filtering
                if ($request->has('date_from')) {
                    $query->whereDate('transaction_date', '>=', $request->date_from);
                }
                if ($request->has('date_to')) {
                    $query->whereDate('transaction_date', '<=', $request->date_to);
                }
                break;
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                            ->orderBy('id', 'desc')
                            ->paginate($request->get('per_page', 15));

        // Ensure metadata is properly decoded for all transactions and format dates
        $transactions->getCollection()->transform(function ($transaction) {
            if (is_string($transaction->metadata)) {
                $transaction->metadata = json_decode($transaction->metadata, true);
            }
            // Format transaction_date as Y-m-d to avoid timezone issues
            if ($transaction->transaction_date) {
                $transaction->transaction_date = $transaction->transaction_date->format('Y-m-d');
            }
            return $transaction;
        });

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function createExpense(Request $request)
    {
        try {
            \Log::info('📥 createExpense called', ['request_data' => $request->except(['receipt_file'])]);
            
            // Parse metadata JSON string BEFORE validation
            $requestData = $request->all();
            if (isset($requestData['metadata']) && is_string($requestData['metadata'])) {
                $decoded = json_decode($requestData['metadata'], true);
                if (json_last_error() === JSON_ERROR_NONE && $decoded !== null) {
                    $requestData['metadata'] = $decoded;
                    \Log::info('✓ Metadata parsed successfully', ['metadata' => $decoded]);
                } else {
                    \Log::warning('⚠ Failed to parse metadata', ['error' => json_last_error_msg(), 'metadata' => $requestData['metadata']]);
                }
            }
            
            $validator = Validator::make($requestData, [
                'category_id' => 'required|exists:categories,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'transaction_date' => 'required|date',
                'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'metadata' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                \Log::error('❌ Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Use parsed requestData instead of request->only()
            $transactionData = collect($requestData)->only([
                'category_id', 'title', 'description', 'amount', 
                'transaction_date', 'metadata'
            ])->toArray();

            // Ensure transaction_date is saved correctly without timezone conversion
            // Validate and keep as-is if already in Y-m-d format
            if (isset($transactionData['transaction_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $transactionData['transaction_date'])) {
                // Already in correct format, keep it as-is to avoid timezone conversion
                // No need to convert
            }

            $transactionData['user_id'] = $request->user()->id;
            $transactionData['type'] = 'expense';
            $transactionData['status'] = 'pending';

            // Handle file upload
            if ($request->hasFile('receipt_file')) {
                $receiptPath = $request->file('receipt_file')->store('receipts', 'public');
                $transactionData['receipt_file'] = $receiptPath;
                \Log::info('✓ File uploaded', ['path' => $receiptPath]);
            }

            \Log::info('💾 Creating transaction', ['data' => $transactionData]);
            $transaction = Transaction::create($transactionData);
            \Log::info('✅ Transaction created successfully', ['id' => $transaction->id]);

            return response()->json([
                'success' => true,
                'message' => 'Expense transaction created successfully',
                'data' => $transaction->load(['user', 'category'])
            ], 201);
        } catch (\Exception $e) {
            \Log::error('❌ Exception in createExpense', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create expense transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSummary(Request $request)
    {
        $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly
        
        $query = Transaction::approved();
        
        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', today());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->whereMonth('transaction_date', now()->month)
                      ->whereYear('transaction_date', now()->year);
                break;
            case 'yearly':
                $query->whereYear('transaction_date', now()->year);
                break;
        }

        $totalIncome = (clone $query)->income()->sum('amount');
        $totalExpense = (clone $query)->expense()->sum('amount');
        $netCashflow = $totalIncome - $totalExpense;

        // Get transactions by category
        $incomeByCategory = (clone $query)->where('transactions.type', 'income')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->get();

        $expenseByCategory = (clone $query)->where('transactions.type', 'expense')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_cashflow' => $netCashflow,
                'income_by_category' => $incomeByCategory,
                'expense_by_category' => $expenseByCategory
            ]
        ]);
    }

    public function approveTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending approval'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'approval_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'approval_notes' => $request->approval_notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction approved successfully',
            'data' => $transaction->load(['user', 'category', 'approvedBy'])
        ]);
    }

    public function rejectTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending approval'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'approval_notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'approval_notes' => $request->approval_notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction rejected successfully',
            'data' => $transaction->load(['user', 'category', 'approvedBy'])
        ]);
    }

    public function updateTransaction(Request $request, $id)
    {
        try {
            \Log::info('📥 updateTransaction called', ['id' => $id, 'request_data' => $request->except(['receipt_file'])]);
            
            $transaction = Transaction::findOrFail($id);

            $user = $request->user();
            
            // Check if user has permission to edit transactions
            $hasEditPermission = $this->hasTransactionPermission($user, $transaction->type, 'edit');
            
            // Super admin can edit any transaction
            $isSuperAdmin = $user->isSuperAdmin();
            
            // Only allow updating pending transactions OR if user has explicit permission
            if ($transaction->status !== 'pending' && !$isSuperAdmin && !$hasEditPermission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending transactions can be updated'
                ], 400);
            }

            // Parse metadata JSON string BEFORE validation
            $requestData = $request->all();
            if (isset($requestData['metadata']) && is_string($requestData['metadata'])) {
                $decoded = json_decode($requestData['metadata'], true);
                if (json_last_error() === JSON_ERROR_NONE && $decoded !== null) {
                    $requestData['metadata'] = $decoded;
                    \Log::info('✓ Metadata parsed successfully', ['metadata' => $decoded]);
                } else {
                    \Log::warning('⚠ Failed to parse metadata', ['error' => json_last_error_msg(), 'metadata' => $requestData['metadata']]);
                }
            }

            $validator = Validator::make($requestData, [
                'category_id' => 'sometimes|exists:categories,id',
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'sometimes|numeric|min:0',
                'transaction_date' => 'sometimes|date',
                'receipt_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
                'metadata' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                \Log::error('❌ Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Use parsed requestData instead of request->only()
            $updateData = collect($requestData)->only([
                'category_id', 'title', 'description', 'amount', 
                'transaction_date', 'metadata'
            ])->toArray();
            
            \Log::info('📊 Update data after filtering', ['update_data' => $updateData]);

            // Ensure transaction_date is saved correctly without timezone conversion
            // Validate and keep as-is if already in Y-m-d format
            if (isset($updateData['transaction_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $updateData['transaction_date'])) {
                // Already in correct format, keep it as-is to avoid timezone conversion
                // No need to convert
            }

            // Handle file upload
            if ($request->hasFile('receipt_file')) {
                // Delete old file if exists
                if ($transaction->receipt_file) {
                    Storage::disk('public')->delete($transaction->receipt_file);
                }
                
                $receiptPath = $request->file('receipt_file')->store('receipts', 'public');
                $updateData['receipt_file'] = $receiptPath;
                \Log::info('✓ File uploaded', ['path' => $receiptPath]);
            }

            \Log::info('💾 Updating transaction', ['id' => $id, 'data' => $updateData]);
            $transaction->update($updateData);
            \Log::info('✅ Transaction updated successfully', ['id' => $transaction->id]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction updated successfully',
                'data' => $transaction->load(['user', 'category'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('❌ Transaction not found', ['id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('❌ Exception in updateTransaction', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteTransaction(Request $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);

            $user = $request->user();
            
            // Check if user has permission to delete transactions
            $hasDeletePermission = $this->hasTransactionPermission($user, $transaction->type, 'delete');
            
            // Super admin can delete any transaction
            $isSuperAdmin = $user->isSuperAdmin();
            
            // Only allow deleting pending transactions OR if user has explicit permission
            if ($transaction->status !== 'pending' && !$isSuperAdmin && !$hasDeletePermission) {
                \Log::warning('⚠ Delete rejected: Transaction is not pending', ['id' => $id, 'status' => $transaction->status]);
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending transactions can be deleted'
                ], 400);
            }

            // Delete receipt file if exists
            if ($transaction->receipt_file) {
                Storage::disk('public')->delete($transaction->receipt_file);
                \Log::info('✓ Receipt file deleted', ['path' => $transaction->receipt_file]);
            }

            // Lepas FK bill_payments → transactions (supaya hapus tidak gagal error 1451)
            $unlinked = BillPayment::where('transaction_id', $transaction->id)->update(['transaction_id' => null]);
            if ($unlinked > 0) {
                \Log::info('✓ Unlinked bill_payments from transaction', ['transaction_id' => $id, 'rows' => $unlinked]);
            }

            \Log::info('🗑️ Deleting transaction', ['id' => $id]);
            $transaction->delete();
            \Log::info('✅ Transaction deleted successfully', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('❌ Transaction not found', ['id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('❌ Exception in deleteTransaction', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete transaction: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user has permission for transaction operations
     */
    private function hasTransactionPermission($user, $transactionType, $action)
    {
        if (!$user || !$user->roles) {
            return false;
        }

        // Map transaction type to module name
        $moduleName = $transactionType === 'income' ? 'pemasukan' : 'pengeluaran';
        
        // Check if user has the specific permission
        return $user->roles()->whereHas('permissions', function ($query) use ($moduleName, $action) {
            $query->where('name', "{$moduleName}.{$action}");
        })->exists();
    }

    /**
     * Normalize payment method to valid ENUM values
     * Maps various payment method formats to: cash, transfer, qris, credit_card
     */
    private function normalizePaymentMethod($paymentMethod)
    {
        if (empty($paymentMethod)) {
            return 'cash';
        }

        $method = strtolower(trim($paymentMethod));

        // Direct matches
        if (in_array($method, ['cash', 'transfer', 'qris', 'credit_card'])) {
            return $method;
        }

        // Map common variations
        if ($method === 'card' || $method === 'kartu' || $method === 'credit card') {
            return 'credit_card';
        }

        // If contains bank name or transfer keyword, map to transfer
        if (preg_match('/bank|transfer|bca|bni|mandiri|bri|syariah|rekening/i', $paymentMethod)) {
            return 'transfer';
        }

        // Default to cash
        return 'cash';
    }
}