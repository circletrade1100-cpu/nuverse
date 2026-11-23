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
        Schema::table('payroll', function (Blueprint $table) {
            $table->integer('jml_hari_transport1')->default(0)->after('transport1');
            $table->integer('jml_hari_transport2')->default(0)->after('transport2');
            $table->integer('makan_hari')->default(0)->after('makan');
            $table->integer('overtime_hari')->default(0)->after('overtime');
            $table->integer('jml_jam_pramuka')->default(0)->after('pramuka');
            $table->integer('jml_jam_insentif_ekskul')->default(0)->after('ekskul');
            $table->integer('jml_jam_insentif_bimbel')->default(0)->after('bimbel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payroll', function (Blueprint $table) {
            $table->dropColumn([
                'jml_hari_transport1',
                'jml_hari_transport2',
                'makan_hari',
                'overtime_hari',
                'jml_jam_pramuka',
                'jml_jam_insentif_ekskul',
                'jml_jam_insentif_bimbel'
            ]);
        });
    }
};
