<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GuruPotonganSeeder extends Seeder
{
    public function run()
    {
        DB::table('guru_potongan')->insert([
            [
                'id_guru'     => 9,
                'id_potongan' => 2,
                'created_date' => Carbon::now(),
            ],
            [
                'id_guru'     => 9,
                'id_potongan' => 3,
                'created_date' => Carbon::now(),
            ],
            [
                'id_guru'     => 9,
                'id_potongan' => 4,
                'created_date' => Carbon::now(),
            ],
            [
                'id_guru'     => 9,
                'id_potongan' => 5,
                'created_date' => Carbon::now(),
            ],
            [
                'id_guru'     => 9,
                'id_potongan' => 6,
                'created_date' => Carbon::now(),
            ],
        ]);
    }
}
