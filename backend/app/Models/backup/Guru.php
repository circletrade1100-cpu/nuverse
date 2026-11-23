<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Guru extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'nama_lengkap',
        'nip',
        'jabatan_id',
        'status',
        'tmt',
        'unit_sekolah_id',
        'tempat_lahir',
        'tanggal_lahir',
        'jenjang_pendidikan',
        'jurusan',
        'status_pernikahan',
        'tugas_tambahan',
        'mapel_diampu',
        'jam_mengajar',
        'email',
        'no_telepon',
        'alamat',
        'avatar',
        'username',
        'password',
        // Payroll fields
        'gaji_pokok',
        'tunjangan_jabatan',
        'tunjangan_masa_kerja',
        'wali_kelas',
        'koordinator',
        'tatap_muka',
        't_muka_pengganti',
        'tunj_keluarga',
        'transport1',
        'transport2',
        'makan',
        'jamsostek',
        'overtime',
        'pramuka',
        'tunj_lain',
        'ekskul',
        'bpjs',
        'bimbel',
        'proyek',
        'insentif_peng_pramuka',
        'insentif_peng_ekskul',
        'insentif_peng_proyek',
        'insentif_pengurus_bimbel',
        'insentif_lain',
        'potongan_yayasan',
        'potongan_lain',
        'potongan_koperasi_wajib',
        'potongan_koperasi_sukarela',
        'potongan_angsuran_koperasi',
        'deposit_annurmart',
        'potongan_jht',
        'potongan_pph21',
        'potongan_t_muka_pengganti',
        // Bank fields
        'nama_bank',
        'no_rekening'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'mapel_diampu' => 'array',
        // Don't cast tmt and tanggal_lahir as 'date' to avoid timezone conversion
        // We'll handle formatting via accessors instead
        'jam_mengajar' => 'integer',
        'password' => 'hashed',
        // Payroll fields as integer/decimal
        'gaji_pokok' => 'integer',
        'tunjangan_jabatan' => 'integer',
        'tunjangan_masa_kerja' => 'integer',
        'wali_kelas' => 'integer',
        'koordinator' => 'integer',
        'tatap_muka' => 'string',
        't_muka_pengganti' => 'string',
        'tunj_keluarga' => 'integer',
        'transport1' => 'integer',
        'transport2' => 'integer',
        'makan' => 'integer',
        'jamsostek' => 'integer',
        'overtime' => 'integer',
        'pramuka' => 'integer',
        'tunj_lain' => 'integer',
        'ekskul' => 'integer',
        'bpjs' => 'integer',
        'bimbel' => 'integer',
        'proyek' => 'integer',
        'insentif_peng_pramuka' => 'integer',
        'insentif_peng_ekskul' => 'integer',
        'insentif_peng_proyek' => 'integer',
        'insentif_pengurus_bimbel' => 'integer',
        'insentif_lain' => 'integer',
        'potongan_yayasan' => 'integer',
        'potongan_lain' => 'integer',
        'potongan_koperasi_wajib' => 'integer',
        'potongan_koperasi_sukarela' => 'integer',
        'potongan_angsuran_koperasi' => 'integer',
        'deposit_annurmart' => 'integer',
        'potongan_jht' => 'integer',
        'potongan_pph21' => 'integer',
        'potongan_t_muka_pengganti' => 'integer',
    ];

    protected $appends = ['masa_kerja'];

    /**
     * Get tanggal_lahir in YYYY-MM-DD format without timezone conversion
     */
    public function getTanggalLahirAttribute($value)
    {
        // Get raw value from database (without cast conversion)
        $rawValue = $this->attributes['tanggal_lahir'] ?? null;
        
        if (!$rawValue) {
            return null;
        }
        
        // Extract date part (YYYY-MM-DD) if contains time
        return explode(' ', $rawValue)[0];
    }

    /**
     * Get tmt in YYYY-MM-DD format without timezone conversion
     */
    public function getTmtAttribute($value)
    {
        // Get raw value from database (without cast conversion)
        $rawValue = $this->attributes['tmt'] ?? null;
        
        if (!$rawValue) {
            return null;
        }
        
        // Extract date part (YYYY-MM-DD) if contains time
        return explode(' ', $rawValue)[0];
    }

    public function getMasaKerjaAttribute()
    {
        // Get raw TMT value and parse as Carbon for calculation
        $tmtRaw = $this->attributes['tmt'] ?? null;
        if (!$tmtRaw) {
            return null;
        }
        
        // Parse raw date string to Carbon (without timezone conversion)
        $tmt = \Carbon\Carbon::parse($tmtRaw);
        $now = now();
        
        // If TMT is in the future, return "0 bulan"
        if ($now->lt($tmt)) {
            return "0 bulan";
        }
        
        // Simple and reliable calculation
        $years = $now->year - $tmt->year;
        $months = $now->month - $tmt->month;
        $days = $now->day - $tmt->day;
        
        // Adjust for negative days
        if ($days < 0) {
            $months--;
            $days += $now->copy()->subMonth()->daysInMonth;
        }
        
        // Adjust for negative months
        if ($months < 0) {
            $years--;
            $months += 12;
        }
        
        // If less than 1 month, calculate days
        if ($years == 0 && $months == 0) {
            $totalDays = $now->diffInDays($tmt);
            if ($totalDays == 0) {
                return "1 hari";
            } elseif ($totalDays < 30) {
                return "{$totalDays} hari";
            } else {
                return "1 bulan";
            }
        }
        
        if ($years > 0) {
            return $months > 0 ? "{$years} tahun {$months} bulan" : "{$years} tahun";
        } else {
            return "{$months} bulan";
        }
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Aktif');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByUnitSekolah($query, $unitSekolahId)
    {
        return $query->where('unit_sekolah_id', $unitSekolahId);
    }

    public function scopeByJabatan($query, $jabatan)
    {
        return $query->where('jabatan_id', $jabatan);
    }

    // Relasi ke model Jabatan
    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    // Relasi ke model UnitSekolah
    public function unitSekolah(): BelongsTo
    {
        return $this->belongsTo(UnitSekolah::class);
    }

    // Relasi ke model Absensi
    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class, 'id_guru');
    }
}
