<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollPotongan extends Model
{
    use HasFactory;

    protected $table = 'payroll_potongan';
    protected $primaryKey = 'id_potongan';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'guru_id',
        'nama_potongan',
        'jumlah',
        'periode_bulan',
        'periode_tahun',
        'created_by',
        'created_date',
    ];

    protected $dates = ['created_date'];
}
