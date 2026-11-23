<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lpj extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'unit_kerja_id',
        'periode_type',
        'periode_start_date',
        'periode_end_date',
        'title',
        'description',
        'status',
        'created_by',
        'submitted_at',
        'approved_by_principal',
        'approved_by_principal_at',
        'approved_by_dirpen',
        'approved_by_dirpen_at',
        'approved_by_director',
        'approved_by_director_at',
        'finalized_at',
        'rejection_notes_principal',
        'rejection_notes_dirpen',
        'rejection_notes_director',
    ];

    protected $casts = [
        'periode_start_date' => 'date',
        'periode_end_date' => 'date',
        'submitted_at' => 'datetime',
        'approved_by_principal_at' => 'datetime',
        'approved_by_dirpen_at' => 'datetime',
        'approved_by_director_at' => 'datetime',
        'finalized_at' => 'datetime',
    ];

    protected $with = ['academicYear', 'unitKerja', 'createdBy'];

    /**
     * Get the academic year
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the unit kerja
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_kerja_id');
    }

    /**
     * Get the user who created
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the principal who approved (Level 1)
     */
    public function approvedByPrincipal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_principal');
    }

    /**
     * Get the Dirpen who approved (Level 2)
     */
    public function approvedByDirpen(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_dirpen');
    }

    /**
     * Get the director who approved (Level 3 - Final)
     */
    public function approvedByDirector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_director');
    }

    /**
     * Get RAPBS plans included in this LPJ
     */
    public function rapbsPlans(): HasMany
    {
        return $this->hasMany(LpjRapbsPlan::class);
    }

    /**
     * Get documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(LpjDocument::class);
    }

    /**
     * Get notes
     */
    public function notes(): HasMany
    {
        return $this->hasMany(LpjNote::class);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by academic year
     */
    public function scopeByAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    /**
     * Scope to filter by unit kerja
     */
    public function scopeByUnitKerja($query, $unitKerjaId)
    {
        return $query->where('unit_kerja_id', $unitKerjaId);
    }

    /**
     * Get total planned amount from all included RAPBS plans
     */
    public function getTotalPlannedAmountAttribute()
    {
        return $this->rapbsPlans()
            ->join('rapbs_plans', 'lpj_rapbs_plans.rapbs_plan_id', '=', 'rapbs_plans.id')
            ->sum('rapbs_plans.planned_amount');
    }

    /**
     * Get total realized amount from all included RAPBS plans
     */
    public function getTotalRealizedAmountAttribute()
    {
        return $this->rapbsPlans()
            ->join('rapbs_plans', 'lpj_rapbs_plans.rapbs_plan_id', '=', 'rapbs_plans.id')
            ->join('rapbs_realizations', 'rapbs_plans.id', '=', 'rapbs_realizations.rapbs_plan_id')
            ->where('rapbs_realizations.status', 'approved')
            ->whereBetween('rapbs_realizations.transaction_date', [
                $this->periode_start_date,
                $this->periode_end_date
            ])
            ->sum('rapbs_realizations.amount');
    }
}
