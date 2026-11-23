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
        Schema::table('divisional_transactions', function (Blueprint $table) {
            $table->renameColumn('division_id', 'unit_kerja_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('divisional_transactions', function (Blueprint $table) {
            $table->renameColumn('unit_kerja_id', 'division_id');
        });
    }
};
