<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $fillable = [
        'nama_bank',
        'nomor_rekening',
    ];

    protected $casts = [
        'nama_bank' => 'string',
        'nomor_rekening' => 'string',
    ];
}
