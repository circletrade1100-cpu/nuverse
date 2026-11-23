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
        Schema::create('realization_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('realization_id')->constrained('rapbs_realizations')->onDelete('cascade');
            $table->enum('document_type', ['receipt', 'invoice', 'fpu', 'other']);
            $table->string('file_name', 200);
            $table->string('file_path', 255);
            $table->bigInteger('file_size');
            $table->string('mime_type', 100);
            $table->enum('validation_status', ['pending', 'validated', 'rejected'])->default('pending');
            $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('validated_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('realization_id');
            $table->index('validation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realization_documents');
    }
};

