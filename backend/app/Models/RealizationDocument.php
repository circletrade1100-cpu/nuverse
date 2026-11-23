<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RealizationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'realization_id',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'validation_status',
        'validated_by',
        'validated_at',
        'notes',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'validated_at' => 'datetime',
    ];

    /**
     * Get the realization
     */
    public function realization(): BelongsTo
    {
        return $this->belongsTo(RapbsRealization::class, 'realization_id');
    }

    /**
     * Get the user who validated
     */
    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Scope to get pending documents
     */
    public function scopePending($query)
    {
        return $query->where('validation_status', 'pending');
    }

    /**
     * Scope to get validated documents
     */
    public function scopeValidated($query)
    {
        return $query->where('validation_status', 'validated');
    }
}

