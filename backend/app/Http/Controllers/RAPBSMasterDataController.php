<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\ActivityCategory;
use App\Models\FundingSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RAPBSMasterDataController extends Controller
{
    // Academic Years

    public function getAcademicYears(Request $request)
    {
        $query = AcademicYear::query();

        if ($request->has('search')) {
            $query->where('year', 'like', "%{$request->search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $years = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $years
        ]);
    }

    public function getAcademicYear($id)
    {
        $year = AcademicYear::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $year
        ]);
    }

    public function storeAcademicYear(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|string|max:10|unique:academic_years,year',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $year = AcademicYear::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Academic year created successfully',
            'data' => $year
        ], 201);
    }

    public function updateAcademicYear(Request $request, $id)
    {
        $year = AcademicYear::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'year' => 'sometimes|string|max:10|unique:academic_years,year,' . $id,
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $year->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Academic year updated successfully',
            'data' => $year
        ]);
    }

    public function deleteAcademicYear($id)
    {
        $year = AcademicYear::findOrFail($id);
        $year->delete();

        return response()->json([
            'success' => true,
            'message' => 'Academic year deleted successfully'
        ]);
    }

    // Activity Categories

    public function getActivityCategories(Request $request)
    {
        $query = ActivityCategory::with('parent');

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('budget_type')) {
            $query->where('budget_type', $request->budget_type);
        }

        $perPage = $request->get('per_page', 10);
        $categories = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function getActivityCategory($id)
    {
        $category = ActivityCategory::with(['parent', 'children'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    public function storeActivityCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:activity_categories,id',
            'budget_type' => 'required|in:income,expense'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = ActivityCategory::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Activity category created successfully',
            'data' => $category
        ], 201);
    }

    public function updateActivityCategory(Request $request, $id)
    {
        $category = ActivityCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:activity_categories,id',
            'budget_type' => 'sometimes|in:income,expense'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Activity category updated successfully',
            'data' => $category
        ]);
    }

    public function deleteActivityCategory($id)
    {
        $category = ActivityCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity category deleted successfully'
        ]);
    }

    // Funding Sources

    public function getFundingSources(Request $request)
    {
        $query = FundingSource::query();

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // If all=true, return all without pagination (for dropdowns)
        if ($request->get('all') === 'true') {
            $sources = $query->where('status', 'active')->orderBy('name')->get();
            return response()->json([
                'success' => true,
                'data' => $sources
            ]);
        }

        $perPage = $request->get('per_page', 10);
        $sources = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $sources
        ]);
    }

    public function getFundingSource($id)
    {
        $source = FundingSource::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $source
        ]);
    }

    public function storeFundingSource(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'type' => 'required|in:bos,spp,donation,other',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $source = FundingSource::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Funding source created successfully',
            'data' => $source
        ], 201);
    }

    public function updateFundingSource(Request $request, $id)
    {
        $source = FundingSource::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:bos,spp,donation,other',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $source->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Funding source updated successfully',
            'data' => $source
        ]);
    }

    public function deleteFundingSource($id)
    {
        $source = FundingSource::findOrFail($id);
        $source->delete();

        return response()->json([
            'success' => true,
            'message' => 'Funding source deleted successfully'
        ]);
    }
}

