<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RapbsDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'rapbs_plan_id',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the RAPBS plan
     */
    public function rapbsPlan(): BelongsTo
    {
        return $this->belongsTo(RapbsPlan::class);
    }

    /**
     * Get the user who uploaded
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

