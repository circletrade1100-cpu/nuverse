<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\AttendanceLog;
use App\Models\User;
use App\Models\UnitSekolah;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TUController extends Controller
{
    public function dashboard()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Get authenticated user info
        $user = auth()->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        // Build base query for income
        $incomeQuery = Transaction::income()->approved();
        $expenseQuery = Transaction::expense()->approved();
        $cashIncomeQuery = Transaction::income()->approved();
        $cashExpenseQuery = Transaction::expense()->approved();
        $pendingQuery = Transaction::pending();
        
        // Filter berdasarkan unit_sekolah_id atau unit_sekolah dari user profile (kecuali Super Admin)
        if (!$isSuperAdmin && $user && $user->profile) {
            // Cari unit_sekolah_id dari unit_sekolah nama user
            $userUnitSekolahNama = $user->profile->unit_sekolah;
            if ($userUnitSekolahNama) {
                $userUnitSekolah = UnitSekolah::where('nama', $userUnitSekolahNama)->first();
                
                if ($userUnitSekolah) {
                    // Filter by unit_sekolah_id jika ada
                    $incomeQuery->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                        $q->where('unit_sekolah_id', $userUnitSekolah->id)
                          ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                              $subQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                    });
                    
                    $expenseQuery->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                        $q->where('unit_sekolah_id', $userUnitSekolah->id)
                          ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                              $subQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                    });
                    
                    $cashIncomeQuery->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                        $q->where('unit_sekolah_id', $userUnitSekolah->id)
                          ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                              $subQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                    });
                    
                    $cashExpenseQuery->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                        $q->where('unit_sekolah_id', $userUnitSekolah->id)
                          ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                              $subQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                    });
                    
                    $pendingQuery->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                        $q->where('unit_sekolah_id', $userUnitSekolah->id)
                          ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                              $subQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                    });
                }
            }
        }

        // Total pemasukan hari ini dan bulan ini
        $todayIncome = (clone $incomeQuery)
            ->whereDate('transaction_date', $today)
            ->sum('amount');

        $monthlyIncome = (clone $incomeQuery)
            ->where('transaction_date', '>=', $thisMonth)
            ->sum('amount');

        // Total pengeluaran hari ini dan bulan ini
        $todayExpense = (clone $expenseQuery)
            ->whereDate('transaction_date', $today)
            ->sum('amount');

        $monthlyExpense = (clone $expenseQuery)
            ->where('transaction_date', '>=', $thisMonth)
            ->sum('amount');

        // Saldo kas (filtered by unit_sekolah)
        $totalIncome = $cashIncomeQuery->sum('amount');
        $totalExpense = $cashExpenseQuery->sum('amount');
        $cashBalance = $totalIncome - $totalExpense;

        // Pending approvals (filtered by unit_sekolah)
        $pendingApprovals = $pendingQuery->count();

        // Staff attendance today
        $totalStaff = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['tu_staff', 'kepala_tu']);
        })->count();

        $presentToday = AttendanceLog::today()
            ->whereIn('status', ['present', 'late'])
            ->distinct('user_id')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'income' => [
                    'today' => $todayIncome,
                    'monthly' => $monthlyIncome
                ],
                'expense' => [
                    'today' => $todayExpense,
                    'monthly' => $monthlyExpense
                ],
                'cash_balance' => $cashBalance,
                'pending_approvals' => $pendingApprovals,
                'attendance' => [
                    'present' => $presentToday,
                    'total' => $totalStaff,
                    'percentage' => $totalStaff > 0 ? round(($presentToday / $totalStaff) * 100, 1) : 0
                ]
            ]
        ]);
    }

    public function getReportData(Request $request)
    {
        $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly
        $unitId = $request->get('unit_id');
        // Samakan tipe dengan kolom FK (query string vs int di DB)
        $unitKeyForQuery = ($unitId !== null && $unitId !== '' && $unitId !== 'all' && is_numeric($unitId))
            ? (int) $unitId
            : null;
        $categoryFilter = $request->get('category'); // Filter by category name

        
        // Build base query with relations - include approved and pending for complete report
        // Exclude only rejected status
        $query = Transaction::whereIn('status', ['approved', 'pending', 'completed'])
            ->with(['category', 'unitSekolah', 'user.profile']);
        
        // Filter berdasarkan unit_sekolah user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        // Handle unit filter
        if ($isSuperAdmin) {
            // Super Admin bisa filter manual lewat dropdown
            if ($unitKeyForQuery !== null) {
                // Filter by unit_sekolah_id directly (primary method)
                $query->where(function($q) use ($unitKeyForQuery) {
                    $q->where('unit_sekolah_id', $unitKeyForQuery)
                      // Fallback: filter by unit name in metadata or user profile (for old data)
                      ->orWhere(function($subQ) use ($unitKeyForQuery) {
                          $unitSekolah = UnitSekolah::find($unitKeyForQuery);
                          if ($unitSekolah) {
                              $this->applyReportUnitMetadataConditionsFromNama($subQ, $unitSekolah->nama);
                          }
                      });
                });
            }
            // If unitId is 'all' or empty, no unit filter applied for Super Admin
        } else {
            // Non-Super Admin: filter otomatis berdasarkan unit mereka, tapi bisa override dengan unit_id jika dikirim
            $userUnitSekolahNama = $user && $user->profile ? $user->profile->unit_sekolah : null;
            $userUnitSekolah = null;
            
            if ($userUnitSekolahNama) {
                $userUnitSekolah = UnitSekolah::where('nama', $userUnitSekolahNama)->first();
            }
            
            if ($unitKeyForQuery !== null) {
                // User non-Super Admin memilih unit tertentu dari dropdown
                // Filter dengan unit_sekolah_id dan fallback methods
                $query->where(function($q) use ($unitKeyForQuery) {
                    $q->where('unit_sekolah_id', $unitKeyForQuery)
                      // Fallback: filter by unit name in metadata or user profile (for old data)
                      ->orWhere(function($subQ) use ($unitKeyForQuery) {
                          $unitSekolah = UnitSekolah::find($unitKeyForQuery);
                          if ($unitSekolah) {
                              $this->applyReportUnitMetadataConditionsFromNama($subQ, $unitSekolah->nama);
                          }
                      });
                });
            } elseif ($userUnitSekolah) {
                // Default: filter otomatis berdasarkan unit_sekolah_id user
                $query->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                    $q->where('unit_sekolah_id', $userUnitSekolah->id)
                      // Fallback for old data without unit_sekolah_id
                      ->orWhere(function($subQ) use ($userUnitSekolahNama) {
                          $subQ->whereHas('user.profile', function($profileQ) use ($userUnitSekolahNama) {
                              $profileQ->where('unit_sekolah', $userUnitSekolahNama);
                          })
                          ->orWhere(function($metaQ) use ($userUnitSekolahNama) {
                              $this->applyReportUnitMetadataConditionsFromNama($metaQ, $userUnitSekolahNama);
                          });

                      });
                });
            }
        }
        
        // Apply period filter
        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', today());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->whereMonth('transaction_date', now()->month)
                      ->whereYear('transaction_date', now()->year);
                break;
            case 'yearly':
                $query->whereYear('transaction_date', now()->year);
                break;
            case 'custom':
                $startDate = $request->get('start_date');
                $endDate = $request->get('end_date');
                if ($startDate && $endDate) {
                    $query->whereBetween('transaction_date', [$startDate, $endDate]);
                }
                break;
        }

        // Get all transactions for the period (tanggal terbaru dulu, lalu waktu pencatatan)
        $allTransactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Calculate totals including additional categories
        $totalIncome = 0;
        $totalExpense = 0;
        
        foreach ($allTransactions as $transaction) {
            $baseAmount = $transaction->amount;
            
            // Selaras dengan kolom Kategori di tabel (metadata bill_type / kategori dulu)
            $baseCategory = $this->resolveReportCategoryLabel($transaction);
            $metadata = $transaction->metadata ?? [];
            
            // Filter base transaction by category if filter is active
            $showBaseTransaction = true;
            if ($categoryFilter && $categoryFilter !== 'all') {
                if ($baseCategory !== $categoryFilter) {
                    $showBaseTransaction = false;
                }
            }

            if ($showBaseTransaction) {
                if ($transaction->type === 'income') {
                    $totalIncome += $baseAmount;
                } else {
                    $totalExpense += $baseAmount;
                }
            }
            
            if (is_array($metadata)) {
                $rawAdditionalCategories = $metadata['additionalCategories']
                    ?? $metadata['additional_categories']
                    ?? $metadata['additional_categories_list']
                    ?? [];
                
                // Handle string JSON
                if (is_string($rawAdditionalCategories)) {
                    $decoded = json_decode($rawAdditionalCategories, true);
                    if (is_array($decoded)) {
                        $rawAdditionalCategories = $decoded;
                    }
                }
                
                // Handle object map
                if (is_object($rawAdditionalCategories) && !is_array($rawAdditionalCategories)) {
                    $rawAdditionalCategories = (array) $rawAdditionalCategories;
                }
                
                if (is_array($rawAdditionalCategories)) {
                    $additionalCategories = array_values($rawAdditionalCategories);
                    
                    foreach ($additionalCategories as $additionalCategory) {
                        if (!is_array($additionalCategory) && !is_object($additionalCategory)) {
                            continue;
                        }
                        
                        $additionalCategoryArray = is_object($additionalCategory) ? (array) $additionalCategory : $additionalCategory;
                        
                        $catName = $additionalCategoryArray['category']
                            ?? $additionalCategoryArray['category_name']
                            ?? $additionalCategoryArray['name']
                            ?? $additionalCategoryArray['label']
                            ?? 'Kategori Tambahan';

                        // Filter additional category if filter is active
                        if ($categoryFilter && $categoryFilter !== 'all' && $catName !== $categoryFilter) {
                            continue;
                        }

                        $rawAmount = $additionalCategoryArray['amount']
                            ?? $additionalCategoryArray['jumlah']
                            ?? $additionalCategoryArray['value']
                            ?? $additionalCategoryArray['nominal']
                            ?? 0;
                        
                        $additionalAmount = is_numeric($rawAmount) 
                            ? (float) $rawAmount 
                            : (is_string($rawAmount) ? (float) preg_replace('/[^\d.-]/', '', $rawAmount) : 0);
                        
                        if ($additionalAmount > 0) {
                            if ($transaction->type === 'income') {
                                $totalIncome += $additionalAmount;
                            } else {
                                $totalExpense += $additionalAmount;
                            }
                        }
                    }
                }
            }
        }

        
        $netBalance = $totalIncome - $totalExpense;
        
        // Get current balance (optimized by using unit filter if applicable)
        $balanceQuery = Transaction::whereIn('status', ['approved', 'completed']);
        
        // If not super admin, restrict balance calculation to their unit
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_sekolah) {
            $uNama = $user->profile->unit_sekolah;
            $u = UnitSekolah::where('nama', $uNama)->first();
            
            $balanceQuery->where(function($q) use ($u, $uNama) {
                if ($u) {
                    $q->where('unit_sekolah_id', $u->id);
                }
                $q->orWhere(function ($sub) use ($uNama) {
                    $this->applyReportUnitMetadataConditionsFromNama($sub, $uNama);
                });
            });
        } elseif ($unitKeyForQuery !== null) {
            // Respect unit selection for Super Admin too in balance calculation
            $u = UnitSekolah::find($unitKeyForQuery);
            if ($u) {
                $uNama = $u->nama;
                $balanceQuery->where(function($q) use ($unitKeyForQuery, $uNama) {
                    $q->where('unit_sekolah_id', $unitKeyForQuery)
                      ->orWhere(function ($sub) use ($uNama) {
                          $this->applyReportUnitMetadataConditionsFromNama($sub, $uNama);
                      });
                });
            }
        }

        // Limit results to optimize memory, though we still need metadata for full accuracy
        // For very large datasets, this should ideally be handled at DB level with JSON support
        // Processing in chunks to be safer with memory
        $currentIncome = 0;
        $currentExpense = 0;
        
        $balanceQuery->chunk(500, function($transactions) use (&$currentIncome, &$currentExpense) {
            foreach ($transactions as $transaction) {
                $baseAmount = $transaction->amount;
                
                if ($transaction->type === 'income') {
                    $currentIncome += $baseAmount;
                } else {
                    $currentExpense += $baseAmount;
                }
                
                $metadata = $transaction->metadata ?? [];
                if (is_array($metadata)) {
                    $rawAdditionalCategories = $metadata['additionalCategories']
                        ?? $metadata['additional_categories']
                        ?? $metadata['additional_categories_list']
                        ?? [];
                    
                    if (is_string($rawAdditionalCategories)) {
                        $rawAdditionalCategories = json_decode($rawAdditionalCategories, true);
                    }
                    
                    if (is_array($rawAdditionalCategories) || is_object($rawAdditionalCategories)) {
                        $additionalCategories = is_object($rawAdditionalCategories) ? (array) $rawAdditionalCategories : array_values($rawAdditionalCategories);
                        
                        foreach ($additionalCategories as $additionalCategory) {
                            if (!is_array($additionalCategory) && !is_object($additionalCategory)) continue;
                            
                            $catArray = (array) $additionalCategory;
                            $rawAmt = $catArray['amount'] ?? $catArray['jumlah'] ?? $catArray['value'] ?? $catArray['nominal'] ?? 0;
                            $addAmt = is_numeric($rawAmt) ? (float) $rawAmt : 0;
                            
                            if ($addAmt > 0) {
                                if ($transaction->type === 'income') $currentIncome += $addAmt;
                                else $currentExpense += $addAmt;
                            }
                        }
                    }
                }
            }
        });
        
        $currentBalance = $currentIncome - $currentExpense;


        // Chart mengikuti filter kategori (sama dengan total baris dasar)
        $transactionsForChart = $allTransactions;
        if ($categoryFilter && $categoryFilter !== 'all') {
            $transactionsForChart = $allTransactions->filter(function (Transaction $t) use ($categoryFilter) {
                return $this->resolveReportCategoryLabel($t) === $categoryFilter;
            });
        }

        // Generate chart data based on period
        $chartData = $this->generateChartData($transactionsForChart, $period);

        // Prepare transaction list for table
        // Use flatMap to handle additional categories as separate transactions
        $transactions = $allTransactions->flatMap(function($transaction) use ($categoryFilter) {
            $result = [];
            
            // Ensure metadata is always an array, handle double-encoded JSON if necessary
            $rawMetadata = $transaction->metadata ?? [];
            $metadata = $rawMetadata;
            if (is_string($rawMetadata)) {
                $decoded = json_decode($rawMetadata, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $metadata = $decoded;
                } else {
                    $metadata = [];
                }
            } elseif ($rawMetadata instanceof \Illuminate\Contracts\Support\Arrayable) {
                $metadata = $rawMetadata->toArray();
            } elseif (is_object($rawMetadata)) {
                $metadata = (array) $rawMetadata;
            }

            // Get "Dibayar Oleh" from metadata
            $dibayarOleh = 'N/A';
            if (is_array($metadata)) {
                // Priority list for paid by info
                $dibayarOleh = $metadata['paidBy']
                    ?? $metadata['student_name']
                    ?? $metadata['nama_siswa']
                    ?? null;
                
                // Fallback to user name if metadata doesn't have it
                if (!$dibayarOleh && $transaction->user) {
                    $dibayarOleh = $transaction->user->name;
                }
            } elseif ($transaction->user) {
                $dibayarOleh = $transaction->user->name;
            }
            
            // Re-normalize dibayarOleh to N/A if still null
            $dibayarOleh = $dibayarOleh ?: 'N/A';

            // Kolom Unit laporan: utamakan unit sekolah siswa (metadata / lookup Student), bukan unit pencatat TU
            $unitNama = $this->resolveReportDisplayUnitNama($transaction, is_array($metadata) ? $metadata : [], $dibayarOleh);

            // Untuk filter query siswa di resolveStudentClass: jangan pakai unit transaksi jika itu kantor TU
            $studentUnitSekolah = null;
            if (is_array($metadata)) {
                $studentUnitSekolah = $metadata['student_unit_sekolah']
                    ?? $metadata['unit_sekolah']
                    ?? null;
            }
            if (!$studentUnitSekolah && $transaction->unitSekolah) {
                $fromTx = $transaction->unitSekolah->kode
                    ?? $transaction->unitSekolah->singkatan
                    ?? $transaction->unitSekolah->nama;
                if (!$this->isTuRecorderUnitName($fromTx) && !$this->isTuRecorderUnitName($transaction->unitSekolah->nama ?? null)) {
                    $studentUnitSekolah = $fromTx;
                }
            }
            if (
                !$studentUnitSekolah &&
                $transaction->user &&
                $transaction->user->profile &&
                $transaction->user->profile->unit_sekolah
            ) {
                $p = $transaction->user->profile->unit_sekolah;
                if (!$this->isTuRecorderUnitName($p)) {
                    $studentUnitSekolah = $p;
                }
            }

            $createdAt = $transaction->created_at ? $transaction->created_at->copy()->timezone(config('app.timezone')) : null;
            $jamDibuat = $createdAt ? $createdAt->format('H:i') : null;
            $createdAtFull = $createdAt ? $createdAt->format('Y-m-d H:i:s') : null;

            $nomorKwitansi = $metadata['receiptNumber']
                ?? $metadata['receipt_number']
                ?? $metadata['reference_number']
                ?? null;

            $kelasSiswa = $this->resolveStudentClass($metadata, $dibayarOleh, $transaction, $studentUnitSekolah);

            $metodePembayaran = $metadata['paymentMethod']
                ?? $metadata['payment_method']
                ?? null;

            $metodePembayaranLabel = $this->formatPaymentMethodLabel($metodePembayaran);
            
            $baseDescription = $transaction->description ?: $transaction->title;
            
            $baseCategory = $this->resolveReportCategoryLabel($transaction);
            
            // Create base transaction entry
            $baseTransaction = [
                'id' => $transaction->id,
                'tanggal' => $transaction->transaction_date,
                'kategori' => $baseCategory,
                'deskripsi' => $baseDescription,
                'pemasukan' => $transaction->type === 'income' ? $transaction->amount : 0,
                'pengeluaran' => $transaction->type === 'expense' ? $transaction->amount : 0,
                'unit' => $unitNama,
                'unit_sekolah_id' => $transaction->unit_sekolah_id,
                'status' => $transaction->status,
                'dibayar_oleh' => $dibayarOleh,
                'jam_dibuat' => $jamDibuat,
                'created_at_full' => $createdAtFull,
                'nomor_kwitansi' => $nomorKwitansi,
                'kelas_siswa' => $kelasSiswa,
                'metode_pembayaran' => $metodePembayaran,
                'metode_pembayaran_label' => $metodePembayaranLabel,
                'payment_method' => $metodePembayaran,
                'payment_method_label' => $metodePembayaranLabel
            ];
            
            $includeBaseRow = !$categoryFilter || $categoryFilter === 'all' || $baseCategory === $categoryFilter;
            if ($includeBaseRow) {
                $result[] = $baseTransaction;
            }
            
            // Process additional categories from metadata
            $additionalCategories = [];
            if (is_array($metadata)) {
                // Check multiple possible keys for additional categories
                $rawAdditionalCategories = $metadata['additionalCategories']
                    ?? $metadata['additional_categories']
                    ?? $metadata['additional_categories_list']
                    ?? [];
                
                // Handle string JSON
                if (is_string($rawAdditionalCategories)) {
                    $decoded = json_decode($rawAdditionalCategories, true);
                    if (is_array($decoded)) {
                        $rawAdditionalCategories = $decoded;
                    }
                }
                
                // Handle object map { key: {...}, ... }
                if (is_object($rawAdditionalCategories) && !is_array($rawAdditionalCategories)) {
                    $rawAdditionalCategories = (array) $rawAdditionalCategories;
                }
                
                if (is_array($rawAdditionalCategories)) {
                    $additionalCategories = array_values($rawAdditionalCategories);
                }
            }
            
            // Create additional transaction entry
            foreach ($additionalCategories as $index => $additionalCategory) {
                if (!is_array($additionalCategory) && !is_object($additionalCategory)) {
                    continue;
                }
                
                $additionalCategoryArray = is_object($additionalCategory) ? (array) $additionalCategory : $additionalCategory;
                
                // Get category name
                $categoryName = $additionalCategoryArray['category']
                    ?? $additionalCategoryArray['category_name']
                    ?? $additionalCategoryArray['name']
                    ?? $additionalCategoryArray['label']
                    ?? 'Kategori Tambahan';
                
                // Filter additional category if filter is active
                if ($categoryFilter && $categoryFilter !== 'all' && $categoryName !== $categoryFilter) {
                    continue;
                }

                // Get amount
                $rawAmount = $additionalCategoryArray['amount']
                    ?? $additionalCategoryArray['jumlah']
                    ?? $additionalCategoryArray['value']
                    ?? $additionalCategoryArray['nominal']
                    ?? 0;
                
                $additionalAmount = is_numeric($rawAmount) 
                    ? (float) $rawAmount 
                    : (is_string($rawAmount) ? (float) preg_replace('/[^\d.-]/', '', $rawAmount) : 0);
                
                // Skip if category name is empty or amount is 0
                if (empty($categoryName) || $additionalAmount <= 0) {
                    continue;
                }
                
                // Create additional transaction entry
                $additionalTransaction = [
                    'id' => $transaction->id . '-extra-' . $index,
                    'tanggal' => $transaction->transaction_date,
                    'kategori' => $categoryName,
                    'deskripsi' => $baseDescription . ' - ' . $categoryName,
                    'pemasukan' => $transaction->type === 'income' ? $additionalAmount : 0,
                    'pengeluaran' => $transaction->type === 'expense' ? $additionalAmount : 0,
                    'unit' => $unitNama,
                    'unit_sekolah_id' => $transaction->unit_sekolah_id,
                    'status' => $transaction->status,
                    'dibayar_oleh' => $dibayarOleh,
                    'jam_dibuat' => $jamDibuat,
                    'created_at_full' => $createdAtFull,
                    'nomor_kwitansi' => $nomorKwitansi ? ($nomorKwitansi . '-CAT' . ($index + 1)) : null,
                    'kelas_siswa' => $kelasSiswa,
                    'metode_pembayaran' => $metodePembayaran,
                    'metode_pembayaran_label' => $metodePembayaranLabel,
                    'payment_method' => $metodePembayaran,
                    'payment_method_label' => $metodePembayaranLabel
                ];
                
                $result[] = $additionalTransaction;
            }
            
            return $result;
        });


        return response()->json([
            'success' => true,
            'data' => [
                'totals' => [
                    'total_income' => $totalIncome,
                    'total_expense' => $totalExpense,
                    'net_balance' => $netBalance,
                    'current_balance' => $currentBalance
                ],
                'chart_data' => $chartData,
                'transactions' => $transactions->toArray()
            ]
        ]);
    }

    /**
     * Nama kategori tampilan laporan: sama dengan prioritas di baris tabel (metadata dulu).
     */
    private function resolveReportCategoryLabel(Transaction $transaction): string
    {
        $raw = $transaction->metadata;
        $metadata = [];
        if (is_array($raw)) {
            $metadata = $raw;
        } elseif (is_string($raw)) {
            $decoded = json_decode($raw, true);
            $metadata = is_array($decoded) ? $decoded : [];
        } elseif ($raw instanceof \Illuminate\Contracts\Support\Arrayable) {
            $metadata = $raw->toArray();
        } elseif (is_object($raw)) {
            $metadata = (array) $raw;
        }

        return $metadata['bill_type_name']
            ?? $metadata['category']
            ?? $metadata['category_name']
            ?? ($transaction->category->name ?? 'Kategori tidak diketahui');
    }

    /**
     * Nama master unit_sekolahs vs nilai di students.unit_sekolah / metadata (SD vs SDIT, dll.).
     * Filter laporan harus mencocokkan semua alias agar konsisten dengan kolom Unit di UI.
     *
     * @return list<string>
     */
    private function expandReportUnitFilterVariants(string $unitNama): array
    {
        $n = trim($unitNama);
        $aliasGroups = [
            ['TU Islam Annur', 'Tata Usaha'],
            ['SDIT', 'SD'],
            ['SMPIT', 'SMP'],
            ['SMAIT', 'SMA'],
            ['TKIT', 'TK'],
        ];
        foreach ($aliasGroups as $group) {
            if (in_array($n, $group, true)) {
                return array_values(array_unique($group));
            }
        }

        return [$n];
    }

    /**
     * Filter unit pada laporan: metadata menyimpan string di path JSON (bukan array),
     * sehingga whereJsonContains tidak cocok. Selaraskan juga alias TU Islam Annur / Tata Usaha
     * dan transaksi tanpa unit_sekolah_id yang di UI ditampilkan sebagai TU default.
     */
    private function applyReportUnitMetadataConditionsFromNama($query, string $unitNama): void
    {
        $variants = $this->expandReportUnitFilterVariants($unitNama);

        $query->where(function ($w) use ($variants) {
            // Metadata / profil / student id (sama seperti sebelumnya)
            foreach ($variants as $name) {
                $w->orWhere(function ($q) use ($name) {
                    $q->where('metadata->student_unit_sekolah', $name)
                        ->orWhere('metadata->unit_sekolah', $name)
                        ->orWhere('metadata->student_unit', $name);
                });
            }

            $w->orWhereHas('user.profile', function ($profileQ) use ($variants) {
                $profileQ->whereIn('unit_sekolah', $variants);
            });

            $w->orWhere(function ($studentQ) use ($variants) {
                $studentQ->whereNotNull('metadata->student')
                    ->whereExists(function ($existsQuery) use ($variants) {
                        $existsQuery->select(DB::raw(1))
                            ->from('students')
                            ->whereRaw(
                                'JSON_UNQUOTE(JSON_EXTRACT(transactions.metadata, "$.student")) = CAST(students.id AS CHAR)'
                            )
                            ->whereIn('students.unit_sekolah', $variants);
                    });
            });

            /*
             * Kolom Unit di laporan bisa dari lookup siswa lewat nama pembayar (paidBy / nama_siswa),
             * tanpa student_unit_sekolah di metadata — filter SQL harus ikut kasus itu.
             */
            $inPlaceholders = implode(',', array_fill(0, count($variants), '?'));
            $w->orWhereRaw(
                "EXISTS (
                    SELECT 1 FROM students st
                    WHERE st.unit_sekolah IN ({$inPlaceholders})
                    AND (
                        JSON_UNQUOTE(JSON_EXTRACT(transactions.metadata, '$.paidBy')) LIKE CONCAT('%', st.nama_lengkap, '%')
                        OR JSON_UNQUOTE(JSON_EXTRACT(transactions.metadata, '$.student_name')) LIKE CONCAT('%', st.nama_lengkap, '%')
                        OR JSON_UNQUOTE(JSON_EXTRACT(transactions.metadata, '$.nama_siswa')) LIKE CONCAT('%', st.nama_lengkap, '%')
                    )
                )",
                $variants
            );

            if (array_intersect($variants, ['TU Islam Annur', 'Tata Usaha'])) {
                $w->orWhere(function ($q) {
                    $q->whereNull('unit_sekolah_id')
                        ->where(function ($inner) {
                            $inner->whereNull('metadata')
                                ->orWhereRaw('JSON_EXTRACT(metadata, "$.student_unit_sekolah") IS NULL')
                                ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.student_unit_sekolah')) = ''");
                        });
                });
            }
        });
    }

    private function formatPaymentMethodLabel(?string $method): string
    {
        if (!$method) {
            return 'Tunai';
        }

        $normalized = strtolower(trim($method));

        if (str_contains($normalized, 'cash') || $normalized === 'tunai') {
            return 'Tunai';
        }

        if (str_contains($normalized, 'qris')) {
            return 'QRIS';
        }

        if (
            str_contains($normalized, 'transfer') ||
            str_contains($normalized, 'bank') ||
            str_contains($normalized, 'bca') ||
            str_contains($normalized, 'bni') ||
            str_contains($normalized, 'bri') ||
            str_contains($normalized, 'mandiri')
        ) {
            return 'Transfer';
        }

        if (str_contains($normalized, 'card') || str_contains($normalized, 'debit') || str_contains($normalized, 'kartu')) {
            return 'Kartu';
        }

        return ucwords($normalized);
    }

    /**
     * Unit pencatat transaksi (Tata Usaha / TU Islam Annur) — bukan unit pendidikan siswa.
     */
    private function isTuRecorderUnitName(?string $nama): bool
    {
        if ($nama === null || $nama === '') {
            return false;
        }
        $n = trim($nama);

        return in_array($n, ['TU Islam Annur', 'Tata Usaha'], true);
    }

    /**
     * Samakan label kolom Unit dengan dropdown filter (master SDIT → tampil "SD", dll.).
     */
    private function normalizeReportDisplayUnitLabel(string $unitNama): string
    {
        $t = trim($unitNama);
        $map = [
            'SDIT' => 'SD',
            'SMPIT' => 'SMP',
            'SMAIT' => 'SMA',
            'TKIT' => 'TK',
            'Tata Usaha' => 'TU Islam Annur',
        ];

        return $map[$t] ?? $t;
    }

    /**
     * Nama unit untuk kolom laporan Detail Transaksi: siswa dulu, baru unit pencatat / profil.
     */
    private function resolveReportDisplayUnitNama(Transaction $transaction, array $metadata, string $dibayarOleh): string
    {
        foreach (['student_unit_sekolah', 'unit_sekolah'] as $key) {
            if (!empty($metadata[$key]) && is_string($metadata[$key])) {
                $v = trim($metadata[$key]);
                if ($v !== '' && !$this->isTuRecorderUnitName($v)) {
                    return $this->normalizeReportDisplayUnitLabel($v);
                }
            }
        }

        if ($dibayarOleh && $dibayarOleh !== 'N/A' && $dibayarOleh !== 'Super Administrator') {
            $cleanName = trim(preg_replace('/\s*\(.*?\)\s*/', '', $dibayarOleh));
            if ($cleanName !== '') {
                static $unitCacheByPayerName = [];
                if (!array_key_exists($cleanName, $unitCacheByPayerName)) {
                    $student = Student::where('nama_lengkap', 'like', "%{$cleanName}%")
                        ->orWhere('nisn', $cleanName)
                        ->first();
                    $unitCacheByPayerName[$cleanName] = ($student && $student->unit_sekolah)
                        ? trim($student->unit_sekolah)
                        : null;
                }
                if ($unitCacheByPayerName[$cleanName]) {
                    return $this->normalizeReportDisplayUnitLabel($unitCacheByPayerName[$cleanName]);
                }
            }
        }

        $studentNameCandidate = null;
        if (!empty($transaction->title)) {
            $title = $transaction->title;
            if (preg_match('/dari\s+([A-Z\s]+?)(?:\s*\(|$)/u', $title, $matches)) {
                $candidate = trim($matches[1]);
                if ($candidate !== '' && mb_strtoupper($candidate, 'UTF-8') === $candidate) {
                    $studentNameCandidate = $candidate;
                }
            }
            if (
                !$studentNameCandidate &&
                preg_match('/([A-Z][A-Z\s]+)(?:\s*\(|$)/u', $title, $matches)
            ) {
                $candidate = trim($matches[1]);
                if ($candidate !== '' && mb_strtoupper($candidate, 'UTF-8') === $candidate) {
                    $studentNameCandidate = $candidate;
                }
            }
        }

        if ($studentNameCandidate) {
            static $unitCacheByTitleCandidate = [];
            if (!array_key_exists($studentNameCandidate, $unitCacheByTitleCandidate)) {
                $student = Student::query()
                    ->where('nama_lengkap', 'LIKE', '%' . $studentNameCandidate . '%')
                    ->first();
                $unitCacheByTitleCandidate[$studentNameCandidate] = ($student && $student->unit_sekolah)
                    ? trim($student->unit_sekolah)
                    : null;
            }
            if ($unitCacheByTitleCandidate[$studentNameCandidate]) {
                return $this->normalizeReportDisplayUnitLabel($unitCacheByTitleCandidate[$studentNameCandidate]);
            }
        }

        if ($transaction->unitSekolah) {
            return $this->normalizeReportDisplayUnitLabel($transaction->unitSekolah->nama);
        }
        if ($transaction->user && $transaction->user->profile && $transaction->user->profile->unit_sekolah) {
            return $this->normalizeReportDisplayUnitLabel($transaction->user->profile->unit_sekolah);
        }

        return 'TU Islam Annur';
    }

    private function resolveStudentClass($metadata, string $dibayarOleh, ?Transaction $transaction = null, ?string $studentUnitSekolah = null): ?string
    {
        if (is_array($metadata)) {
            $candidates = [
                'student_class',
                'student_unit_kelas',
                'studentClass',
                'student_unit',
                'student_grade',
                'kelas',
                'class',
                'grade'
            ];

            foreach ($candidates as $key) {
                if (!empty($metadata[$key]) && is_string($metadata[$key])) {
                    return $metadata[$key];
                }
            }

            if (!empty($metadata['student']) && isset($metadata['student']['kelas'])) {
                return $metadata['student']['kelas'];
            }
        }

        // Try extracting from dibayarOleh if it has (Class) format
        if ($dibayarOleh && preg_match('/\((.*?)\)/', $dibayarOleh, $matches)) {
            $class = trim($matches[1]);
            // Filter common non-class strings if needed
            if (!empty($class) && strlen($class) < 15) {
                return $class;
            }
        }

        // Search for student by name if we have a name and no class
        if ($dibayarOleh && $dibayarOleh !== 'N/A' && $dibayarOleh !== 'Super Administrator') {
            // Remove any (Class) info for searching
            $cleanName = trim(preg_replace('/\s*\(.*?\)\s*/', '', $dibayarOleh));
            
            // Simple cache-like check or directly query
            $student = \App\Models\Student::where('nama_lengkap', 'like', "%{$cleanName}%")
                ->orWhere('nisn', $cleanName)
                ->first();
            
            if ($student && $student->unit_kelas) {
                return $student->unit_kelas;
            }
        }

        $studentNameCandidate = null;

        if ($transaction && !empty($transaction->title)) {
            $title = $transaction->title;

            if (preg_match('/dari\s+([A-Z\s]+?)(?:\s*\(|$)/u', $title, $matches)) {
                $candidate = trim($matches[1]);
                if ($candidate !== '' && mb_strtoupper($candidate, 'UTF-8') === $candidate) {
                    $studentNameCandidate = $candidate;
                }
            }

            if (
                !$studentNameCandidate &&
                preg_match('/([A-Z][A-Z\s]+)(?:\s*\(|$)/u', $title, $matches)
            ) {
                $candidate = trim($matches[1]);
                if ($candidate !== '' && mb_strtoupper($candidate, 'UTF-8') === $candidate) {
                    $studentNameCandidate = $candidate;
                }
            }
        }

        if ($studentNameCandidate) {
            $unitForQuery = $studentUnitSekolah;

            if (!$unitForQuery && is_array($metadata)) {
                $unitForQuery = $metadata['student_unit_sekolah']
                    ?? $metadata['student_unit']
                    ?? $metadata['unit_sekolah']
                    ?? null;
            }

            static $studentClassCache = [];
            $cacheKey = ($unitForQuery ?: 'all') . '|' . $studentNameCandidate;

            if (!array_key_exists($cacheKey, $studentClassCache)) {
                $studentQuery = Student::query();

                if ($unitForQuery) {
                    $studentQuery->where('unit_sekolah', $unitForQuery);
                }

                $student = $studentQuery
                    ->where('nama_lengkap', 'LIKE', '%' . $studentNameCandidate . '%')
                    ->first();

                if (!$student && $unitForQuery && str_contains($unitForQuery, ' ')) {
                    $firstToken = trim(strtok($unitForQuery, ' '));
                    if ($firstToken !== '') {
                        $studentQuery = Student::query()
                            ->where('nama_lengkap', 'LIKE', '%' . $studentNameCandidate . '%')
                            ->where('unit_sekolah', $firstToken);
                        $student = $studentQuery->first();
                    }
                }

                if (!$student) {
                    $student = Student::query()
                        ->where('nama_lengkap', 'LIKE', '%' . $studentNameCandidate . '%')
                        ->first();
                }

                $studentClassCache[$cacheKey] = $student && $student->unit_kelas ? $student->unit_kelas : null;
            }

            if ($studentClassCache[$cacheKey]) {
                return $studentClassCache[$cacheKey];
            }
        }

        return null;
    }

    private function generateChartData($transactions, $period)
    {
        $grouped = [];
        
        foreach ($transactions as $transaction) {
            $date = Carbon::parse($transaction->transaction_date);
            $key = '';
            
            switch ($period) {
                case 'daily':
                case 'custom':
                    // Group by date for daily/custom view
                    $key = $date->format('d M Y');
                    break;
                case 'weekly':
                    // Fix: use copy to avoid modifying original date
                    $weekStart = $date->copy()->startOfWeek();
                    $key = 'Minggu ' . $weekStart->format('d M');
                    break;
                case 'monthly':
                    $key = $date->format('M Y');
                    break;
                case 'yearly':
                    $key = $date->format('Y');
                    break;
            }
            
            if (!isset($grouped[$key])) {
                $grouped[$key] = ['pemasukan' => 0, 'pengeluaran' => 0];
            }
            
            if ($transaction->type === 'income') {
                $grouped[$key]['pemasukan'] += $transaction->amount;
            } else {
                $grouped[$key]['pengeluaran'] += $transaction->amount;
            }
        }
        
        // Convert to array format with running balance
        $result = [];
        $runningBalance = 0;
        
        foreach ($grouped as $periodKey => $data) {
            $runningBalance += ($data['pemasukan'] - $data['pengeluaran']);
            $result[] = [
                'period' => $periodKey,
                'pemasukan' => $data['pemasukan'],
                'pengeluaran' => $data['pengeluaran'],
                'saldo' => $runningBalance
            ];
        }
        
        // Sort by period for proper display
        usort($result, function($a, $b) {
            // For daily, sort by date
            try {
                $dateA = Carbon::createFromFormat('d M Y', $a['period']);
                $dateB = Carbon::createFromFormat('d M Y', $b['period']);
                return $dateA->compare($dateB);
            } catch (\Exception $e) {
                // If not daily format, try other formats or use string comparison
                try {
                    $dateA = Carbon::createFromFormat('M Y', $a['period']);
                    $dateB = Carbon::createFromFormat('M Y', $b['period']);
                    return $dateA->compare($dateB);
                } catch (\Exception $e2) {
                    // For weekly or yearly, use string comparison
                    return strcmp($a['period'], $b['period']);
                }
            }
        });
        
        return $result;
    }

    public function incomeSummary(Request $request)
    {
        $period = $request->get('period', 'monthly'); // daily, weekly, monthly, yearly
        $query = Transaction::income()->approved()->with(['category', 'unitSekolah']);

        // Filter berdasarkan unit_sekolah_id atau unit_sekolah user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_sekolah) {
            $userUnitSekolahNama = $user->profile->unit_sekolah;
            $userUnitSekolah = UnitSekolah::where('nama', $userUnitSekolahNama)->first();
            
            if ($userUnitSekolah) {
                $query->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                    $q->where('unit_sekolah_id', $userUnitSekolah->id)
                      // Fallback for old data
                      ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                          $subQ->where('unit_sekolah', $userUnitSekolahNama);
                      })
                      ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                });
            }
        }

        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', Carbon::today());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->whereMonth('transaction_date', Carbon::now()->month)
                      ->whereYear('transaction_date', Carbon::now()->year);
                break;
            case 'yearly':
                $query->whereYear('transaction_date', Carbon::now()->year);
                break;
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();
        $total = $transactions->sum('amount');

        // Group by category
        $byCategory = $transactions->groupBy('category.name')->map(function($group) {
            return [
                'category' => $group->first()->category->name,
                'total' => $group->sum('amount'),
                'count' => $group->count()
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
                'total' => $total,
                'by_category' => $byCategory,
                'period' => $period
            ]
        ]);
    }

    public function expenseSummary(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $query = Transaction::expense()->approved()->with(['category', 'unitSekolah']);

        // Filter berdasarkan unit_sekolah_id atau unit_sekolah user yang login (kecuali Super Admin)
        $user = $request->user();
        $isSuperAdmin = $user && $user->isSuperAdmin();
        
        if (!$isSuperAdmin && $user && $user->profile && $user->profile->unit_sekolah) {
            $userUnitSekolahNama = $user->profile->unit_sekolah;
            $userUnitSekolah = UnitSekolah::where('nama', $userUnitSekolahNama)->first();
            
            if ($userUnitSekolah) {
                $query->where(function($q) use ($userUnitSekolah, $userUnitSekolahNama) {
                    $q->where('unit_sekolah_id', $userUnitSekolah->id)
                      // Fallback for old data
                      ->orWhereHas('user.profile', function($subQ) use ($userUnitSekolahNama) {
                          $subQ->where('unit_sekolah', $userUnitSekolahNama);
                      })
                      ->orWhereJsonContains('metadata->student_unit_sekolah', $userUnitSekolahNama);
                });
            }
        }

        switch ($period) {
            case 'daily':
                $query->whereDate('transaction_date', Carbon::today());
                break;
            case 'weekly':
                $query->whereBetween('transaction_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->whereMonth('transaction_date', Carbon::now()->month)
                      ->whereYear('transaction_date', Carbon::now()->year);
                break;
            case 'yearly':
                $query->whereYear('transaction_date', Carbon::now()->year);
                break;
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();
        $total = $transactions->sum('amount');

        // Group by category
        $byCategory = $transactions->groupBy('category.name')->map(function($group) {
            return [
                'category' => $group->first()->category->name,
                'total' => $group->sum('amount'),
                'count' => $group->count()
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'transactions' => $transactions,
                'total' => $total,
                'by_category' => $byCategory,
                'period' => $period
            ]
        ]);
    }

    public function sppReminders()
    {
        // TODO: Implement SPP reminder logic
        // This would typically involve checking student payment status
        // and finding overdue payments
        
        $reminders = [
            [
                'student_name' => 'Ahmad Fauzan',
                'class' => 'XII IPA 1',
                'amount' => 500000,
                'due_date' => '2025-09-15',
                'days_overdue' => 5
            ],
            [
                'student_name' => 'Siti Aisyah',
                'class' => 'XI IPS 2',
                'amount' => 500000,
                'due_date' => '2025-09-10',
                'days_overdue' => 10
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $reminders
        ]);
    }

    public function approvalNotifications()
    {
        $pendingTransactions = Transaction::pending()
            ->with(['user', 'category', 'unitSekolah'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingTransactions
        ]);
    }

    public function attendanceStatus()
    {
        $today = Carbon::today();
        
        $attendanceData = AttendanceLog::today()
            ->with('user')
            ->orderBy('check_in', 'asc')
            ->get();

        $summary = [
            'total_present' => $attendanceData->where('status', 'present')->count(),
            'total_late' => $attendanceData->where('status', 'late')->count(),
            'total_absent' => User::whereHas('roles', function($q) {
                $q->whereIn('name', ['tu_staff', 'kepala_tu']);
            })->count() - $attendanceData->count(),
            'attendance_list' => $attendanceData
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }
}