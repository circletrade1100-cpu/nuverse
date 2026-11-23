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
            $table->integer('potongan_yayasan')->default(0)->after('insentif_pengurus_bimbel');
            $table->integer('potongan_lain')->default(0)->after('potongan_yayasan');
            $table->integer('potongan_koperasi_wajib')->default(0)->after('potongan_lain');
            $table->integer('potongan_koperasi_sukarela')->default(0)->after('potongan_koperasi_wajib');
            $table->integer('potongan_angsuran_koperasi')->default(0)->after('potongan_koperasi_sukarela');
            $table->integer('deposit_annurmart')->default(0)->after('potongan_angsuran_koperasi');
            $table->integer('potongan_jht')->default(0)->after('deposit_annurmart');
            $table->integer('potongan_pph21')->default(0)->after('potongan_jht');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn([
                'potongan_yayasan',
                'potongan_lain',
                'potongan_koperasi_wajib',
                'potongan_koperasi_sukarela',
                'potongan_angsuran_koperasi',
                'deposit_annurmart',
                'potongan_jht',
                'potongan_pph21'
            ]);
        });
    }
};
