<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalTemplate extends Model
{
    protected $fillable = [
        'template_name',
        'source_module',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function details()
    {
        return $this->hasMany(JournalTemplateDetail::class, 'template_id');
    }
}
