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
        Schema::create('midtrans_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 100)->unique();       // Format: BILL-{bill_id}-{timestamp}
            $table->foreignId('student_bill_id')->nullable()->constrained('student_bills')->onDelete('set null');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('transaction_id', 100)->nullable(); // Midtrans transaction_id
            $table->string('payment_type', 50)->nullable();    // 'bank_transfer', 'qris', etc
            $table->string('bank', 50)->nullable();            // 'bca', 'bni', etc
            $table->string('va_number', 50)->nullable();
            $table->string('snap_token')->nullable();          // Snap token
            $table->decimal('gross_amount', 15, 2);
            $table->string('transaction_status', 50)->default('pending'); // 'pending', 'settlement', 'expire'
            $table->timestamp('settlement_time')->nullable();
            $table->json('raw_response')->nullable();          // Full webhook response
            $table->timestamps();
            
            // Indexes
            $table->index('order_id');
            $table->index('transaction_id');
            $table->index('transaction_status');
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('midtrans_transactions');
    }
};

