<?php

namespace App\Http\Controllers;

use App\Models\Guru;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\HasApiTokens;

class GuruAuthController extends Controller
{
    /**
     * Login guru menggunakan username dan password
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guru = Guru::where('username', $request->username)->first();

        if (!$guru || !Hash::check($request->password, $guru->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah'
            ], 401);
        }

        // Check if guru is active
        if ($guru->status !== 'Aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak aktif. Silakan hubungi administrator.'
            ], 403);
        }

        // Load relationships
        $guru->load('jabatan', 'unitSekolah');

        // Create token
        $token = $guru->createToken('guru-auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'guru' => [
                    'id' => $guru->id,
                    'nama_lengkap' => $guru->nama_lengkap,
                    'nip' => $guru->nip,
                    'email' => $guru->email,
                    'status' => $guru->status,
                    'tmt' => $guru->tmt,
                    'masa_kerja' => $guru->masa_kerja,
                    'tempat_lahir' => $guru->tempat_lahir,
                    'tanggal_lahir' => $guru->tanggal_lahir,
                    'jenjang_pendidikan' => $guru->jenjang_pendidikan,
                    'jurusan' => $guru->jurusan,
                    'status_pernikahan' => $guru->status_pernikahan,
                    'tugas_tambahan' => $guru->tugas_tambahan,
                    'mapel_diampu' => $guru->mapel_diampu,
                    'jam_mengajar' => $guru->jam_mengajar,
                    'no_telepon' => $guru->no_telepon,
                    'alamat' => $guru->alamat,
                    'avatar' => $guru->avatar,
                    'username' => $guru->username,
                    'jabatan' => $guru->jabatan,
                    'unit_sekolah' => $guru->unitSekolah,
                    'created_at' => $guru->created_at,
                    'updated_at' => $guru->updated_at,
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Get profile guru yang sedang login
     */
    public function profile(Request $request)
    {
        $guru = $request->user();
        
        // Load relationships
        $guru->load('jabatan', 'unitSekolah');

        return response()->json([
            'success' => true,
            'message' => 'Profile guru berhasil diambil',
            'data' => [
                'id' => $guru->id,
                'nama_lengkap' => $guru->nama_lengkap,
                'nip' => $guru->nip,
                'email' => $guru->email,
                'status' => $guru->status,
                'tmt' => $guru->tmt,
                'masa_kerja' => $guru->masa_kerja,
                'tempat_lahir' => $guru->tempat_lahir,
                'tanggal_lahir' => $guru->tanggal_lahir,
                'jenjang_pendidikan' => $guru->jenjang_pendidikan,
                'jurusan' => $guru->jurusan,
                'status_pernikahan' => $guru->status_pernikahan,
                'tugas_tambahan' => $guru->tugas_tambahan,
                'mapel_diampu' => $guru->mapel_diampu,
                'jam_mengajar' => $guru->jam_mengajar,
                'no_telepon' => $guru->no_telepon,
                'alamat' => $guru->alamat,
                'avatar' => $guru->avatar,
                'username' => $guru->username,
                'jabatan' => $guru->jabatan,
                'unit_sekolah' => $guru->unitSekolah,
                'created_at' => $guru->created_at,
                'updated_at' => $guru->updated_at,
            ]
        ]);
    }

    /**
     * Update profile guru
     */
    public function updateProfile(Request $request)
    {
        $guru = $request->user();
        
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:gurus,email,' . $guru->id,
            'no_telepon' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string|max:500',
            'password' => 'sometimes|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['nama_lengkap', 'email', 'no_telepon', 'alamat']);
        
        // Update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $guru->update($updateData);
        $guru->load('jabatan', 'unitSekolah');

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'data' => [
                'id' => $guru->id,
                'nama_lengkap' => $guru->nama_lengkap,
                'nip' => $guru->nip,
                'email' => $guru->email,
                'status' => $guru->status,
                'tmt' => $guru->tmt,
                'masa_kerja' => $guru->masa_kerja,
                'tempat_lahir' => $guru->tempat_lahir,
                'tanggal_lahir' => $guru->tanggal_lahir,
                'jenjang_pendidikan' => $guru->jenjang_pendidikan,
                'jurusan' => $guru->jurusan,
                'status_pernikahan' => $guru->status_pernikahan,
                'tugas_tambahan' => $guru->tugas_tambahan,
                'mapel_diampu' => $guru->mapel_diampu,
                'jam_mengajar' => $guru->jam_mengajar,
                'no_telepon' => $guru->no_telepon,
                'alamat' => $guru->alamat,
                'avatar' => $guru->avatar,
                'username' => $guru->username,
                'jabatan' => $guru->jabatan,
                'unit_sekolah' => $guru->unitSekolah,
                'created_at' => $guru->created_at,
                'updated_at' => $guru->updated_at,
            ]
        ]);
    }

    /**
     * Logout guru
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user && $user->currentAccessToken()) {
                // Revoke current token
                $user->currentAccessToken()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error:', [
                'error' => $e->getMessage(),
                'user' => $request->user() ? $request->user()->id : 'null'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil'
            ]);
        }
    }

    /**
     * Logout dari semua device
     */
    public function logoutAll(Request $request)
    {
        // Revoke all tokens for this guru
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout dari semua device berhasil'
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

        $guru = $request->user();

        // Check current password
        if (!Hash::check($request->current_password, $guru->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password lama tidak sesuai'
            ], 400);
        }

        // Update password
        $guru->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah'
        ]);
    }

    /**
     * Forgot password - send reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:gurus,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $guru = Guru::where('email', $request->email)->first();
        
        if ($guru->status !== 'Aktif') {
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
}
