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
        Schema::create('student_bills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id')->comment('ID siswa');
            $table->unsignedBigInteger('bill_type_id')->comment('ID jenis tagihan');
            $table->decimal('total_amount', 15, 2)->comment('Total jumlah tagihan');
            $table->decimal('paid_amount', 15, 2)->default(0)->comment('Jumlah yang sudah dibayar');
            $table->decimal('remaining_amount', 15, 2)->comment('Sisa tagihan yang belum dibayar');
            $table->date('due_date')->comment('Tanggal jatuh tempo');
            $table->integer('period_month')->nullable()->comment('Bulan periode (untuk SPP bulanan)');
            $table->integer('period_year')->nullable()->comment('Tahun periode');
            $table->enum('status', ['unpaid', 'partial', 'paid', 'overdue'])->default('unpaid')->comment('Status pembayaran');
            $table->boolean('allow_installment')->default(true)->comment('Apakah boleh dicicil');
            $table->text('notes')->nullable()->comment('Catatan tambahan');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('bill_type_id')->references('id')->on('bill_types');
            
            // Indexes
            $table->index(['student_id', 'status']);
            $table->index(['due_date', 'status']);
            $table->index(['period_year', 'period_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_bills');
    }
};
