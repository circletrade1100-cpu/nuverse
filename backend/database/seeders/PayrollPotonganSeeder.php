<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayrollPotonganSeeder extends Seeder
{
    public function run()
    {
        DB::table('payroll_potongan')->insert([
            [
                'nama_potongan' => 'Potongan BPJS',
                'jumlah'        => 100000,
                'created_by'    => 'system',
                'created_date'  => Carbon::now(),
            ],
            [
                'nama_potongan' => 'Potongan Koperasi/Iuran Wajib',
                'jumlah'        => 30000,
                'created_by'    => 'system',
                'created_date'  => Carbon::now(),
            ],
            [
                'nama_potongan' => 'Angsuran Hutang',
                'jumlah'        => 525000,
                'created_by'    => 'system',
                'created_date'  => Carbon::now(),
            ],
        ]);
    }
}
