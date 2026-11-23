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
        Schema::create('bill_labels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bill_type_id')->comment('ID jenis tagihan');
            $table->string('label_name', 100)->comment('Nama label sesuai dengan jenis tagihan');
            $table->text('label_text')->comment('Teks catatan/label untuk jenis tagihan');
            $table->boolean('is_active')->default(true)->comment('Status aktif/tidak aktif');
            $table->timestamps();
            
            // Foreign key
            $table->foreign('bill_type_id')->references('id')->on('bill_types')->onDelete('cascade');
            
            // Indexes
            $table->index(['bill_type_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_labels');
    }
};
