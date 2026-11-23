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
            $table->enum('nama_bank', ['BSI', 'BJB Syariah', 'Mandiri', 'Tunai'])->nullable()->after('insentif_peng_proyek');
            $table->string('no_rekening', 50)->nullable()->after('nama_bank');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            $table->dropColumn(['nama_bank', 'no_rekening']);
        });
    }
};
