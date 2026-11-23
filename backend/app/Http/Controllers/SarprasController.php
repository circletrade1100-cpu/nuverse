<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\MaintenanceSchedule;
use App\Models\RepairRequest;
use App\Models\RepairRequestImage;
use App\Models\DepreciationLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SarprasController extends Controller
{
    // ==================== INVENTORY ITEMS ====================
    
    /**
     * Get all inventory items with filters
     */
    public function index(Request $request)
    {
        try {
            $query = InventoryItem::with(['category', 'images']);

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%")
                      ->orWhere('pic', 'like', "%{$search}%")
                      ->orWhere('item_code', 'like', "%{$search}%");
                });
            }

            // Filter by category
            if ($request->has('category') && $request->category !== 'semua') {
                $query->where('sub_category', $request->category);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by condition
            if ($request->has('condition')) {
                $query->where('condition', $request->condition);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate or get all
            if ($request->has('per_page')) {
                $items = $query->paginate($request->per_page);
            } else {
                $items = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $items,
                'message' => 'Data inventory berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data inventory: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new inventory item
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:200',
                'category_id' => 'nullable|exists:inventory_categories,id',
                'sub_category' => 'nullable|string|max:100',
                'brand' => 'nullable|string|max:100',
                'model' => 'nullable|string|max:100',
                'serial_number' => 'nullable|string|max:100',
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'current_value' => 'nullable|numeric|min:0',
                'location' => 'nullable|string|max:200',
                'status' => 'required|in:aktif,maintenance,penghapusan',
                'condition' => 'required|in:baik,rusak_ringan,rusak_berat,tidak_berfungsi',
                'warranty_expiry' => 'nullable|date',
                'supplier' => 'nullable|string|max:200',
                'pic' => 'nullable|string|max:200',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            
            // Generate unique item code
            $data['item_code'] = InventoryItem::generateItemCode();
            
            // Set current_value same as purchase_price if not provided
            if (!isset($data['current_value']) && isset($data['purchase_price'])) {
                $data['current_value'] = $data['purchase_price'];
            }

            // Try to create item with retry mechanism for unique constraint
            $maxRetries = 3;
            $item = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                try {
                    $item = InventoryItem::create($data);
                    break; // Success, exit retry loop
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() == 23000 && $i < $maxRetries - 1) {
                        // Duplicate entry, regenerate item code and retry
                        $data['item_code'] = InventoryItem::generateItemCode();
                        continue;
                    }
                    throw $e; // Re-throw if not duplicate entry or max retries reached
                }
            }

            // Handle image uploads
            if ($request->hasFile('images')) {
                $this->handleImageUploads($item, $request->file('images'));
            }

            return response()->json([
                'success' => true,
                'data' => $item->load('category'),
                'message' => 'Item inventory berhasil ditambahkan'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single inventory item
     */
    public function show($id)
    {
        try {
            $item = InventoryItem::with(['category', 'maintenanceSchedules', 'repairRequests', 'images'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $item,
                'message' => 'Data item berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Update inventory item
     */
    public function update(Request $request, $id)
    {
        try {
            $item = InventoryItem::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:200',
                'category_id' => 'nullable|exists:inventory_categories,id',
                'sub_category' => 'nullable|string|max:100',
                'brand' => 'nullable|string|max:100',
                'model' => 'nullable|string|max:100',
                'serial_number' => 'nullable|string|max:100',
                'purchase_date' => 'nullable|date',
                'purchase_price' => 'nullable|numeric|min:0',
                'current_value' => 'nullable|numeric|min:0',
                'location' => 'nullable|string|max:200',
                'status' => 'sometimes|required|in:aktif,maintenance,penghapusan',
                'condition' => 'sometimes|required|in:baik,rusak_ringan,rusak_berat,tidak_berfungsi',
                'warranty_expiry' => 'nullable|date',
                'supplier' => 'nullable|string|max:200',
                'pic' => 'nullable|string|max:200',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $item->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $item->load('category'),
                'message' => 'Item berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete inventory item
     */
    public function destroy($id)
    {
        try {
            $item = InventoryItem::findOrFail($id);
            $item->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function statistics()
    {
        try {
            $totalItems = InventoryItem::count();
            $totalValue = InventoryItem::sum('current_value');
            $itemsByCondition = InventoryItem::select('condition', DB::raw('count(*) as count'))
                ->groupBy('condition')
                ->get();
            $itemsByStatus = InventoryItem::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get();
            $itemsByCategory = InventoryItem::select('sub_category', DB::raw('count(*) as count'))
                ->groupBy('sub_category')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_items' => $totalItems,
                    'total_value' => $totalValue,
                    'by_condition' => $itemsByCondition,
                    'by_status' => $itemsByStatus,
                    'by_category' => $itemsByCategory,
                ],
                'message' => 'Statistik berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== CATEGORIES ====================

    /**
     * Get all categories
     */
    public function getCategories()
    {
        try {
            $categories = InventoryCategory::with('children')->whereNull('parent_id')->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Data kategori berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kategori: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store new category
     */
    public function storeCategory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:inventory_categories,name',
                'description' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $category = InventoryCategory::create([
                'name' => $request->name,
                'description' => $request->description
            ]);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Kategori berhasil ditambahkan'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan kategori: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete category
     */
    public function deleteCategory($id)
    {
        try {
            $category = InventoryCategory::findOrFail($id);
            
            // Check if category is used by any items
            $itemCount = InventoryItem::where('sub_category', $category->name)->count();
            if ($itemCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Kategori tidak dapat dihapus karena masih digunakan oleh {$itemCount} item"
                ], 400);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kategori berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kategori: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== MAINTENANCE SCHEDULES ====================

    /**
     * Get maintenance schedules
     */
    public function getMaintenanceSchedules(Request $request)
    {
        try {
            $query = MaintenanceSchedule::with(['item', 'technician']);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('item_id')) {
                $query->where('item_id', $request->item_id);
            }

            $schedules = $query->orderBy('next_maintenance', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $schedules,
                'message' => 'Data jadwal maintenance berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil jadwal maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store maintenance schedule
     */
    public function storeMaintenanceSchedule(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'maintenance_type' => 'required|in:preventive,corrective,emergency,upgrade',
                'frequency' => 'nullable|string|max:50',
                'next_maintenance' => 'required|date',
                'technician_id' => 'nullable|exists:users,id',
                'estimated_duration' => 'nullable|string|max:50',
                'required_materials' => 'nullable|string',
                'checklist' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $schedule = MaintenanceSchedule::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $schedule->load(['item', 'technician']),
                'message' => 'Jadwal maintenance berhasil dibuat'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat jadwal maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update maintenance schedule
     */
    public function updateMaintenanceSchedule(Request $request, $id)
    {
        try {
            $schedule = MaintenanceSchedule::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'maintenance_type' => 'required|in:preventive,corrective,emergency,upgrade',
                'frequency' => 'nullable|string|max:50',
                'next_maintenance' => 'required|date',
                'technician_id' => 'nullable|exists:users,id',
                'estimated_duration' => 'nullable|string|max:50',
                'required_materials' => 'nullable|string',
                'checklist' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $schedule->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $schedule->load(['item', 'technician']),
                'message' => 'Jadwal maintenance berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate jadwal maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete maintenance schedule
     */
    public function deleteMaintenanceSchedule($id)
    {
        try {
            $schedule = MaintenanceSchedule::findOrFail($id);
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Jadwal maintenance berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus jadwal maintenance: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== REPAIR REQUESTS ====================

    /**
     * Get repair requests
     */
    public function getRepairRequests(Request $request)
    {
        try {
            $query = RepairRequest::with(['item', 'requester', 'technician', 'images']);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            $requests = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $requests,
                'message' => 'Data pengajuan perbaikan berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store repair request
     */
    public function storeRepairRequest(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'requester_id' => 'required|exists:users,id',
                'request_date' => 'required|date',
                'problem_description' => 'required|string',
                'priority' => 'required|in:low,medium,high,urgent',
                'estimated_cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            $repairRequest = RepairRequest::create($data);

            // Handle image uploads
            if ($request->hasFile('images')) {
                $this->handleRepairRequestImageUploads($repairRequest, $request->file('images'));
            }

            return response()->json([
                'success' => true,
                'data' => $repairRequest->load(['item', 'requester', 'images']),
                'message' => 'Pengajuan perbaikan berhasil dibuat'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pengajuan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update repair request
     */
    public function updateRepairRequest(Request $request, $id)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'requester_id' => 'required|exists:users,id',
                'request_date' => 'required|date',
                'problem_description' => 'required|string',
                'priority' => 'required|in:low,medium,high,urgent',
                'estimated_cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $repairRequest->update($data);

            // Handle new image uploads
            if ($request->hasFile('images')) {
                $this->handleRepairRequestImageUploads($repairRequest, $request->file('images'));
            }

            return response()->json([
                'success' => true,
                'data' => $repairRequest->load(['item', 'requester', 'images']),
                'message' => 'Pengajuan perbaikan berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate pengajuan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete repair request
     */
    public function deleteRepairRequest($id)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($id);
            $repairRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan perbaikan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus pengajuan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update repair request status
     */
    public function updateRepairRequestStatus(Request $request, $id)
    {
        try {
            $repairRequest = RepairRequest::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,approved,in_progress,completed,rejected',
                'assigned_technician_id' => 'nullable|exists:users,id',
                'start_date' => 'nullable|date',
                'completion_date' => 'nullable|date',
                'actual_cost' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $repairRequest->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $repairRequest->load(['item', 'requester', 'technician']),
                'message' => 'Status perbaikan berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle image uploads for inventory item
     */
    private function handleImageUploads($item, $images)
    {
        $uploadPath = 'inventory/' . $item->item_code;
        
        foreach ($images as $index => $image) {
            // Validate image
            if (!$image->isValid()) {
                continue;
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($image->getMimeType(), $allowedTypes)) {
                continue;
            }

            // Validate file size (max 5MB)
            if ($image->getSize() > 5 * 1024 * 1024) {
                continue;
            }

            try {
                // Generate unique filename
                $filename = time() . '_' . $index . '.' . $image->getClientOriginalExtension();
                
                // Store file
                $path = $image->storeAs($uploadPath, $filename, 'public');
                
                // Create database record
                \App\Models\InventoryImage::create([
                    'inventory_item_id' => $item->id,
                    'filename' => $filename,
                    'original_name' => $image->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $image->getMimeType(),
                    'file_size' => $image->getSize(),
                    'sort_order' => $index + 1
                ]);

                // Sync file to web accessible storage
                $this->syncFileToWebStorage($path);
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage());
                continue;
            }
        }
    }

    /**
     * Handle image uploads for repair request
     */
    private function handleRepairRequestImageUploads($repairRequest, $images)
    {
        $uploadPath = 'repair-requests';
        
        foreach ($images as $index => $image) {
            // Validate image
            if (!$image->isValid()) {
                continue;
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($image->getMimeType(), $allowedTypes)) {
                continue;
            }

            // Validate file size (max 5MB)
            if ($image->getSize() > 5 * 1024 * 1024) {
                continue;
            }

            try {
                // Generate unique filename
                $filename = time() . '_' . $index . '.' . $image->getClientOriginalExtension();
                
                // Store file
                $filename = $repairRequest->id . '_' . $filename;
                $fullPath = storage_path('app/public/' . $uploadPath);
                $path = $uploadPath . '/' . $filename;
                $image->move($fullPath, $filename);
                
                // Create database record
                $repairRequest->images()->create([
                    'image_url' => '/storage/' . $path,
                    'image_name' => $filename,
                    'sort_order' => $index + 1
                ]);

                // Sync file to web accessible storage
                $this->syncFileToWebStorage($path);
                
            } catch (\Exception $e) {
                continue;
            }
        }
    }

    // ==================== DEPRECIATION LOGS ====================
    
    /**
     * Get all depreciation logs
     */
    public function getDepreciationLogs(Request $request)
    {
        try {
            $query = DepreciationLog::with(['item', 'calculator']);

            // Filter by item_id
            if ($request->filled('item_id')) {
                $query->where('item_id', $request->item_id);
            }

            // Filter by date range
            if ($request->filled('start_date')) {
                $query->where('depreciation_date', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->where('depreciation_date', '<=', $request->end_date);
            }

            // Filter by method
            if ($request->filled('method')) {
                $query->where('method', $request->method);
            }

            $depreciationLogs = $query->orderBy('depreciation_date', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $depreciationLogs,
                'message' => 'Data penyusutan berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penyusutan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create depreciation log
     */
    public function createDepreciationLog(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'depreciation_date' => 'required|date',
                'method' => 'required|in:straight_line,declining_balance,units_of_production',
                'depreciation_rate' => 'nullable|numeric|min:0|max:100',
                'useful_life_years' => 'nullable|integer|min:1',
                'salvage_value' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $item = InventoryItem::findOrFail($request->item_id);
            $previousValue = $item->current_value;
            
            // Calculate depreciation based on method
            $depreciationAmount = 0;
            switch ($request->method) {
                case 'straight_line':
                    $depreciationAmount = DepreciationLog::calculateStraightLine(
                        $item->purchase_price,
                        $request->salvage_value ?? 0,
                        $request->useful_life_years ?? 5
                    );
                    break;
                case 'declining_balance':
                    $depreciationAmount = DepreciationLog::calculateDecliningBalance(
                        $previousValue,
                        $request->depreciation_rate ?? 20
                    );
                    break;
                case 'units_of_production':
                    // This would need additional parameters like total_units and units_used
                    $depreciationAmount = $request->depreciation_amount ?? 0;
                    break;
            }

            $newValue = max($previousValue - $depreciationAmount, $request->salvage_value ?? 0);

            $depreciationLog = DepreciationLog::create([
                'item_id' => $request->item_id,
                'depreciation_date' => $request->depreciation_date,
                'depreciation_amount' => $depreciationAmount,
                'current_value' => $newValue,
                'previous_value' => $previousValue,
                'method' => $request->method,
                'depreciation_rate' => $request->depreciation_rate,
                'useful_life_years' => $request->useful_life_years,
                'salvage_value' => $request->salvage_value ?? 0,
                'notes' => $request->notes,
                'calculated_by' => auth()->id() ?? 1 // TODO: Get from auth
            ]);

            // Update item's current value
            $item->update(['current_value' => $newValue]);

            return response()->json([
                'success' => true,
                'data' => $depreciationLog->load(['item', 'calculator']),
                'message' => 'Penyusutan berhasil dicatat'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat penyusutan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update depreciation log
     */
    public function updateDepreciationLog(Request $request, $id)
    {
        try {
            $depreciationLog = DepreciationLog::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'depreciation_date' => 'required|date',
                'method' => 'required|in:straight_line,declining_balance,units_of_production',
                'depreciation_rate' => 'nullable|numeric|min:0|max:100',
                'useful_life_years' => 'nullable|integer|min:1',
                'salvage_value' => 'nullable|numeric|min:0',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $item = InventoryItem::findOrFail($depreciationLog->item_id);
            $previousValue = $item->current_value;
            
            // Calculate depreciation based on method
            $depreciationAmount = 0;
            switch ($request->method) {
                case 'straight_line':
                    $depreciationAmount = DepreciationLog::calculateStraightLine(
                        $item->purchase_price,
                        $request->salvage_value ?? 0,
                        $request->useful_life_years ?? 5
                    );
                    break;
                case 'declining_balance':
                    $depreciationAmount = DepreciationLog::calculateDecliningBalance(
                        $previousValue,
                        $request->depreciation_rate ?? 20
                    );
                    break;
                case 'units_of_production':
                    $depreciationAmount = $request->depreciation_amount ?? 0;
                    break;
            }

            $newValue = max($previousValue - $depreciationAmount, $request->salvage_value ?? 0);

            $depreciationLog->update([
                'depreciation_date' => $request->depreciation_date,
                'depreciation_amount' => $depreciationAmount,
                'current_value' => $newValue,
                'previous_value' => $previousValue,
                'method' => $request->method,
                'depreciation_rate' => $request->depreciation_rate,
                'useful_life_years' => $request->useful_life_years,
                'salvage_value' => $request->salvage_value ?? 0,
                'notes' => $request->notes,
            ]);

            // Update item's current value
            $item->update(['current_value' => $newValue]);

            return response()->json([
                'success' => true,
                'data' => $depreciationLog->load(['item', 'calculator']),
                'message' => 'Penyusutan berhasil diperbarui'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui penyusutan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete depreciation log
     */
    public function deleteDepreciationLog($id)
    {
        try {
            $depreciationLog = DepreciationLog::findOrFail($id);
            $depreciationLog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Log penyusutan berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus log penyusutan: ' . $e->getMessage()
            ], 500);
        }
    }

    // ==================== AUDIT LOGS ====================
    
    /**
     * Get all audit logs
     */
    public function getAuditLogs(Request $request)
    {
        try {
            $query = AuditLog::with(['item', 'auditor']);

            // Filter by item_id
            if ($request->filled('item_id')) {
                $query->where('item_id', $request->item_id);
            }

            // Filter by date range
            if ($request->filled('start_date')) {
                $query->where('audit_date', '>=', $request->start_date);
            }
            if ($request->filled('end_date')) {
                $query->where('audit_date', '<=', $request->end_date);
            }

            // Filter by audit type
            if ($request->filled('audit_type')) {
                $query->where('audit_type', $request->audit_type);
            }

            // Filter by auditor
            if ($request->filled('auditor_id')) {
                $query->where('auditor_id', $request->auditor_id);
            }

            $auditLogs = $query->orderBy('audit_date', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $auditLogs,
                'message' => 'Data audit berhasil diambil'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data audit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create audit log
     */
    public function createAuditLog(Request $request)
    {
        try {
            // Debug logging - temporarily disabled due to permission issues
            // \Log::info('Create Audit Log Request:', $request->all());
            // \Log::info('Files received:', $request->allFiles());
            // \Log::info('Has audit_images:', $request->hasFile('audit_images'));
            $validator = Validator::make($request->all(), [
                'item_id' => 'required|exists:inventory_items,id',
                'audit_date' => 'required|date',
                'condition_before' => 'required|in:baik,rusak_ringan,rusak_berat,tidak_berfungsi',
                'condition_after' => 'required|in:baik,rusak_ringan,rusak_berat,tidak_berfungsi',
                'status_before' => 'required|in:aktif,maintenance,penghapusan',
                'status_after' => 'required|in:aktif,maintenance,penghapusan',
                'findings' => 'nullable|string',
                'recommendations' => 'nullable|string',
                'action_taken' => 'nullable|string',
                'estimated_repair_cost' => 'nullable|numeric|min:0',
                'audit_type' => 'required|in:routine,special,emergency',
                'location_verified' => 'nullable|string',
                'audit_images' => 'nullable|array',
                'audit_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB
                'photos' => 'nullable|array',
                'photos.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $auditLog = AuditLog::create([
                'item_id' => $request->item_id,
                'audit_date' => $request->audit_date,
                'auditor_id' => auth()->id() ?? 1, // TODO: Get from auth
                'condition_before' => $request->condition_before,
                'condition_after' => $request->condition_after,
                'status_before' => $request->status_before,
                'status_after' => $request->status_after,
                'findings' => $request->findings,
                'recommendations' => $request->recommendations,
                'action_taken' => $request->action_taken,
                'estimated_repair_cost' => $request->estimated_repair_cost,
                'audit_type' => $request->audit_type,
                'location_verified' => $request->location_verified,
                'photos' => $request->photos ?? []
            ]);

            // Handle image uploads
            $uploadedPhotos = [];
            if ($request->hasFile('audit_images')) {
                $uploadedPhotos = $this->handleAuditImageUploads($auditLog, $request->file('audit_images'));
                // Update photos field with uploaded image URLs
                $auditLog->update(['photos' => $uploadedPhotos]);
            }

            // Update item's condition and status if changed
            $item = InventoryItem::findOrFail($request->item_id);
            $item->update([
                'condition' => $request->condition_after,
                'status' => $request->status_after
            ]);

            return response()->json([
                'success' => true,
                'data' => $auditLog->load(['item', 'auditor']),
                'message' => 'Audit berhasil dicatat'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat audit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update audit log
     */
    public function updateAuditLog(Request $request, $id)
    {
        try {
            $auditLog = AuditLog::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'condition_after' => 'required|in:baik,rusak_ringan,rusak_berat,tidak_berfungsi',
                'status_after' => 'required|in:aktif,maintenance,penghapusan',
                'findings' => 'nullable|string',
                'recommendations' => 'nullable|string',
                'action_taken' => 'nullable|string',
                'estimated_repair_cost' => 'nullable|numeric|min:0',
                'location_verified' => 'nullable|string',
                'audit_images' => 'nullable|array',
                'audit_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // max 5MB
                'photos' => 'nullable|array',
                'photos.*' => 'string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors()
                ], 422);
            }

            $auditLog->update($request->only([
                'condition_after',
                'status_after',
                'findings',
                'recommendations',
                'action_taken',
                'estimated_repair_cost',
                'location_verified',
                'photos'
            ]));

            // Handle image uploads
            if ($request->hasFile('audit_images')) {
                $uploadedPhotos = $this->handleAuditImageUploads($auditLog, $request->file('audit_images'));
                // Merge with existing photos
                $existingPhotos = $auditLog->photos ?? [];
                $allPhotos = array_merge($existingPhotos, $uploadedPhotos);
                $auditLog->update(['photos' => $allPhotos]);
            }

            // Update item's condition and status
            $item = InventoryItem::findOrFail($auditLog->item_id);
            $item->update([
                'condition' => $request->condition_after,
                'status' => $request->status_after
            ]);

            return response()->json([
                'success' => true,
                'data' => $auditLog->load(['item', 'auditor']),
                'message' => 'Audit berhasil diupdate'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate audit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete audit log
     */
    public function deleteAuditLog($id)
    {
        try {
            $auditLog = AuditLog::findOrFail($id);
            $auditLog->delete();

            return response()->json([
                'success' => true,
                'message' => 'Log audit berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus log audit: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle audit image uploads
     */
    private function handleAuditImageUploads($auditLog, $images)
    {
        $uploadPath = 'audit-images';
        $uploadedUrls = [];
        
        foreach ($images as $index => $image) {
            if (!$image->isValid()) {
                continue;
            }
            
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($image->getMimeType(), $allowedTypes)) {
                continue;
            }
            
            if ($image->getSize() > 5 * 1024 * 1024) { // max 5MB
                continue;
            }
            
            try {
                $filename = $auditLog->id . '_' . time() . '_' . $index . '.' . $image->getClientOriginalExtension();
                
                // Store file
                $fullPath = storage_path('app/public/' . $uploadPath);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0755, true);
                }
                
                $image->move($fullPath, $filename);
                
                $uploadedUrls[] = '/storage/' . $uploadPath . '/' . $filename;

                // Sync file to web accessible storage
                $this->syncFileToWebStorage($uploadPath . '/' . $filename);
            } catch (\Exception $e) {
                continue;
            }
        }
        
        return $uploadedUrls;
    }

    /**
     * Sync file to web accessible storage
     */
    private function syncFileToWebStorage($filePath)
    {
        try {
            $sourcePath = storage_path('app/public/' . $filePath);
            $targetDir = '/www/wwwroot/nurverse.id/storage/' . dirname($filePath);
            $targetPath = '/www/wwwroot/nurverse.id/storage/' . $filePath;

            // Create target directory if it doesn't exist
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // Copy file to web accessible storage
            if (file_exists($sourcePath)) {
                copy($sourcePath, $targetPath);
                \Log::info("File synced: {$filePath}");
            }
        } catch (\Exception $e) {
            \Log::error('File sync failed: ' . $e->getMessage());
        }
    }
}

