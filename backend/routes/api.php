<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\GuruAuthController;
use App\Http\Controllers\StudentAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TUController;
use App\Http\Controllers\CashflowController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\UnitKerjaController;
use App\Http\Controllers\JabatanController;
use App\Http\Controllers\UnitSekolahController;
use App\Http\Controllers\UnitKelasController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TestStudentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\KategoriPemasukanController;
use App\Http\Controllers\KategoriPengeluaranController;
use App\Http\Controllers\Api\TagihanController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PayrollInputTuController;
use App\Http\Controllers\THRController;
use App\Http\Controllers\BusinessUnitController;
use App\Http\Controllers\BusinessTransactionController;
use App\Http\Controllers\DanusController;
use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\CutiController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\SarprasController;
use App\Http\Controllers\RAPBSDashboardController;
use App\Http\Controllers\RAPBSPlanController;
use App\Http\Controllers\RAPBSRealizationController;
use App\Http\Controllers\RAPBSMasterDataController;
use App\Http\Controllers\RAPBSReportController;
use App\Http\Controllers\RAPBSUserController;
use App\Http\Controllers\LPJController;
use App\Http\Controllers\LPJDashboardController;
use App\Http\Controllers\Api\DivisionalTransactionController;
use App\Http\Controllers\Api\TeacherAttendanceController;
use App\Http\Controllers\Api\ExpenseDocumentController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\ChartOfAccountsController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\BankTransactionController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\FiscalYearController;
use App\Http\Controllers\ParentCalendarEventController;
use App\Http\Controllers\ParentAnnouncementController;
use App\Http\Controllers\ParentBannerController;

// Test route
Route::post('/test-post', function(Request $request) {
    \Log::info('TEST POST ROUTE CALLED');
    \Log::info('Data: ', $request->all());
    return response()->json([
        'success' => true,
        'message' => 'POST method working',
        'data' => $request->all(),
        'method' => $request->method()
    ]);
});

// Direct student routes outside master-data (try different path)
Route::get('/add-student', [StudentController::class, 'addStudentViaGet']);
Route::get('/list-students', [StudentController::class, 'index']);


// Debug route for student POST
Route::post('/debug-student', function(Request $request) {
    \Log::info('=== DEBUG STUDENT POST CALLED ===');
    \Log::info('Method: ' . $request->method());
    \Log::info('Headers: ', $request->headers->all());
    \Log::info('Data: ', $request->all());
    return response()->json([
        'success' => true,
        'message' => 'Debug POST received',
        'method' => $request->method(),
        'data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
});

// Test Student Controller
Route::post('/test-student-create', [TestStudentController::class, 'testCreate']);

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);

// Guru Authentication routes
Route::prefix('guru-auth')->group(function () {
    Route::post('/login', [GuruAuthController::class, 'login']);
    Route::post('/forgot-password', [GuruAuthController::class, 'forgotPassword']);
    
    // Protected routes (require authentication) - only use guru.guard middleware
    Route::middleware(['guru.guard'])->group(function () {
        Route::get('/profile', [GuruAuthController::class, 'profile']);
        Route::put('/profile', [GuruAuthController::class, 'updateProfile']);
        Route::post('/logout', [GuruAuthController::class, 'logout']);
        Route::post('/logout-all', [GuruAuthController::class, 'logoutAll']);
        Route::post('/change-password', [GuruAuthController::class, 'changePassword']);
        
        // Cuti routes
        Route::get('/cuti/my-cuti', [CutiController::class, 'myCuti']);
        Route::get('/cuti/statistics', [CutiController::class, 'statistics']);
        Route::put('/cuti/{id}/approve', [CutiController::class, 'approve']);
        Route::put('/cuti/{id}/reject', [CutiController::class, 'reject']);
        Route::apiResource('cuti', CutiController::class);
        
        // Overtime routes
        Route::get('/overtime/my-overtime', [OvertimeController::class, 'myOvertime']);
        Route::get('/overtime/statistics', [OvertimeController::class, 'statistics']);
        Route::put('/overtime/{id}/approve', [OvertimeController::class, 'approve']);
        Route::put('/overtime/{id}/reject', [OvertimeController::class, 'reject']);
        Route::apiResource('overtime', OvertimeController::class);
    });
});

// Student Authentication routes
Route::prefix('student-auth')->group(function () {
    Route::post('/login', [StudentAuthController::class, 'login']);
    Route::post('/forgot-password', [StudentAuthController::class, 'forgotPassword']);
    
    // Protected routes (require authentication) - only use student.guard middleware
    Route::middleware(['student.guard'])->group(function () {
        Route::get('/profile', [StudentAuthController::class, 'profile']);
        Route::get('/biodata', [StudentAuthController::class, 'biodata']);
        Route::put('/profile', [StudentAuthController::class, 'updateProfile']);
        Route::put('/biodata', [StudentAuthController::class, 'updateBiodata']);
        Route::post('/avatar', [StudentAuthController::class, 'uploadAvatar']);
        Route::delete('/avatar', [StudentAuthController::class, 'deleteAvatar']);
        Route::post('/logout', [StudentAuthController::class, 'logout']);
        Route::post('/logout-all', [StudentAuthController::class, 'logoutAll']);
        Route::post('/change-password', [StudentAuthController::class, 'changePassword']);
        
        // Student specific data
        Route::get('/tagihan', [StudentAuthController::class, 'getTagihan']);
        Route::get('/pembayaran', [StudentAuthController::class, 'getPembayaran']);
        Route::get('/absensi', [StudentAuthController::class, 'getAbsensi']);
        Route::get('/absensi/statistics', [StudentAuthController::class, 'getAbsensiStatistics']);
        
        // Notifications
        Route::get('/notifications', [StudentAuthController::class, 'getNotifications']);
        Route::get('/notifications/unread-count', [StudentAuthController::class, 'getUnreadNotificationCount']);
        Route::put('/notifications/{id}/read', [StudentAuthController::class, 'markNotificationAsRead']);
        Route::put('/notifications/mark-all-read', [StudentAuthController::class, 'markAllNotificationsAsRead']);
        Route::delete('/notifications/{id}', [StudentAuthController::class, 'deleteNotification']);
        
        // Payment routes
        Route::post('/bills/{id}/payment', [PaymentController::class, 'createPayment']);
        Route::get('/payments/history', [PaymentController::class, 'paymentHistory']);
        Route::get('/payments/status/{orderId}', [PaymentController::class, 'checkStatus']);
        
        // Get student by ID (untuk parent/admin)
        Route::get('/student/{id}', [StudentAuthController::class, 'getStudentById']);
    });
});

// Master Data routes (temporary without auth for testing)
Route::prefix('master-data')->group(function () {
    // Unit Kerja CRUD
    Route::apiResource('unit-kerja', UnitKerjaController::class);
    
    // Jabatan CRUD
    Route::apiResource('jabatan', JabatanController::class);
    
    // Unit Sekolah CRUD
    Route::apiResource('unit-sekolah', UnitSekolahController::class);
    
    // Unit Kelas CRUD
    Route::apiResource('unit-kelas', UnitKelasController::class);
    
    // Bank CRUD
    Route::apiResource('bank', BankController::class);
    
    // Master Data Controller routes
    Route::get('unit-kerjas', [MasterDataController::class, 'getUnitKerjas']);
    Route::get('unit-sekolahs', [MasterDataController::class, 'getUnitSekolahs']);
    
    // Guru CRUD (PROTECTED - require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('guru/export', [GuruController::class, 'export']); // Export guru data - MUST be before apiResource
        Route::get('guru/export-pdf', [GuruController::class, 'exportPdf']); // Export guru data to PDF - MUST be before apiResource
        Route::get('guru-form-data', [GuruController::class, 'getFormData']);
        Route::get('guru/{id}/jumlah-hari-hadir', [GuruController::class, 'getJumlahHariHadir']); // Get jumlah hari hadir
        Route::get('guru/total-absensi', [GuruController::class, 'getTotalAbsensi']); // Get total absensi
        Route::apiResource('guru', GuruController::class);
        Route::post('guru/{id}/update-with-file', [GuruController::class, 'updateWithFile']); // For file uploads
    });

    // Payroll CRUD (PROTECTED - require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        //Route::apiResource('payroll', PayrollController::class);
        // Export routes MUST come before parameterized routes to avoid route collision
        Route::get('payroll/export-rekening-bbjs', [PayrollController::class, 'exportRekeningBBJS']);
        
        // Bulk generate payroll dari data TU Unit
        Route::post('payroll/bulk-generate', [PayrollController::class, 'bulkGenerate']);
        
        Route::get('payroll', [PayrollController::class, 'index']);
        Route::post('payroll', [PayrollController::class, 'store']);
        Route::get('payroll/{id}', [PayrollController::class, 'show']);
        Route::put('payroll/{id}', [PayrollController::class, 'update']);
        Route::delete('payroll/{id}', [PayrollController::class, 'destroy']);
    });
    
    // Payroll Input TU (untuk TU Unit input data)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('payroll-input-tu', [PayrollInputTuController::class, 'index']);
        Route::get('payroll-input-tu/gurus-by-unit', [PayrollInputTuController::class, 'getGurusByUnit']);
        Route::post('payroll-input-tu', [PayrollInputTuController::class, 'store']);
        Route::post('payroll-input-tu/bulk', [PayrollInputTuController::class, 'bulkStore']);
        Route::get('payroll-input-tu/{id}', [PayrollInputTuController::class, 'show']);
        Route::put('payroll-input-tu/{id}', [PayrollInputTuController::class, 'update']);
        Route::delete('payroll-input-tu/{id}', [PayrollInputTuController::class, 'destroy']);
    });
    
    // Guru Payroll endpoints (protected with guru authentication)
    Route::middleware(['guru.guard'])->group(function () {
        Route::get('payroll/guru/my-payroll', [PayrollController::class, 'getGuruPayroll']);
        Route::get('payroll/guru/my-history', [PayrollController::class, 'getGuruPayrollHistory']);
        Route::get('payroll/guru/my-slip/{id}', [PayrollController::class, 'getGuruPayrollSlip']);
        Route::get('payroll/guru/my-thr', [THRController::class, 'getGuruTHR']);
        Route::get('payroll/guru/my-thr-slip/{id}', [THRController::class, 'getGuruTHRSlip']);
    });
    
    // THR CRUD (PROTECTED - require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('thr/export', [THRController::class, 'export']); // Export THR - MUST be before apiResource
        Route::get('thr', [THRController::class, 'index']);
        Route::post('thr', [THRController::class, 'store']);
        Route::get('thr/{id}', [THRController::class, 'show']);
        Route::put('thr/{id}', [THRController::class, 'update']);
        Route::delete('thr/{id}', [THRController::class, 'destroy']);
    });
    
    // Student CRUD - Full REST API support (PROTECTED - require authentication)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('student/statistics', [StudentController::class, 'statistics']); // Get statistics MUST be before apiResource
        Route::apiResource('student', StudentController::class);
        Route::post('student/{id}/update-with-file', [StudentController::class, 'updateWithFile']); // For file uploads
        Route::post('student/import', [StudentController::class, 'import']);
        Route::post('student/import-json', [StudentController::class, 'importJson']);
    });
    
    // Legacy GET-based endpoints (keep for backward compatibility)
    Route::get('student-create', [StudentController::class, 'createViaGet']);
    Route::get('student-update', [StudentController::class, 'updateViaGet']);
    Route::get('student-delete', [StudentController::class, 'deleteViaGet']);
    
    // Kategori Pemasukan CRUD
    Route::apiResource('kategori-pemasukan', KategoriPemasukanController::class)->middleware('auth:sanctum');
    
    // Kategori Pengeluaran CRUD
    Route::apiResource('kategori-pengeluaran', KategoriPengeluaranController::class);
    
    // Jenis Tagihan (Bill Types) CRUD
    Route::post('jenis-tagihan/{id}/toggle-status', [\App\Http\Controllers\Api\BillTypeController::class, 'toggleStatus']);
    Route::apiResource('jenis-tagihan', \App\Http\Controllers\Api\BillTypeController::class);
    
    // Tagihan Siswa CRUD (auth:sanctum agar user & isSuperAdmin() terdeteksi saat hapus)
    // Custom routes harus SEBELUM apiResource untuk avoid conflict dengan {id}
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('tagihan/bill-types', [TagihanController::class, 'getBillTypes']);
        Route::get('tagihan/bill-labels', [TagihanController::class, 'getBillLabels']);
        Route::get('tagihan/student/{studentId}', [TagihanController::class, 'getByStudent']);
        Route::post('tagihan/create-multiple', [TagihanController::class, 'createMultiple']);
        Route::post('tagihan/bulk-create', [TagihanController::class, 'bulkCreate']);
        Route::apiResource('tagihan', TagihanController::class);
    });
    
    // Pembayaran CRUD
    // Custom routes harus SEBELUM apiResource untuk avoid conflict dengan {id}
    Route::get('pembayaran/bill/{billId}', [PembayaranController::class, 'getByBill']);
    Route::get('pembayaran/summary', [PembayaranController::class, 'getSummary']);
    Route::apiResource('pembayaran', PembayaranController::class);
    
    // Jenis Unit Usaha CRUD
    // JenisUnitUsahaController temporarily disabled
    // Route::get('jenis-unit-usaha/all', [JenisUnitUsahaController::class, 'getAll']);
    // Route::apiResource('jenis-unit-usaha', JenisUnitUsahaController::class);
    
    // Absensi CRUD
    Route::get('absensi/statistics/daily', [AbsensiController::class, 'getDailyStatistics']);
    Route::get('absensi/statistics/detailed', [AbsensiController::class, 'getDetailedStatistics']);
    Route::get('absensi/statistics', [AbsensiController::class, 'getStatistics']);
    Route::get('absensi/export', [AbsensiController::class, 'export']); // Export absensi data - MUST be before apiResource
    Route::post('absensi/check-in', [AbsensiController::class, 'checkIn']);
    Route::post('absensi/check-out', [AbsensiController::class, 'checkOut']);
    Route::get('absensi/today', [AbsensiController::class, 'getTodayAttendance']);
    Route::post('absensi/mobile-checkin', [AbsensiController::class, 'mobileCheckIn']);
    Route::post('absensi/check-unfinished', [AbsensiController::class, 'checkUnfinishedAttendance']);
    Route::apiResource('absensi', AbsensiController::class);
    
// SARPRAS (Sarana Prasarana) CRUD
// Statistics & Dashboard
Route::get('sarpras/statistics', [SarprasController::class, 'statistics']);
Route::get('sarpras/categories', [SarprasController::class, 'getCategories']);

// Categories Management
Route::post('sarpras/categories', [SarprasController::class, 'storeCategory']);
Route::delete('sarpras/categories/{id}', [SarprasController::class, 'deleteCategory']);

// Inventory Items CRUD
Route::apiResource('sarpras', SarprasController::class);
    
    // Maintenance Schedules
    Route::get('sarpras/maintenance/schedules', [SarprasController::class, 'getMaintenanceSchedules']);
    Route::post('sarpras/maintenance/schedules', [SarprasController::class, 'storeMaintenanceSchedule']);
    Route::put('sarpras/maintenance/schedules/{id}', [SarprasController::class, 'updateMaintenanceSchedule']);
    Route::delete('sarpras/maintenance/schedules/{id}', [SarprasController::class, 'deleteMaintenanceSchedule']);
    
    // Repair Requests
    Route::get('sarpras/repair/requests', [SarprasController::class, 'getRepairRequests']);
    Route::post('sarpras/repair/requests', [SarprasController::class, 'storeRepairRequest']);
    Route::put('sarpras/repair/requests/{id}', [SarprasController::class, 'updateRepairRequest']);
    Route::delete('sarpras/repair/requests/{id}', [SarprasController::class, 'deleteRepairRequest']);
    Route::put('sarpras/repair/requests/{id}/status', [SarprasController::class, 'updateRepairRequestStatus']);
    
    // Depreciation Logs
    Route::get('sarpras/depreciation/logs', [SarprasController::class, 'getDepreciationLogs']);
    Route::post('sarpras/depreciation/logs', [SarprasController::class, 'createDepreciationLog']);
    Route::put('sarpras/depreciation/logs/{id}', [SarprasController::class, 'updateDepreciationLog']);
    Route::delete('sarpras/depreciation/logs/{id}', [SarprasController::class, 'deleteDepreciationLog']);
    
    // Audit Logs
    Route::get('sarpras/audit/logs', [SarprasController::class, 'getAuditLogs']);
    Route::post('sarpras/audit/logs', [SarprasController::class, 'createAuditLog']);
    Route::put('sarpras/audit/logs/{id}', [SarprasController::class, 'updateAuditLog']);
    Route::delete('sarpras/audit/logs/{id}', [SarprasController::class, 'deleteAuditLog']);
    
    // Presensi QR Scan Routes
    Route::post('presensi/masuk', [\App\Http\Controllers\Api\PresensiController::class, 'presensiMasuk']);
    Route::post('presensi/keluar', [\App\Http\Controllers\Api\PresensiController::class, 'presensiKeluar']);
    Route::post('presensi/status', [\App\Http\Controllers\Api\PresensiController::class, 'statusPresensiHariIni']);
    Route::get('presensi/foto/{filename}', [\App\Http\Controllers\Api\PresensiController::class, 'getFotoPresensi']);
    
    // Divisions CRUD
    Route::apiResource('divisions', DivisionController::class);
});

// Midtrans Webhook (no auth - called by Midtrans)
Route::post('/midtrans/callback', [PaymentController::class, 'webhook']);
Route::post('/midtrans/webhook', [PaymentController::class, 'webhook']); // Backup

// Manual webhook trigger for testing
Route::post('/midtrans/webhook/manual', [PaymentController::class, 'manualWebhook']);
Route::get('/payment/status/{orderId}', [PaymentController::class, 'checkStatus']);
Route::post('/payment/process/{orderId}', [PaymentController::class, 'processTransaction']);

// Payment monitoring routes
Route::get('/payment-monitoring/dashboard', [PaymentMonitoringController::class, 'dashboard']);
Route::get('/payment-monitoring/transaction/{orderId}', [PaymentMonitoringController::class, 'transactionStatus']);
Route::post('/payment-monitoring/process/{orderId}', [PaymentMonitoringController::class, 'processTransaction']);

// Real-time payment processing (for authenticated students)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/realtime-payment/check', [RealTimePaymentController::class, 'checkActivePayments']);
    Route::post('/realtime-payment/process', [RealTimePaymentController::class, 'processSettledPayment']);
});

// Role and Permission routes (PROTECTED - require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);
    
    // User Management routes (PROTECTED - require authentication)
    Route::apiResource('users', UserController::class);
});

// DANUS (Dana Usaha) routes - TEMPORARILY WITHOUT AUTH FOR TESTING
Route::prefix('danus')->group(function () {
    // Dashboard & Reports
    Route::get('/dashboard', [DanusController::class, 'dashboard']);
    Route::get('/profit-loss', [DanusController::class, 'profitLoss']);
    Route::get('/unit-performance', [DanusController::class, 'unitPerformance']);
    Route::get('/summary', [DanusController::class, 'summary']);
    
    // Business Units
    Route::apiResource('business-units', BusinessUnitController::class);
    Route::get('business-units/{id}/performance', [BusinessUnitController::class, 'performance']);
    
    // Alternative endpoints for managers and types (to avoid routing conflicts)
    Route::get('danus-managers', [BusinessUnitController::class, 'getManagers']);
    Route::get('danus-types', [BusinessUnitController::class, 'getTypes']);
    
    // Business Transactions
    Route::apiResource('transactions', BusinessTransactionController::class);
    Route::get('transactions/income', [BusinessTransactionController::class, 'income']);
    Route::get('transactions/expense', [BusinessTransactionController::class, 'expense']);
    Route::get('transactions/pending', [BusinessTransactionController::class, 'pending']);
    Route::put('transactions/{id}/approve', [BusinessTransactionController::class, 'approve']);
    Route::put('transactions/{id}/reject', [BusinessTransactionController::class, 'reject']);
    Route::put('transactions/{id}/complete', [BusinessTransactionController::class, 'complete']);
});

Route::middleware('auth:sanctum')->group(function () {
    // Debug route for testing authentication
    Route::get('/debug/auth', function (Request $request) {
        return response()->json([
            'success' => true,
            'message' => 'Authentication working',
            'user' => $request->user(),
            'token' => $request->bearerToken()
        ]);
    });
    
    // Cuti Management for Admin/HRD
    Route::prefix('cuti-management')->group(function () {
        Route::get('/', [CutiController::class, 'index']);
        Route::get('/statistics', [CutiController::class, 'statistics']);
        Route::get('/{id}', [CutiController::class, 'show']);
        Route::post('/', [CutiController::class, 'store']);
        Route::put('/{id}', [CutiController::class, 'update']);
        Route::delete('/{id}', [CutiController::class, 'destroy']);
        Route::put('/{id}/approve', [CutiController::class, 'approve']);
        Route::put('/{id}/reject', [CutiController::class, 'reject']);
    });
    
    // Overtime Management for Admin/HRD
    Route::prefix('overtime')->group(function () {
        Route::get('/', [OvertimeController::class, 'index']);
        Route::get('/statistics', [OvertimeController::class, 'statistics']);
        Route::get('/{id}', [OvertimeController::class, 'show']);
        Route::post('/', [OvertimeController::class, 'store']);
        Route::put('/{id}', [OvertimeController::class, 'update']);
        Route::delete('/{id}', [OvertimeController::class, 'destroy']);
        Route::post('/{id}/approve', [OvertimeController::class, 'approve']);
        Route::post('/{id}/reject', [OvertimeController::class, 'reject']);
    });
    
    // Token refresh route
    Route::post('/auth/refresh', function (Request $request) {
        $user = $request->user();
        if ($user) {
            // Revoke old token
            $request->user()->currentAccessToken()->delete();
            // Create new token
            $token = $user->createToken('web-token', ['*'], null);
            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'token' => $token->plainTextToken,
                    'user' => $user
                ]
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'User not authenticated'
        ], 401);
    });
    
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::get('/users/{id}/profile', [UserController::class, 'getProfile']);
    Route::put('/users/{id}/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/{id}/avatar', [UserController::class, 'uploadAvatar']);
    
    // TU Dashboard routes
    Route::prefix('tu')->group(function () {
        Route::get('/dashboard', [TUController::class, 'dashboard']);
        Route::get('/income-summary', [TUController::class, 'incomeSummary']);
        Route::get('/expense-summary', [TUController::class, 'expenseSummary']);
        Route::get('/spp-reminders', [TUController::class, 'sppReminders']);
        Route::get('/approval-notifications', [TUController::class, 'approvalNotifications']);
        Route::get('/attendance-status', [TUController::class, 'attendanceStatus']);
        Route::get('/report-data', [TUController::class, 'getReportData']);
        
        // Cashflow Management
        Route::prefix('cashflow')->group(function () {
            Route::get('/income', [CashflowController::class, 'getIncome']);
            Route::post('/income', [CashflowController::class, 'createIncome']);
            Route::get('/expense', [CashflowController::class, 'getExpense']);
            Route::post('/expense', [CashflowController::class, 'createExpense']);
            Route::get('/summary', [CashflowController::class, 'getSummary']);
            Route::put('/transactions/{id}/approve', [CashflowController::class, 'approveTransaction']);
            Route::put('/transactions/{id}/reject', [CashflowController::class, 'rejectTransaction']);
            Route::put('/transactions/{id}', [CashflowController::class, 'updateTransaction']);
            Route::delete('/transactions/{id}', [CashflowController::class, 'deleteTransaction']);
        });
        
        // Attendance Management
        Route::prefix('attendance')->group(function () {
            Route::get('/', [AttendanceController::class, 'index']);
            Route::post('/check-in', [AttendanceController::class, 'checkIn']);
            Route::post('/check-out', [AttendanceController::class, 'checkOut']);
            Route::get('/report', [AttendanceController::class, 'report']);
            Route::get('/my-attendance', [AttendanceController::class, 'myAttendance']);
        });
    });

    // RAPBS Routes
    Route::prefix('rapbs')->group(function () {
        // Dashboard
        Route::get('/dashboard', [RAPBSDashboardController::class, 'index']);

        // Master Data - Academic Years
        Route::get('/academic-years', [RAPBSMasterDataController::class, 'getAcademicYears']);
        Route::get('/academic-years/{id}', [RAPBSMasterDataController::class, 'getAcademicYear']);
        Route::post('/academic-years', [RAPBSMasterDataController::class, 'storeAcademicYear']);
        Route::put('/academic-years/{id}', [RAPBSMasterDataController::class, 'updateAcademicYear']);
        Route::delete('/academic-years/{id}', [RAPBSMasterDataController::class, 'deleteAcademicYear']);

        // Master Data - Activity Categories
        Route::get('/activity-categories', [RAPBSMasterDataController::class, 'getActivityCategories']);
        Route::get('/activity-categories/{id}', [RAPBSMasterDataController::class, 'getActivityCategory']);
        Route::post('/activity-categories', [RAPBSMasterDataController::class, 'storeActivityCategory']);
        Route::put('/activity-categories/{id}', [RAPBSMasterDataController::class, 'updateActivityCategory']);
        Route::delete('/activity-categories/{id}', [RAPBSMasterDataController::class, 'deleteActivityCategory']);

        // Master Data - Funding Sources
        Route::get('/funding-sources', [RAPBSMasterDataController::class, 'getFundingSources']);
        Route::get('/funding-sources/{id}', [RAPBSMasterDataController::class, 'getFundingSource']);
        Route::post('/funding-sources', [RAPBSMasterDataController::class, 'storeFundingSource']);
        Route::put('/funding-sources/{id}', [RAPBSMasterDataController::class, 'updateFundingSource']);
        Route::delete('/funding-sources/{id}', [RAPBSMasterDataController::class, 'deleteFundingSource']);

        // RAPBS Plans
        Route::get('/plans', [RAPBSPlanController::class, 'index']);
        Route::get('/plans/{id}', [RAPBSPlanController::class, 'show']);
        Route::post('/plans', [RAPBSPlanController::class, 'store']);
        Route::put('/plans/{id}', [RAPBSPlanController::class, 'update']);
        Route::delete('/plans/{id}', [RAPBSPlanController::class, 'destroy']);
        Route::put('/plans/{id}/submit', [RAPBSPlanController::class, 'submit']);
        
        // Multi-Level Approval
        Route::put('/plans/{id}/approve-by-principal', [RAPBSPlanController::class, 'approveByPrincipal']);
        Route::put('/plans/{id}/approve-by-dirpen', [RAPBSPlanController::class, 'approveByDirpen']);
        Route::put('/plans/{id}/approve-by-director', [RAPBSPlanController::class, 'approveByDirector']);
        
        // Multi-Level Rejection
        Route::put('/plans/{id}/reject-by-principal', [RAPBSPlanController::class, 'rejectByPrincipal']);
        Route::put('/plans/{id}/reject-by-dirpen', [RAPBSPlanController::class, 'rejectByDirpen']);
        Route::put('/plans/{id}/reject-by-director', [RAPBSPlanController::class, 'rejectByDirector']);
        
        // Backward compatibility (deprecated - use multi-level endpoints instead)
        Route::put('/plans/{id}/approve', [RAPBSPlanController::class, 'approve']);
        Route::put('/plans/{id}/reject', [RAPBSPlanController::class, 'reject']);

        // Budget Breakdowns
        Route::get('/plans/{planId}/breakdown', [RAPBSPlanController::class, 'getBreakdown']);
        Route::post('/plans/{planId}/breakdown', [RAPBSPlanController::class, 'addBreakdown']);
        Route::put('/plans/{planId}/breakdown/{breakdownId}', [RAPBSPlanController::class, 'updateBreakdown']);
        Route::delete('/plans/{planId}/breakdown/{breakdownId}', [RAPBSPlanController::class, 'deleteBreakdown']);

        // Plan Documents
        Route::get('/plans/{planId}/documents', [RAPBSPlanController::class, 'getDocuments']);
        Route::post('/plans/{planId}/upload-document', [RAPBSPlanController::class, 'uploadDocument']);
        Route::delete('/plans/{planId}/documents/{documentId}', [RAPBSPlanController::class, 'deleteDocument']);

        // Activity Notes
        Route::get('/plans/{planId}/notes', [RAPBSPlanController::class, 'getNotes']);
        Route::post('/plans/{planId}/notes', [RAPBSPlanController::class, 'addNote']);

        // Realizations
        Route::get('/realizations', [RAPBSRealizationController::class, 'index']);
        Route::get('/realizations/{id}', [RAPBSRealizationController::class, 'show']);
        Route::post('/realizations', [RAPBSRealizationController::class, 'store']);
        Route::put('/realizations/{id}', [RAPBSRealizationController::class, 'update']);
        Route::delete('/realizations/{id}', [RAPBSRealizationController::class, 'destroy']);
        Route::put('/realizations/{id}/submit', [RAPBSRealizationController::class, 'submit']);
        
        // Multi-Level Approval (mengikuti alur Rencana RAPBS)
        Route::put('/realizations/{id}/approve-by-principal', [RAPBSRealizationController::class, 'approveByPrincipal']);
        Route::put('/realizations/{id}/approve-by-dirpen', [RAPBSRealizationController::class, 'approveByDirpen']);
        Route::put('/realizations/{id}/approve-by-director', [RAPBSRealizationController::class, 'approveByDirector']);
        
        // Rejection per level
        Route::put('/realizations/{id}/reject-by-principal', [RAPBSRealizationController::class, 'rejectByPrincipal']);
        Route::put('/realizations/{id}/reject-by-dirpen', [RAPBSRealizationController::class, 'rejectByDirpen']);
        Route::put('/realizations/{id}/reject-by-director', [RAPBSRealizationController::class, 'rejectByDirector']);
        
        // Backward compatibility (deprecated)
        Route::put('/realizations/{id}/approve', [RAPBSRealizationController::class, 'approve']);
        Route::put('/realizations/{id}/reject', [RAPBSRealizationController::class, 'reject']);

        // Realization Documents
        Route::get('/realizations/{realizationId}/documents', [RAPBSRealizationController::class, 'getDocuments']);
        Route::post('/realizations/{realizationId}/upload-document', [RAPBSRealizationController::class, 'uploadDocument']);
        Route::put('/realizations/{realizationId}/documents/{documentId}/validate', [RAPBSRealizationController::class, 'validateDocument']);

        // Reports
        Route::get('/reports/plan-vs-realization', [RAPBSReportController::class, 'planVsRealization']);
        Route::get('/reports/realization/summary', [RAPBSReportController::class, 'realizationSummary']);
        Route::get('/reports/variance-analysis', [RAPBSReportController::class, 'varianceAnalysis']);
        Route::get('/reports/performance', [RAPBSReportController::class, 'performance']);

        // RAPBS Users Management
        Route::get('/users', [RAPBSUserController::class, 'index']);
        Route::get('/users/{id}', [RAPBSUserController::class, 'show']);
        Route::get('/users/by-user/{userId}', [RAPBSUserController::class, 'getByUserId']);
        Route::post('/users', [RAPBSUserController::class, 'store']);
        Route::put('/users/{id}', [RAPBSUserController::class, 'update']);
        Route::delete('/users/{id}', [RAPBSUserController::class, 'destroy']);
        Route::get('/users/role/{role}', [RAPBSUserController::class, 'getUsersByRole']);
        Route::get('/available-users', [RAPBSUserController::class, 'getAvailableUsers']);
    });

    // LPJ (Laporan Pertanggung Jawaban) Routes
    Route::prefix('lpj')->group(function () {
        // Dashboard
        Route::get('/dashboard', [LPJDashboardController::class, 'index']);

        // Get available RAPBS plans for LPJ (MUST be before /{id} routes)
        Route::get('/available-plans', [LPJController::class, 'getAvailablePlans']);

        // LPJ CRUD
        Route::get('/', [LPJController::class, 'index']);
        Route::get('/{id}', [LPJController::class, 'show']);
        Route::post('/', [LPJController::class, 'store']);
        Route::put('/{id}', [LPJController::class, 'update']);
        Route::delete('/{id}', [LPJController::class, 'destroy']);

        // Approval Workflow
        Route::put('/{id}/submit', [LPJController::class, 'submit']);
        Route::put('/{id}/approve-by-principal', [LPJController::class, 'approveByPrincipal']);
        Route::put('/{id}/approve-by-dirpen', [LPJController::class, 'approveByDirpen']);
        Route::put('/{id}/approve-by-director', [LPJController::class, 'approveByDirector']);
        Route::put('/{id}/reject', [LPJController::class, 'reject']);
        Route::put('/{id}/finalize', [LPJController::class, 'finalize']);

        // Summary
        Route::get('/{id}/summary', [LPJController::class, 'summary']);

        // Documents
        Route::post('/{id}/documents', [LPJController::class, 'uploadDocument']);
        Route::delete('/{id}/documents/{documentId}', [LPJController::class, 'deleteDocument']);

        // Notes
        Route::post('/{id}/notes', [LPJController::class, 'addNote']);
    });

    // Division/Unit Management Routes
    Route::prefix('division')->group(function () {
        // Transaction Management - Custom routes first
        Route::get('transactions/income', [DivisionalTransactionController::class, 'getIncome']);
        Route::get('transactions/expense', [DivisionalTransactionController::class, 'getExpense']);
        
        // Transaction CRUD (nama route diprefix agar tidak bentrok dengan apiResource transactions DANUS / route:cache)
        Route::apiResource('transactions', DivisionalTransactionController::class)
            ->names('division.transactions');
        
        // Reports
        Route::get('reports/summary', [DivisionalTransactionController::class, 'getSummary']);
        Route::get('reports/funding-breakdown', [DivisionalTransactionController::class, 'getFundingBreakdown']);
        Route::get('reports/expense-analysis', [DivisionalTransactionController::class, 'getExpenseAnalysis']);
        
        // Teacher Attendance & Document Management
        Route::post('attendance/upload-document', [TeacherAttendanceController::class, 'uploadDocument']);
        Route::get('attendance/documents', [TeacherAttendanceController::class, 'getDocuments']);
        Route::put('attendance/documents/{id}/approve', [TeacherAttendanceController::class, 'approveDocument']);
        Route::put('attendance/documents/{id}/reject', [TeacherAttendanceController::class, 'rejectDocument']);
        Route::get('attendance/teachers', [TeacherAttendanceController::class, 'getTeachers']);
        Route::post('attendance/input', [TeacherAttendanceController::class, 'inputAttendance']);
        Route::get('attendance/report', [TeacherAttendanceController::class, 'getReport']);
        
        // Expense Document Management
        Route::post('expense/upload', [ExpenseDocumentController::class, 'upload']);
        Route::get('expense/documents', [ExpenseDocumentController::class, 'getDocuments']);
        Route::put('expense/documents/{id}/approve', [ExpenseDocumentController::class, 'approveDocument']);
        Route::put('expense/documents/{id}/reject', [ExpenseDocumentController::class, 'rejectDocument']);
        Route::get('expense/summary', [ExpenseDocumentController::class, 'getSummary']);
        Route::get('expense/report', [ExpenseDocumentController::class, 'getReport']);
        Route::post('expense/input', [ExpenseDocumentController::class, 'inputExpense']);
    });

});

// Storage route untuk mengakses file public
Route::get('storage/{filename}', function ($filename) {
    try {
        $path = storage_path('app/public/' . $filename);
        
        if (!file_exists($path)) {
            \Log::warning('Storage file not found', ['filename' => $filename, 'path' => $path]);
            abort(404);
        }
        
        // Get mime type
        $mimeType = mime_content_type($path);
        if (!$mimeType) {
            $mimeType = 'application/octet-stream';
        }
        
        // Return file with proper headers
        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    } catch (\Exception $e) {
        \Log::error('Storage file access error', [
            'filename' => $filename,
            'error' => $e->getMessage()
        ]);
        abort(404);
    }
})->where('filename', '.*');

// ==================== ACCOUNTING MODULE ====================

Route::prefix('accounting')->middleware('auth:sanctum')->group(function () {
    
    // Chart of Accounts
    Route::apiResource('chart-of-accounts', ChartOfAccountsController::class);
    
    // Journal Entries
    Route::post('journal-entries/{id}/post', [JournalController::class, 'post']);
    Route::post('journal-entries/{id}/void', [JournalController::class, 'void']);
    Route::apiResource('journal-entries', JournalController::class);
    
    // Bank Accounts
    Route::apiResource('bank-accounts', BankAccountController::class);
    
    // Bank Transactions
    Route::apiResource('bank-transactions', BankTransactionController::class);
    
    // Fiscal Years
    Route::post('fiscal-years/{id}/close', [FiscalYearController::class, 'close']);
    Route::apiResource('fiscal-years', FiscalYearController::class);
    
});

// ==================== CMS PARENT MODULE ====================

// Public routes (accessible without authentication for parent dashboard)
Route::prefix('cms-parent')->group(function () {
    Route::get('calendar-events/public', [ParentCalendarEventController::class, 'getPublicEvents']);
    Route::get('announcements/public', [ParentAnnouncementController::class, 'getPublicAnnouncements']);
    Route::get('banners/public', [ParentBannerController::class, 'getPublicBanners']);
    Route::post('announcements/{id}/increment-views', [ParentAnnouncementController::class, 'incrementViews']);
});

// Admin routes (require authentication for CMS management)
Route::prefix('cms-parent')->middleware('auth:sanctum')->group(function () {
    
    // Calendar Events CRUD
    Route::apiResource('calendar-events', ParentCalendarEventController::class);
    
    // Announcements CRUD
    Route::apiResource('announcements', ParentAnnouncementController::class);
    
    // Banners CRUD
    Route::post('banners/update-sort-order', [ParentBannerController::class, 'updateSortOrder']);
    Route::apiResource('banners', ParentBannerController::class);
    
});
