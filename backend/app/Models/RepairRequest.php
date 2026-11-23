<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'requester_id',
        'request_date',
        'problem_description',
        'priority',
        'estimated_cost',
        'status',
        'assigned_technician_id',
        'start_date',
        'completion_date',
        'actual_cost',
        'notes',
    ];

    protected $casts = [
        'request_date' => 'date',
        'start_date' => 'date',
        'completion_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    /**
     * Get the inventory item
     */
    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    /**
     * Get the requester
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * Get the assigned technician
     */
    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    /**
     * Get the repair request images
     */
    public function images()
    {
        return $this->hasMany(RepairRequestImage::class)->orderBy('sort_order');
    }
}

