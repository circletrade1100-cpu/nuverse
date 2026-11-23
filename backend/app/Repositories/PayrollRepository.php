<?php

namespace App\Repositories;

use App\Models\Payroll;
use Carbon\Carbon;

class PayrollRepository
{
    public function all()
    {
        $payroll = Payroll::select([
            'payroll_id',
            'guru_id',
            'g.nip',
            'g.nama_lengkap',
            'j.nama as nama_jabatan',
            'payroll.gaji_pokok',
            'jabatan',
            'masa_kerja',
            'wali_kelas',
            'koordinator',
            'tatap_muka',
            't_muka_pengganti',
            'tunj_keluarga',
            'transport1',
            'transport2',
            'makan',
            'jamsostek',
            'overtime',
            'pramuka',
            'ekskul',
            'bimbel',
            'insentif_peng_pramuka',
            'insentif_peng_ekskul',
            'insentif_peng_proyek',
            'total_gaji',
            'total_potongan',
            'gaji_bersih',
            'payroll.periode_bulan',
            'payroll.periode_tahun',
            'payroll.status',
        ])
        //->distinct()
        ->join('gurus as g', 'payroll.guru_id', '=', 'g.id')
        ->join('jabatans as j', 'g.jabatan_id', '=', 'j.id')
        //->join('guru_potongan as gp', 'payroll.guru_id', '=', 'gp.id_guru')
        //->join('payroll_potongan as pp', 'gp.id_potongan', '=', 'pp.id_potongan')
        //->where('payroll.periode_bulan', $bulan)
        ->where('payroll.periode_tahun', date('Y'))
        ->get();

        if($payroll->isEmpty()) {
            return [];
        }
        else 
        {
            $result = [];
            foreach ($payroll as $p) {
                $result[] = $p;
            }
            return $result;
        }
    }

    public function find($id)
    {
        return Payroll::find($id);
    }

    public function create(array $data)
    {
        return Payroll::create($data);
    }

    public function update($id, array $data)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->update($data);
        return $payroll;
    }

    public function delete($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->delete();
        return true;
    }

    public function getPayrollWithPotongan($bulan, $tahun)
    {
        $payroll = Payroll::select([
                'payroll_id',
                'guru_id',
                'g.nip',
                'g.nama_lengkap',
                'j.nama as nama_jabatan',
                'payroll.gaji_pokok',
                'jabatan',
                'masa_kerja',
                'wali_kelas',
                'koordinator',
                'tatap_muka',
                't_muka_pengganti',
                'tunj_keluarga',
                'transport1',
                'transport2',
                'makan',
                'jamsostek',
                'overtime',
                'pramuka',
                'ekskul',
                'bimbel',
                'insentif_peng_pramuka',
                'insentif_peng_ekskul',
                'insentif_peng_proyek',
                'total_gaji',
                'payroll.status',
            ])
            //->distinct()
            ->join('gurus as g', 'payroll.guru_id', '=', 'g.id')
            ->join('jabatans as j', 'g.jabatan_id', '=', 'j.id')
            //->join('guru_potongan as gp', 'payroll.guru_id', '=', 'gp.id_guru')
            //->join('payroll_potongan as pp', 'gp.id_potongan', '=', 'pp.id_potongan')
            ->where('payroll.periode_bulan', $bulan)
            ->where('payroll.periode_tahun', $tahun)
            ->get();
        if($payroll->isEmpty()) {
            return [];
        }
        else {
            $result = [];
            foreach ($payroll as $p) {
                $total_gaji = $p->gaji_pokok + ($p->jabatan ?? 0) 
                + ($p->masa_kerja ?? 0) + ($p->wali_kelas ?? 0) 
                + ($p->koordinator ?? 0) + ($p->tatap_muka ?? 0) 
                + ($p->t_muka_pengganti ?? 0) + + ($p->tunj_keluarga ?? 0) + ($p->transport1 ?? 0) 
                + ($p->transport2 ?? 0) + ($p->makan ?? 0) 
                + ($p->jamsostek ?? 0) + ($p->overtime ?? 0) 
                + ($p->pramuka ?? 0) + ($p->ekskul ?? 0) + ($p->bimbel ?? 0)
                + ($p->insentif_peng_pramuka ?? 0) + ($p->insentif_peng_ekskul ?? 0)
                + ($p->insentif_peng_proyek ?? 0);
                $potongans = \DB::table('guru_potongan as gp')
                    ->join('payroll_potongan as pp', 'gp.id_potongan', '=', 'pp.id_potongan')
                    ->select('pp.nama_potongan', 'pp.jumlah')
                    ->where('gp.id_guru', $p->guru_id)
                    ->where('pp.periode_bulan', $bulan)
                    ->where('pp.periode_tahun', $tahun)
                    ->get();
                foreach ($potongans as $potongan) {
                    $p->total_potongan = ($p->total_potongan ?? 0) + $potongan->jumlah;
                }
                //$result[] = $p;
                $p->total_gaji = $total_gaji;
                $p->potongans = $potongans;
                $result[] = $p;
            }
            return $result;
        }
    }
}
