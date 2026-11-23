<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menyamakan nama unit master dengan label yang dipakai transaksi / metadata ("TU Islam Annur").
     * Memperbarui profil pengguna yang masih memakai teks lama agar lookup unit tetap berfungsi.
     */
    public function up(): void
    {
        DB::table('unit_sekolahs')
            ->where('nama', 'Tata Usaha')
            ->update(['nama' => 'TU Islam Annur', 'updated_at' => now()]);

        if (Schema::hasTable('user_profiles')) {
            DB::table('user_profiles')
                ->where('unit_sekolah', 'Tata Usaha')
                ->update(['unit_sekolah' => 'TU Islam Annur', 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        DB::table('unit_sekolahs')
            ->where('nama', 'TU Islam Annur')
            ->update(['nama' => 'Tata Usaha', 'updated_at' => now()]);
    }
};
