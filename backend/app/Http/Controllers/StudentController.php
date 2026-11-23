<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Disable logging temporarily due to permission issues
//         // \Log::info('=== INDEX METHOD CALLED ===');
//         // \Log::info('Request method: ' . $request->method());
//         // \Log::info('Request URL: ' . $request->url());
//         // \Log::info('Request headers: ', $request->headers->all());
//         // \Log::info('Request content: ' . $request->getContent());
//         // \Log::info('Query params: ', $request->query->all());
        
        // Simple create detection using specific parameters
        if ($request->has('create_student') && $request->has('data_json')) {
//             // \Log::info('=== SIMPLE CREATE DETECTED ===');
            
            $dataJson = $request->get('data_json');
            $decodedData = json_decode(urldecode($dataJson), true);
            
            if ($decodedData) {
//                 // \Log::info('Decoded student data: ', $decodedData);
                $request->merge($decodedData);
                return $this->store($request);
            } else {
//                 // \Log::error('Failed to decode JSON data: ' . $dataJson);
            }
        }
        
        $query = Student::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nama_panggilan', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Unit sekolah filter
        if ($request->has('unit_sekolah')) {
            $query->byUnitSekolah($request->unit_sekolah);
        }

        // Unit kelas filter
        if ($request->has('unit_kelas')) {
            $query->byUnitKelas($request->unit_kelas);
        }

        $students = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 15));

        // Add umur to each student
        $students->getCollection()->transform(function ($student) {
            $student->umur = $student->umur;
            return $student;
        });

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    /**
     * Get statistics for all students (count per unit sekolah)
     */
    public function statistics()
    {
        // Count by unit sekolah using LIKE pattern to match variations like TKIT, SDIT, SMPIT, SMAIT
        $stats = [
            'total' => Student::count(),
            'by_unit_sekolah' => [
                'TK' => Student::where(function($q) {
                    $q->where('unit_sekolah', 'TK')
                      ->orWhere('unit_sekolah', 'like', 'TK%');
                })->count(),
                'SD' => Student::where(function($q) {
                    $q->where('unit_sekolah', 'SD')
                      ->orWhere('unit_sekolah', 'like', 'SD%');
                })->count(),
                'SMP' => Student::where(function($q) {
                    $q->where('unit_sekolah', 'SMP')
                      ->orWhere('unit_sekolah', 'like', 'SMP%');
                })->count(),
                'SMA' => Student::where(function($q) {
                    $q->where('unit_sekolah', 'SMA')
                      ->orWhere('unit_sekolah', 'like', 'SMA%');
                })->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Disable logging temporarily due to permission issues
//         // \Log::info('🚀 === STUDENT CREATE REQUEST RECEIVED ===');
        error_log('=== STUDENT STORE METHOD CALLED ===');
        error_log('Request method: ' . $request->method());
        error_log('Content-Type: ' . $request->header('Content-Type'));
        error_log('Has files: ' . ($request->hasFile('avatar') ? 'YES' : 'NO'));
        error_log('All request data: ' . json_encode($request->all()));
        if ($request->hasFile('avatar')) {
            error_log('Files in request: ' . json_encode(array_keys($request->allFiles())));
        }
        
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'required|string|max:100',
            'nisn' => 'required|string|max:20|unique:students',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'nama_ibu' => 'required|string|max:255',
            'nama_ayah' => 'required|string|max:255',
            'nomor_hp' => 'required|string|max:20',
            'alamat' => 'required|string',
            'email' => 'required|email|unique:students',
            'unit_sekolah' => 'required|string|max:50',
            'unit_kelas' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|in:Aktif,Non-Aktif,Lulus,Pindah'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            error_log('Avatar file received: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' bytes)');
            $avatarPath = $file->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
            error_log('Avatar stored at: ' . $avatarPath);
        } else {
            error_log('No avatar file received in request');
        }

        try {
            // Use transaction to ensure data is committed
            $student = \DB::transaction(function () use ($data) {
                $student = Student::create($data);
                // Force commit and reload
                $student = $student->fresh();
                return $student;
            });
            
        } catch (\Exception $e) {
//             \Log::error('Error creating student:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully',
            'data' => $student
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::findOrFail($id);
        $student->umur = $student->umur;
        
        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
//         \Log::info('=== UPDATE METHOD CALLED ===');
//         \Log::info('Student ID: ' . $id);
//         \Log::info('Request method: ' . $request->method());
//         \Log::info('Request data: ', $request->all());
//         \Log::info('Content-Type: ' . $request->header('Content-Type'));
        
        $student = Student::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'nama_panggilan' => 'sometimes|string|max:100',
            'nisn' => 'sometimes|string|max:20|unique:students,nisn,' . $id,
            'tempat_lahir' => 'sometimes|string|max:100',
            'tanggal_lahir' => 'sometimes|date',
            'nama_ibu' => 'sometimes|string|max:255',
            'nama_ayah' => 'sometimes|string|max:255',
            'nomor_hp' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string',
            'email' => 'sometimes|email|unique:students,email,' . $id,
            'unit_sekolah' => 'sometimes|string|max:50',
            'unit_kelas' => 'sometimes|string|max:20',
            'password' => 'sometimes|string|min:6',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|in:Aktif,Non-Aktif,Lulus,Pindah'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            error_log('UPDATE: Avatar file received: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' bytes)');
            
            // Delete old avatar if exists
            if ($student->avatar) {
                error_log('UPDATE: Deleting old avatar: ' . $student->avatar);
                Storage::disk('public')->delete($student->avatar);
            }
            
            $avatarPath = $file->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
            error_log('UPDATE: Avatar stored at: ' . $avatarPath);
        } else {
            error_log('UPDATE: No avatar file received in request');
            error_log('UPDATE: Request files: ' . json_encode($request->allFiles()));
            error_log('UPDATE: Request method: ' . $request->method());
            error_log('UPDATE: Content-Type: ' . $request->header('Content-Type'));
        }

        $student->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student,
            'debug' => [
                'hasFile' => $request->hasFile('avatar'),
                'files' => array_keys($request->allFiles()),
                'method' => $request->method(),
                'contentType' => $request->header('Content-Type')
            ]
        ]);
    }

    /**
     * Update student with file upload support
     */
    public function updateWithFile(Request $request, string $id)
    {
        error_log('=== UPDATE WITH FILE METHOD CALLED ===');
        error_log('Student ID: ' . $id);
        error_log('Request method: ' . $request->method());
        error_log('Content-Type: ' . $request->header('Content-Type'));
        error_log('Has files: ' . ($request->hasFile('avatar') ? 'YES' : 'NO'));
        
        $student = Student::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'sometimes|string|max:255',
            'nama_panggilan' => 'sometimes|string|max:100',
            'nisn' => 'sometimes|string|max:20|unique:students,nisn,' . $id,
            'tempat_lahir' => 'sometimes|string|max:100',
            'tanggal_lahir' => 'sometimes|date',
            'nama_ibu' => 'sometimes|string|max:255',
            'nama_ayah' => 'sometimes|string|max:255',
            'nomor_hp' => 'sometimes|string|max:20',
            'alamat' => 'sometimes|string',
            'email' => 'sometimes|email|unique:students,email,' . $id,
            'unit_sekolah' => 'sometimes|string|max:50',
            'unit_kelas' => 'sometimes|string|max:20',
            'password' => 'sometimes|string|min:6',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|in:Aktif,Non-Aktif,Lulus,Pindah'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['avatar']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            error_log('UPDATE WITH FILE: Avatar file received: ' . $file->getClientOriginalName() . ' (' . $file->getSize() . ' bytes)');
            
            // Delete old avatar if exists
            if ($student->avatar) {
                error_log('UPDATE WITH FILE: Deleting old avatar: ' . $student->avatar);
                Storage::disk('public')->delete($student->avatar);
            }
            
            $avatarPath = $file->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
            error_log('UPDATE WITH FILE: Avatar stored at: ' . $avatarPath);
        } else {
            error_log('UPDATE WITH FILE: No avatar file received');
        }

        $student->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully with file',
            'data' => $student,
            'debug' => [
                'hasFile' => $request->hasFile('avatar'),
                'files' => array_keys($request->allFiles()),
                'method' => $request->method(),
                'contentType' => $request->header('Content-Type')
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
//         \Log::info('=== DESTROY METHOD CALLED ===');
//         \Log::info('Student ID: ' . $id);
        
        $student = Student::findOrFail($id);
        
        // Delete avatar if exists
        if ($student->avatar) {
            Storage::disk('public')->delete($student->avatar);
        }
        
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }

    /**
     * Handle all student requests based on action parameter
     */
    public function handleRequest(Request $request)
    {
//         \Log::info('=== HANDLE REQUEST METHOD CALLED ===');
//         \Log::info('Method: ' . $request->method());
//         \Log::info('Query params: ', $request->query->all());
//         \Log::info('Body data: ', $request->all());
        
        $action = $request->get('action', 'list');
        $method = $request->method();
        
        switch ($action) {
            case 'create':
                if ($method === 'POST') {
                    return $this->store($request);
                }
                break;
                
            case 'update':
                if ($method === 'PUT' || $method === 'POST') {
                    $id = $request->get('id');
                    if (!$id) {
                        return response()->json([
                            'success' => false,
                            'message' => 'ID is required for update'
                        ], 400);
                    }
                    return $this->update($request, $id);
                }
                break;
                
            case 'delete':
                if ($method === 'DELETE' || $method === 'POST') {
                    $id = $request->get('id');
                    if (!$id) {
                        return response()->json([
                            'success' => false,
                            'message' => 'ID is required for delete'
                        ], 400);
                    }
                    return $this->destroy($id);
                }
                break;
                
            case 'show':
                $id = $request->get('id');
                if (!$id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'ID is required for show'
                    ], 400);
                }
                return $this->show($id);
                
            case 'list':
            default:
                return $this->index($request);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid action or method combination'
        ], 400);
    }

    /**
     * Create student via GET request
     */
    public function createViaGet(Request $request)
    {
//         \Log::info('=== CREATE VIA GET CALLED ===');
//         \Log::info('Query params: ', $request->query->all());
        
        // Get data from query parameter
        $data = $request->get('data');
        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Data parameter is required'
            ], 400);
        }
        
        // Decode JSON data
        $decodedData = json_decode($data, true);
        if (!$decodedData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }
        
//         \Log::info('Decoded data: ', $decodedData);
        
        // Merge decoded data into request
        $request->merge($decodedData);
        
        // Call store method
        return $this->store($request);
    }
    
    /**
     * Update student via GET request
     */
    public function updateViaGet(Request $request)
    {
//         \Log::info('=== UPDATE VIA GET CALLED ===');
        
        $id = $request->get('id');
        if (!$id) {
            return response()->json([
                'success' => false,
                'message' => 'ID parameter is required'
            ], 400);
        }
        
        $data = $request->get('data');
        if ($data) {
            $decodedData = json_decode($data, true);
            if ($decodedData) {
                $request->merge($decodedData);
            }
        }
        
        return $this->update($request, $id);
    }
    
    /**
     * Delete student via GET request
     */
    public function deleteViaGet(Request $request)
    {
//         \Log::info('=== DELETE VIA GET CALLED ===');
        
        $id = $request->get('id');
        if (!$id) {
            return response()->json([
                'success' => false,
                'message' => 'ID parameter is required'
            ], 400);
        }
        
        return $this->destroy($id);
    }

    /**
     * Add student via GET (direct route)
     */
    public function addStudentViaGet(Request $request)
    {
//         \Log::info('=== ADD STUDENT VIA GET CALLED ===');
//         \Log::info('All params: ', $request->all());
        
        $dataJson = $request->get('data');
        if (!$dataJson) {
            return response()->json([
                'success' => false,
                'message' => 'Data parameter is required'
            ], 400);
        }
        
        $decodedData = json_decode(urldecode($dataJson), true);
        if (!$decodedData) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }
        
//         \Log::info('Adding student with data: ', $decodedData);
        
        // Create new request with decoded data
        $newRequest = new Request($decodedData);
        $newRequest->setMethod('POST');
        
        return $this->store($newRequest);
    }

    /**
     * Import students from Excel/CSV file
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $fileExtension = $file->getClientOriginalExtension();
            
            // Determine reader type
            if (in_array($fileExtension, ['xlsx', 'xls'])) {
                $reader = IOFactory::createReader(ucfirst($fileExtension));
            } else {
                // CSV file
                $reader = IOFactory::createReader('Csv');
                $reader->setInputEncoding('UTF-8');
                $reader->setDelimiter(',');
                $reader->setEnclosure('"');
            }
            
            $spreadsheet = $reader->load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $highestRow = $sheet->getHighestRow();
            
            // Map column headers (assuming first row is header)
            $headerMap = [];
            $highestColumn = $sheet->getHighestColumn();
            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
            
            // Read header row
            $headerDebug = [];
            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                $cellValue = $sheet->getCell($columnLetter . '1')->getValue();
                $headerValue = trim($cellValue ?? '');
                $mappedField = $this->mapHeaderToField($headerValue);
                $headerMap[$col] = $mappedField;
                
                $headerDebug[] = [
                    'col' => $col,
                    'letter' => $columnLetter,
                    'header' => $headerValue,
                    'mapped_to' => $mappedField
                ];
                
                // Log unmapped headers for debugging
                if (empty($mappedField) && !empty($headerValue)) {
                    \Log::warning("Import Student: Unmapped header column $col ($columnLetter): '$headerValue'");
                }
            }
            
            \Log::info("Import Student: Header mapping", ['headers' => $headerDebug]);
            
            $imported = 0;
            $updated = 0;
            $skipped = 0;
            $errors = [];
            
            $placeholderValues = ['-', '--', 'n/a', 'na', 'tidak ada', 'kosong', 'null', 'undefined'];

            // Process data rows (starting from row 2)
            for ($row = 2; $row <= $highestRow; $row++) {
                try {
                    $rowData = [];
                    
                    // Read each column for this row
                    for ($col = 1; $col <= $highestColumnIndex; $col++) {
                        $field = $headerMap[$col] ?? null;
                        if ($field) {
                            $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                            $cell = $sheet->getCell($columnLetter . $row);
                            $value = null;
                            if ($cell) {
                                try {
                                    $value = $cell->getCalculatedValue();
                                } catch (\Exception $e) {
                                    $value = $cell->getValue();
                                }
                            }
                            
                            // Handle date formatting first (before checking null/empty)
                            if ($field === 'tanggal_lahir' && $value !== null && $value !== '') {
                                if (is_numeric($value)) {
                                    // Excel date serial number
                                    try {
                                        $value = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
                                    } catch (\Exception $e) {
                                        // If conversion fails, try parsing as string
                                        $parsedDate = date_create($value);
                                        if ($parsedDate) {
                                            $value = $parsedDate->format('Y-m-d');
                                        } else {
                                            $value = null; // Mark as invalid if can't parse
                                        }
                                    }
                                } else {
                                    // Try to parse date string
                                    $parsedDate = date_create($value);
                                    if ($parsedDate) {
                                        $value = $parsedDate->format('Y-m-d');
                                    } else {
                                        $value = null; // Mark as invalid if can't parse
                                    }
                                }
                            }
                            
                            // Convert to string if not null, and trim whitespace
                            // Only set if value is not null and not empty after trim
                            if ($value !== null && $value !== '') {
                                $trimmedValue = trim((string)$value);
                                if ($trimmedValue !== '') {
                                    $normalizedValue = strtolower($trimmedValue);
                                    if (in_array($normalizedValue, $placeholderValues)) {
                                        continue;
                                    }
                                    $rowData[$field] = $trimmedValue;
                                }
                            }
                        }
                    }
                    
                    // Debug: Log row data untuk troubleshooting
                    \Log::debug("Import Student: Row $row data", ['rowData' => $rowData]);
                    
                    // Skip empty rows
                    if (empty($rowData['nama_lengkap']) && empty($rowData['nisn'])) {
                        \Log::debug("Import Student: Row $row skipped - empty row");
                        continue;
                    }
                    
                    // Validate required fields with detailed error messages
                    $missingFields = [];
                    if (empty($rowData['nama_lengkap']) || trim($rowData['nama_lengkap'] ?? '') === '') {
                        $missingFields[] = 'nama_lengkap';
                    }
                    if (empty($rowData['nisn']) || trim($rowData['nisn'] ?? '') === '') {
                        $missingFields[] = 'nisn';
                    }
                    if (empty($rowData['email']) || trim($rowData['email'] ?? '') === '') {
                        $missingFields[] = 'email';
                    }
                    if (!empty($rowData['email']) && !filter_var($rowData['email'], FILTER_VALIDATE_EMAIL)) {
                        $missingFields[] = 'email (format tidak valid)';
                    }
                    
                    if (!empty($missingFields)) {
                        $skipped++;
                        $errorMsg = "Row $row: Missing required fields: " . implode(', ', $missingFields);
                        $errors[] = $errorMsg;
                        \Log::warning("Import Student: $errorMsg", ['rowData' => $rowData]);
                        continue;
                    }
                    
                    // Set default values for optional fields
                    if (empty($rowData['nama_panggilan'])) {
                        $rowData['nama_panggilan'] = '-';
                    }
                    if (empty($rowData['password'])) {
                        $rowData['password'] = '123456'; // Default password
                    }
                    if (empty($rowData['status'])) {
                        $rowData['status'] = 'Aktif';
                    }
                    
                    // Ensure all required fields are present (with defaults for optional ones)
                    // Note: Use trim() check to handle whitespace-only values
                    $missingRequiredFields = [];
                    if (empty($rowData['tempat_lahir']) || trim($rowData['tempat_lahir'] ?? '') === '') {
                        $missingRequiredFields[] = 'tempat_lahir';
                    }
                    if (empty($rowData['tanggal_lahir']) || trim($rowData['tanggal_lahir'] ?? '') === '') {
                        $missingRequiredFields[] = 'tanggal_lahir';
                    }
                    if (empty($rowData['nama_ibu']) || trim($rowData['nama_ibu'] ?? '') === '') {
                        $missingRequiredFields[] = 'nama_ibu';
                    }
                    if (empty($rowData['nama_ayah']) || trim($rowData['nama_ayah'] ?? '') === '') {
                        $missingRequiredFields[] = 'nama_ayah';
                    }
                    if (empty($rowData['nomor_hp']) || trim($rowData['nomor_hp'] ?? '') === '') {
                        $missingRequiredFields[] = 'nomor_hp';
                    }
                    if (empty($rowData['alamat']) || trim($rowData['alamat'] ?? '') === '') {
                        $missingRequiredFields[] = 'alamat';
                    }
                    if (empty($rowData['unit_sekolah']) || trim($rowData['unit_sekolah'] ?? '') === '') {
                        $missingRequiredFields[] = 'unit_sekolah';
                    }
                    if (empty($rowData['unit_kelas']) || trim($rowData['unit_kelas'] ?? '') === '') {
                        $missingRequiredFields[] = 'unit_kelas';
                    }
                    
                    if (!empty($missingRequiredFields)) {
                        $skipped++;
                        $errorMsg = "Row $row: Missing required fields: " . implode(', ', $missingRequiredFields);
                        $errors[] = $errorMsg;
                        \Log::warning("Import Student: $errorMsg", ['rowData' => $rowData]);
                        continue;
                    }
                    
                    // Check if student already exists
                    // If NISN already exists, update the existing student instead of skipping
                    $existingByNisn = Student::where('nisn', $rowData['nisn'])->first();
                    if ($existingByNisn) {
                        $emailConflict = Student::where('email', $rowData['email'])
                            ->where('id', '!=', $existingByNisn->id)
                            ->first();
                        
                        if ($emailConflict) {
                            $skipped++;
                            $errorMsg = "Row $row: Email {$rowData['email']} already used by another student (ID {$emailConflict->id}, NISN {$emailConflict->nisn}, Nama {$emailConflict->nama_lengkap}). Cannot update NISN {$rowData['nisn']} with duplicate email.";
                            $errors[] = $errorMsg;
                            \Log::warning("Import Student: $errorMsg");
                            continue;
                        }
                        
                        DB::beginTransaction();
                        try {
                            \Log::info("Import Student: Updating existing student (row $row)", [
                                'existing_id' => $existingByNisn->id,
                                'nisn' => $existingByNisn->nisn,
                                'nama_lengkap' => $rowData['nama_lengkap']
                            ]);
                            
                            $existingByNisn->update($rowData);
                            DB::commit();
                            $updated++;
                            \Log::info("Import Student: Successfully updated student for row $row");
                        } catch (\Exception $e) {
                            DB::rollBack();
                            $skipped++;
                            $errorMsg = "Row $row: Failed to update existing student - " . $e->getMessage();
                            $errors[] = $errorMsg;
                            \Log::error("Import Student: Failed to update student for row $row", [
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString(),
                                'rowData' => $rowData,
                                'existing_student' => $existingByNisn->toArray()
                            ]);
                        }
                        
                        continue;
                    }
                    
                    // For new students, ensure email is unique
                    $existingByEmail = Student::where('email', $rowData['email'])->first();
                    if ($existingByEmail) {
                        $skipped++;
                        $errorMsg = "Row $row: Email {$rowData['email']} already exists with NISN {$existingByEmail->nisn} (ID {$existingByEmail->id}, Nama {$existingByEmail->nama_lengkap}). Email must be unique for new students.";
                        $errors[] = $errorMsg;
                        \Log::warning("Import Student: $errorMsg");
                        continue;
                    }
                    
                    // Create student
                    DB::beginTransaction();
                    try {
                        \Log::info("Import Student: Creating student for row $row", [
                            'nisn' => $rowData['nisn'],
                            'nama_lengkap' => $rowData['nama_lengkap'],
                            'email' => $rowData['email']
                        ]);
                        
                        Student::create($rowData);
                        DB::commit();
                        $imported++;
                        \Log::info("Import Student: Successfully imported row $row");
                    } catch (\Exception $e) {
                        DB::rollBack();
                        $skipped++;
                        $errorMsg = "Row $row: " . $e->getMessage();
                        $errors[] = $errorMsg;
                        \Log::error("Import Student: Failed to create student for row $row", [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                            'rowData' => $rowData
                        ]);
                    }
                    
                } catch (\Exception $e) {
                    $skipped++;
                    $errors[] = "Row $row: " . $e->getMessage();
                }
            }
            
            \Log::info("Import Student: Completed", [
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
                'total_errors' => count($errors)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Import completed. Imported: $imported, Updated: $updated, Skipped: $skipped",
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
                'errors' => $errors,
                'debug' => [
                    'total_rows_processed' => $highestRow - 1,
                    'header_mapping' => $headerDebug ?? []
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'imported' => 0
            ], 500);
        }
    }
    
    /**
     * Import students from JSON data
     */
    public function importJson(Request $request)
    {
        // More flexible validation - just check that data is array
        // Field validation will be done in processStudentData
        $validator = Validator::make($request->all(), [
            'data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $jsonData = $request->input('data');
            $imported = 0;
            $updated = 0;
            $skipped = 0;
            $errors = [];
            
            $placeholderValues = ['-', '--', 'n/a', 'na', 'tidak ada', 'kosong', 'null', 'undefined'];

            foreach ($jsonData as $index => $rowData) {
                $row = $index + 1; // Row number for error reporting
                try {
                    // Normalize data - handle various field name formats
                    $normalizedData = [];
                    foreach ($rowData as $key => $value) {
                        // Normalize key: trim, lowercase, remove spaces
                        $normalizedKey = strtolower(trim(preg_replace('/\s+/', '_', $key)));
                        
                        // Map common variations (including Title Case with spaces)
                        $fieldMap = [
                            // Nama Lengkap variations
                            'nama_lengkap' => 'nama_lengkap',
                            'namalengkap' => 'nama_lengkap',
                            'nama lengkap' => 'nama_lengkap',
                            'namalengkap' => 'nama_lengkap',
                            'namaLengkap' => 'nama_lengkap',
                            
                            // Nama Panggilan variations
                            'nama_panggilan' => 'nama_panggilan',
                            'namapanggilan' => 'nama_panggilan',
                            'nama panggilan' => 'nama_panggilan',
                            'namaPanggilan' => 'nama_panggilan',
                            'nama' => 'nama_panggilan',
                            
                            // NISN variations
                            'nisn' => 'nisn',
                            'NISN' => 'nisn',
                            
                            // Tempat Lahir variations
                            'tempat_lahir' => 'tempat_lahir',
                            'tempatlahir' => 'tempat_lahir',
                            'tempat lahir' => 'tempat_lahir',
                            'tempatLahir' => 'tempat_lahir',
                            
                            // Tanggal Lahir variations
                            'tanggal_lahir' => 'tanggal_lahir',
                            'tanggallahir' => 'tanggal_lahir',
                            'tanggal lahir' => 'tanggal_lahir',
                            'tanggalLahir' => 'tanggal_lahir',
                            
                            // Nama Ibu variations
                            'nama_ibu' => 'nama_ibu',
                            'namaibu' => 'nama_ibu',
                            'nama ibu' => 'nama_ibu',
                            'namaIbu' => 'nama_ibu',
                            
                            // Nama Ayah variations
                            'nama_ayah' => 'nama_ayah',
                            'namaayah' => 'nama_ayah',
                            'nama ayah' => 'nama_ayah',
                            'namaAyah' => 'nama_ayah',
                            
                            // Nomor HP variations
                            'nomor_hp' => 'nomor_hp',
                            'nomorhp' => 'nomor_hp',
                            'nomor hp' => 'nomor_hp',
                            'nomorHp' => 'nomor_hp',
                            'no_hp' => 'nomor_hp',
                            'no hp' => 'nomor_hp',
                            
                            // Alamat variations
                            'alamat' => 'alamat',
                            
                            // Email variations
                            'email' => 'email',
                            
                            // Unit Sekolah variations
                            'unit_sekolah' => 'unit_sekolah',
                            'unitsekolah' => 'unit_sekolah',
                            'unit sekolah' => 'unit_sekolah',
                            'unitSekolah' => 'unit_sekolah',
                            'unit' => 'unit_sekolah',
                            'unit ' => 'unit_sekolah', // Handle trailing space
                            
                            // Unit Kelas variations
                            'unit_kelas' => 'unit_kelas',
                            'unitkelas' => 'unit_kelas',
                            'unit kelas' => 'unit_kelas',
                            'unitKelas' => 'unit_kelas',
                            'kelas' => 'unit_kelas',
                            
                            // Password variations
                            'password' => 'password',
                            'pasword' => 'password', // Handle typo
                            'Password' => 'password',
                            'Pasword' => 'password',
                            
                            // Status variations
                            'status' => 'status',
                            'Status' => 'status',
                        ];
                        
                        $field = $fieldMap[$normalizedKey] ?? $fieldMap[strtolower($key)] ?? $normalizedKey;
                        
                        // Skip placeholder values
                        if ($value !== null && $value !== '') {
                            $trimmedValue = trim((string)$value);
                            $normalizedValue = strtolower($trimmedValue);
                            if (!in_array($normalizedValue, $placeholderValues) && $trimmedValue !== '') {
                                $normalizedData[$field] = $trimmedValue;
                            }
                        }
                    }
                    
                    // Use the same validation and processing logic as Excel import
                    $result = $this->processStudentData($normalizedData, $row);
                    
                    if ($result['action'] === 'imported') {
                        $imported++;
                    } elseif ($result['action'] === 'updated') {
                        $updated++;
                    } else {
                        $skipped++;
                        if (!empty($result['error'])) {
                            $errors[] = $result['error'];
                        }
                    }
                    
                } catch (\Exception $e) {
                    $skipped++;
                    $errors[] = "Item $row: " . $e->getMessage();
                    \Log::error("Import Student JSON: Failed to process item $row", [
                        'error' => $e->getMessage(),
                        'data' => $rowData
                    ]);
                }
            }
            
            \Log::info("Import Student JSON: Completed", [
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
                'total_errors' => count($errors)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Import completed. Imported: $imported, Updated: $updated, Skipped: $skipped",
                'imported' => $imported,
                'updated' => $updated,
                'skipped' => $skipped,
                'errors' => $errors,
                'debug' => [
                    'total_items_processed' => count($jsonData)
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'imported' => 0
            ], 500);
        }
    }
    
    /**
     * Process student data (shared logic for Excel and JSON import)
     */
    private function processStudentData($rowData, $rowNumber = 0)
    {
        $placeholderValues = ['-', '--', 'n/a', 'na', 'tidak ada', 'kosong', 'null', 'undefined'];
        
        // Skip empty rows
        if (empty($rowData['nama_lengkap']) && empty($rowData['nisn'])) {
            return ['action' => 'skipped', 'error' => "Item $rowNumber: Empty row"];
        }
        
        // Validate required fields
        $missingFields = [];
        if (empty($rowData['nama_lengkap']) || trim($rowData['nama_lengkap'] ?? '') === '') {
            $missingFields[] = 'nama_lengkap';
        }
        if (empty($rowData['nisn']) || trim($rowData['nisn'] ?? '') === '') {
            $missingFields[] = 'nisn';
        }
        if (empty($rowData['email']) || trim($rowData['email'] ?? '') === '') {
            $missingFields[] = 'email';
        }
        if (!empty($rowData['email']) && !filter_var($rowData['email'], FILTER_VALIDATE_EMAIL)) {
            $missingFields[] = 'email (format tidak valid)';
        }
        
        if (!empty($missingFields)) {
            return ['action' => 'skipped', 'error' => "Item $rowNumber: Missing required fields: " . implode(', ', $missingFields)];
        }
        
        // Set default values for optional fields
        if (empty($rowData['nama_panggilan'])) {
            $rowData['nama_panggilan'] = '-';
        }
        if (empty($rowData['password'])) {
            $rowData['password'] = '123456';
        }
        if (empty($rowData['status'])) {
            $rowData['status'] = 'Aktif';
        }
        
        // Validate all required fields
        $missingRequiredFields = [];
        if (empty($rowData['tempat_lahir']) || trim($rowData['tempat_lahir'] ?? '') === '') {
            $missingRequiredFields[] = 'tempat_lahir';
        }
        if (empty($rowData['tanggal_lahir']) || trim($rowData['tanggal_lahir'] ?? '') === '') {
            $missingRequiredFields[] = 'tanggal_lahir';
        }
        if (empty($rowData['nama_ibu']) || trim($rowData['nama_ibu'] ?? '') === '') {
            $missingRequiredFields[] = 'nama_ibu';
        }
        if (empty($rowData['nama_ayah']) || trim($rowData['nama_ayah'] ?? '') === '') {
            $missingRequiredFields[] = 'nama_ayah';
        }
        if (empty($rowData['nomor_hp']) || trim($rowData['nomor_hp'] ?? '') === '') {
            $missingRequiredFields[] = 'nomor_hp';
        }
        if (empty($rowData['alamat']) || trim($rowData['alamat'] ?? '') === '') {
            $missingRequiredFields[] = 'alamat';
        }
        if (empty($rowData['unit_sekolah']) || trim($rowData['unit_sekolah'] ?? '') === '') {
            $missingRequiredFields[] = 'unit_sekolah';
        }
        if (empty($rowData['unit_kelas']) || trim($rowData['unit_kelas'] ?? '') === '') {
            $missingRequiredFields[] = 'unit_kelas';
        }
        
        if (!empty($missingRequiredFields)) {
            return ['action' => 'skipped', 'error' => "Item $rowNumber: Missing required fields: " . implode(', ', $missingRequiredFields)];
        }
        
        // Check if student already exists
        $existingByNisn = Student::where('nisn', $rowData['nisn'])->first();
        if ($existingByNisn) {
            $emailConflict = Student::where('email', $rowData['email'])
                ->where('id', '!=', $existingByNisn->id)
                ->first();
            
            if ($emailConflict) {
                return ['action' => 'skipped', 'error' => "Item $rowNumber: Email {$rowData['email']} already used by another student (ID {$emailConflict->id}, NISN {$emailConflict->nisn}, Nama {$emailConflict->nama_lengkap}). Cannot update NISN {$rowData['nisn']} with duplicate email."];
            }
            
            DB::beginTransaction();
            try {
                $existingByNisn->update($rowData);
                DB::commit();
                return ['action' => 'updated'];
            } catch (\Exception $e) {
                DB::rollBack();
                return ['action' => 'skipped', 'error' => "Item $rowNumber: Failed to update existing student - " . $e->getMessage()];
            }
        }
        
        // For new students, ensure email is unique
        $existingByEmail = Student::where('email', $rowData['email'])->first();
        if ($existingByEmail) {
            return ['action' => 'skipped', 'error' => "Item $rowNumber: Email {$rowData['email']} already exists with NISN {$existingByEmail->nisn} (ID {$existingByEmail->id}, Nama {$existingByEmail->nama_lengkap}). Email must be unique for new students."];
        }
        
        // Create student
        DB::beginTransaction();
        try {
            Student::create($rowData);
            DB::commit();
            return ['action' => 'imported'];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['action' => 'skipped', 'error' => "Item $rowNumber: " . $e->getMessage()];
        }
    }
    
    /**
     * Map Excel header to database field name
     */
    private function mapHeaderToField($header)
    {
        // Normalize header: trim, lowercase, remove extra spaces
        $normalized = strtolower(trim(preg_replace('/\s+/', ' ', $header)));
        
        $mapping = [
            // Nama Lengkap variations
            'nama lengkap' => 'nama_lengkap',
            'Nama Lengkap' => 'nama_lengkap',
            'NAMA LENGKAP' => 'nama_lengkap',
            
            // Nama Panggilan variations
            'nama panggilan' => 'nama_panggilan',
            'Nama Panggilan' => 'nama_panggilan',
            'NAMA PANGGILAN' => 'nama_panggilan',
            'nama' => 'nama_panggilan', // Handle single "nama" column
            
            // NISN variations
            'nisn' => 'nisn',
            'NISN' => 'nisn',
            
            // Tempat Lahir variations
            'tempat lahir' => 'tempat_lahir',
            'Tempat Lahir' => 'tempat_lahir',
            'TEMPAT LAHIR' => 'tempat_lahir',
            
            // Tanggal Lahir variations
            'tanggal lahir' => 'tanggal_lahir',
            'Tanggal Lahir' => 'tanggal_lahir',
            'TANGGAL LAHIR' => 'tanggal_lahir',
            
            // Nama Ibu variations
            'nama ibu' => 'nama_ibu',
            'Nama Ibu' => 'nama_ibu',
            'NAMA IBU' => 'nama_ibu',
            
            // Nama Ayah variations
            'nama ayah' => 'nama_ayah',
            'Nama Ayah' => 'nama_ayah',
            'NAMA AYAH' => 'nama_ayah',
            
            // Nomor HP variations
            'nomor hp' => 'nomor_hp',
            'Nomor HP' => 'nomor_hp',
            'NOMOR HP' => 'nomor_hp',
            'nomor telepon' => 'nomor_hp',
            'Nomor Telepon' => 'nomor_hp',
            'no hp' => 'nomor_hp',
            'No HP' => 'nomor_hp',
            
            // Alamat variations
            'alamat' => 'alamat',
            'Alamat' => 'alamat',
            'ALAMAT' => 'alamat',
            
            // Email variations
            'email' => 'email',
            'Email' => 'email',
            'EMAIL' => 'email',
            
            // Unit Sekolah variations
            'unit' => 'unit_sekolah',
            'Unit' => 'unit_sekolah',
            'UNIT' => 'unit_sekolah',
            'unit sekolah' => 'unit_sekolah',
            'Unit Sekolah' => 'unit_sekolah',
            'UNIT SEKOLAH' => 'unit_sekolah',
            
            // Unit Kelas variations
            'kelas' => 'unit_kelas',
            'Kelas' => 'unit_kelas',
            'KELAS' => 'unit_kelas',
            'unit kelas' => 'unit_kelas',
            'Unit Kelas' => 'unit_kelas',
            'UNIT KELAS' => 'unit_kelas',
            
            // Password variations
            'password' => 'password',
            'Password' => 'password',
            'PASSWORD' => 'password',
            'pasword' => 'password', // Handle typo
            'Pasword' => 'password',
            
            // Status variations
            'status' => 'status',
            'Status' => 'status',
            'STATUS' => 'status',
        ];
        
        // Try exact match first (case-sensitive)
        if (isset($mapping[$header])) {
            return $mapping[$header];
        }
        
        // Try normalized match (case-insensitive, normalized spaces)
        if (isset($mapping[$normalized])) {
            return $mapping[$normalized];
        }
        
        // Try case-insensitive match with original mapping keys
        foreach ($mapping as $key => $value) {
            $normalizedKey = strtolower(trim(preg_replace('/\s+/', ' ', $key)));
            if ($normalizedKey === $normalized) {
                return $value;
            }
        }
        
        return null;
    }
}
