<?php

namespace App\Http\Controllers;

use App\Models\ParentAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ParentAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentAnnouncement::with('creator');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Pinned filter
        if ($request->has('is_pinned')) {
            $query->where('is_pinned', $request->boolean('is_pinned'));
        }

        // Active filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $announcements = $query->orderBy('is_pinned', 'desc')
                              ->orderBy('published_at', 'desc')
                              ->orderBy('sort_order', 'asc')
                              ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $announcements
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'required|in:akademik,kegiatan,pengumuman,informasi',
            'author' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'sort_order' => 'integer|min:0',
            'read_time' => 'integer|min:1|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('parent-announcements/thumbnails', 'public');
            $data['thumbnail'] = $thumbnailPath;
        }

        // Handle document upload
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('parent-announcements/documents', 'public');
            $data['document_path'] = $documentPath;
        }

        $data['created_by'] = auth()->id();

        // Set default published_at if not provided
        if (!isset($data['published_at'])) {
            $data['published_at'] = now()->toDateString();
        }

        $announcement = ParentAnnouncement::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Announcement created successfully',
            'data' => $announcement->load('creator')
        ], 201);
    }

    public function show($id)
    {
        $announcement = ParentAnnouncement::with('creator')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $announcement
        ]);
    }

    public function update(Request $request, $id)
    {
        $announcement = ParentAnnouncement::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string|max:500',
            'category' => 'sometimes|in:akademik,kegiatan,pengumuman,informasi',
            'author' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:published_at',
            'sort_order' => 'integer|min:0',
            'read_time' => 'integer|min:1|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($announcement->thumbnail) {
                Storage::disk('public')->delete($announcement->thumbnail);
            }
            
            $thumbnailPath = $request->file('thumbnail')->store('parent-announcements/thumbnails', 'public');
            $data['thumbnail'] = $thumbnailPath;
        }

        // Handle document upload
        if ($request->hasFile('document')) {
            // Delete old document
            if ($announcement->document_path) {
                Storage::disk('public')->delete($announcement->document_path);
            }
            
            $documentPath = $request->file('document')->store('parent-announcements/documents', 'public');
            $data['document_path'] = $documentPath;
        }

        $announcement->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Announcement updated successfully',
            'data' => $announcement->load('creator')
        ]);
    }

    public function destroy($id)
    {
        $announcement = ParentAnnouncement::findOrFail($id);

        // Delete associated files
        if ($announcement->thumbnail) {
            Storage::disk('public')->delete($announcement->thumbnail);
        }
        if ($announcement->document_path) {
            Storage::disk('public')->delete($announcement->document_path);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully'
        ]);
    }

    /**
     * Increment view count
     */
    public function incrementViews($id)
    {
        $announcement = ParentAnnouncement::findOrFail($id);
        $announcement->incrementViews();

        return response()->json([
            'success' => true,
            'views' => $announcement->view_count
        ]);
    }

    /**
     * Get active announcements for public display (parent dashboard)
     */
    public function getPublicAnnouncements(Request $request)
    {
        $query = ParentAnnouncement::active()
            ->current()
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->orderBy('sort_order', 'asc');

        // Category filter
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Limit results
        $limit = $request->get('limit', 20);
        $announcements = $query->limit($limit)->get();

        return response()->json([
            'success' => true,
            'data' => $announcements
        ]);
    }
}

