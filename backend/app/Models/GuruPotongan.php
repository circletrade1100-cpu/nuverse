<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuruPotongan extends Model
{
    use HasFactory;

    protected $table = 'guru_potongan';
    public $timestamps = false;
    protected $fillable = [
        'id_guru',
        'id_potongan',
        'created_date',
    ];

    protected $dates = ['created_date'];

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'id_guru', 'id_guru');
    }

    public function potongan()
    {
        return $this->belongsTo(PayrollPotongan::class, 'id_potongan', 'id_potongan');
    }
}
