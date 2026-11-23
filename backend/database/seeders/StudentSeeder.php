<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'nama_lengkap' => 'Ahmad Rizky Pratama',
                'nama_panggilan' => 'Rizky',
                'nisn' => '1234567890',
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '2010-05-15',
                'nama_ibu' => 'Siti Nurhaliza',
                'nama_ayah' => 'Budi Pratama',
                'nomor_hp' => '08123456789',
                'alamat' => 'Jl. Merdeka No. 123, Jakarta Pusat',
                'email' => 'ahmad.rizky@student.ypiannur.sch.id',
                'unit_sekolah' => 'SMP',
                'unit_kelas' => '7A',
                'password' => 'password123',
                'status' => 'Aktif'
            ],
            [
                'nama_lengkap' => 'Sari Indira Putri',
                'nama_panggilan' => 'Sari',
                'nisn' => '2345678901',
                'tempat_lahir' => 'Bandung',
                'tanggal_lahir' => '2009-08-22',
                'nama_ibu' => 'Dewi Sartika',
                'nama_ayah' => 'Indra Wijaya',
                'nomor_hp' => '08234567890',
                'alamat' => 'Jl. Sudirman No. 45, Bandung',
                'email' => 'sari.indira@student.ypiannur.sch.id',
                'unit_sekolah' => 'SMP',
                'unit_kelas' => '8B',
                'password' => 'saripass123',
                'status' => 'Aktif'
            ],
            [
                'nama_lengkap' => 'Muhammad Fajar Sidiq',
                'nama_panggilan' => 'Fajar',
                'nisn' => '3456789012',
                'tempat_lahir' => 'Surabaya',
                'tanggal_lahir' => '2008-12-10',
                'nama_ibu' => 'Aisyah Rahmawati',
                'nama_ayah' => 'Sidiq Rahman',
                'nomor_hp' => '08345678901',
                'alamat' => 'Jl. Diponegoro No. 78, Surabaya',
                'email' => 'fajar.sidiq@student.ypiannur.sch.id',
                'unit_sekolah' => 'SMP',
                'unit_kelas' => '9A',
                'password' => 'fajar2024',
                'status' => 'Aktif'
            ],
            [
                'nama_lengkap' => 'Anisa Dewi Lestari',
                'nama_panggilan' => 'Anisa',
                'nisn' => '4567890123',
                'tempat_lahir' => 'Yogyakarta',
                'tanggal_lahir' => '2010-03-18',
                'nama_ibu' => 'Lestari Wulandari',
                'nama_ayah' => 'Bambang Sutrisno',
                'nomor_hp' => '08456789012',
                'alamat' => 'Jl. Malioboro No. 156, Yogyakarta',
                'email' => 'anisa.dewi@student.ypiannur.sch.id',
                'unit_sekolah' => 'SMP',
                'unit_kelas' => '7B',
                'password' => 'anisa123',
                'status' => 'Aktif'
            ],
            [
                'nama_lengkap' => 'Dinda Maharani Putri',
                'nama_panggilan' => 'Dinda',
                'nisn' => '5678901234',
                'tempat_lahir' => 'Medan',
                'tanggal_lahir' => '2009-07-25',
                'nama_ibu' => 'Maharani Sari',
                'nama_ayah' => 'Putra Mahendra',
                'nomor_hp' => '08567890123',
                'alamat' => 'Jl. Gatot Subroto No. 234, Medan',
                'email' => 'dinda.maharani@student.ypiannur.sch.id',
                'unit_sekolah' => 'SMP',
                'unit_kelas' => '8A',
                'password' => 'dinda2024',
                'status' => 'Aktif'
            ]
        ];

        foreach ($students as $student) {
            Student::firstOrCreate(
                ['nisn' => $student['nisn']], // Check by NISN
                $student // Create with this data if not exists
            );
        }
    }
}
