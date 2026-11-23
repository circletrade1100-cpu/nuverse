<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payroll;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollSeeder extends Seeder
{
    /**
     * Jalankan database seeder.
     */
    public function run(): void
    {
        // Kosongkan tabel terlebih dahulu (opsional)
        DB::table('payroll')->truncate();

        // Data sample
        $data = [
            [
                'guru_id' => 10,
                'gaji_pokok' => 5000000,
                'jabatan' => 8350000,
                'masa_kerja' => 250000,
                'wali_kelas' => 0,
                'koordinator' => 0,
                'tatap_muka' => 200000,
                't_muka_pengganti' => 0,
                'transport1' => 300000,
                'transport2' => 200000,
                'makan' => 150000,
                'jamsostek' => 250000,
                'overtime' => 100000,
                'pramuka' => 50000,
                'ekskul' => 75000,
                'bimbel' => 100000,
                'status' => 'Draft',
                'created_date' => Carbon::now(),
                'created_by' => 'admin'
            ],
            [
                'guru_id' => 9,
                'gaji_pokok' => 4800000,
                'jabatan' => 4000000,
                'masa_kerja' => 250000,
                'wali_kelas' => 0,
                'koordinator' => 0,
                'tatap_muka' => 0,
                't_muka_pengganti' => 100000,
                'transport1' => 250000,
                'transport2' => 150000,
                'makan' => 130000,
                'jamsostek' => 200000,
                'overtime' => 50000,
                'pramuka' => 50000,
                'ekskul' => 50000,
                'bimbel' => 0,
                'status' => 'Draft',
                'created_date' => Carbon::now(),
                'created_by' => 'admin'
            ],
            [
                'guru_id' => 10,
                'gaji_pokok' => 5500000,
                'jabatan' => 4000000,
                'masa_kerja' => 250000,
                'wali_kelas' => 0,
                'koordinator' => 0,
                'tatap_muka' => 220000,
                't_muka_pengganti' => 0,
                'transport1' => 350000,
                'transport2' => 250000,
                'makan' => 160000,
                'jamsostek' => 280000,
                'overtime' => 80000,
                'pramuka' => 0,
                'ekskul' => 100000,
                'bimbel' => 50000,
                'status' => 'Disetujui',
                'created_date' => Carbon::now(),
                'created_by' => 'admin'
            ],
            [
                'guru_id' => 9,
                'gaji_pokok' => 4700000,
                'jabatan' => 4000000,
                'masa_kerja' => 250000,
                'wali_kelas' => 0,
                'koordinator' => 0,
                'tatap_muka' => 0,
                't_muka_pengganti' => 0,
                'transport1' => 200000,
                'transport2' => 100000,
                'makan' => 120000,
                'jamsostek' => 180000,
                'overtime' => 40000,
                'pramuka' => 30000,
                'ekskul' => 40000,
                'bimbel' => 0,
                'status' => 'Dibayar',
                'created_date' => Carbon::now(),
                'created_by' => 'admin'
            ],
            [
                'guru_id' => 10,
                'gaji_pokok' => 6000000,
                'jabatan' => 5000000,
                'masa_kerja' => 250000,
                'wali_kelas' => 0,
                'koordinator' => 0,
                'tatap_muka' => 0,
                't_muka_pengganti' => 0,
                'transport1' => 400000,
                'transport2' => 300000,
                'makan' => 180000,
                'jamsostek' => 300000,
                'overtime' => 120000,
                'pramuka' => 70000,
                'ekskul' => 80000,
                'bimbel' => 90000,
                'status' => 'Dibayar',
                'created_date' => Carbon::now(),
                'created_by' => 'admin'
            ],
        ];

        Payroll::insert($data);
    }
}
