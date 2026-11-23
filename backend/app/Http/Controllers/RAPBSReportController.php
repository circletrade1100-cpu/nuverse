<?php

namespace App\Http\Controllers;

use App\Models\RapbsPlan;
use App\Models\RapbsRealization;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RAPBSReportController extends Controller
{
    /**
     * Get plan vs realization report
     */
    public function planVsRealization(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = RapbsPlan::with(['activityCategory', 'fundingSource'])
            ->where('status', 'approved');

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $plans = $query->get();

        $report = $plans->map(function($plan) use ($startDate, $endDate) {
            $realizationQuery = $plan->realizations();
            
            if ($startDate) {
                $realizationQuery->where('transaction_date', '>=', $startDate);
            }
            if ($endDate) {
                $realizationQuery->where('transaction_date', '<=', $endDate);
            }

            $totalRealization = $realizationQuery->sum('amount');
            $variance = $plan->planned_amount - $totalRealization;
            $variancePercent = $plan->planned_amount > 0 
                ? ($variance / $plan->planned_amount) * 100 
                : 0;

            return [
                'id' => $plan->id,
                'title' => $plan->title,
                'category' => $plan->activityCategory->name,
                'funding_source' => $plan->fundingSource->name,
                'planned_amount' => (float) $plan->planned_amount,
                'realization_amount' => (float) $totalRealization,
                'variance' => (float) $variance,
                'variance_percent' => round($variancePercent, 2),
                'status' => $variancePercent > 10 ? 'over_budget' : ($variancePercent < -10 ? 'under_budget' : 'on_track')
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }

    /**
     * Get realization summary report
     */
    public function realizationSummary(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = RapbsRealization::query();

        if ($academicYearId) {
            $query->whereHas('rapbsPlan', function($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }

        if ($startDate) {
            $query->where('transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('transaction_date', '<=', $endDate);
        }

        $totalRealization = $query->sum('amount');
        $totalTransactions = $query->count();

        // By payment method
        $byPaymentMethod = $query->clone()
            ->select('payment_method', DB::raw('SUM(amount) as total'))
            ->groupBy('payment_method')
            ->get();

        // By month
        $byMonth = $query->clone()
            ->select(
                DB::raw('DATE_FORMAT(transaction_date, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_realization' => (float) $totalRealization,
                'total_transactions' => $totalTransactions,
                'by_payment_method' => $byPaymentMethod,
                'by_month' => $byMonth
            ]
        ]);
    }

    /**
     * Get variance analysis
     */
    public function varianceAnalysis(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');

        $query = RapbsPlan::with(['activityCategory', 'fundingSource'])
            ->where('status', 'approved');

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $plans = $query->get();

        $analysis = [
            'over_budget' => [],
            'under_budget' => [],
            'on_track' => []
        ];

        foreach ($plans as $plan) {
            $totalRealization = $plan->realizations()->sum('amount');
            $variance = $plan->planned_amount - $totalRealization;
            $variancePercent = $plan->planned_amount > 0 
                ? ($variance / $plan->planned_amount) * 100 
                : 0;

            $item = [
                'id' => $plan->id,
                'title' => $plan->title,
                'category' => $plan->activityCategory->name,
                'planned_amount' => (float) $plan->planned_amount,
                'realization_amount' => (float) $totalRealization,
                'variance' => (float) $variance,
                'variance_percent' => round($variancePercent, 2)
            ];

            if ($variancePercent > 10) {
                $analysis['over_budget'][] = $item;
            } elseif ($variancePercent < -10) {
                $analysis['under_budget'][] = $item;
            } else {
                $analysis['on_track'][] = $item;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $analysis
        ]);
    }

    /**
     * Get performance report
     */
    public function performance(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');

        $query = RapbsPlan::query();

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        // Plan status summary
        $statusSummary = $query->clone()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Priority distribution
        $priorityDistribution = $query->clone()
            ->select('priority', DB::raw('COUNT(*) as count'))
            ->groupBy('priority')
            ->get();

        // Category performance
        $categoryPerformance = RapbsPlan::where('status', 'approved')
            ->when($academicYearId, function($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            })
            ->with('activityCategory')
            ->get()
            ->groupBy('activity_category_id')
            ->map(function($plans) {
                $totalPlanned = $plans->sum('planned_amount');
                $totalRealized = $plans->sum(function($plan) {
                    return $plan->realizations()->sum('amount');
                });
                $utilizationRate = $totalPlanned > 0 ? ($totalRealized / $totalPlanned) * 100 : 0;

                return [
                    'category' => $plans->first()->activityCategory->name,
                    'total_planned' => (float) $totalPlanned,
                    'total_realized' => (float) $totalRealized,
                    'utilization_rate' => round($utilizationRate, 2),
                    'plan_count' => $plans->count()
                ];
            })
            ->values();

        // Funding source utilization
        $fundingSourceUtilization = RapbsPlan::where('status', 'approved')
            ->when($academicYearId, function($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            })
            ->with('fundingSource')
            ->get()
            ->groupBy('funding_source_id')
            ->map(function($plans) {
                $totalPlanned = $plans->sum('planned_amount');
                $totalRealized = $plans->sum(function($plan) {
                    return $plan->realizations()->sum('amount');
                });
                $utilizationRate = $totalPlanned > 0 ? ($totalRealized / $totalPlanned) * 100 : 0;

                return [
                    'source' => $plans->first()->fundingSource->name,
                    'total_planned' => (float) $totalPlanned,
                    'total_realized' => (float) $totalRealized,
                    'utilization_rate' => round($utilizationRate, 2),
                    'plan_count' => $plans->count()
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'status_summary' => $statusSummary,
                'priority_distribution' => $priorityDistribution,
                'category_performance' => $categoryPerformance,
                'funding_source_utilization' => $fundingSourceUtilization
            ]
        ]);
    }
}

