<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class StudentAuthController extends Controller
{
    /**
     * Login siswa menggunakan NISN/Email dan password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nisn' => 'required|string', // NISN atau Email
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cari siswa berdasarkan NISN atau Email
        $student = Student::where('nisn', $request->nisn)
            ->first();

        if (!$student || !Hash::check($request->password, $student->password)) {
            return response()->json([
                'success' => false,
                'message' => 'NISN/Email atau password salah'
            ], 401);
        }

        // Check if student is active
        if ($student->status !== 'Aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.'
            ], 403);
        }

        // Create token
        $token = $student->createToken('student-auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'nama_lengkap' => $student->nama_lengkap,
                    'nama_panggilan' => $student->nama_panggilan,
                    'nisn' => $student->nisn,
                    'email' => $student->email,
                    'tempat_lahir' => $student->tempat_lahir,
                    'tanggal_lahir' => $student->tanggal_lahir,
                    'umur' => $student->umur,
                    'nama_ibu' => $student->nama_ibu,
                    'nama_ayah' => $student->nama_ayah,
                    'nomor_hp' => $student->nomor_hp,
                    'alamat' => $student->alamat,
                    'unit_sekolah' => $student->unit_sekolah,
                    'unit_kelas' => $student->unit_kelas,
                    'avatar' => $student->avatar,
                    'status' => $student->status,
                    'created_at' => $student->created_at,
                    'updated_at' => $student->updated_at,
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Get profile siswa yang sedang login
     */
    public function profile(Request $request)
    {
        $student = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Profile siswa berhasil diambil',
            'data' => [
                'id' => $student->id,
                'nama_lengkap' => $student->nama_lengkap,
                'nama_panggilan' => $student->nama_panggilan,
                'nisn' => $student->nisn,
                'email' => $student->email,
                'tempat_lahir' => $student->tempat_lahir,
                'tanggal_lahir' => $student->tanggal_lahir,
                'umur' => $student->umur,
                'nama_ibu' => $student->nama_ibu,
                'nama_ayah' => $student->nama_ayah,
                'nomor_hp' => $student->nomor_hp,
                'alamat' => $student->alamat,
                'unit_sekolah' => $student->unit_sekolah,
                'unit_kelas' => $student->unit_kelas,
                'avatar' => $student->avatar,
                'status' => $student->status,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
            ]
        ]);
    }

    /**
     * Get biodata siswa (alias for profile)
     */
    public function biodata(Request $request)
    {
        return $this->profile($request);
    }

    /**
     * Update profile siswa
     */
    public function updateProfile(Request $request)
    {
        $student = $request->user();
        
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'nama_panggilan' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:students,email,' . $student->id,
            'tempat_lahir' => 'sometimes|string|max:255',
            'tanggal_lahir' => 'sometimes|date',
            'nama_ibu' => 'sometimes|string|max:255',
            'nama_ayah' => 'sometimes|string|max:255',
            'nomor_hp' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'nama_lengkap',
            'nama_panggilan', 
            'email',
            'tempat_lahir',
            'tanggal_lahir',
            'nama_ibu',
            'nama_ayah',
            'nomor_hp',
            'alamat'
        ]);

        $student->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'data' => [
                'id' => $student->id,
                'nama_lengkap' => $student->nama_lengkap,
                'nama_panggilan' => $student->nama_panggilan,
                'nisn' => $student->nisn,
                'email' => $student->email,
                'tempat_lahir' => $student->tempat_lahir,
                'tanggal_lahir' => $student->tanggal_lahir,
                'umur' => $student->umur,
                'nama_ibu' => $student->nama_ibu,
                'nama_ayah' => $student->nama_ayah,
                'nomor_hp' => $student->nomor_hp,
                'alamat' => $student->alamat,
                'unit_sekolah' => $student->unit_sekolah,
                'unit_kelas' => $student->unit_kelas,
                'avatar' => $student->avatar,
                'status' => $student->status,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
            ]
        ]);
    }

    /**
     * Update biodata siswa (alias for updateProfile)
     */
    public function updateBiodata(Request $request)
    {
        return $this->updateProfile($request);
    }

    /**
     * Upload avatar siswa
     */
    public function uploadAvatar(Request $request)
    {
        $student = $request->user();
        
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Delete old avatar if exists
        if ($student->avatar && Storage::disk('public')->exists($student->avatar)) {
            Storage::disk('public')->delete($student->avatar);
        }

        // Upload new avatar
        $file = $request->file('avatar');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('avatars/students', $filename, 'public');

        $student->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil diupload',
            'data' => [
                'avatar' => $student->avatar,
                'avatar_url' => Storage::url($path)
            ]
        ]);
    }

    /**
     * Delete avatar siswa
     */
    public function deleteAvatar(Request $request)
    {
        $student = $request->user();
        
        if ($student->avatar && Storage::disk('public')->exists($student->avatar)) {
            Storage::disk('public')->delete($student->avatar);
        }

        $student->update(['avatar' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil dihapus'
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $student = $request->user();

        // Check current password
        if (!Hash::check($request->current_password, $student->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama tidak sesuai'
            ], 400);
        }

        // Update password
        $student->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah'
        ]);
    }

    /**
     * Logout siswa
     */
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Logout dari semua device
     */
    public function logoutAll(Request $request)
    {
        // Revoke all tokens for this student
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout dari semua device berhasil'
        ]);
    }

    /**
     * Forgot password - send reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:students,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $student = Student::where('email', $request->email)->first();
        
        if ($student->status !== 'Aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak aktif. Silakan hubungi administrator.'
            ], 403);
        }

        // TODO: Implement email sending logic here
        // For now, just return success message
        
        return response()->json([
            'success' => true,
            'message' => 'Link reset password telah dikirim ke email Anda'
        ]);
    }

    /**
     * Get tagihan siswa
     */
    public function getTagihan(Request $request)
    {
        $student = $request->user();
        
        // Get tagihan with payments
        $tagihan = \App\Models\StudentBill::where('student_id', $student->id)
            ->with(['billType', 'payments'])
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Tagihan siswa berhasil diambil',
            'data' => $tagihan
        ]);
    }

    /**
     * Get notifikasi siswa
     */
    public function getNotifications(Request $request)
    {
        $student = $request->user();
        
        $query = \App\Models\Notification::where('student_id', $student->id)
            ->orderBy('created_at', 'desc');

        // Filter by read status
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'semua') {
            $query->where('category', $request->category);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->get();

        // Get counts
        $counts = [
            'total' => \App\Models\Notification::where('student_id', $student->id)->count(),
            'unread' => \App\Models\Notification::where('student_id', $student->id)->unread()->count(),
            'tagihan' => \App\Models\Notification::where('student_id', $student->id)->where('category', 'tagihan')->count(),
            'pengumuman' => \App\Models\Notification::where('student_id', $student->id)->where('category', 'pengumuman')->count(),
            'komunikasi' => \App\Models\Notification::where('student_id', $student->id)->where('category', 'komunikasi')->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil diambil',
            'data' => $notifications,
            'counts' => $counts
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(Request $request, $id)
    {
        $student = $request->user();
        
        try {
            $notification = \App\Models\Notification::where('student_id', $student->id)
                ->findOrFail($id);
            
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi ditandai sebagai sudah dibaca'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        $student = $request->user();
        
        \App\Models\Notification::where('student_id', $student->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai sebagai sudah dibaca'
        ]);
    }

    /**
     * Delete notification
     */
    public function deleteNotification(Request $request, $id)
    {
        $student = $request->user();
        
        try {
            $notification = \App\Models\Notification::where('student_id', $student->id)
                ->findOrFail($id);
            
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Notifikasi tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Get unread notification count
     */
    public function getUnreadNotificationCount(Request $request)
    {
        $student = $request->user();
        
        $count = \App\Models\Notification::where('student_id', $student->id)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count
            ]
        ]);
    }

    /**
     * Get history pembayaran siswa
     */
    public function getPembayaran(Request $request)
    {
        $student = $request->user();
        
        // Get all payments through tagihan
        $pembayaran = \App\Models\Payment::whereHas('tagihan', function($query) use ($student) {
            $query->where('student_id', $student->id);
        })
        ->with(['tagihan.billType'])
        ->orderBy('payment_date', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'message' => 'History pembayaran berhasil diambil',
            'data' => $pembayaran
        ]);
    }

    /**
     * Get absensi siswa
     */
    public function getAbsensi(Request $request)
    {
        $student = $request->user();
        
        $query = \App\Models\Absensi::where('nisn', $student->nisn);

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('tanggal', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('tanggal', '<=', $request->end_date);
        }

        $absensi = $query->orderBy('tanggal', 'desc')
            ->orderBy('waktu_masuk', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data absensi berhasil diambil',
            'data' => $absensi
        ]);
    }

    /**
     * Get statistik absensi siswa
     */
    public function getAbsensiStatistics(Request $request)
    {
        $student = $request->user();
        
        $query = \App\Models\Absensi::where('nisn', $student->nisn);

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('tanggal', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('tanggal', '<=', $request->end_date);
        }

        $total = $query->count();
        $hadir = $query->clone()->where('status', 'Hadir')->count();
        $izin = $query->clone()->where('status', 'Izin')->count();
        $sakit = $query->clone()->where('status', 'Sakit')->count();
        $alpha = $query->clone()->where('status', 'Alpha')->count();

        return response()->json([
            'success' => true,
            'message' => 'Statistik absensi berhasil diambil',
            'data' => [
                'total' => $total,
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpha' => $alpha,
                'persentase_hadir' => $total > 0 ? round(($hadir / $total) * 100, 2) : 0
            ]
        ]);
    }

    /**
     * Get data student berdasarkan ID (untuk parent/admin)
     */
    public function getStudentById(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data siswa berhasil diambil',
                'data' => [
                    'id' => $student->id,
                    'nama_lengkap' => $student->nama_lengkap,
                    'nama_panggilan' => $student->nama_panggilan,
                    'nisn' => $student->nisn,
                    'email' => $student->email,
                    'tempat_lahir' => $student->tempat_lahir,
                    'tanggal_lahir' => $student->tanggal_lahir,
                    'umur' => $student->umur,
                    'nama_ibu' => $student->nama_ibu,
                    'nama_ayah' => $student->nama_ayah,
                    'nomor_hp' => $student->nomor_hp,
                    'alamat' => $student->alamat,
                    'unit_sekolah' => $student->unit_sekolah,
                    'unit_kelas' => $student->unit_kelas,
                    'avatar' => $student->avatar,
                    'status' => $student->status,
                    'created_at' => $student->created_at,
                    'updated_at' => $student->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Student tidak ditemukan'
            ], 404);
        }
    }
}

