<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BillType;
use App\Models\BillLabel;

class BillLabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $billTypes = BillType::all();

        if ($billTypes->isEmpty()) {
            $this->command->warn('⚠️ Tidak ada jenis tagihan. Jalankan BillTypeSeeder terlebih dahulu.');
            return;
        }

        $billLabels = [];

        foreach ($billTypes as $billType) {
            // Buat label berdasarkan jenis tagihan
            switch ($billType->name) {
                case 'SPP':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Pembayaran SPP wajib dilakukan setiap bulan sebelum tanggal 10. Pembayaran setelah tanggal tersebut dikenakan denda keterlambatan.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Uang Pangkal':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Uang pangkal dibayar satu kali saat pendaftaran siswa baru. Pembayaran harus lunas sebelum siswa mulai aktif belajar di sekolah.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Seragam':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Biaya seragam mencakup baju seragam harian, seragam olahraga, dan atribut sekolah (topi, dasi, badge). Pengambilan seragam dapat dilakukan di bagian kesiswaan setelah pembayaran lunas.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Kegiatan':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Biaya kegiatan mencakup kegiatan ekstrakurikuler, field trip, dan kegiatan sekolah lainnya. Pembayaran dapat dilakukan secara bertahap sesuai jadwal kegiatan.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Buku Paket':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Biaya buku paket untuk semester berjalan. Buku akan diberikan setelah pembayaran lunas. Buku bekas dapat dikembalikan untuk mendapatkan potongan harga pada semester berikutnya.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Ujian':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Biaya ujian mencakup ujian tengah semester, ujian akhir semester, dan ujian nasional. Pembayaran harus dilakukan sebelum jadwal ujian dimulai.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                case 'Studi Tour':
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Biaya studi tour bersifat opsional. Siswa yang mengikuti studi tour wajib membayar biaya ini sebelum tanggal keberangkatan. Pembayaran tidak dapat dikembalikan jika sudah dibayar.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;

                default:
                    // Label default untuk jenis tagihan lainnya
                    $billLabels[] = [
                        'bill_type_id' => $billType->id,
                        'label_name' => $billType->name,
                        'label_text' => 'Pembayaran tagihan ini wajib dilakukan sesuai dengan ketentuan yang berlaku. Untuk informasi lebih lanjut, hubungi bagian keuangan sekolah.',
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    break;
            }
        }

        // Insert semua label
        BillLabel::insert($billLabels);

        $this->command->info('✅ Bill labels seeded successfully! (' . count($billLabels) . ' labels created)');
    }
}
