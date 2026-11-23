<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetBreakdown extends Model
{
    use HasFactory;

    protected $fillable = [
        'rapbs_plan_id',
        'item_name',
        'quantity',
        'unit_price',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the RAPBS plan
     */
    public function rapbsPlan(): BelongsTo
    {
        return $this->belongsTo(RapbsPlan::class);
    }

    /**
     * Boot method to auto-calculate total amount
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($breakdown) {
            $breakdown->total_amount = $breakdown->quantity * $breakdown->unit_price;
        });
    }
}

