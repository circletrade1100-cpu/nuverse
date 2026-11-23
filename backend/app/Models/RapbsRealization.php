<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RapbsRealization extends Model
{
    use HasFactory;

    protected $fillable = [
        'rapbs_plan_id',
        'transaction_date',
        'amount',
        'description',
        'vendor_name',
        'payment_method',
        'reference_number',
        'created_by',
        'status',
        'approved_by',
        'approved_at',
        'approval_notes',
        // Multi-level approval fields (mengikuti alur Rencana RAPBS)
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
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'approved_by_principal_at' => 'datetime',
        'approved_by_dirpen_at' => 'datetime',
        'approved_by_director_at' => 'datetime',
    ];

    protected $with = ['rapbsPlan', 'createdBy', 'documents'];

    /**
     * Get the RAPBS plan
     */
    public function rapbsPlan(): BelongsTo
    {
        return $this->belongsTo(RapbsPlan::class);
    }

    /**
     * Get the user who created
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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
     * Get the dirpen who approved (Level 2)
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
     * Get realization documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(RealizationDocument::class, 'realization_id');
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by payment method
     */
    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }
}

