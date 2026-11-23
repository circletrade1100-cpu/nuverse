<?php

namespace App\Http\Controllers;

use App\Models\BusinessTransaction;
use App\Models\BusinessUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class BusinessTransactionController extends Controller
{
    /**
     * Display a listing of business transactions
     */
    public function index(Request $request)
    {
        $query = BusinessTransaction::with(['businessUnit', 'creator', 'approver']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        // Business unit filter
        if ($request->has('business_unit_id')) {
            $query->where('business_unit_id', $request->business_unit_id);
        }

        // Transaction type filter
        if ($request->has('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                            ->orderBy('created_at', 'desc')
                            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Store a newly created business transaction
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'business_unit_id' => 'required|exists:business_units,id',
            'transaction_type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string',
            'transaction_date' => 'required|date',
            'payment_method' => 'required|in:cash,transfer,card',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = BusinessTransaction::create([
            ...$request->all(),
            'created_by' => Auth::id(),
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => $transaction->load(['businessUnit', 'creator'])
        ], 201);
    }

    /**
     * Display the specified business transaction
     */
    public function show($id)
    {
        $transaction = BusinessTransaction::with(['businessUnit', 'creator', 'approver'])
                                        ->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    /**
     * Update the specified business transaction
     */
    public function update(Request $request, $id)
    {
        $transaction = BusinessTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        // Only allow updates for pending transactions
        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update approved or completed transactions'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'business_unit_id' => 'sometimes|required|exists:business_units,id',
            'transaction_type' => 'sometimes|required|in:income,expense',
            'amount' => 'sometimes|required|numeric|min:0.01',
            'description' => 'sometimes|required|string',
            'transaction_date' => 'sometimes|required|date',
            'payment_method' => 'sometimes|required|in:cash,transfer,card',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Transaction updated successfully',
            'data' => $transaction->load(['businessUnit', 'creator'])
        ]);
    }

    /**
     * Remove the specified business transaction
     */
    public function destroy($id)
    {
        $transaction = BusinessTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        // Only allow deletion of pending transactions
        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved or completed transactions'
            ], 400);
        }

        $transaction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction deleted successfully'
        ]);
    }

    /**
     * Approve a transaction
     */
    public function approve(Request $request, $id)
    {
        $transaction = BusinessTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending'
            ], 400);
        }

        $transaction->approve(Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Transaction approved successfully',
            'data' => $transaction->load(['businessUnit', 'creator', 'approver'])
        ]);
    }

    /**
     * Reject a transaction
     */
    public function reject(Request $request, $id)
    {
        $transaction = BusinessTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not pending'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction->reject(Auth::id(), $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Transaction rejected successfully',
            'data' => $transaction->load(['businessUnit', 'creator', 'approver'])
        ]);
    }

    /**
     * Complete a transaction
     */
    public function complete($id)
    {
        $transaction = BusinessTransaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        if ($transaction->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Transaction must be approved first'
            ], 400);
        }

        $transaction->complete();

        return response()->json([
            'success' => true,
            'message' => 'Transaction completed successfully',
            'data' => $transaction->load(['businessUnit', 'creator', 'approver'])
        ]);
    }

    /**
     * Get income transactions
     */
    public function income(Request $request)
    {
        $query = BusinessTransaction::income()
                                  ->with(['businessUnit', 'creator', 'approver']);

        if ($request->has('business_unit_id')) {
            $query->where('business_unit_id', $request->business_unit_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                             ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Get expense transactions
     */
    public function expense(Request $request)
    {
        $query = BusinessTransaction::expense()
                                   ->with(['businessUnit', 'creator', 'approver']);

        if ($request->has('business_unit_id')) {
            $query->where('business_unit_id', $request->business_unit_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                             ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Get pending transactions for approval
     */
    public function pending(Request $request)
    {
        $query = BusinessTransaction::pending()
                                   ->with(['businessUnit', 'creator']);

        if ($request->has('business_unit_id')) {
            $query->where('business_unit_id', $request->business_unit_id);
        }

        $transactions = $query->orderBy('created_at', 'asc')
                             ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }
}
