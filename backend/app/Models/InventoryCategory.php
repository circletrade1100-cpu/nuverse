<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'parent_id',
    ];

    /**
     * Get the parent category
     */
    public function parent()
    {
        return $this->belongsTo(InventoryCategory::class, 'parent_id');
    }

    /**
     * Get the child categories
     */
    public function children()
    {
        return $this->hasMany(InventoryCategory::class, 'parent_id');
    }

    /**
     * Get all inventory items in this category
     */
    public function items()
    {
        return $this->hasMany(InventoryItem::class, 'category_id');
    }
}

