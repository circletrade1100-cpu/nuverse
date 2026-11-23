<?php

namespace App\Http\Controllers;

use App\Models\ParentBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ParentBannerController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentBanner::with('creator');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        // Active filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $banners = $query->ordered()
                        ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'mobile_image' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|url|max:500',
            'bg_color' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('parent-banners', 'public');
            $data['image_path'] = $imagePath;
        }

        // Handle mobile image upload
        if ($request->hasFile('mobile_image')) {
            $mobileImagePath = $request->file('mobile_image')->store('parent-banners/mobile', 'public');
            $data['mobile_image_path'] = $mobileImagePath;
        }

        $data['created_by'] = auth()->id();

        // Set default bg_color if not provided
        if (!isset($data['bg_color'])) {
            $data['bg_color'] = 'from-blue-600 to-purple-600';
        }

        $banner = ParentBanner::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner created successfully',
            'data' => $banner->load('creator')
        ], 201);
    }

    public function show($id)
    {
        $banner = ParentBanner::with('creator')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $banner
        ]);
    }

    public function update(Request $request, $id)
    {
        $banner = ParentBanner::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'sometimes|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'mobile_image' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'button_text' => 'nullable|string|max:100',
            'button_link' => 'nullable|url|max:500',
            'bg_color' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }
            
            $imagePath = $request->file('image')->store('parent-banners', 'public');
            $data['image_path'] = $imagePath;
        }

        // Handle mobile image upload
        if ($request->hasFile('mobile_image')) {
            // Delete old mobile image
            if ($banner->mobile_image_path) {
                Storage::disk('public')->delete($banner->mobile_image_path);
            }
            
            $mobileImagePath = $request->file('mobile_image')->store('parent-banners/mobile', 'public');
            $data['mobile_image_path'] = $mobileImagePath;
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner updated successfully',
            'data' => $banner->load('creator')
        ]);
    }

    public function destroy($id)
    {
        $banner = ParentBanner::findOrFail($id);

        // Delete associated images
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }
        if ($banner->mobile_image_path) {
            Storage::disk('public')->delete($banner->mobile_image_path);
        }

        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully'
        ]);
    }

    /**
     * Update multiple banners' sort order
     */
    public function updateSortOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'banners' => 'required|array',
            'banners.*.id' => 'required|exists:parent_banners,id',
            'banners.*.sort_order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->banners as $bannerData) {
            ParentBanner::where('id', $bannerData['id'])
                ->update(['sort_order' => $bannerData['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sort order updated successfully'
        ]);
    }

    /**
     * Get active banners for public display (parent dashboard)
     */
    public function getPublicBanners(Request $request)
    {
        $banners = ParentBanner::active()
            ->current()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners
        ]);
    }
}

