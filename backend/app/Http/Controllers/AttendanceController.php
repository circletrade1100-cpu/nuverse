<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = AttendanceLog::with('user');

        // Filter berdasarkan parameter
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('check_in', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('check_in', '<=', $request->date_to);
        }

        $attendances = $query->orderBy('check_in', 'desc')
                           ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $attendances
        ]);
    }

    public function checkIn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $today = Carbon::today();

        // Cek apakah sudah check-in hari ini
        $existingAttendance = AttendanceLog::where('user_id', $user->id)
            ->whereDate('check_in', $today)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'You have already checked in today'
            ], 400);
        }

        $checkInTime = Carbon::now();
        $workStartTime = Carbon::today()->setTime(8, 0); // 08:00
        $status = $checkInTime->isAfter($workStartTime->addMinutes(15)) ? 'late' : 'present';

        $attendance = AttendanceLog::create([
            'user_id' => $user->id,
            'check_in' => $checkInTime,
            'location' => $request->location,
            'ip_address' => $request->ip(),
            'status' => $status,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful',
            'data' => $attendance->load('user')
        ], 201);
    }

    public function checkOut(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $today = Carbon::today();

        // Cari attendance hari ini yang belum check-out
        $attendance = AttendanceLog::where('user_id', $user->id)
            ->whereDate('check_in', $today)
            ->whereNull('check_out')
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'message' => 'No active check-in found for today'
            ], 400);
        }

        $checkOutTime = Carbon::now();
        $attendance->update([
            'check_out' => $checkOutTime,
            'notes' => $request->notes ?: $attendance->notes
        ]);

        // Calculate work hours
        $attendance->calculateWorkHours();

        return response()->json([
            'success' => true,
            'message' => 'Check-out successful',
            'data' => $attendance->load('user')
        ]);
    }

    public function report(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'period' => 'nullable|in:daily,weekly,monthly,yearly',
            'user_id' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $period = $request->get('period', 'monthly');
        $query = AttendanceLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        switch ($period) {
            case 'daily':
                $query->whereDate('check_in', Carbon::today());
                break;
            case 'weekly':
                $query->whereBetween('check_in', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->thisMonth();
                break;
            case 'yearly':
                $query->whereYear('check_in', Carbon::now()->year);
                break;
        }

        $attendances = $query->orderBy('check_in', 'desc')->get();

        // Calculate statistics
        $stats = [
            'total_days' => $attendances->count(),
            'present_days' => $attendances->where('status', 'present')->count(),
            'late_days' => $attendances->where('status', 'late')->count(),
            'absent_days' => $attendances->where('status', 'absent')->count(),
            'sick_days' => $attendances->where('status', 'sick')->count(),
            'leave_days' => $attendances->where('status', 'leave')->count(),
            'total_work_hours' => $attendances->sum('work_hours'),
            'average_work_hours' => $attendances->avg('work_hours') ?: 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'attendances' => $attendances,
                'statistics' => $stats,
                'period' => $period
            ]
        ]);
    }

    public function myAttendance(Request $request)
    {
        $user = $request->user();
        $period = $request->get('period', 'monthly');

        $query = AttendanceLog::where('user_id', $user->id);

        switch ($period) {
            case 'daily':
                $query->whereDate('check_in', Carbon::today());
                break;
            case 'weekly':
                $query->whereBetween('check_in', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->thisMonth();
                break;
            case 'yearly':
                $query->whereYear('check_in', Carbon::now()->year);
                break;
        }

        $attendances = $query->orderBy('check_in', 'desc')->get();

        // Check if user has checked in today
        $todayAttendance = AttendanceLog::where('user_id', $user->id)
            ->whereDate('check_in', Carbon::today())
            ->first();

        $canCheckIn = !$todayAttendance;
        $canCheckOut = $todayAttendance && !$todayAttendance->check_out;

        // Calculate statistics
        $stats = [
            'total_days' => $attendances->count(),
            'present_days' => $attendances->where('status', 'present')->count(),
            'late_days' => $attendances->where('status', 'late')->count(),
            'total_work_hours' => $attendances->sum('work_hours'),
            'average_work_hours' => $attendances->avg('work_hours') ?: 0
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'attendances' => $attendances,
                'statistics' => $stats,
                'today_attendance' => $todayAttendance,
                'can_check_in' => $canCheckIn,
                'can_check_out' => $canCheckOut,
                'period' => $period
            ]
        ]);
    }
}