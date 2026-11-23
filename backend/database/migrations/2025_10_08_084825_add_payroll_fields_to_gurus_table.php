<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            // Payroll fields
            $table->integer('gaji_pokok')->default(0)->after('password');
            $table->integer('tunjangan_jabatan')->default(0)->after('gaji_pokok');
            $table->integer('tunjangan_masa_kerja')->default(0)->after('tunjangan_jabatan');
            $table->integer('wali_kelas')->default(0)->after('tunjangan_masa_kerja');
            $table->integer('koordinator')->default(0)->after('wali_kelas');
            $table->integer('tatap_muka')->default(0)->after('koordinator');
            $table->integer('t_muka_pengganti')->default(0)->after('tatap_muka');
            $table->integer('tunj_keluarga')->default(0)->after('t_muka_pengganti');
            $table->integer('transport1')->default(0)->after('tunj_keluarga');
            $table->integer('transport2')->default(0)->after('transport1');
            $table->integer('makan')->default(0)->after('transport2');
            $table->integer('jamsostek')->default(0)->after('makan');
            $table->integer('overtime')->default(0)->after('jamsostek');
            $table->integer('pramuka')->default(0)->after('overtime');
            $table->integer('tunj_lain')->default(0)->after('pramuka');
            $table->integer('ekskul')->default(0)->after('tunj_lain');
            $table->integer('bpjs')->default(0)->after('ekskul');
            $table->integer('bimbel')->default(0)->after('bpjs');
            $table->integer('insentif_peng_pramuka')->default(0)->after('bimbel');
            $table->integer('insentif_peng_ekskul')->default(0)->after('insentif_peng_pramuka');
            $table->integer('insentif_peng_proyek')->default(0)->after('insentif_peng_ekskul');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn([
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
                'insentif_peng_pramuka',
                'insentif_peng_ekskul',
                'insentif_peng_proyek',
            ]);
        });
    }
};
