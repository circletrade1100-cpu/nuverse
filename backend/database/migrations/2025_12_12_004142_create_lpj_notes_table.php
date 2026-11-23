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
        Schema::create('lpj_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lpj_id')->constrained('lpjs')->onDelete('cascade');
            $table->enum('note_type', ['summary', 'issue', 'achievement', 'recommendation'])->default('summary');
            $table->string('title');
            $table->text('content');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('lpj_id');
            $table->index('note_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lpj_notes');
    }
};
