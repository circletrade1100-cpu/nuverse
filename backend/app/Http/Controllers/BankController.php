<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bank::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_bank', 'like', "%{$search}%")
                    ->orWhere('nomor_rekening', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('paginate', true)) {
            $perPage = (int) $request->get('per_page', 15);
            $banks = $query->orderBy('nama_bank')->paginate($perPage);
        } else {
            $banks = $query->orderBy('nama_bank')->get();
        }

        return response()->json([
            'success' => true,
            'data' => $banks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_bank' => 'required|string|max:150',
            'nomor_rekening' => 'required|string|max:50|unique:banks,nomor_rekening',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bank = Bank::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Bank berhasil ditambahkan',
            'data' => $bank,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $bank = Bank::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $bank,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $bank = Bank::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nama_bank' => 'sometimes|required|string|max:150',
            'nomor_rekening' => 'sometimes|required|string|max:50|unique:banks,nomor_rekening,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $bank->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Bank berhasil diperbarui',
            'data' => $bank,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $bank = Bank::findOrFail($id);
        $bank->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bank berhasil dihapus',
        ]);
    }
}
