<?php

namespace App\Http\Controllers;

use App\Models\RapbsPlan;
use App\Models\RapbsRealization;
use App\Models\AcademicYear;
use App\Models\FundingSource;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RAPBSDashboardController extends Controller
{
    /**
     * Get RAPBS dashboard data
     */
    public function index(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Build query for plans
        $plansQuery = RapbsPlan::query();
        
        // Filter berdasarkan unit_kerja user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->roles()->where('name', 'Super Administrator')->exists();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                $plansQuery->where('unit_kerja_id', $unitKerja->id);
            }
        }
        
        if ($academicYearId) {
            $plansQuery->where('academic_year_id', $academicYearId);
        } elseif (!$startDate && !$endDate) {
            // Default to active academic year
            $activeYear = AcademicYear::where('status', 'active')->first();
            if ($activeYear) {
                $plansQuery->where('academic_year_id', $activeYear->id);
            }
        }

        // Get approved plans
        $approvedPlans = $plansQuery->where('status', 'approved')->get();

        // Calculate budget summary
        $totalBudget = $approvedPlans->sum('planned_amount');
        
        // Get total realization
        $realizationsQuery = RapbsRealization::query();
        if ($approvedPlans->isNotEmpty()) {
            $realizationsQuery->whereIn('rapbs_plan_id', $approvedPlans->pluck('id'));
        }
        
        if ($startDate) {
            $realizationsQuery->where('transaction_date', '>=', $startDate);
        }
        if ($endDate) {
            $realizationsQuery->where('transaction_date', '<=', $endDate);
        }

        $totalRealization = $realizationsQuery->sum('amount');
        $remainingBudget = $totalBudget - $totalRealization;
        $utilizationRate = $totalBudget > 0 ? ($totalRealization / $totalBudget) * 100 : 0;

        // Budget summary
        $budgetSummary = [
            'total_budget' => (float) $totalBudget,
            'total_realization' => (float) $totalRealization,
            'remaining_budget' => (float) $remainingBudget,
            'utilization_rate' => round($utilizationRate, 2)
        ];

        // Funding sources breakdown
        $fundingSources = [];
        $sources = FundingSource::active()->get();
        
        foreach ($sources as $source) {
            $sourceBudget = $approvedPlans
                ->where('funding_source_id', $source->id)
                ->sum('planned_amount');
            
            if ($sourceBudget > 0) {
                $sourceRealization = RapbsRealization::whereIn('rapbs_plan_id', 
                    $approvedPlans->where('funding_source_id', $source->id)->pluck('id')
                )->sum('amount');
                
                $fundingSources[] = [
                    'source' => $source->name,
                    'budget' => (float) $sourceBudget,
                    'realization' => (float) $sourceRealization,
                    'percentage' => $totalBudget > 0 ? round(($sourceBudget / $totalBudget) * 100, 1) : 0
                ];
            }
        }

        // Category breakdown
        $categoryBreakdown = [];
        $categories = ActivityCategory::where('budget_type', 'expense')->get();
        
        foreach ($categories as $category) {
            $categoryBudget = $approvedPlans
                ->where('activity_category_id', $category->id)
                ->sum('planned_amount');
            
            if ($categoryBudget > 0) {
                $categoryRealization = RapbsRealization::whereIn('rapbs_plan_id', 
                    $approvedPlans->where('activity_category_id', $category->id)->pluck('id')
                )->sum('amount');
                
                $categoryBreakdown[] = [
                    'category' => $category->name,
                    'budget' => (float) $categoryBudget,
                    'realization' => (float) $categoryRealization
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'budget_summary' => $budgetSummary,
                'funding_sources' => $fundingSources,
                'category_breakdown' => $categoryBreakdown
            ]
        ]);
    }
}

