<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RapbsPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year_id',
        'activity_category_id',
        'funding_source_id',
        'unit_kerja_id',
        'title',
        'description',
        'planned_amount',
        'realized_amount',
        'priority',
        'status',
        'submitted_by',
        'approved_by',
        'approved_at',
        // Multi-level approval fields
        'approved_by_principal',
        'approved_by_principal_at',
        'rejection_notes_principal',
        'approved_by_dirpen',
        'approved_by_dirpen_at',
        'rejection_notes_dirpen',
        'approved_by_director',
        'approved_by_director_at',
        'rejection_notes_director',
    ];

    protected $casts = [
        'planned_amount' => 'decimal:2',
        'realized_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'approved_by_principal_at' => 'datetime',
        'approved_by_dirpen_at' => 'datetime',
        'approved_by_director_at' => 'datetime',
    ];

    protected $with = ['academicYear', 'activityCategory', 'fundingSource', 'unitKerja'];

    /**
     * Get the academic year
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the activity category
     */
    public function activityCategory(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class);
    }

    /**
     * Get the funding source
     */
    public function fundingSource(): BelongsTo
    {
        return $this->belongsTo(FundingSource::class);
    }

    /**
     * Get the unit kerja
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_kerja_id');
    }

    /**
     * Get the user who submitted
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the user who approved
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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
     * Get budget breakdowns
     */
    public function budgetBreakdowns(): HasMany
    {
        return $this->hasMany(BudgetBreakdown::class);
    }

    /**
     * Get documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(RapbsDocument::class);
    }

    /**
     * Get realizations
     */
    public function realizations(): HasMany
    {
        return $this->hasMany(RapbsRealization::class);
    }

    /**
     * Get activity notes
     */
    public function activityNotes(): HasMany
    {
        return $this->hasMany(ActivityNote::class);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Get total realization amount
     */
    public function getTotalRealizationAttribute()
    {
        return $this->realizations()->sum('amount');
    }

    /**
     * Get remaining budget
     */
    public function getRemainingBudgetAttribute()
    {
        return $this->planned_amount - $this->total_realization;
    }
}

