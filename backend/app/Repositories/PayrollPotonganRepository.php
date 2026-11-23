<?php

namespace App\Repositories;

use App\Models\PayrollPotongan;

class PayrollPotonganRepository
{
    public function all()
    {
        return PayrollPotongan::all();
    }

    public function find($id)
    {
        return PayrollPotongan::find($id);
    }

    public function create(array $data)
    {
        return PayrollPotongan::create($data);
    }

    public function update($id, array $data)
    {
        $potongan = PayrollPotongan::findOrFail($id);
        $potongan->update($data);
        return $potongan;
    }

    public function delete($id)
    {
        $potongan = PayrollPotongan::findOrFail($id);
        $potongan->delete();
        return true;
    }
}
