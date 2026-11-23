<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TestStudentController extends Controller
{
    public function testCreate(Request $request)
    {
        \Log::info('🚀 === TEST STUDENT CREATE ===');
        \Log::info('🔍 Method: ' . $request->method());
        \Log::info('🔍 URL: ' . $request->url());
        \Log::info('🔍 Headers: ', $request->headers->all());
        \Log::info('🔍 All Input: ', $request->all());
        \Log::info('🔍 Raw Content: ' . $request->getContent());
        
        // Simple response to test if we can reach the endpoint
        return response()->json([
            'success' => true,
            'message' => 'Test endpoint reached successfully',
            'received_data' => $request->all(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'timestamp' => now()->toISOString()
        ]);
    }
}
