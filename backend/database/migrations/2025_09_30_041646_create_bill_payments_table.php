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
        Schema::create('bill_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_bill_id')->comment('ID tagihan siswa');
            $table->decimal('amount', 15, 2)->comment('Jumlah pembayaran');
            $table->date('payment_date')->comment('Tanggal pembayaran');
            $table->enum('payment_method', ['cash', 'transfer', 'qris', 'credit_card'])->default('cash')->comment('Metode pembayaran');
            $table->string('reference_number', 100)->nullable()->comment('Nomor referensi pembayaran');
            $table->unsignedBigInteger('processed_by')->comment('ID user yang memproses pembayaran');
            $table->unsignedBigInteger('transaction_id')->nullable()->comment('ID transaksi di sistem TU');
            $table->boolean('is_installment')->default(false)->comment('Apakah ini pembayaran cicilan');
            $table->integer('installment_number')->default(1)->comment('Nomor cicilan keberapa');
            $table->text('notes')->nullable()->comment('Catatan pembayaran');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('student_bill_id')->references('id')->on('student_bills')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users');
            $table->foreign('transaction_id')->references('id')->on('transactions');
            
            // Indexes
            $table->index(['student_bill_id', 'payment_date']);
            $table->index(['processed_by', 'payment_date']);
            $table->index(['payment_method', 'payment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_payments');
    }
};
