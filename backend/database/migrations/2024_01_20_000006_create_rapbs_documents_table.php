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
        Schema::create('rapbs_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapbs_plan_id')->constrained('rapbs_plans')->onDelete('cascade');
            $table->enum('document_type', ['proposal', 'budget_detail', 'supporting_doc']);
            $table->string('file_name', 200);
            $table->string('file_path', 255);
            $table->bigInteger('file_size');
            $table->string('mime_type', 100);
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('rapbs_plan_id');
            $table->index('document_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapbs_documents');
    }
};

