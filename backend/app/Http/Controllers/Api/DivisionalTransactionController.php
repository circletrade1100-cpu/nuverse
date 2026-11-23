<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DivisionalTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DivisionalTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = DivisionalTransaction::with(['unitKerja', 'fundingSource', 'creator']);

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by funding source
            if ($request->has('funding_source_id')) {
                $query->where('funding_source_id', $request->funding_source_id);
            }

            // Filter by transaction type
            if ($request->has('transaction_type')) {
                $query->where('transaction_type', $request->transaction_type);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('reference_number', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 15);
            $transactions = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'unit_kerja_id' => 'required|exists:unit_kerjas,id',
                'funding_source_id' => 'required|exists:funding_sources,id',
                'transaction_type' => 'required|in:income,expense',
                'amount' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'transaction_date' => 'required|date',
                'reference_number' => 'required|string|max:100|unique:divisional_transactions,reference_number',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction = DivisionalTransaction::create([
                'unit_kerja_id' => $request->unit_kerja_id,
                'funding_source_id' => $request->funding_source_id,
                'transaction_type' => $request->transaction_type,
                'amount' => $request->amount,
                'description' => $request->description,
                'transaction_date' => $request->transaction_date,
                'reference_number' => $request->reference_number,
                'created_by' => auth()->id() ?? 1,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil ditambahkan',
                'data' => $transaction->load(['unitKerja', 'fundingSource', 'creator'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $transaction = DivisionalTransaction::with(['unitKerja', 'fundingSource', 'creator'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $transaction = DivisionalTransaction::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'unit_kerja_id' => 'sometimes|required|exists:unit_kerjas,id',
                'funding_source_id' => 'sometimes|required|exists:funding_sources,id',
                'transaction_type' => 'sometimes|required|in:income,expense',
                'amount' => 'sometimes|required|numeric|min:0',
                'description' => 'nullable|string',
                'transaction_date' => 'sometimes|required|date',
                'reference_number' => 'sometimes|required|string|max:100|unique:divisional_transactions,reference_number,' . $id,
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diperbarui',
                'data' => $transaction->load(['unitKerja', 'fundingSource', 'creator'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $transaction = DivisionalTransaction::findOrFail($id);
            $transaction->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get income transactions
     */
    public function getIncome(Request $request)
    {
        try {
            $query = DivisionalTransaction::with(['unitKerja', 'fundingSource', 'creator'])
                ->where('transaction_type', 'income');

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by funding source
            if ($request->has('funding_source_id')) {
                $query->where('funding_source_id', $request->funding_source_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            $perPage = $request->get('per_page', 15);
            $transactions = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pemasukan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expense transactions
     */
    public function getExpense(Request $request)
    {
        try {
            $query = DivisionalTransaction::with(['unitKerja', 'fundingSource', 'creator'])
                ->where('transaction_type', 'expense');

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by funding source
            if ($request->has('funding_source_id')) {
                $query->where('funding_source_id', $request->funding_source_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            $perPage = $request->get('per_page', 15);
            $transactions = $query->orderBy('transaction_date', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get summary report
     */
    public function getSummary(Request $request)
    {
        try {
            $query = DivisionalTransaction::query();

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            $totalIncome = (clone $query)->where('transaction_type', 'income')->sum('amount');
            $totalExpense = (clone $query)->where('transaction_type', 'expense')->sum('amount');
            $balance = $totalIncome - $totalExpense;

            $incomeCount = (clone $query)->where('transaction_type', 'income')->count();
            $expenseCount = (clone $query)->where('transaction_type', 'expense')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'balance' => $balance,
                    'income_count' => $incomeCount,
                    'expense_count' => $expenseCount,
                    'total_transactions' => $incomeCount + $expenseCount,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil ringkasan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get funding source breakdown
     */
    public function getFundingBreakdown(Request $request)
    {
        try {
            $query = DivisionalTransaction::with('fundingSource');

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            $breakdown = $query->selectRaw('
                funding_source_id,
                SUM(CASE WHEN transaction_type = "income" THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN transaction_type = "expense" THEN amount ELSE 0 END) as total_expense,
                COUNT(*) as transaction_count
            ')
            ->groupBy('funding_source_id')
            ->get()
            ->map(function ($item) {
                $fundingSource = \App\Models\FundingSource::find($item->funding_source_id);
                return [
                    'funding_source_id' => $item->funding_source_id,
                    'funding_source_name' => $fundingSource ? $fundingSource->name : 'Unknown',
                    'total_income' => $item->total_income,
                    'total_expense' => $item->total_expense,
                    'balance' => $item->total_income - $item->total_expense,
                    'transaction_count' => $item->transaction_count,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $breakdown
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil breakdown sumber dana',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get expense analysis
     */
    public function getExpenseAnalysis(Request $request)
    {
        try {
            $query = DivisionalTransaction::with(['unitKerja', 'fundingSource'])
                ->where('transaction_type', 'expense');

            // Filter by unit kerja
            if ($request->has('unit_kerja_id')) {
                $query->where('unit_kerja_id', $request->unit_kerja_id);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('transaction_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('transaction_date', '<=', $request->end_date);
            }

            // By Unit Kerja
            $byUnitKerja = (clone $query)->selectRaw('
                unit_kerja_id,
                SUM(amount) as total_expense,
                COUNT(*) as transaction_count,
                AVG(amount) as average_expense
            ')
            ->groupBy('unit_kerja_id')
            ->get()
            ->map(function ($item) {
                $unitKerja = \App\Models\UnitKerja::find($item->unit_kerja_id);
                return [
                    'unit_kerja_id' => $item->unit_kerja_id,
                    'unit_kerja_name' => $unitKerja ? $unitKerja->nama : 'Unknown',
                    'total_expense' => $item->total_expense,
                    'transaction_count' => $item->transaction_count,
                    'average_expense' => $item->average_expense,
                ];
            });

            // By Funding Source
            $byFundingSource = (clone $query)->selectRaw('
                funding_source_id,
                SUM(amount) as total_expense,
                COUNT(*) as transaction_count
            ')
            ->groupBy('funding_source_id')
            ->get()
            ->map(function ($item) {
                $fundingSource = \App\Models\FundingSource::find($item->funding_source_id);
                return [
                    'funding_source_id' => $item->funding_source_id,
                    'funding_source_name' => $fundingSource ? $fundingSource->name : 'Unknown',
                    'total_expense' => $item->total_expense,
                    'transaction_count' => $item->transaction_count,
                ];
            });

            // Monthly trend
            $monthlyTrend = (clone $query)->selectRaw('
                DATE_FORMAT(transaction_date, "%Y-%m") as month,
                SUM(amount) as total_expense,
                COUNT(*) as transaction_count
            ')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'by_unit_kerja' => $byUnitKerja,
                    'by_funding_source' => $byFundingSource,
                    'monthly_trend' => $monthlyTrend,
                    'total_expense' => $query->sum('amount'),
                    'total_transactions' => $query->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil analisis pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
