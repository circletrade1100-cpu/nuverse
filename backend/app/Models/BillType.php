<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillType extends Model
{
    protected $fillable = [
        'name',
        'description', 
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all student bills for this bill type
     */
    public function studentBills(): HasMany
    {
        return $this->hasMany(StudentBill::class);
    }

    /**
     * Get all labels for this bill type
     */
    public function billLabels(): HasMany
    {
        return $this->hasMany(BillLabel::class);
    }

    /**
     * Scope untuk hanya jenis tagihan yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
