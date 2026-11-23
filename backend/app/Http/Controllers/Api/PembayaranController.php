<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillPayment;
use App\Models\StudentBill;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PembayaranController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request)
    {
        try {
            $query = BillPayment::with(['studentBill.student', 'studentBill.billType', 'processedBy'])
                ->orderBy('payment_date', 'desc');

            // Filter berdasarkan tanggal
            if ($request->has('date_from') && $request->date_from) {
                $query->where('payment_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('payment_date', '<=', $request->date_to);
            }

            // Filter berdasarkan metode pembayaran
            if ($request->has('payment_method') && $request->payment_method) {
                $query->where('payment_method', $request->payment_method);
            }

            // Filter berdasarkan siswa
            if ($request->has('student_id') && $request->student_id) {
                $query->whereHas('studentBill', function($q) use ($request) {
                    $q->where('student_id', $request->student_id);
                });
            }

            // Search by student name
            if ($request->has('search') && $request->search) {
                $query->whereHas('studentBill.student', function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
            }

            $payments = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $payments,
                'message' => 'Data pembayaran berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category ID based on bill type name
     */
    private function resolveCategoryId($billTypeName)
    {
        $name = strtolower($billTypeName);
        
        if (str_contains($name, 'spp')) return 1;
        if (str_contains($name, 'ekskul') || str_contains($name, 'ekstrakurikuler')) return 2;
        if (str_contains($name, 'buku')) return 3;
        if (str_contains($name, 'kegiatan')) return 4;
        if (str_contains($name, 'ajp')) return 5;
        if (str_contains($name, 'seragam')) return 6;
        if (str_contains($name, 'infaq') || str_contains($name, 'sumbangan')) return 7;
        if (str_contains($name, 'koperasi')) return 8;
        if (str_contains($name, 'daftar') || str_contains($name, 'pendaftaran')) return 9;
        
        return $this->getTagihanCategoryId(); // Fallback to "Tagihan Siswa"
    }

    /**
     * Store a newly created payment
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_bill_id' => 'required|exists:student_bills,id',
                'amount' => 'required|numeric|min:1',
                'payment_date' => 'required|date',
                'payment_method' => 'required|in:cash,transfer,qris,credit_card',
                'reference_number' => 'nullable|string|max:100',
                'is_installment' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $studentBill = StudentBill::with(['student', 'billType'])->findOrFail($request->student_bill_id);

            // Validasi jumlah pembayaran
            if ($request->amount > $studentBill->remaining_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah pembayaran melebihi sisa tagihan'
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Hitung nomor cicilan
                $installmentNumber = 1;
                if ($request->is_installment) {
                    $lastInstallment = BillPayment::where('student_bill_id', $request->student_bill_id)
                        ->where('is_installment', true)
                        ->max('installment_number');
                    $installmentNumber = ($lastInstallment ?? 0) + 1;
                }

                // Create payment record
                $payment = BillPayment::create([
                    'student_bill_id' => $request->student_bill_id,
                    'amount' => $request->amount,
                    'payment_date' => $request->payment_date,
                    'payment_method' => $request->payment_method,
                    'reference_number' => $request->reference_number,
                    'processed_by' => Auth::id() ?? 1, // Fallback to user ID 1 if not authenticated
                    'is_installment' => $request->is_installment ?? false,
                    'installment_number' => $installmentNumber,
                    'notes' => $request->notes
                ]);

                // Update student bill
                $studentBill->paid_amount += $request->amount;
                $studentBill->remaining_amount -= $request->amount;
                $studentBill->updateStatus();

                // Get student unit sekolah information
                $student = $studentBill->student;
                $unitSekolahId = null;
                $studentUnitSekolah = null;

                if ($student) {
                    $studentUnitSekolah = $student->unit_sekolah;
                    if ($studentUnitSekolah) {
                        $unit = \App\Models\UnitSekolah::where('nama', $studentUnitSekolah)
                            ->orWhere('nama', 'like', $studentUnitSekolah . '%')
                            ->first();
                        if ($unit) {
                            $unitSekolahId = $unit->id;
                        }
                    }

                }

                // Auto create transaction in TU system
                $transaction = Transaction::create([
                    'user_id' => Auth::id() ?? 1, // Fallback to user ID 1 if not authenticated
                    'category_id' => $this->resolveCategoryId($studentBill->billType->name ?? ''), 
                    'unit_sekolah_id' => $unitSekolahId,
                    'type' => 'income',
                    'title' => "Pembayaran {$studentBill->billType->name} - {$studentBill->student->nama_lengkap}",
                    'amount' => $request->amount,
                    'transaction_date' => $request->payment_date, // Use correct field name
                    'status' => 'approved', // Auto approve untuk pembayaran tagihan
                    'description' => "Pembayaran {$studentBill->billType->name} siswa {$studentBill->student->nama_lengkap}",
                    'metadata' => [
                        'student_bill_id' => $studentBill->id,
                        'payment_id' => $payment->id,
                        'payment_method' => $request->payment_method,
                        'reference_number' => $request->reference_number,
                        'paidBy' => $studentBill->student->nama_lengkap,
                        'student_name' => $studentBill->student->nama_lengkap,
                        'bill_type_name' => $studentBill->billType->name,
                        'student_unit_sekolah' => $studentUnitSekolah
                    ]
                ]);


                // Update payment dengan transaction_id
                $payment->update(['transaction_id' => $transaction->id]);

                DB::commit();

                $payment->load(['studentBill.student', 'studentBill.billType', 'processedBy']);

                return response()->json([
                    'success' => true,
                    'data' => $payment,
                    'message' => 'Pembayaran berhasil diproses'
                ], 201);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified payment
     */
    public function show(string $id)
    {
        try {
            $payment = BillPayment::with(['studentBill.student', 'studentBill.billType', 'processedBy', 'transaction'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $payment,
                'message' => 'Data pembayaran berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Get payments by student bill ID
     */
    public function getByBill($billId)
    {
        try {
            $payments = BillPayment::with(['processedBy'])
                ->where('student_bill_id', $billId)
                ->orderBy('payment_date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments,
                'message' => 'Data pembayaran tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment summary
     */
    public function getSummary(Request $request)
    {
        try {
            $query = BillPayment::query();

            // Filter berdasarkan tanggal
            if ($request->has('date_from') && $request->date_from) {
                $query->where('payment_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('payment_date', '<=', $request->date_to);
            }

            $summary = [
                'total_payments' => $query->count(),
                'total_amount' => $query->sum('amount'),
                'by_payment_method' => $query->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                    ->groupBy('payment_method')
                    ->get(),
                'by_bill_type' => $query->join('student_bills', 'bill_payments.student_bill_id', '=', 'student_bills.id')
                    ->join('bill_types', 'student_bills.bill_type_id', '=', 'bill_types.id')
                    ->selectRaw('bill_types.name, COUNT(*) as count, SUM(bill_payments.amount) as total')
                    ->groupBy('bill_types.id', 'bill_types.name')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Ringkasan pembayaran berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get category ID for student bills in TU system
     */
    private function getTagihanCategoryId()
    {
        // Cari kategori "Tagihan Siswa" atau buat jika belum ada
        $category = \App\Models\Category::firstOrCreate(
            ['name' => 'Tagihan Siswa'],
            [
                'code' => 'TAGIHAN_SISWA',
                'description' => 'Pendapatan dari pembayaran tagihan siswa',
                'type' => 'income',
                'is_active' => true
            ]
        );

        return $category->id;
    }
}
