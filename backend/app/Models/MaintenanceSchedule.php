<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'maintenance_type',
        'frequency',
        'last_maintenance',
        'next_maintenance',
        'technician_id',
        'technician_name',
        'estimated_duration',
        'required_materials',
        'checklist',
        'status',
        'notes',
    ];

    protected $casts = [
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
    ];

    /**
     * Get the inventory item
     */
    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    /**
     * Get the technician
     */
    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}

