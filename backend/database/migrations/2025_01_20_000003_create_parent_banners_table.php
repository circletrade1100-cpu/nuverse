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
        Schema::create('parent_banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_path'); // Path ke image banner
            $table->string('mobile_image_path')->nullable(); // Gambar khusus untuk mobile
            $table->string('button_text')->nullable(); // Teks tombol CTA
            $table->string('button_link')->nullable(); // Link tombol CTA
            $table->string('bg_color')->default('from-blue-600 to-purple-600'); // Tailwind gradient class
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0); // Untuk urutan tampil di carousel
            $table->date('start_date')->nullable(); // Kapan banner mulai ditampilkan
            $table->date('end_date')->nullable(); // Kapan banner tidak lagi ditampilkan
            $table->text('notes')->nullable();
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
        Schema::dropIfExists('parent_banners');
    }
};

