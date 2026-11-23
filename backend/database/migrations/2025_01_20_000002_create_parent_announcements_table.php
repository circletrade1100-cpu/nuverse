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
        Schema::create('parent_announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->text('excerpt')->nullable(); // Ringkasan singkat
            $table->enum('category', ['akademik', 'kegiatan', 'pengumuman', 'informasi'])->default('pengumuman');
            $table->string('author')->nullable();
            $table->string('thumbnail')->nullable(); // Gambar thumbnail
            $table->string('document_path')->nullable(); // Lampiran dokumen
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->date('published_at')->nullable();
            $table->date('expires_at')->nullable(); // Kapan pengumuman tidak lagi ditampilkan
            $table->integer('view_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->integer('read_time')->nullable(); // Estimasi waktu baca (dalam menit)
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_announcements');
    }
};

