<?php

namespace App\Http\Controllers;

use App\Models\BusinessUnit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BusinessUnitController extends Controller
{
    /**
     * Display a listing of business units
     */
    public function index(Request $request)
    {
        $query = BusinessUnit::with(['manager']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $businessUnits = $query->orderBy('created_at', 'desc')
                             ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $businessUnits
        ]);
    }

    /**
     * Store a newly created business unit
     */
    public function store(Request $request)
    {
        // Debug authentication
        $authHeader = $request->header('Authorization');
        $user = $request->user();
        $bearerToken = $request->bearerToken();
        
        \Log::info('BusinessUnit Store Request', [
            'auth_header' => $authHeader,
            'bearer_token' => $bearerToken ? substr($bearerToken, 0, 20) . '...' : 'null',
            'user' => $user ? $user->id : 'null',
            'user_name' => $user ? $user->name : 'null',
            'data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'type' => 'required|in:catering,swimming_pool,canteen,other',
            'manager_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
            'description' => 'nullable|string',
            'monthly_budget' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $businessUnit = BusinessUnit::create($request->all());

        \Log::info('BusinessUnit Created Successfully', [
            'id' => $businessUnit->id,
            'name' => $businessUnit->name,
            'type' => $businessUnit->type,
            'status' => $businessUnit->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Business unit created successfully',
            'data' => $businessUnit->load('manager')
        ], 201);
    }

    /**
     * Display the specified business unit
     */
    public function show($id)
    {
        $businessUnit = BusinessUnit::with(['manager', 'transactions' => function($query) {
            $query->latest()->limit(10);
        }])->find($id);

        if (!$businessUnit) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit not found'
            ], 404);
        }

        // Add performance metrics
        $businessUnit->total_income = $businessUnit->getTotalIncome();
        $businessUnit->total_expense = $businessUnit->getTotalExpense();
        $businessUnit->net_profit = $businessUnit->getNetProfit();
        $businessUnit->profit_margin = $businessUnit->getProfitMargin();

        return response()->json([
            'success' => true,
            'data' => $businessUnit
        ]);
    }

    /**
     * Update the specified business unit
     */
    public function update(Request $request, $id)
    {
        $businessUnit = BusinessUnit::find($id);

        if (!$businessUnit) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'type' => 'sometimes|required|in:catering,swimming_pool,canteen,other',
            'manager_id' => 'nullable|exists:users,id',
            'status' => 'sometimes|required|in:active,inactive',
            'description' => 'nullable|string',
            'monthly_budget' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $businessUnit->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Business unit updated successfully',
            'data' => $businessUnit->load('manager')
        ]);
    }

    /**
     * Remove the specified business unit
     */
    public function destroy($id)
    {
        $businessUnit = BusinessUnit::find($id);

        if (!$businessUnit) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit not found'
            ], 404);
        }

        // Check if business unit has transactions
        if ($businessUnit->transactions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete business unit with existing transactions'
            ], 400);
        }

        $businessUnit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Business unit deleted successfully'
        ]);
    }

    /**
     * Get business unit performance metrics
     */
    public function performance(Request $request, $id)
    {
        $businessUnit = BusinessUnit::find($id);

        if (!$businessUnit) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit not found'
            ], 404);
        }

        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $metrics = [
            'total_income' => $businessUnit->getTotalIncome($startDate, $endDate),
            'total_expense' => $businessUnit->getTotalExpense($startDate, $endDate),
            'net_profit' => $businessUnit->getNetProfit($startDate, $endDate),
            'profit_margin' => $businessUnit->getProfitMargin($startDate, $endDate),
            'transaction_count' => $businessUnit->transactions()
                ->byDateRange($startDate, $endDate)
                ->count(),
            'budget_utilization' => $businessUnit->monthly_budget ? 
                ($businessUnit->getTotalExpense($startDate, $endDate) / $businessUnit->monthly_budget) * 100 : 0
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics
        ]);
    }

    /**
     * Get available managers for business units
     */
    public function getManagers()
    {
        $managers = User::whereHas('roles', function($query) {
            $query->whereIn('name', ['manager', 'supervisor', 'admin']);
        })->select('id', 'name', 'email')->get();

        return response()->json([
            'success' => true,
            'data' => $managers
        ]);
    }

    /**
     * Get business unit types
     */
    public function getTypes()
    {
        $types = [
            ['value' => 'catering', 'label' => 'Catering'],
            ['value' => 'swimming_pool', 'label' => 'Kolam Renang'],
            ['value' => 'canteen', 'label' => 'Kantin'],
            ['value' => 'other', 'label' => 'Usaha Lainnya']
        ];

        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }
}
