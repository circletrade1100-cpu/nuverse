<?php

namespace App\Services;

class MidtransService
{
    protected $serverKey;
    protected $clientKey;
    protected $isProduction;
    protected $apiUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->clientKey = config('midtrans.client_key');
        $this->isProduction = config('midtrans.is_production', false);
        $this->apiUrl = $this->isProduction 
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Create Snap payment token
     */
    public function createSnapToken($params)
    {
        $url = ($this->isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com') . '/snap/v1/transactions';
        
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($params),
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/json',
                'Authorization: Basic ' . base64_encode($this->serverKey . ':')
            ],
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            throw new \Exception('Midtrans Error: ' . $err);
        }
        
        $result = json_decode($response, true);
        
        if (isset($result['error_messages'])) {
            throw new \Exception('Midtrans Error: ' . implode(', ', $result['error_messages']));
        }
        
        return $result;
    }

    /**
     * Get transaction status
     */
    public function getStatus($orderId)
    {
        $url = $this->apiUrl . '/' . $orderId . '/status';
        
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/json',
                'Authorization: Basic ' . base64_encode($this->serverKey . ':')
            ],
        ]);
        
        $response = curl_exec($curl);
        $err = curl_error($curl);
        
        curl_close($curl);
        
        if ($err) {
            throw new \Exception('Midtrans Error: ' . $err);
        }
        
        return json_decode($response, true);
    }

    /**
     * Create payment for student bill
     */
    public function createPayment($studentBill, $student, $customAmount = null, $bankCode = 'bca')
    {
        // Jika custom amount, gunakan itu. Jika tidak, bayar full
        $paymentAmount = $customAmount ?? $studentBill->remaining_amount;
        
        // Validasi
        if ($paymentAmount > $studentBill->remaining_amount) {
            throw new \Exception('Jumlah pembayaran melebihi sisa tagihan');
        }
        
        if ($paymentAmount < 10000) {
            throw new \Exception('Minimal pembayaran Rp 10.000');
        }

        $orderId = 'BILL-' . $studentBill->id . '-' . time();
        
        // Generate/Get VA Number
        $va = \App\Models\MidtransVaNumber::generateForStudent($student->id, $bankCode);
        
        // Calculate installment number
        $installmentNumber = ($studentBill->installment_count ?? 0) + 1;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int)$paymentAmount,
            ],
            'customer_details' => [
                'first_name' => $student->nama_lengkap,
                'email' => $student->email,
                'phone' => $student->nomor_hp,
            ],
            'item_details' => [
                [
                    'id' => $studentBill->billType->id ?? 1,
                    'price' => (int)$paymentAmount,
                    'quantity' => 1,
                    'name' => ($studentBill->billType->name ?? 'Tagihan') . ' (Cicilan ke-' . $installmentNumber . ')',
                ]
            ],
            'enabled_payments' => ['bank_transfer', 'qris', 'gopay', 'shopeepay'],
        ];

        try {
            $result = $this->createSnapToken($params);
            
            // Save transaction
            \App\Models\MidtransTransaction::create([
                'order_id' => $orderId,
                'student_bill_id' => $studentBill->id,
                'student_id' => $student->id,
                'payment_type' => 'bank_transfer',
                'bank' => $bankCode,
                'va_number' => $va->va_number ?? null,
                'gross_amount' => $paymentAmount,
                'transaction_status' => 'pending',
                'snap_token' => $result['token'] ?? null,
            ]);

            return [
                'snap_token' => $result['token'],
                'order_id' => $orderId,
                'va_number' => $va->va_number ?? null,
                'amount' => $paymentAmount,
                'installment_number' => $installmentNumber,
                'remaining_after_payment' => $studentBill->remaining_amount - $paymentAmount,
            ];
        } catch (\Exception $e) {
            \Log::error('Midtrans Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verify notification signature
     */
    public function verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)
    {
        $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $this->serverKey);
        return $mySignature === $signatureKey;
    }
}

