<?php

namespace App\Http\Controllers;

use App\Models\RapbsUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RAPBSUserController extends Controller
{
    /**
     * Get all RAPBS users
     */
    public function index(Request $request)
    {
        $query = RapbsUser::with(['user', 'division']);

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by division
        if ($request->has('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        // Search by user name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $rapbsUsers = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $rapbsUsers
        ]);
    }

    /**
     * Get single RAPBS user
     */
    public function show($id)
    {
        $rapbsUser = RapbsUser::with(['user', 'division'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rapbsUser
        ]);
    }

    /**
     * Get RAPBS user by user_id
     */
    public function getByUserId($userId)
    {
        $rapbsUser = RapbsUser::with(['user', 'division'])
            ->where('user_id', $userId)
            ->first();

        if (!$rapbsUser) {
            return response()->json([
                'success' => false,
                'message' => 'RAPBS user not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $rapbsUser
        ]);
    }

    /**
     * Assign RAPBS role to user
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:planner,approver,executor,viewer',
            'division_id' => 'nullable|exists:unit_kerjas,id',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already has RAPBS role
        $exists = RapbsUser::where('user_id', $request->user_id)
            ->where('role', $request->role)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'User already has this RAPBS role'
            ], 422);
        }

        $rapbsUser = RapbsUser::create([
            'user_id' => $request->user_id,
            'role' => $request->role,
            'division_id' => $request->division_id,
            'permissions' => $request->permissions
        ]);

        return response()->json([
            'success' => true,
            'message' => 'RAPBS role assigned successfully',
            'data' => $rapbsUser->load(['user', 'division'])
        ], 201);
    }

    /**
     * Update RAPBS user
     */
    public function update(Request $request, $id)
    {
        $rapbsUser = RapbsUser::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'role' => 'sometimes|in:planner,approver,executor,viewer',
            'division_id' => 'nullable|exists:unit_kerjas,id',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $rapbsUser->update($request->only([
            'role',
            'division_id',
            'permissions'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'RAPBS user updated successfully',
            'data' => $rapbsUser->load(['user', 'division'])
        ]);
    }

    /**
     * Remove RAPBS role from user
     */
    public function destroy($id)
    {
        $rapbsUser = RapbsUser::findOrFail($id);
        $rapbsUser->delete();

        return response()->json([
            'success' => true,
            'message' => 'RAPBS role removed successfully'
        ]);
    }

    /**
     * Get users by role
     */
    public function getUsersByRole($role)
    {
        $validator = Validator::make(['role' => $role], [
            'role' => 'required|in:planner,approver,executor,viewer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid role'
            ], 422);
        }

        $users = RapbsUser::with(['user', 'division'])
            ->where('role', $role)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get available users (users not assigned to RAPBS)
     */
    public function getAvailableUsers()
    {
        $assignedUserIds = RapbsUser::pluck('user_id')->toArray();
        
        $users = User::whereNotIn('id', $assignedUserIds)
            ->where('is_active', true)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}

