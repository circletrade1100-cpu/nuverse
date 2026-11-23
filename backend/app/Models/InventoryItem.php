<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_code',
        'name',
        'category_id',
        'sub_category',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'purchase_price',
        'current_value',
        'location',
        'status',
        'condition',
        'warranty_expiry',
        'supplier',
        'pic',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'purchase_price' => 'decimal:2',
        'current_value' => 'decimal:2',
    ];

    /**
     * Get the category
     */
    public function category()
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    /**
     * Get maintenance schedules
     */
    public function maintenanceSchedules()
    {
        return $this->hasMany(MaintenanceSchedule::class, 'item_id');
    }

    /**
     * Get repair requests
     */
    public function repairRequests()
    {
        return $this->hasMany(RepairRequest::class, 'item_id');
    }

    /**
     * Get images
     */
    public function images()
    {
        return $this->hasMany(InventoryImage::class)->orderBy('sort_order');
    }

    /**
     * Get depreciation logs
     */
    public function depreciationLogs()
    {
        return $this->hasMany(DepreciationLog::class, 'item_id')->orderBy('depreciation_date', 'desc');
    }

    /**
     * Get audit logs
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'item_id')->orderBy('audit_date', 'desc');
    }

    /**
     * Generate unique item code with retry mechanism
     */
    public static function generateItemCode($retries = 5)
    {
        $prefix = 'INV';
        $year = date('Y');
        
        for ($i = 0; $i < $retries; $i++) {
            $lastItem = self::withTrashed()
                ->where('item_code', 'like', "{$prefix}-{$year}-%")
                ->orderBy('item_code', 'desc')
                ->first();

            if ($lastItem) {
                $lastNumber = (int) substr($lastItem->item_code, -4);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }

            $itemCode = "{$prefix}-{$year}-{$newNumber}";
            
            // Check if this code already exists
            if (!self::where('item_code', $itemCode)->exists()) {
                return $itemCode;
            }
            
            // If code exists, try next number
            $newNumber = str_pad((int)$newNumber + 1, 4, '0', STR_PAD_LEFT);
            $itemCode = "{$prefix}-{$year}-{$newNumber}";
            
            if (!self::where('item_code', $itemCode)->exists()) {
                return $itemCode;
            }
        }
        
        // Fallback: use timestamp if all retries fail
        return "{$prefix}-{$year}-" . str_pad(mt_rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    }
}

