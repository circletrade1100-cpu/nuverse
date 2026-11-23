<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillLabel extends Model
{
    protected $fillable = [
        'bill_type_id',
        'label_name',
        'label_text',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the bill type that owns this label
     */
    public function billType(): BelongsTo
    {
        return $this->belongsTo(BillType::class);
    }

    /**
     * Scope untuk hanya label yang aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
