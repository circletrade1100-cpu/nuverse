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
        Schema::create('bill_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nama jenis tagihan (SPP, Uang Pangkal, dll)');
            $table->text('description')->nullable()->comment('Deskripsi jenis tagihan');
            $table->decimal('default_amount', 15, 2)->nullable()->comment('Jumlah default untuk tagihan ini');
            $table->boolean('is_active')->default(true)->comment('Status aktif/tidak aktif');
            $table->timestamps();
            
            $table->index(['is_active', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_types');
    }
};
