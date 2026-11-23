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
        Schema::table('thr', function (Blueprint $table) {
            $table->bigInteger('masa_kerja')->default(0)->after('tatap_muka_rupiah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('thr', function (Blueprint $table) {
            $table->dropColumn('masa_kerja');
        });
    }
};
