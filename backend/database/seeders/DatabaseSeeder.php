<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
            CategorySeeder::class,
            TransactionSeeder::class,
            AttendanceSeeder::class,
            // Master Data Seeders - urutan penting!
            JabatanSeeder::class,
            UnitSekolahSeeder::class,
            UnitKerjaSeeder::class,  // Setelah UnitSekolah karena bergantung pada data UnitSekolah
            UnitKelasSeeder::class,
            // Guru dan Student Seeders
            GuruSeeder::class,
            StudentSeeder::class,
            PayrollSeeder::class,
            PayrollPotonganSeeder::class,
            GuruPotonganSeeder::class,
            // Tagihan Siswa Seeders
            BillTypeSeeder::class,
            BillLabelSeeder::class,  // Setelah BillTypeSeeder karena bergantung pada data BillType
            StudentBillSeeder::class,
            // Cuti Guru Seeder
            CutiSeeder::class,
            // RAPBS Seeders
            AcademicYearSeeder::class,
            ActivityCategorySeeder::class,
            FundingSourceSeeder::class,
            RapbsSeeder::class,
            RapbsUserSeeder::class,
            RapbsDocumentSeeder::class,
            RapbsRealizationSeeder::class,
            ActivityNoteSeeder::class,
            // Divisi & Unit Seeders
            DivisionSeeder::class,
            DivisionalTransactionSeeder::class,
            TeacherAttendanceDocumentSeeder::class,
            ExpenseDocumentSeeder::class,
        ]);
    }
}
