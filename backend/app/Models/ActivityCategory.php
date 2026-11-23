<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'parent_id',
        'budget_type',
    ];

    /**
     * Get the parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class, 'parent_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(ActivityCategory::class, 'parent_id');
    }

    /**
     * Get all RAPBS plans for this category
     */
    public function rapbsPlans(): HasMany
    {
        return $this->hasMany(RapbsPlan::class);
    }

    /**
     * Scope to filter by budget type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('budget_type', $type);
    }
}

