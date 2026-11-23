<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'rapbs_plan_id',
        'note_type',
        'title',
        'content',
        'created_by',
    ];

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
     * Scope to filter by note type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('note_type', $type);
    }
}

