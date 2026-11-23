<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get all RAPBS plans for this academic year
     */
    public function rapbsPlans(): HasMany
    {
        return $this->hasMany(RapbsPlan::class);
    }

    /**
     * Scope to get only active academic years
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

