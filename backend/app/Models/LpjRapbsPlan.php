<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LpjRapbsPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'lpj_id',
        'rapbs_plan_id',
        'notes',
    ];

    /**
     * Get the LPJ
     */
    public function lpj(): BelongsTo
    {
        return $this->belongsTo(Lpj::class);
    }

    /**
     * Get the RAPBS plan
     */
    public function rapbsPlan(): BelongsTo
    {
        return $this->belongsTo(RapbsPlan::class);
    }
}
