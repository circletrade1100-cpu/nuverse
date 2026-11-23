<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'filename',
        'original_name',
        'file_path',
        'mime_type',
        'file_size',
        'sort_order'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'sort_order' => 'integer'
    ];

    /**
     * Get the inventory item that owns the image
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the full URL for the image
     */
    public function getUrlAttribute(): string
    {
        return url('storage/' . $this->file_path);
    }

    /**
     * Get the image name for display
     */
    public function getNameAttribute(): string
    {
        return $this->original_name;
    }
}