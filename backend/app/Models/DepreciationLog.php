<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepreciationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'depreciation_date',
        'depreciation_amount',
        'current_value',
        'previous_value',
        'method',
        'depreciation_rate',
        'useful_life_years',
        'salvage_value',
        'notes',
        'calculated_by'
    ];

    protected $casts = [
        'depreciation_date' => 'date',
        'depreciation_amount' => 'decimal:2',
        'current_value' => 'decimal:2',
        'previous_value' => 'decimal:2',
        'depreciation_rate' => 'decimal:2',
        'salvage_value' => 'decimal:2',
    ];

    /**
     * Get the inventory item that owns the depreciation log.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who calculated the depreciation.
     */
    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }

    /**
     * Calculate depreciation using straight line method
     */
    public static function calculateStraightLine($purchasePrice, $salvageValue, $usefulLife)
    {
        if ($usefulLife <= 0) {
            return 0;
        }
        
        return ($purchasePrice - $salvageValue) / $usefulLife;
    }

    /**
     * Calculate depreciation using declining balance method
     */
    public static function calculateDecliningBalance($currentValue, $depreciationRate)
    {
        return $currentValue * ($depreciationRate / 100);
    }

    /**
     * Calculate depreciation using units of production method
     */
    public static function calculateUnitsOfProduction($purchasePrice, $salvageValue, $totalUnits, $unitsUsed)
    {
        if ($totalUnits <= 0) {
            return 0;
        }
        
        $depreciationPerUnit = ($purchasePrice - $salvageValue) / $totalUnits;
        return $depreciationPerUnit * $unitsUsed;
    }
}