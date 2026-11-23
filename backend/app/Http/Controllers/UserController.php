<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['profile', 'roles']);

        // Filter berdasarkan parameter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($profile) use ($search) {
                      $profile->where('nip', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status')) {
            $query->whereHas('profile', function($profile) use ($request) {
                $profile->where('status', $request->status);
            });
        }

        if ($request->has('role')) {
            $query->whereHas('roles', function($roles) use ($request) {
                $roles->where('name', $request->role);
            });
        }

        // Filter by jabatan (position) for backward compatibility
        if ($request->has('jabatan')) {
            $query->whereHas('profile', function($profile) use ($request) {
                $profile->where('jabatan', 'like', "%{$request->jabatan}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'nip' => 'sometimes|string|max:20|unique:user_profiles',
            'jabatan' => 'sometimes|string|max:100',
            'unit_kerja' => 'sometimes|string|max:100',
            'unit_sekolah' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:Aktif,Non-Aktif,Pensiun',
            'role_ids' => 'sometimes|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create user profile if profile data provided
        if ($request->hasAny(['nip', 'jabatan', 'unit_kerja', 'unit_sekolah', 'status'])) {
            UserProfile::create([
                'user_id' => $user->id,
                'nip' => $request->nip,
                'jabatan' => $request->jabatan,
                'unit_kerja' => $request->unit_kerja,
                'unit_sekolah' => $request->unit_sekolah,
                'status' => $request->status ?? 'Aktif',
                'tmt' => $request->tmt,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenjang_pendidikan' => $request->jenjang_pendidikan,
                'jurusan' => $request->jurusan,
                'status_pernikahan' => $request->status_pernikahan,
                'tugas_tambahan' => $request->tugas_tambahan,
                'mapel_diampu' => $request->mapel_diampu,
                'jam_mengajar' => $request->jam_mengajar,
            ]);
        }

        // Assign roles if provided
        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load(['profile', 'roles'])
        ], 201);
    }

    public function show($id)
    {
        $user = User::with(['profile', 'roles'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email']);
        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Update profile if exists
        if ($user->profile && $request->hasAny(['nip', 'jabatan', 'unit_kerja', 'unit_sekolah', 'status'])) {
            $user->profile->update($request->only([
                'nip', 'jabatan', 'unit_kerja', 'unit_sekolah', 'status', 'tmt',
                'tempat_lahir', 'tanggal_lahir', 'jenjang_pendidikan',
                'jurusan', 'status_pernikahan', 'tugas_tambahan',
                'mapel_diampu', 'jam_mengajar'
            ]));
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('profile')
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    public function getProfile($id)
    {
        $user = User::with('profile')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user->profile
        ]);
    }

    public function uploadAvatar(Request $request, $id)
    {
        $user = User::findOrFail($id);

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
        if ($user->profile && $user->profile->avatar) {
            Storage::delete('public/' . $user->profile->avatar);
        }

        $avatarPath = $request->file('avatar')->store('avatars', 'public');

        if ($user->profile) {
            $user->profile->update(['avatar' => $avatarPath]);
        } else {
            UserProfile::create([
                'user_id' => $user->id,
                'avatar' => $avatarPath
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Avatar uploaded successfully',
            'data' => ['avatar_url' => Storage::url($avatarPath)]
        ]);
    }

    public function getRoles()
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    public function createRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:roles',
            'display_name' => 'required|string|max:100',
            'description' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $role = Role::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => $role
        ], 201);
    }

    public function updateRole(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:50|unique:roles,name,' . $id,
            'display_name' => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $role->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => $role
        ]);
    }

    public function deleteRole($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }

    public function getPermissions()
    {
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }
}
