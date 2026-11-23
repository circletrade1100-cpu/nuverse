<?php

namespace App\Http\Controllers;

use App\Models\ParentCalendarEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ParentCalendarEventController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentCalendarEvent::with('creator');

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Event type filter
        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        // Priority filter
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Active filter
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Date range filter
        if ($request->has('date_from')) {
            $query->where('start_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('start_date', '<=', $request->date_to);
        }

        $events = $query->orderBy('start_date', 'asc')
                      ->orderBy('sort_order', 'asc')
                      ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'event_type' => 'required|in:akademik,kegiatan,libur,kompetisi,pengumuman',
            'priority' => 'required|in:high,medium,low',
            'location' => 'nullable|string|max:255',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle document upload
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('parent-calendar-documents', 'public');
            $data['document_path'] = $documentPath;
        }

        $data['created_by'] = auth()->id();

        $event = ParentCalendarEvent::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Calendar event created successfully',
            'data' => $event->load('creator')
        ], 201);
    }

    public function show($id)
    {
        $event = ParentCalendarEvent::with('creator')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $event
        ]);
    }

    public function update(Request $request, $id)
    {
        $event = ParentCalendarEvent::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'event_type' => 'sometimes|in:akademik,kegiatan,libur,kompetisi,pengumuman',
            'priority' => 'sometimes|in:high,medium,low',
            'location' => 'nullable|string|max:255',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        // Handle document upload
        if ($request->hasFile('document')) {
            // Delete old document
            if ($event->document_path) {
                Storage::disk('public')->delete($event->document_path);
            }
            
            $documentPath = $request->file('document')->store('parent-calendar-documents', 'public');
            $data['document_path'] = $documentPath;
        }

        $event->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Calendar event updated successfully',
            'data' => $event->load('creator')
        ]);
    }

    public function destroy($id)
    {
        $event = ParentCalendarEvent::findOrFail($id);

        // Delete associated document
        if ($event->document_path) {
            Storage::disk('public')->delete($event->document_path);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Calendar event deleted successfully'
        ]);
    }

    /**
     * Get active events for public display (parent dashboard)
     */
    public function getPublicEvents(Request $request)
    {
        $query = ParentCalendarEvent::active()
            ->orderBy('start_date', 'asc')
            ->orderBy('sort_order', 'asc');

        // Limit to upcoming events if requested
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $events = $query->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }
}

