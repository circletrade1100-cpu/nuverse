<?php

namespace App\Repositories;

use App\Models\GuruPotongan;

class GuruPotonganRepository
{
    public function all()
    {
        return GuruPotongan::all();
    }

    public function find($bulan, $periode_bulan, $periode_tahun)
    {
        return GuruPotongan::where('id_guru', $id_guru)
            ->where('id_potongan', $id_potongan)
            ->first();
    }

    public function create(array $data)
    {
        return GuruPotongan::create($data);
    }

    public function delete($id_guru, $id_potongan)
    {
        $record = GuruPotongan::where('id_guru', $id_guru)
            ->where('id_potongan', $id_potongan)
            ->first();
        if ($record) {
            $record->delete();
            return true;
        }
        return false;
    }

    public function findPotonganByGuruAndPeriode($id_guru, $periode_bulan, $periode_tahun)
    {
        return \DB::table('guru_potongan as gp')
            ->join('payroll_potongan as pp', 'gp.id_potongan', '=', 'pp.id_potongan')
            ->select('pp.nama_potongan', 'pp.jumlah', 'pp.periode_bulan', 'pp.periode_tahun')
            ->where('gp.id_guru', $id_guru)
            ->where('pp.periode_bulan', $periode_bulan)
            ->where('pp.periode_tahun', $periode_tahun)
            ->get();
    }
}
