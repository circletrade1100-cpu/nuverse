<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentAnnouncement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'excerpt',
        'category',
        'author',
        'thumbnail',
        'document_path',
        'is_pinned',
        'is_active',
        'published_at',
        'expires_at',
        'view_count',
        'sort_order',
        'read_time',
        'created_by',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'published_at' => 'date',
        'expires_at' => 'date',
    ];

    /**
     * Get the user who created this announcement
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to get only active announcements
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get announcements by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get pinned announcements
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    /**
     * Scope to get current announcements (not expired)
     */
    public function scopeCurrent($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>=', now()->toDateString());
        });
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }

    /**
     * Generate excerpt from content if not provided
     */
    public function generateExcerpt($length = 150)
    {
        if ($this->excerpt) {
            return $this->excerpt;
        }

        $content = strip_tags($this->content);
        return mb_substr($content, 0, $length) . (mb_strlen($content) > $length ? '...' : '');
    }
}

