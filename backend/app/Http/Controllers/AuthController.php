<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $user->load('profile', 'roles.permissions');
            
            // If user is super admin, add virtual permissions to response
            if ($user->isSuperAdmin()) {
                $allPermissions = collect($user->getAllPermissions())->map(function($permissionName) {
                    return [
                        'id' => 0, // Virtual permission ID
                        'name' => $permissionName,
                        'display_name' => ucwords(str_replace(['-', '.'], [' ', ' '], $permissionName))
                    ];
                });

                // Add virtual permissions to the first role (or create a virtual role)
                if ($user->roles->isNotEmpty()) {
                    $user->roles->first()->setRelation('permissions', $allPermissions);
                }
            }
            
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
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

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load('profile', 'roles.permissions');
        
        // If user is super admin, add virtual permissions to response
        if ($user->isSuperAdmin()) {
            $allPermissions = collect($user->getAllPermissions())->map(function($permissionName) {
                return [
                    'id' => 0, // Virtual permission ID
                    'name' => $permissionName,
                    'display_name' => ucwords(str_replace(['-', '.'], [' ', ' '], $permissionName))
                ];
            });

            // Add virtual permissions to the first role (or create a virtual role)
            if ($user->roles->isNotEmpty()) {
                $user->roles->first()->setRelation('permissions', $allPermissions);
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Logic untuk mengirim reset password email
        // TODO: Implement password reset functionality

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email'
        ]);
    }
}
