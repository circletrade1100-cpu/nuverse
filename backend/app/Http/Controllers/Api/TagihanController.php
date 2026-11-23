<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentBill;
use App\Models\BillType;
use App\Models\BillLabel;
use App\Models\Student;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Helpers\TagihanNotificationHelper;

class TagihanController extends Controller
{
    /**
     * Display a listing of student bills
     */
    public function index(Request $request)
    {
        try {
            $query = StudentBill::with(['student', 'billType', 'payments']);
            
            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Validate sort fields
            $allowedSortFields = ['created_at', 'due_date', 'total_amount', 'status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Filter berdasarkan status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan siswa
            if ($request->has('student_id') && $request->student_id) {
                $query->where('student_id', $request->student_id);
            }

            // Filter berdasarkan jenis tagihan
            if ($request->has('bill_type_id') && $request->bill_type_id) {
                $query->where('bill_type_id', $request->bill_type_id);
            }

            // Filter berdasarkan periode
            if ($request->has('period_year') && $request->period_year) {
                $query->where('period_year', $request->period_year);
            }

            if ($request->has('period_month') && $request->period_month) {
                $query->where('period_month', $request->period_month);
            }

            // Search by student name
            if ($request->has('search') && $request->search) {
                $query->whereHas('student', function($q) use ($request) {
                    $q->where('nama_lengkap', 'like', '%' . $request->search . '%');
                });
            }

            // Filter berdasarkan unit sekolah
            if ($request->has('unit_sekolah') && $request->unit_sekolah) {
                $query->whereHas('student', function($q) use ($request) {
                    $q->where('unit_sekolah', $request->unit_sekolah);
                });
            }

            $perPage = $request->get('per_page', 10);
            $bills = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $bills,
                'message' => 'Data tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created student bill
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'bill_type_id' => 'required|exists:bill_types,id',
                'total_amount' => 'required|numeric|min:0',
                'due_date' => 'required|date',
                'period_month' => 'nullable|integer|between:1,12',
                'period_year' => 'nullable|integer|min:2020',
                'allow_installment' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bill = StudentBill::create([
                'student_id' => $request->student_id,
                'bill_type_id' => $request->bill_type_id,
                'total_amount' => $request->total_amount,
                'paid_amount' => 0,
                'remaining_amount' => $request->total_amount,
                'due_date' => $request->due_date,
                'period_month' => $request->period_month,
                'period_year' => $request->period_year,
                'status' => 'unpaid',
                'allow_installment' => $request->allow_installment ?? true,
                'notes' => $request->notes
            ]);

            $bill->load(['student', 'billType']);

            // 🔔 Auto-create notification untuk siswa (database)
            Notification::createTagihanNotification($request->student_id, [
                'bill_id' => $bill->id,
                'student_name' => $bill->student->nama_lengkap ?? 'Siswa',
                'bill_type' => $bill->billType->name ?? 'Tagihan',
                'amount' => $bill->total_amount,
                'due_date' => $bill->due_date,
                'notes' => $bill->notes,
            ]);

            // 📱 Kirim OneSignal push notification ke parent
            TagihanNotificationHelper::sendNewBillNotification($bill);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Tagihan berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student bill
     */
    public function show(string $id)
    {
        try {
            $bill = StudentBill::with(['student', 'billType', 'payments.processedBy'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Data tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tagihan tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update the specified student bill
     */
    public function update(Request $request, string $id)
    {
        try {
            $bill = StudentBill::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'total_amount' => 'sometimes|numeric|min:0',
                'due_date' => 'sometimes|date',
                'period_month' => 'nullable|integer|between:1,12',
                'period_year' => 'nullable|integer|min:2020',
                'allow_installment' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'total_amount', 'due_date', 'period_month', 
                'period_year', 'allow_installment', 'notes'
            ]);

            // Jika total_amount diubah, update remaining_amount
            if ($request->has('total_amount')) {
                $updateData['remaining_amount'] = $request->total_amount - $bill->paid_amount;
            }

            $bill->update($updateData);
            $bill->updateStatus(); // Update status berdasarkan kondisi terkini

            $bill->load(['student', 'billType']);

            return response()->json([
                'success' => true,
                'data' => $bill,
                'message' => 'Tagihan berhasil diperbarui'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student bill
     */
    public function destroy(Request $request, string $id)
    {
        try {
            $bill = StudentBill::findOrFail($id);

            $user = $request->user();
            $isSuperAdmin = $user && $user->isSuperAdmin();

            // Non–super admin: tidak boleh hapus jika sudah ada pembayaran (integritas data)
            if (!$isSuperAdmin && $bill->payments()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus tagihan yang sudah memiliki pembayaran'
                ], 422);
            }

            // Super admin: boleh hapus; bill_payments ikut terhapus (onDelete cascade dari student_bills)
            $bill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tagihan berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bills by student ID
     */
    public function getByStudent($studentId)
    {
        try {
            $bills = StudentBill::with(['billType', 'payments'])
                ->where('student_id', $studentId)
                ->orderBy('due_date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $bills,
                'message' => 'Data tagihan siswa berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill types
     */
    public function getBillTypes()
    {
        try {
            $billTypes = BillType::active()->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $billTypes,
                'message' => 'Data jenis tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get bill labels by bill type ID
     */
    public function getBillLabels(Request $request)
    {
        try {
            $billTypeId = $request->get('bill_type_id');
            
            if (!$billTypeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'bill_type_id diperlukan'
                ], 422);
            }

            $billLabels = BillLabel::where('bill_type_id', $billTypeId)
                ->active()
                ->orderBy('label_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $billLabels,
                'message' => 'Data label tagihan berhasil diambil'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create multiple bills for one student
     */
    public function createMultiple(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'due_date' => 'required|date',
                'period_month' => 'nullable|integer|between:1,12',
                'period_year' => 'nullable|integer|min:2020',
                'allow_installment' => 'boolean',
                'notes' => 'nullable|string',
                'bill_items' => 'required|array|min:1',
                'bill_items.*.bill_type_id' => 'required|exists:bill_types,id',
                'bill_items.*.total_amount' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $createdBills = [];

            DB::transaction(function () use ($request, &$createdBills) {
                foreach ($request->bill_items as $billItem) {
                    $bill = StudentBill::create([
                        'student_id' => $request->student_id,
                        'bill_type_id' => $billItem['bill_type_id'],
                        'total_amount' => $billItem['total_amount'],
                        'paid_amount' => 0,
                        'remaining_amount' => $billItem['total_amount'],
                        'due_date' => $request->due_date,
                        'period_month' => $request->period_month,
                        'period_year' => $request->period_year,
                        'status' => 'unpaid',
                        'allow_installment' => $request->allow_installment ?? true,
                        'notes' => $request->notes ?? null
                    ]);

                    $bill->load(['student', 'billType']);

                    // 🔔 Auto-create notification untuk siswa
                    Notification::createTagihanNotification($request->student_id, [
                        'bill_id' => $bill->id,
                        'student_name' => $bill->student->nama_lengkap ?? 'Siswa',
                        'bill_type' => $bill->billType->name ?? 'Tagihan',
                        'amount' => $bill->total_amount,
                        'due_date' => $bill->due_date,
                        'notes' => $bill->notes,
                    ]);

                    $createdBills[] = $bill;
                }
            });

            return response()->json([
                'success' => true,
                'data' => $createdBills,
                'message' => count($createdBills) . ' tagihan berhasil dibuat untuk siswa'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create multiple bills for multiple students (Bulk Create)
     */
    public function bulkCreate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_ids' => 'required|array|min:1',
                'student_ids.*' => 'exists:students,id',
                'due_date' => 'required|date',
                'period_month' => 'nullable|integer|between:1,12',
                'period_year' => 'nullable|integer|min:2020',
                'allow_installment' => 'boolean',
                'notes' => 'nullable|string',
                'bill_items' => 'required|array|min:1',
                'bill_items.*.bill_type_id' => 'required|exists:bill_types,id',
                'bill_items.*.total_amount' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $createdBills = [];
            $totalCreated = 0;

            DB::transaction(function () use ($request, &$createdBills, &$totalCreated) {
                foreach ($request->student_ids as $studentId) {
                    foreach ($request->bill_items as $billItem) {
                        $bill = StudentBill::create([
                            'student_id' => $studentId,
                            'bill_type_id' => $billItem['bill_type_id'],
                            'total_amount' => $billItem['total_amount'],
                            'paid_amount' => 0,
                            'remaining_amount' => $billItem['total_amount'],
                            'due_date' => $request->due_date,
                            'period_month' => $request->period_month,
                            'period_year' => $request->period_year,
                            'status' => 'unpaid',
                            'allow_installment' => $request->allow_installment ?? true,
                            'notes' => $request->notes ?? null
                        ]);

                        $bill->load(['student', 'billType']);

                        Notification::createTagihanNotification($studentId, [
                            'bill_id' => $bill->id,
                            'student_name' => $bill->student->nama_lengkap ?? 'Siswa',
                            'bill_type' => $bill->billType->name ?? 'Tagihan',
                            'amount' => $bill->total_amount,
                            'due_date' => $bill->due_date,
                            'notes' => $bill->notes,
                        ]);

                        $createdBills[] = $bill;
                        $totalCreated++;
                    }
                }
            });

            // 📱 Kirim OneSignal push notification ke semua parent (bulk)
            TagihanNotificationHelper::sendBulkNewBillNotification($createdBills);

            return response()->json([
                'success' => true,
                'data' => $createdBills,
                'message' => "Berhasil membuat {$totalCreated} tagihan untuk " . count($request->student_ids) . " siswa"
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
