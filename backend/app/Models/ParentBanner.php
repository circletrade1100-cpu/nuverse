<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentBanner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'subtitle',
        'image_path',
        'mobile_image_path',
        'button_text',
        'button_link',
        'bg_color',
        'is_active',
        'sort_order',
        'start_date',
        'end_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the user who created this banner
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get only active banners
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get current banners (within date range)
     */
    public function scopeCurrent($query)
    {
        return $query->where(function($q) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', now()->toDateString());
        })->where(function($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', now()->toDateString());
        });
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Get the appropriate image based on device
     */
    public function getImageUrl($isMobile = false)
    {
        $path = $isMobile && $this->mobile_image_path ? $this->mobile_image_path : $this->image_path;
        
        if (!$path) {
            return null;
        }

        // If path starts with http, return as is
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        // Otherwise, return storage URL
        return asset('storage/' . $path);
    }
}

