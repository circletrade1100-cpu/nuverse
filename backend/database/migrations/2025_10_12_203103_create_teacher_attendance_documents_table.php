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
        Schema::create('teacher_attendance_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('gurus')->onDelete('cascade');
            $table->date('attendance_date');
            $table->enum('document_type', ['sick_leave', 'permit', 'other']);
            $table->string('document_file', 255);
            $table->string('file_name', 200);
            $table->bigInteger('file_size');
            $table->string('mime_type', 100);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_attendance_documents');
    }
};
