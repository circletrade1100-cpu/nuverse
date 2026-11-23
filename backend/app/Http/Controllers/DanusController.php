<?php

namespace App\Http\Controllers;

use App\Models\BusinessUnit;
use App\Models\BusinessTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DanusController extends Controller
{
    /**
     * Get DANUS dashboard summary
     */
    public function dashboard(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        // Overall metrics
        $totalIncome = BusinessTransaction::income()
            ->byDateRange($startDate, $endDate)
            ->sum('amount');

        $totalExpense = BusinessTransaction::expense()
            ->byDateRange($startDate, $endDate)
            ->sum('amount');

        $netProfit = $totalIncome - $totalExpense;
        $profitMargin = $totalIncome > 0 ? ($netProfit / $totalIncome) * 100 : 0;

        // Business unit performance
        $unitPerformance = BusinessUnit::with(['transactions' => function($query) use ($startDate, $endDate) {
            $query->byDateRange($startDate, $endDate);
        }])->get()->map(function($unit) use ($startDate, $endDate) {
            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type_label,
                'total_income' => $unit->getTotalIncome($startDate, $endDate),
                'total_expense' => $unit->getTotalExpense($startDate, $endDate),
                'net_profit' => $unit->getNetProfit($startDate, $endDate),
                'profit_margin' => $unit->getProfitMargin($startDate, $endDate),
                'transaction_count' => $unit->transactions()->byDateRange($startDate, $endDate)->count()
            ];
        });

        // Recent transactions
        $recentTransactions = BusinessTransaction::with(['businessUnit', 'creator'])
            ->latest()
            ->limit(10)
            ->get();

        // Pending approvals
        $pendingApprovals = BusinessTransaction::pending()
            ->with(['businessUnit', 'creator'])
            ->count();

        // Monthly trend (last 6 months)
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            
            $monthlyTrend[] = [
                'month' => $monthStart->format('Y-m'),
                'month_label' => $monthStart->format('M Y'),
                'income' => BusinessTransaction::income()
                    ->byDateRange($monthStart, $monthEnd)
                    ->sum('amount'),
                'expense' => BusinessTransaction::expense()
                    ->byDateRange($monthStart, $monthEnd)
                    ->sum('amount')
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'net_profit' => $netProfit,
                    'profit_margin' => round($profitMargin, 2),
                    'pending_approvals' => $pendingApprovals,
                    'active_units' => BusinessUnit::active()->count()
                ],
                'unit_performance' => $unitPerformance,
                'recent_transactions' => $recentTransactions,
                'monthly_trend' => $monthlyTrend
            ]
        ]);
    }

    /**
     * Get profit & loss report
     */
    public function profitLoss(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());
        $businessUnitId = $request->get('business_unit_id');

        $query = BusinessTransaction::query();

        if ($businessUnitId) {
            $query->where('business_unit_id', $businessUnitId);
        }

        $query->byDateRange($startDate, $endDate);

        $income = $query->income()->sum('amount');
        $expense = $query->expense()->sum('amount');
        $netProfit = $income - $expense;
        $profitMargin = $income > 0 ? ($netProfit / $income) * 100 : 0;

        // Income breakdown by business unit
        $incomeBreakdown = BusinessUnit::with(['transactions' => function($q) use ($startDate, $endDate) {
            $q->income()->byDateRange($startDate, $endDate);
        }])->get()->map(function($unit) use ($startDate, $endDate) {
            return [
                'unit_name' => $unit->name,
                'amount' => $unit->getTotalIncome($startDate, $endDate)
            ];
        })->filter(fn($item) => $item['amount'] > 0);

        // Expense breakdown by business unit
        $expenseBreakdown = BusinessUnit::with(['transactions' => function($q) use ($startDate, $endDate) {
            $q->expense()->byDateRange($startDate, $endDate);
        }])->get()->map(function($unit) use ($startDate, $endDate) {
            return [
                'unit_name' => $unit->name,
                'amount' => $unit->getTotalExpense($startDate, $endDate)
            ];
        })->filter(fn($item) => $item['amount'] > 0);

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_income' => $income,
                    'total_expense' => $expense,
                    'net_profit' => $netProfit,
                    'profit_margin' => round($profitMargin, 2)
                ],
                'income_breakdown' => $incomeBreakdown,
                'expense_breakdown' => $expenseBreakdown
            ]
        ]);
    }

    /**
     * Get unit performance report
     */
    public function unitPerformance(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $units = BusinessUnit::with(['manager', 'transactions' => function($query) use ($startDate, $endDate) {
            $query->byDateRange($startDate, $endDate);
        }])->get()->map(function($unit) use ($startDate, $endDate) {
            $income = $unit->getTotalIncome($startDate, $endDate);
            $expense = $unit->getTotalExpense($startDate, $endDate);
            $netProfit = $income - $expense;
            $profitMargin = $income > 0 ? ($netProfit / $income) * 100 : 0;
            $budgetUtilization = $unit->monthly_budget ? 
                ($expense / $unit->monthly_budget) * 100 : 0;

            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type_label,
                'manager' => $unit->manager ? $unit->manager->name : 'Belum ditentukan',
                'status' => $unit->status_label,
                'monthly_budget' => $unit->monthly_budget,
                'total_income' => $income,
                'total_expense' => $expense,
                'net_profit' => $netProfit,
                'profit_margin' => round($profitMargin, 2),
                'budget_utilization' => round($budgetUtilization, 2),
                'transaction_count' => $unit->transactions()->byDateRange($startDate, $endDate)->count(),
                'efficiency_score' => $this->calculateEfficiencyScore($income, $expense, $unit->monthly_budget)
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $units
        ]);
    }

    /**
     * Get summary statistics
     */
    public function summary(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $stats = [
            'total_income' => BusinessTransaction::income()
                ->byDateRange($startDate, $endDate)
                ->sum('amount'),
            'total_expense' => BusinessTransaction::expense()
                ->byDateRange($startDate, $endDate)
                ->sum('amount'),
            'transaction_count' => BusinessTransaction::byDateRange($startDate, $endDate)->count(),
            'pending_count' => BusinessTransaction::pending()->count(),
            'active_units' => BusinessUnit::active()->count(),
            'total_units' => BusinessUnit::count()
        ];

        $stats['net_profit'] = $stats['total_income'] - $stats['total_expense'];
        $stats['profit_margin'] = $stats['total_income'] > 0 ? 
            ($stats['net_profit'] / $stats['total_income']) * 100 : 0;

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Calculate efficiency score for a business unit
     */
    private function calculateEfficiencyScore($income, $expense, $budget)
    {
        if ($income == 0) return 0;
        
        $profitMargin = (($income - $expense) / $income) * 100;
        $budgetEfficiency = $budget ? max(0, 100 - (($expense / $budget) * 100)) : 100;
        
        return round(($profitMargin + $budgetEfficiency) / 2, 2);
    }
}
