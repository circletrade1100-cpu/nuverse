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
        // Check if table already exists
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_bill_id')->constrained('student_bills')->onDelete('cascade');
                $table->decimal('amount', 15, 2);
                $table->timestamp('payment_date');
                $table->string('payment_method', 50)->nullable();    // 'midtrans', 'cash', 'transfer'
                $table->string('reference_number', 100)->nullable(); // Midtrans transaction_id
                $table->boolean('is_installment')->default(false);
                $table->integer('installment_number')->default(1);   // Cicilan ke berapa
                $table->text('notes')->nullable();
                $table->unsignedBigInteger('processed_by')->nullable(); // User/Student ID
                $table->timestamps();
                
                // Indexes
                $table->index('student_bill_id');
                $table->index('payment_date');
                $table->index('reference_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

