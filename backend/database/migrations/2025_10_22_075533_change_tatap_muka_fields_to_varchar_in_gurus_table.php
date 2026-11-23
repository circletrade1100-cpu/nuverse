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
            // Ubah tipe data dari integer ke string (varchar)
            $table->string('tatap_muka', 50)->default('0')->change();
            $table->string('t_muka_pengganti', 50)->default('0')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gurus', function (Blueprint $table) {
            // Kembalikan ke integer
            $table->integer('tatap_muka')->default(0)->change();
            $table->integer('t_muka_pengganti')->default(0)->change();
        });
    }
};
