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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('type'); // 'tagihan', 'pengumuman', 'komunikasi', 'akademik'
            $table->string('title');
            $table->text('description');
            $table->text('full_content')->nullable();
            $table->json('data')->nullable(); // Additional data (bill_id, etc)
            $table->string('category')->default('pengumuman'); // 'tagihan', 'pengumuman', 'komunikasi'
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['student_id', 'is_read']);
            $table->index(['student_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

