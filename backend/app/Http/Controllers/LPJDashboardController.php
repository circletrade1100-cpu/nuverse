<?php

namespace App\Http\Controllers;

use App\Models\Lpj;
use App\Models\RapbsPlan;
use App\Models\RapbsRealization;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LPJDashboardController extends Controller
{
    /**
     * Get LPJ dashboard data
     */
    public function index(Request $request)
    {
        $academicYearId = $request->get('academic_year_id');
        
        // Filter berdasarkan unit_kerja user yang login (kecuali Super Admin)
        $user = Auth::user();
        $isSuperAdmin = $user && $user->roles()->where('name', 'Super Administrator')->exists();
        
        $query = Lpj::query();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_kerja) {
            $unitKerja = \App\Models\UnitKerja::where('nama', $user->profile->unit_kerja)->first();
            if ($unitKerja) {
                $query->where('unit_kerja_id', $unitKerja->id);
            }
        }
        
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        } else {
            // Default to active academic year
            $activeYear = AcademicYear::where('status', 'active')->first();
            if ($activeYear) {
                $query->where('academic_year_id', $activeYear->id);
            }
        }

        // Total LPJ
        $totalLpj = $query->count();

        // LPJ by status
        $statusSummary = $query->clone()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // LPJ by periode type
        $periodeTypeSummary = $query->clone()
            ->select('periode_type', DB::raw('COUNT(*) as count'))
            ->groupBy('periode_type')
            ->get()
            ->pluck('count', 'periode_type')
            ->toArray();

        // Recent LPJs
        $recentLpjs = $query->clone()
            ->with(['academicYear', 'unitKerja'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Approval rate
        $totalSubmitted = $query->clone()
            ->whereIn('status', ['submitted', 'approved_by_principal', 'approved_by_dirpen', 'approved', 'finalized'])
            ->count();
        
        $totalApproved = $query->clone()
            ->whereIn('status', ['approved', 'finalized'])
            ->count();
        
        $approvalRate = $totalSubmitted > 0 ? ($totalApproved / $totalSubmitted) * 100 : 0;

        // LPJ trend by month
        $lpjTrend = $query->clone()
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_lpj' => $totalLpj,
                'status_summary' => $statusSummary,
                'periode_type_summary' => $periodeTypeSummary,
                'approval_rate' => round($approvalRate, 2),
                'recent_lpjs' => $recentLpjs,
                'lpj_trend' => $lpjTrend
            ]
        ]);
    }
}
