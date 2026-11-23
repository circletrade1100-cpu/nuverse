<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairRequestImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'repair_request_id',
        'image_url',
        'image_name',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the repair request
     */
    public function repairRequest()
    {
        return $this->belongsTo(RepairRequest::class);
    }
}
