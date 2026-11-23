-- Nuverse / Manajemen Annur — struktur tabel saja (tanpa data user/transaksi).
-- Import ke MySQL/MariaDB lokal, lalu sesuaikan .env backend.

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: sql_nurverse_id
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0ubuntu0.24.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `absensi`
--

DROP TABLE IF EXISTS `absensi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `absensi` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_guru` bigint(20) unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `status` enum('hadir','sakit','izin','alpha') NOT NULL DEFAULT 'hadir',
  `keterangan` text DEFAULT NULL,
  `jam_mengajar` int(11) NOT NULL DEFAULT 0,
  `lokasi` text DEFAULT NULL,
  `nama_lokasi` varchar(255) DEFAULT NULL,
  `foto` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_guru_tanggal` (`id_guru`,`tanggal`),
  KEY `absensi_id_guru_tanggal_index` (`id_guru`,`tanggal`),
  KEY `absensi_status_index` (`status`),
  KEY `absensi_tanggal_index` (`tanggal`),
  CONSTRAINT `absensi_id_guru_foreign` FOREIGN KEY (`id_guru`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22906 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_years` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `year` varchar(10) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `academic_years_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `account_balances`
--

DROP TABLE IF EXISTS `account_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_balances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` bigint(20) unsigned NOT NULL,
  `period_year` int(11) NOT NULL,
  `period_month` int(11) NOT NULL,
  `opening_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `opening_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `period_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `period_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `closing_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `closing_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_balances_account_id_period_year_period_month_unique` (`account_id`,`period_year`,`period_month`),
  CONSTRAINT `account_balances_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_categories`
--

DROP TABLE IF EXISTS `activity_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `budget_type` enum('income','expense') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_categories_parent_id_foreign` (`parent_id`),
  KEY `activity_categories_budget_type_index` (`budget_type`),
  CONSTRAINT `activity_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `activity_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_notes`
--

DROP TABLE IF EXISTS `activity_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_notes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `rapbs_plan_id` bigint(20) unsigned NOT NULL,
  `note_type` enum('progress','issue','completion') NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_notes_created_by_foreign` (`created_by`),
  KEY `activity_notes_rapbs_plan_id_index` (`rapbs_plan_id`),
  KEY `activity_notes_note_type_index` (`note_type`),
  CONSTRAINT `activity_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `activity_notes_rapbs_plan_id_foreign` FOREIGN KEY (`rapbs_plan_id`) REFERENCES `rapbs_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_logs`
--

DROP TABLE IF EXISTS `attendance_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `check_in` datetime DEFAULT NULL,
  `check_out` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `status` enum('present','late','absent','sick','leave') NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `work_hours` decimal(5,2) DEFAULT NULL,
  `is_overtime` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendance_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `attendance_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `audit_date` date NOT NULL,
  `auditor_id` bigint(20) unsigned NOT NULL,
  `condition_before` enum('baik','rusak_ringan','rusak_berat','tidak_berfungsi') NOT NULL,
  `condition_after` enum('baik','rusak_ringan','rusak_berat','tidak_berfungsi') NOT NULL,
  `status_before` enum('aktif','maintenance','penghapusan') NOT NULL,
  `status_after` enum('aktif','maintenance','penghapusan') NOT NULL,
  `findings` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `estimated_repair_cost` decimal(15,2) DEFAULT NULL,
  `audit_type` enum('routine','special','emergency') NOT NULL DEFAULT 'routine',
  `location_verified` varchar(255) DEFAULT NULL,
  `photos` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_item_id_audit_date_index` (`item_id`,`audit_date`),
  KEY `audit_logs_audit_date_index` (`audit_date`),
  KEY `audit_logs_auditor_id_index` (`auditor_id`),
  CONSTRAINT `audit_logs_auditor_id_foreign` FOREIGN KEY (`auditor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_number` varchar(50) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_type` enum('cash','bank','investment') NOT NULL DEFAULT 'bank',
  `currency` varchar(10) NOT NULL DEFAULT 'IDR',
  `opening_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_reconciliations`
--

DROP TABLE IF EXISTS `bank_reconciliations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_reconciliations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bank_account_id` bigint(20) unsigned NOT NULL,
  `reconciliation_date` date NOT NULL,
  `bank_statement_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `book_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `reconciled_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('draft','completed') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_reconciliations_bank_account_id_foreign` (`bank_account_id`),
  KEY `bank_reconciliations_created_by_foreign` (`created_by`),
  CONSTRAINT `bank_reconciliations_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bank_reconciliations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bank_transactions`
--

DROP TABLE IF EXISTS `bank_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bank_account_id` bigint(20) unsigned NOT NULL,
  `transaction_date` date NOT NULL,
  `transaction_type` enum('deposit','withdrawal','transfer','adjustment') NOT NULL DEFAULT 'deposit',
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance_after` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_transactions_bank_account_id_foreign` (`bank_account_id`),
  KEY `bank_transactions_created_by_foreign` (`created_by`),
  CONSTRAINT `bank_transactions_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bank_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banks`
--

DROP TABLE IF EXISTS `banks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `banks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_bank` varchar(150) NOT NULL,
  `nomor_rekening` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `banks_nomor_rekening_unique` (`nomor_rekening`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_labels`
--

DROP TABLE IF EXISTS `bill_labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_labels` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bill_type_id` bigint(20) unsigned NOT NULL COMMENT 'ID jenis tagihan',
  `label_name` varchar(100) DEFAULT NULL COMMENT 'Nama label sesuai dengan jenis tagihan',
  `label_text` text NOT NULL COMMENT 'Teks catatan/label untuk jenis tagihan',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Status aktif/tidak aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bill_labels_bill_type_id_is_active_index` (`bill_type_id`,`is_active`),
  CONSTRAINT `bill_labels_bill_type_id_foreign` FOREIGN KEY (`bill_type_id`) REFERENCES `bill_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_payments`
--

DROP TABLE IF EXISTS `bill_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_bill_id` bigint(20) unsigned NOT NULL COMMENT 'ID tagihan siswa',
  `amount` decimal(15,2) NOT NULL COMMENT 'Jumlah pembayaran',
  `payment_date` date NOT NULL COMMENT 'Tanggal pembayaran',
  `payment_method` enum('cash','transfer','qris','credit_card') NOT NULL DEFAULT 'cash' COMMENT 'Metode pembayaran',
  `reference_number` varchar(100) DEFAULT NULL COMMENT 'Nomor referensi pembayaran',
  `processed_by` bigint(20) unsigned NOT NULL COMMENT 'ID user yang memproses pembayaran',
  `transaction_id` bigint(20) unsigned DEFAULT NULL COMMENT 'ID transaksi di sistem TU',
  `is_installment` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Apakah ini pembayaran cicilan',
  `installment_number` int(11) NOT NULL DEFAULT 1 COMMENT 'Nomor cicilan keberapa',
  `notes` text DEFAULT NULL COMMENT 'Catatan pembayaran',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bill_payments_transaction_id_foreign` (`transaction_id`),
  KEY `bill_payments_student_bill_id_payment_date_index` (`student_bill_id`,`payment_date`),
  KEY `bill_payments_processed_by_payment_date_index` (`processed_by`,`payment_date`),
  KEY `bill_payments_payment_method_payment_date_index` (`payment_method`,`payment_date`),
  CONSTRAINT `bill_payments_processed_by_foreign` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`),
  CONSTRAINT `bill_payments_student_bill_id_foreign` FOREIGN KEY (`student_bill_id`) REFERENCES `student_bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bill_payments_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1407 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_types`
--

DROP TABLE IF EXISTS `bill_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Nama jenis tagihan (SPP, Uang Pangkal, dll)',
  `description` text DEFAULT NULL COMMENT 'Deskripsi jenis tagihan',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Status aktif/tidak aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bill_types_is_active_name_index` (`is_active`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `budget_breakdowns`
--

DROP TABLE IF EXISTS `budget_breakdowns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_breakdowns` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `rapbs_plan_id` bigint(20) unsigned NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_breakdowns_rapbs_plan_id_index` (`rapbs_plan_id`),
  CONSTRAINT `budget_breakdowns_rapbs_plan_id_foreign` FOREIGN KEY (`rapbs_plan_id`) REFERENCES `rapbs_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_attendance`
--

DROP TABLE IF EXISTS `business_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_attendance` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `business_unit_id` bigint(20) unsigned NOT NULL,
  `employee_id` bigint(20) unsigned NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `shift_type` enum('morning','afternoon','night') NOT NULL DEFAULT 'morning',
  `overtime_hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_attendance_unique` (`business_unit_id`,`employee_id`,`attendance_date`),
  KEY `business_attendance_employee_id_foreign` (`employee_id`),
  KEY `business_attendance_attendance_date_shift_type_index` (`attendance_date`,`shift_type`),
  CONSTRAINT `business_attendance_business_unit_id_foreign` FOREIGN KEY (`business_unit_id`) REFERENCES `business_units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `business_attendance_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_transactions`
--

DROP TABLE IF EXISTS `business_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `business_unit_id` bigint(20) unsigned NOT NULL,
  `transaction_type` enum('income','expense') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `transaction_date` date NOT NULL,
  `payment_method` enum('cash','transfer','card') NOT NULL DEFAULT 'cash',
  `reference_number` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `created_by` bigint(20) unsigned NOT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `business_transactions_created_by_foreign` (`created_by`),
  KEY `business_transactions_approved_by_foreign` (`approved_by`),
  KEY `idx_trans_unit_type_date` (`business_unit_id`,`transaction_type`,`transaction_date`),
  KEY `idx_trans_status_date` (`status`,`transaction_date`),
  CONSTRAINT `business_transactions_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `business_transactions_business_unit_id_foreign` FOREIGN KEY (`business_unit_id`) REFERENCES `business_units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `business_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_units`
--

DROP TABLE IF EXISTS `business_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_units` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('catering','swimming_pool','canteen','other') NOT NULL,
  `manager_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `description` text DEFAULT NULL,
  `monthly_budget` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `business_units_manager_id_foreign` (`manager_id`),
  KEY `business_units_type_status_index` (`type`,`status`),
  CONSTRAINT `business_units_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `icon` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chart_of_accounts`
--

DROP TABLE IF EXISTS `chart_of_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chart_of_accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('asset','liability','equity','revenue','expense') NOT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chart_of_accounts_account_code_unique` (`account_code`),
  KEY `chart_of_accounts_parent_id_foreign` (`parent_id`),
  CONSTRAINT `chart_of_accounts_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuti`
--

DROP TABLE IF EXISTS `cuti`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuti` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_guru` bigint(20) unsigned NOT NULL,
  `jenis` varchar(255) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `durasi` int(11) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `alasan` text NOT NULL,
  `tanggal_disetujui` date DEFAULT NULL,
  `pengganti` varchar(255) DEFAULT NULL,
  `disetujui_oleh` bigint(20) unsigned DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cuti_created_by_foreign` (`created_by`),
  KEY `cuti_disetujui_oleh_foreign` (`disetujui_oleh`),
  KEY `cuti_id_guru_tanggal_mulai_index` (`id_guru`,`tanggal_mulai`),
  KEY `cuti_status_index` (`status`),
  KEY `cuti_tanggal_mulai_index` (`tanggal_mulai`),
  CONSTRAINT `cuti_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cuti_disetujui_oleh_foreign` FOREIGN KEY (`disetujui_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cuti_id_guru_foreign` FOREIGN KEY (`id_guru`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `depreciation_logs`
--

DROP TABLE IF EXISTS `depreciation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `depreciation_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `depreciation_date` date NOT NULL,
  `depreciation_amount` decimal(15,2) NOT NULL,
  `current_value` decimal(15,2) NOT NULL,
  `previous_value` decimal(15,2) NOT NULL,
  `method` enum('straight_line','declining_balance','units_of_production') NOT NULL,
  `depreciation_rate` decimal(5,2) DEFAULT NULL,
  `useful_life_years` int(11) DEFAULT NULL,
  `salvage_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `calculated_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `depreciation_logs_calculated_by_foreign` (`calculated_by`),
  KEY `depreciation_logs_item_id_depreciation_date_index` (`item_id`,`depreciation_date`),
  KEY `depreciation_logs_depreciation_date_index` (`depreciation_date`),
  CONSTRAINT `depreciation_logs_calculated_by_foreign` FOREIGN KEY (`calculated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `depreciation_logs_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `divisional_transactions`
--

DROP TABLE IF EXISTS `divisional_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisional_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_kerja_id` bigint(20) unsigned NOT NULL,
  `funding_source_id` bigint(20) unsigned NOT NULL,
  `transaction_type` enum('income','expense') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `reference_number` varchar(100) NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `divisional_transactions_reference_number_unique` (`reference_number`),
  KEY `divisional_transactions_division_id_foreign` (`unit_kerja_id`),
  KEY `divisional_transactions_funding_source_id_foreign` (`funding_source_id`),
  KEY `divisional_transactions_created_by_foreign` (`created_by`),
  CONSTRAINT `divisional_transactions_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `divisional_transactions_division_id_foreign` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerjas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `divisional_transactions_funding_source_id_foreign` FOREIGN KEY (`funding_source_id`) REFERENCES `funding_sources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `head_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `divisions_code_unique` (`code`),
  KEY `divisions_head_id_foreign` (`head_id`),
  CONSTRAINT `divisions_head_id_foreign` FOREIGN KEY (`head_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense_documents`
--

DROP TABLE IF EXISTS `expense_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `division_id` bigint(20) unsigned NOT NULL,
  `expense_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `vendor_name` varchar(200) NOT NULL,
  `document_type` enum('fpu','receipt','invoice','other') NOT NULL,
  `document_file` varchar(255) NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_documents_division_id_foreign` (`division_id`),
  KEY `expense_documents_approved_by_foreign` (`approved_by`),
  CONSTRAINT `expense_documents_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `expense_documents_division_id_foreign` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fiscal_years`
--

DROP TABLE IF EXISTS `fiscal_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `fiscal_years` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `year_name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT 0,
  `closed_by` bigint(20) unsigned DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fiscal_years_closed_by_foreign` (`closed_by`),
  CONSTRAINT `fiscal_years_closed_by_foreign` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `funding_sources`
--

DROP TABLE IF EXISTS `funding_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `funding_sources` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('bos','spp','donation','other') NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `funding_sources_type_index` (`type`),
  KEY `funding_sources_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guru_potongan`
--

DROP TABLE IF EXISTS `guru_potongan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guru_potongan` (
  `id_guru` bigint(20) NOT NULL,
  `id_potongan` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id_guru`,`id_potongan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guru_tunjangan`
--

DROP TABLE IF EXISTS `guru_tunjangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guru_tunjangan` (
  `id_guru` bigint(20) NOT NULL,
  `id_tunjangan` int(11) NOT NULL,
  PRIMARY KEY (`id_guru`,`id_tunjangan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gurus`
--

DROP TABLE IF EXISTS `gurus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `gurus` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(255) NOT NULL,
  `nip` varchar(255) NOT NULL,
  `jabatan_id` bigint(20) unsigned NOT NULL,
  `status` enum('Aktif','Non-Aktif','Pensiun') NOT NULL DEFAULT 'Aktif',
  `tmt` date NOT NULL,
  `unit_sekolah_id` bigint(20) unsigned NOT NULL,
  `tempat_lahir` varchar(255) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `jenjang_pendidikan` varchar(255) NOT NULL,
  `jurusan` varchar(255) NOT NULL,
  `status_pernikahan` enum('Menikah','Belum Menikah','Janda/Duda') NOT NULL,
  `tugas_tambahan` varchar(255) DEFAULT NULL,
  `mapel_diampu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapel_diampu`)),
  `jam_mengajar` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `no_telepon` varchar(255) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gaji_pokok` int(11) NOT NULL DEFAULT 0,
  `tunjangan_jabatan` int(11) NOT NULL DEFAULT 0,
  `tunjangan_masa_kerja` int(11) NOT NULL DEFAULT 0,
  `wali_kelas` int(11) NOT NULL DEFAULT 0,
  `koordinator` int(11) NOT NULL DEFAULT 0,
  `tatap_muka` varchar(50) NOT NULL DEFAULT '0',
  `t_muka_pengganti` varchar(50) NOT NULL DEFAULT '0',
  `tunj_keluarga` int(11) NOT NULL DEFAULT 0,
  `transport1` int(11) NOT NULL DEFAULT 0,
  `transport2` int(11) NOT NULL DEFAULT 0,
  `makan` int(11) NOT NULL DEFAULT 0,
  `jamsostek` int(11) NOT NULL DEFAULT 0,
  `overtime` int(11) NOT NULL DEFAULT 0,
  `pramuka` int(11) NOT NULL DEFAULT 0,
  `tunj_lain` int(11) NOT NULL DEFAULT 0,
  `ekskul` int(11) NOT NULL DEFAULT 0,
  `bpjs` int(11) NOT NULL DEFAULT 0,
  `bimbel` int(11) NOT NULL DEFAULT 0,
  `proyek` int(11) NOT NULL DEFAULT 0,
  `insentif_peng_pramuka` int(11) NOT NULL DEFAULT 0,
  `insentif_peng_ekskul` int(11) NOT NULL DEFAULT 0,
  `insentif_peng_proyek` int(11) NOT NULL DEFAULT 0,
  `insentif_pengurus_bimbel` int(11) NOT NULL DEFAULT 0,
  `potongan_yayasan` int(11) NOT NULL DEFAULT 0,
  `potongan_lain` int(11) NOT NULL DEFAULT 0,
  `potongan_koperasi_wajib` int(11) NOT NULL DEFAULT 0,
  `potongan_koperasi_sukarela` int(11) NOT NULL DEFAULT 0,
  `potongan_angsuran_koperasi` int(11) NOT NULL DEFAULT 0,
  `deposit_annurmart` int(11) NOT NULL DEFAULT 0,
  `potongan_jht` int(11) NOT NULL DEFAULT 0,
  `potongan_pph21` int(11) NOT NULL DEFAULT 0,
  `potongan_t_muka_pengganti` int(11) NOT NULL DEFAULT 0,
  `nama_bank` varchar(100) DEFAULT NULL,
  `no_rekening` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gurus_nip_unique` (`nip`),
  UNIQUE KEY `gurus_email_unique` (`email`),
  UNIQUE KEY `gurus_username_unique` (`username`),
  KEY `gurus_jabatan_id_foreign` (`jabatan_id`),
  KEY `gurus_unit_sekolah_id_foreign` (`unit_sekolah_id`),
  CONSTRAINT `gurus_jabatan_id_foreign` FOREIGN KEY (`jabatan_id`) REFERENCES `jabatans` (`id`),
  CONSTRAINT `gurus_unit_sekolah_id_foreign` FOREIGN KEY (`unit_sekolah_id`) REFERENCES `unit_sekolahs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_categories`
--

DROP TABLE IF EXISTS `inventory_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_categories_parent_id_foreign` (`parent_id`),
  CONSTRAINT `inventory_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `inventory_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_images`
--

DROP TABLE IF EXISTS `inventory_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `inventory_item_id` bigint(20) unsigned NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `file_size` bigint(20) unsigned NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_images_inventory_item_id_sort_order_index` (`inventory_item_id`,`sort_order`),
  CONSTRAINT `inventory_images_inventory_item_id_foreign` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `current_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `location` varchar(200) DEFAULT NULL,
  `status` enum('aktif','maintenance','penghapusan') NOT NULL DEFAULT 'aktif',
  `condition` enum('baik','rusak_ringan','rusak_berat','tidak_berfungsi') NOT NULL DEFAULT 'baik',
  `warranty_expiry` date DEFAULT NULL,
  `supplier` varchar(200) DEFAULT NULL,
  `pic` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_items_item_code_unique` (`item_code`),
  KEY `inventory_items_category_id_foreign` (`category_id`),
  CONSTRAINT `inventory_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jabatans`
--

DROP TABLE IF EXISTS `jabatans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jabatans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `level` int(10) unsigned NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT 0.00,
  `tunjangan` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jabatans_kode_unique` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jenis_unit_usaha`
--

DROP TABLE IF EXISTS `jenis_unit_usaha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jenis_unit_usaha` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode_unit_usaha` varchar(10) NOT NULL,
  `nama_jenis_unit_usaha` varchar(100) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `jenis_unit_usaha_kode_unit_usaha_unique` (`kode_unit_usaha`),
  KEY `jenis_unit_usaha_kode_unit_usaha_status_index` (`kode_unit_usaha`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_details`
--

DROP TABLE IF EXISTS `journal_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `journal_entry_id` bigint(20) unsigned NOT NULL,
  `account_id` bigint(20) unsigned NOT NULL,
  `debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `journal_details_journal_entry_id_foreign` (`journal_entry_id`),
  KEY `journal_details_account_id_foreign` (`account_id`),
  CONSTRAINT `journal_details_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`),
  CONSTRAINT `journal_details_journal_entry_id_foreign` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `entry_type` enum('automatic','manual','adjustment','reversing') NOT NULL DEFAULT 'manual',
  `source_module` varchar(50) DEFAULT NULL,
  `source_id` bigint(20) unsigned DEFAULT NULL,
  `total_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('draft','posted','void') NOT NULL DEFAULT 'draft',
  `posted_by` bigint(20) unsigned DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `journal_entries_entry_number_unique` (`entry_number`),
  KEY `journal_entries_posted_by_foreign` (`posted_by`),
  KEY `journal_entries_created_by_foreign` (`created_by`),
  CONSTRAINT `journal_entries_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `journal_entries_posted_by_foreign` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_template_details`
--

DROP TABLE IF EXISTS `journal_template_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_template_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) unsigned NOT NULL,
  `account_id` bigint(20) unsigned NOT NULL,
  `debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_percentage` tinyint(1) NOT NULL DEFAULT 0,
  `percentage_field` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `journal_template_details_template_id_foreign` (`template_id`),
  KEY `journal_template_details_account_id_foreign` (`account_id`),
  CONSTRAINT `journal_template_details_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`),
  CONSTRAINT `journal_template_details_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `journal_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_templates`
--

DROP TABLE IF EXISTS `journal_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `template_name` varchar(100) NOT NULL,
  `source_module` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lpj_documents`
--

DROP TABLE IF EXISTS `lpj_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpj_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lpj_id` bigint(20) unsigned NOT NULL,
  `document_type` enum('cover_letter','legal_doc','photo','other') NOT NULL DEFAULT 'other',
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `mime_type` varchar(255) DEFAULT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lpj_documents_uploaded_by_foreign` (`uploaded_by`),
  KEY `lpj_documents_lpj_id_index` (`lpj_id`),
  KEY `lpj_documents_document_type_index` (`document_type`),
  CONSTRAINT `lpj_documents_lpj_id_foreign` FOREIGN KEY (`lpj_id`) REFERENCES `lpjs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lpj_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lpj_notes`
--

DROP TABLE IF EXISTS `lpj_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpj_notes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lpj_id` bigint(20) unsigned NOT NULL,
  `note_type` enum('summary','issue','achievement','recommendation') NOT NULL DEFAULT 'summary',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lpj_notes_created_by_foreign` (`created_by`),
  KEY `lpj_notes_lpj_id_index` (`lpj_id`),
  KEY `lpj_notes_note_type_index` (`note_type`),
  CONSTRAINT `lpj_notes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lpj_notes_lpj_id_foreign` FOREIGN KEY (`lpj_id`) REFERENCES `lpjs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lpj_rapbs_plans`
--

DROP TABLE IF EXISTS `lpj_rapbs_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpj_rapbs_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `lpj_id` bigint(20) unsigned NOT NULL,
  `rapbs_plan_id` bigint(20) unsigned NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lpj_rapbs_plans_lpj_id_rapbs_plan_id_unique` (`lpj_id`,`rapbs_plan_id`),
  KEY `lpj_rapbs_plans_lpj_id_index` (`lpj_id`),
  KEY `lpj_rapbs_plans_rapbs_plan_id_index` (`rapbs_plan_id`),
  CONSTRAINT `lpj_rapbs_plans_lpj_id_foreign` FOREIGN KEY (`lpj_id`) REFERENCES `lpjs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lpj_rapbs_plans_rapbs_plan_id_foreign` FOREIGN KEY (`rapbs_plan_id`) REFERENCES `rapbs_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lpjs`
--

DROP TABLE IF EXISTS `lpjs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpjs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `academic_year_id` bigint(20) unsigned NOT NULL,
  `unit_kerja_id` bigint(20) unsigned DEFAULT NULL,
  `periode_type` enum('semester','tahunan') NOT NULL DEFAULT 'semester',
  `periode_start_date` date NOT NULL,
  `periode_end_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','submitted','approved_by_principal','approved_by_dirpen','approved','finalized','rejected_by_principal','rejected_by_dirpen','rejected_by_director','rejected') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) unsigned NOT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_by_principal` bigint(20) unsigned DEFAULT NULL,
  `approved_by_principal_at` timestamp NULL DEFAULT NULL,
  `approved_by_dirpen` bigint(20) unsigned DEFAULT NULL,
  `approved_by_dirpen_at` timestamp NULL DEFAULT NULL,
  `approved_by_director` bigint(20) unsigned DEFAULT NULL,
  `approved_by_director_at` timestamp NULL DEFAULT NULL,
  `finalized_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_principal` text DEFAULT NULL,
  `rejection_notes_dirpen` text DEFAULT NULL,
  `rejection_notes_director` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lpjs_created_by_foreign` (`created_by`),
  KEY `lpjs_approved_by_principal_foreign` (`approved_by_principal`),
  KEY `lpjs_approved_by_dirpen_foreign` (`approved_by_dirpen`),
  KEY `lpjs_approved_by_director_foreign` (`approved_by_director`),
  KEY `lpjs_status_index` (`status`),
  KEY `lpjs_academic_year_id_index` (`academic_year_id`),
  KEY `lpjs_unit_kerja_id_index` (`unit_kerja_id`),
  KEY `lpjs_periode_start_date_index` (`periode_start_date`),
  KEY `lpjs_periode_end_date_index` (`periode_end_date`),
  CONSTRAINT `lpjs_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lpjs_approved_by_director_foreign` FOREIGN KEY (`approved_by_director`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lpjs_approved_by_dirpen_foreign` FOREIGN KEY (`approved_by_dirpen`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lpjs_approved_by_principal_foreign` FOREIGN KEY (`approved_by_principal`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lpjs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `lpjs_unit_kerja_id_foreign` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerjas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_schedules`
--

DROP TABLE IF EXISTS `maintenance_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `maintenance_type` enum('preventive','corrective','emergency','upgrade') NOT NULL DEFAULT 'preventive',
  `frequency` varchar(50) DEFAULT NULL,
  `last_maintenance` date DEFAULT NULL,
  `next_maintenance` date DEFAULT NULL,
  `technician_id` bigint(20) unsigned DEFAULT NULL,
  `estimated_duration` varchar(50) DEFAULT NULL,
  `required_materials` text DEFAULT NULL,
  `checklist` text DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','overdue') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_schedules_item_id_foreign` (`item_id`),
  KEY `maintenance_schedules_technician_id_foreign` (`technician_id`),
  CONSTRAINT `maintenance_schedules_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_schedules_technician_id_foreign` FOREIGN KEY (`technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `midtrans_transactions`
--

DROP TABLE IF EXISTS `midtrans_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `midtrans_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) NOT NULL,
  `student_bill_id` bigint(20) unsigned DEFAULT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `bank` varchar(50) DEFAULT NULL,
  `va_number` varchar(50) DEFAULT NULL,
  `snap_token` varchar(255) DEFAULT NULL,
  `gross_amount` decimal(15,2) NOT NULL,
  `transaction_status` varchar(50) NOT NULL DEFAULT 'pending',
  `settlement_time` timestamp NULL DEFAULT NULL,
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `midtrans_transactions_order_id_unique` (`order_id`),
  KEY `midtrans_transactions_student_bill_id_foreign` (`student_bill_id`),
  KEY `midtrans_transactions_order_id_index` (`order_id`),
  KEY `midtrans_transactions_transaction_id_index` (`transaction_id`),
  KEY `midtrans_transactions_transaction_status_index` (`transaction_status`),
  KEY `midtrans_transactions_student_id_index` (`student_id`),
  CONSTRAINT `midtrans_transactions_student_bill_id_foreign` FOREIGN KEY (`student_bill_id`) REFERENCES `student_bills` (`id`) ON DELETE SET NULL,
  CONSTRAINT `midtrans_transactions_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `midtrans_va_numbers`
--

DROP TABLE IF EXISTS `midtrans_va_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `midtrans_va_numbers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `bank_code` varchar(20) NOT NULL,
  `va_number` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `midtrans_va_numbers_student_id_bank_code_unique` (`student_id`,`bank_code`),
  KEY `midtrans_va_numbers_va_number_index` (`va_number`),
  CONSTRAINT `midtrans_va_numbers_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `full_content` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `category` varchar(255) NOT NULL DEFAULT 'pengumuman',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_student_id_is_read_index` (`student_id`,`is_read`),
  KEY `notifications_student_id_created_at_index` (`student_id`,`created_at`),
  CONSTRAINT `notifications_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1518 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `overtimes`
--

DROP TABLE IF EXISTS `overtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `overtimes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_guru` bigint(20) unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `durasi` int(11) NOT NULL,
  `jenis` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `tarif` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `supervisor` varchar(255) DEFAULT NULL,
  `disetujui_oleh` bigint(20) unsigned DEFAULT NULL,
  `tanggal_disetujui` date DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `overtimes_created_by_foreign` (`created_by`),
  KEY `overtimes_disetujui_oleh_foreign` (`disetujui_oleh`),
  KEY `overtimes_id_guru_tanggal_index` (`id_guru`,`tanggal`),
  KEY `overtimes_status_index` (`status`),
  KEY `overtimes_tanggal_index` (`tanggal`),
  CONSTRAINT `overtimes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `overtimes_disetujui_oleh_foreign` FOREIGN KEY (`disetujui_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `overtimes_id_guru_foreign` FOREIGN KEY (`id_guru`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parent_announcements`
--

DROP TABLE IF EXISTS `parent_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent_announcements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text DEFAULT NULL,
  `category` enum('akademik','kegiatan','pengumuman','informasi') NOT NULL DEFAULT 'pengumuman',
  `author` varchar(255) DEFAULT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `published_at` date DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `read_time` int(11) DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_announcements_created_by_foreign` (`created_by`),
  CONSTRAINT `parent_announcements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parent_banners`
--

DROP TABLE IF EXISTS `parent_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent_banners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `mobile_image_path` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `bg_color` varchar(255) NOT NULL DEFAULT 'from-blue-600 to-purple-600',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_banners_created_by_foreign` (`created_by`),
  CONSTRAINT `parent_banners_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parent_calendar_events`
--

DROP TABLE IF EXISTS `parent_calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parent_calendar_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `event_type` enum('akademik','kegiatan','libur','kompetisi','pengumuman') NOT NULL DEFAULT 'akademik',
  `priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
  `location` varchar(255) DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_calendar_events_created_by_foreign` (`created_by`),
  CONSTRAINT `parent_calendar_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_bill_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_date` timestamp NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `is_installment` tinyint(1) NOT NULL DEFAULT 0,
  `installment_number` int(11) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `processed_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_student_bill_id_index` (`student_bill_id`),
  KEY `payments_payment_date_index` (`payment_date`),
  KEY `payments_reference_number_index` (`reference_number`),
  CONSTRAINT `payments_student_bill_id_foreign` FOREIGN KEY (`student_bill_id`) REFERENCES `student_bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `payroll_id` uuid NOT NULL DEFAULT uuid(),
  `guru_id` bigint(20) DEFAULT NULL,
  `gaji_pokok` bigint(20) DEFAULT NULL,
  `jabatan` bigint(20) DEFAULT NULL,
  `masa_kerja` bigint(20) DEFAULT NULL,
  `wali_kelas` bigint(20) NOT NULL,
  `koordinator` bigint(20) NOT NULL,
  `tatap_muka` varchar(50) NOT NULL DEFAULT '0',
  `t_muka_pengganti` varchar(50) NOT NULL DEFAULT '0',
  `jml_jam_t_muka_pengganti` int(11) NOT NULL DEFAULT 0,
  `tunj_keluarga` bigint(20) NOT NULL,
  `transport1` bigint(20) NOT NULL,
  `jml_hari_transport1` int(11) NOT NULL DEFAULT 0,
  `transport2` bigint(20) NOT NULL,
  `jml_hari_transport2` int(11) NOT NULL DEFAULT 0,
  `total_transport_all` int(11) NOT NULL DEFAULT 0,
  `makan` bigint(20) NOT NULL,
  `makan_hari` int(11) NOT NULL DEFAULT 0,
  `jamsostek` bigint(20) NOT NULL,
  `overtime` bigint(20) NOT NULL,
  `overtime_hari` int(11) NOT NULL DEFAULT 0,
  `pramuka` bigint(20) NOT NULL,
  `jml_jam_pramuka` int(11) NOT NULL DEFAULT 0,
  `tunj_lain` bigint(20) DEFAULT NULL,
  `ekskul` bigint(20) DEFAULT NULL,
  `jml_jam_insentif_ekskul` int(11) NOT NULL DEFAULT 0,
  `bpjs` bigint(20) DEFAULT NULL,
  `bimbel` bigint(20) DEFAULT NULL,
  `jml_jam_insentif_bimbel` int(11) NOT NULL DEFAULT 0,
  `proyek` int(11) DEFAULT 0,
  `jml_jam_insentif_proyek` int(11) NOT NULL DEFAULT 0,
  `insentif_peng_pramuka` bigint(20) DEFAULT NULL,
  `insentif_peng_ekskul` bigint(20) DEFAULT NULL,
  `insentif_peng_proyek` bigint(20) DEFAULT NULL,
  `insentif_lain` decimal(12,2) DEFAULT 0.00,
  `insentif_pengurus_bimbel` decimal(12,2) DEFAULT 0.00,
  `potongan_yayasan` int(11) NOT NULL DEFAULT 0,
  `potongan_lain` int(11) NOT NULL DEFAULT 0,
  `potongan_koperasi_wajib` int(11) NOT NULL DEFAULT 0,
  `potongan_koperasi_sukarela` int(11) NOT NULL DEFAULT 0,
  `potongan_angsuran_koperasi` int(11) NOT NULL DEFAULT 0,
  `deposit_annurmart` int(11) NOT NULL DEFAULT 0,
  `potongan_jht` int(11) NOT NULL DEFAULT 0,
  `potongan_pph21` int(11) NOT NULL DEFAULT 0,
  `potongan_t_muka_pengganti` int(11) NOT NULL DEFAULT 0,
  `total_gaji` bigint(20) DEFAULT NULL,
  `total_potongan` bigint(20) NOT NULL DEFAULT 0,
  `gaji_bersih` bigint(20) NOT NULL DEFAULT 0,
  `status` varchar(40) NOT NULL,
  `periode_bulan` varchar(40) NOT NULL,
  `periode_tahun` int(4) NOT NULL,
  `created_date` datetime DEFAULT NULL,
  `created_by` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`payroll_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payroll_input_tu`
--

DROP TABLE IF EXISTS `payroll_input_tu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_input_tu` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint(20) unsigned NOT NULL,
  `unit_sekolah_id` bigint(20) unsigned NOT NULL,
  `periode_bulan` varchar(20) NOT NULL,
  `periode_tahun` varchar(4) NOT NULL,
  `bimbel` int(11) NOT NULL DEFAULT 0,
  `proyek` int(11) NOT NULL DEFAULT 0,
  `eskul` int(11) NOT NULL DEFAULT 0,
  `pramuka` int(11) NOT NULL DEFAULT 0,
  `t_muka_pengganti_gaji_pokok` int(11) NOT NULL DEFAULT 0,
  `t_muka_pengganti_potongan` int(11) NOT NULL DEFAULT 0,
  `insentif_lain` int(11) NOT NULL DEFAULT 0,
  `potongan_lain` int(11) NOT NULL DEFAULT 0,
  `status` enum('Draft','Submitted','Approved') NOT NULL DEFAULT 'Draft',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_guru_periode` (`guru_id`,`periode_bulan`,`periode_tahun`),
  KEY `idx_payroll_tu_unit_periode` (`unit_sekolah_id`,`periode_bulan`,`periode_tahun`),
  KEY `idx_payroll_tu_status` (`status`),
  CONSTRAINT `payroll_input_tu_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_input_tu_unit_sekolah_id_foreign` FOREIGN KEY (`unit_sekolah_id`) REFERENCES `unit_sekolahs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payroll_potongan`
--

DROP TABLE IF EXISTS `payroll_potongan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_potongan` (
  `id_potongan` int(11) NOT NULL AUTO_INCREMENT,
  `guru_id` bigint(20) NOT NULL,
  `nama_potongan` varchar(50) NOT NULL,
  `jumlah` bigint(20) DEFAULT NULL,
  `periode_bulan` varchar(40) NOT NULL,
  `periode_tahun` int(4) NOT NULL,
  `created_by` varchar(40) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id_potongan`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payroll_tunjangan`
--

DROP TABLE IF EXISTS `payroll_tunjangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll_tunjangan` (
  `id_tunjangan` int(11) NOT NULL AUTO_INCREMENT,
  `nama_tunjangan` varchar(50) DEFAULT NULL,
  `jumlah` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id_tunjangan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4052 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rapbs_documents`
--

DROP TABLE IF EXISTS `rapbs_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rapbs_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `rapbs_plan_id` bigint(20) unsigned NOT NULL,
  `document_type` enum('proposal','budget_detail','supporting_doc') NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rapbs_documents_uploaded_by_foreign` (`uploaded_by`),
  KEY `rapbs_documents_rapbs_plan_id_index` (`rapbs_plan_id`),
  KEY `rapbs_documents_document_type_index` (`document_type`),
  CONSTRAINT `rapbs_documents_rapbs_plan_id_foreign` FOREIGN KEY (`rapbs_plan_id`) REFERENCES `rapbs_plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rapbs_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rapbs_plans`
--

DROP TABLE IF EXISTS `rapbs_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rapbs_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `academic_year_id` bigint(20) unsigned NOT NULL,
  `activity_category_id` bigint(20) unsigned NOT NULL,
  `funding_source_id` bigint(20) unsigned NOT NULL,
  `unit_kerja_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `planned_amount` decimal(15,2) NOT NULL,
  `realized_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `status` enum('draft','submitted','approved_by_principal','approved_by_dirpen','approved','rejected_by_principal','rejected_by_dirpen','rejected_by_director','rejected') DEFAULT 'draft',
  `submitted_by` bigint(20) unsigned NOT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by_principal` bigint(20) unsigned DEFAULT NULL,
  `approved_by_principal_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_principal` text DEFAULT NULL,
  `approved_by_dirpen` bigint(20) unsigned DEFAULT NULL,
  `approved_by_dirpen_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_dirpen` text DEFAULT NULL,
  `approved_by_director` bigint(20) unsigned DEFAULT NULL,
  `approved_by_director_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_director` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rapbs_plans_activity_category_id_foreign` (`activity_category_id`),
  KEY `rapbs_plans_funding_source_id_foreign` (`funding_source_id`),
  KEY `rapbs_plans_submitted_by_foreign` (`submitted_by`),
  KEY `rapbs_plans_approved_by_foreign` (`approved_by`),
  KEY `rapbs_plans_status_index` (`status`),
  KEY `rapbs_plans_priority_index` (`priority`),
  KEY `rapbs_plans_academic_year_id_index` (`academic_year_id`),
  KEY `rapbs_plans_unit_kerja_id_foreign` (`unit_kerja_id`),
  KEY `rapbs_plans_approved_by_principal_foreign` (`approved_by_principal`),
  KEY `rapbs_plans_approved_by_director_foreign` (`approved_by_director`),
  KEY `rapbs_plans_approved_by_dirpen_foreign` (`approved_by_dirpen`),
  CONSTRAINT `rapbs_plans_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rapbs_plans_activity_category_id_foreign` FOREIGN KEY (`activity_category_id`) REFERENCES `activity_categories` (`id`),
  CONSTRAINT `rapbs_plans_approved_by_director_foreign` FOREIGN KEY (`approved_by_director`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_plans_approved_by_dirpen_foreign` FOREIGN KEY (`approved_by_dirpen`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_plans_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_plans_approved_by_principal_foreign` FOREIGN KEY (`approved_by_principal`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_plans_funding_source_id_foreign` FOREIGN KEY (`funding_source_id`) REFERENCES `funding_sources` (`id`),
  CONSTRAINT `rapbs_plans_submitted_by_foreign` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`),
  CONSTRAINT `rapbs_plans_unit_kerja_id_foreign` FOREIGN KEY (`unit_kerja_id`) REFERENCES `unit_kerjas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=275 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rapbs_realizations`
--

DROP TABLE IF EXISTS `rapbs_realizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rapbs_realizations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `rapbs_plan_id` bigint(20) unsigned NOT NULL,
  `transaction_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `vendor_name` varchar(200) NOT NULL,
  `payment_method` enum('cash','transfer','check') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `status` enum('pending','submitted','approved_by_principal','approved_by_dirpen','approved','rejected_by_principal','rejected_by_dirpen','rejected_by_director','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by_principal` bigint(20) unsigned DEFAULT NULL,
  `approved_by_principal_at` timestamp NULL DEFAULT NULL,
  `approved_by_dirpen` bigint(20) unsigned DEFAULT NULL,
  `approved_by_dirpen_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_dirpen` text DEFAULT NULL,
  `rejection_notes_principal` text DEFAULT NULL,
  `approved_by_director` bigint(20) unsigned DEFAULT NULL,
  `approved_by_director_at` timestamp NULL DEFAULT NULL,
  `rejection_notes_director` text DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rapbs_realizations_created_by_foreign` (`created_by`),
  KEY `rapbs_realizations_rapbs_plan_id_index` (`rapbs_plan_id`),
  KEY `rapbs_realizations_transaction_date_index` (`transaction_date`),
  KEY `rapbs_realizations_payment_method_index` (`payment_method`),
  KEY `rapbs_realizations_approved_by_foreign` (`approved_by`),
  KEY `rapbs_realizations_approved_by_principal_foreign` (`approved_by_principal`),
  KEY `rapbs_realizations_approved_by_director_foreign` (`approved_by_director`),
  KEY `rapbs_realizations_approved_by_dirpen_foreign` (`approved_by_dirpen`),
  CONSTRAINT `rapbs_realizations_approved_by_director_foreign` FOREIGN KEY (`approved_by_director`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_realizations_approved_by_dirpen_foreign` FOREIGN KEY (`approved_by_dirpen`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_realizations_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_realizations_approved_by_principal_foreign` FOREIGN KEY (`approved_by_principal`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_realizations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `rapbs_realizations_rapbs_plan_id_foreign` FOREIGN KEY (`rapbs_plan_id`) REFERENCES `rapbs_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rapbs_users`
--

DROP TABLE IF EXISTS `rapbs_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rapbs_users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `role` enum('planner','approver','executor','viewer') NOT NULL,
  `division_id` bigint(20) unsigned DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rapbs_users_user_id_index` (`user_id`),
  KEY `rapbs_users_role_index` (`role`),
  KEY `rapbs_users_division_id_index` (`division_id`),
  CONSTRAINT `rapbs_users_division_id_foreign` FOREIGN KEY (`division_id`) REFERENCES `unit_kerjas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rapbs_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `realization_documents`
--

DROP TABLE IF EXISTS `realization_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `realization_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `realization_id` bigint(20) unsigned NOT NULL,
  `document_type` enum('receipt','invoice','fpu','other') NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `validation_status` enum('pending','validated','rejected') NOT NULL DEFAULT 'pending',
  `validated_by` bigint(20) unsigned DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `realization_documents_validated_by_foreign` (`validated_by`),
  KEY `realization_documents_realization_id_index` (`realization_id`),
  KEY `realization_documents_validation_status_index` (`validation_status`),
  CONSTRAINT `realization_documents_realization_id_foreign` FOREIGN KEY (`realization_id`) REFERENCES `rapbs_realizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `realization_documents_validated_by_foreign` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `repair_request_images`
--

DROP TABLE IF EXISTS `repair_request_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_request_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `repair_request_id` bigint(20) unsigned NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `image_name` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `repair_request_images_repair_request_id_foreign` (`repair_request_id`),
  CONSTRAINT `repair_request_images_repair_request_id_foreign` FOREIGN KEY (`repair_request_id`) REFERENCES `repair_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `repair_requests`
--

DROP TABLE IF EXISTS `repair_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `requester_id` bigint(20) unsigned NOT NULL,
  `request_date` date NOT NULL,
  `problem_description` text NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `estimated_cost` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','approved','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
  `assigned_technician_id` bigint(20) unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `actual_cost` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `repair_requests_item_id_foreign` (`item_id`),
  KEY `repair_requests_requester_id_foreign` (`requester_id`),
  KEY `repair_requests_assigned_technician_id_foreign` (`assigned_technician_id`),
  CONSTRAINT `repair_requests_assigned_technician_id_foreign` FOREIGN KEY (`assigned_technician_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `repair_requests_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `repair_requests_requester_id_foreign` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) unsigned NOT NULL,
  `permission_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_permissions_role_id_permission_id_unique` (`role_id`,`permission_id`),
  KEY `role_permissions_permission_id_foreign` (`permission_id`),
  CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=644 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_bills`
--

DROP TABLE IF EXISTS `student_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_bills` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) unsigned NOT NULL COMMENT 'ID siswa',
  `bill_type_id` bigint(20) unsigned NOT NULL COMMENT 'ID jenis tagihan',
  `total_amount` decimal(15,2) NOT NULL COMMENT 'Total jumlah tagihan',
  `paid_amount` decimal(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Jumlah yang sudah dibayar',
  `remaining_amount` decimal(15,2) NOT NULL COMMENT 'Sisa tagihan yang belum dibayar',
  `due_date` date NOT NULL COMMENT 'Tanggal jatuh tempo',
  `period_month` int(11) DEFAULT NULL COMMENT 'Bulan periode (untuk SPP bulanan)',
  `period_year` int(11) DEFAULT NULL COMMENT 'Tahun periode',
  `status` enum('unpaid','partial','paid','overdue') NOT NULL DEFAULT 'unpaid' COMMENT 'Status pembayaran',
  `allow_installment` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Apakah boleh dicicil',
  `installment_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Jumlah cicilan yang sudah dibayar',
  `min_installment_amount` decimal(15,2) DEFAULT NULL COMMENT 'Minimal bayar per cicilan (opsional)',
  `notes` text DEFAULT NULL COMMENT 'Catatan tambahan',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_bills_bill_type_id_foreign` (`bill_type_id`),
  KEY `student_bills_student_id_status_index` (`student_id`,`status`),
  KEY `student_bills_due_date_status_index` (`due_date`,`status`),
  KEY `student_bills_period_year_period_month_index` (`period_year`,`period_month`),
  CONSTRAINT `student_bills_bill_type_id_foreign` FOREIGN KEY (`bill_type_id`) REFERENCES `bill_types` (`id`),
  CONSTRAINT `student_bills_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1544 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(255) NOT NULL,
  `nama_panggilan` varchar(255) NOT NULL,
  `nisn` varchar(255) NOT NULL,
  `tempat_lahir` varchar(255) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `nama_ibu` varchar(255) NOT NULL,
  `nama_ayah` varchar(255) NOT NULL,
  `nomor_hp` varchar(255) NOT NULL,
  `alamat` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `unit_sekolah` varchar(255) NOT NULL,
  `unit_kelas` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('Aktif','Non-Aktif','Lulus','Pindah') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_nisn_unique` (`nisn`),
  UNIQUE KEY `students_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1085 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teacher_attendance_documents`
--

DROP TABLE IF EXISTS `teacher_attendance_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_attendance_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint(20) unsigned NOT NULL,
  `attendance_date` date NOT NULL,
  `document_type` enum('sick_leave','permit','other') NOT NULL,
  `document_file` varchar(255) NOT NULL,
  `file_name` varchar(200) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_attendance_documents_teacher_id_foreign` (`teacher_id`),
  KEY `teacher_attendance_documents_approved_by_foreign` (`approved_by`),
  CONSTRAINT `teacher_attendance_documents_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `teacher_attendance_documents_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thr`
--

DROP TABLE IF EXISTS `thr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `thr` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `guru_id` bigint(20) unsigned NOT NULL,
  `tahun` int(11) NOT NULL DEFAULT 2025,
  `jumlah_tatap_muka` int(11) NOT NULL DEFAULT 0,
  `tatap_muka_rupiah` bigint(20) NOT NULL DEFAULT 0,
  `masa_kerja` bigint(20) NOT NULL DEFAULT 0,
  `total_rupiah` bigint(20) NOT NULL DEFAULT 0,
  `keterangan_rupiah` bigint(20) NOT NULL DEFAULT 0,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `thr_guru_id_tahun_index` (`guru_id`,`tahun`),
  CONSTRAINT `thr_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `gurus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  `unit_sekolah_id` bigint(20) unsigned DEFAULT NULL,
  `type` enum('income','expense') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approval_notes` text DEFAULT NULL,
  `receipt_file` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_foreign` (`user_id`),
  KEY `transactions_category_id_foreign` (`category_id`),
  KEY `transactions_approved_by_foreign` (`approved_by`),
  KEY `transactions_unit_sekolah_id_foreign` (`unit_sekolah_id`),
  CONSTRAINT `transactions_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_unit_sekolah_id_foreign` FOREIGN KEY (`unit_sekolah_id`) REFERENCES `unit_sekolahs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1557 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_kelas`
--

DROP TABLE IF EXISTS `unit_kelas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_kelas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tingkat` int(10) unsigned NOT NULL,
  `unit_sekolah_id` bigint(20) unsigned NOT NULL,
  `wali_kelas` varchar(255) DEFAULT NULL,
  `kapasitas` int(11) NOT NULL DEFAULT 30,
  `deskripsi` text DEFAULT NULL,
  `status` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_kelas_kode_unique` (`kode`),
  KEY `unit_kelas_unit_sekolah_id_foreign` (`unit_sekolah_id`),
  CONSTRAINT `unit_kelas_unit_sekolah_id_foreign` FOREIGN KEY (`unit_sekolah_id`) REFERENCES `unit_sekolahs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_kerjas`
--

DROP TABLE IF EXISTS `unit_kerjas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_kerjas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `status` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_sekolah_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_kerjas_kode_unique` (`kode`),
  KEY `unit_kerjas_unit_sekolah_id_foreign` (`unit_sekolah_id`),
  CONSTRAINT `unit_kerjas_unit_sekolah_id_foreign` FOREIGN KEY (`unit_sekolah_id`) REFERENCES `unit_sekolahs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_sekolahs`
--

DROP TABLE IF EXISTS `unit_sekolahs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_sekolahs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jenjang` enum('PAUD','TK','SD','SMP','SMA','SMK') NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kepala_sekolah` varchar(255) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `telepon` varchar(255) DEFAULT NULL,
  `status` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_sekolahs_kode_unique` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `nip` varchar(255) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `unit_kerja` varchar(255) DEFAULT NULL,
  `unit_sekolah` varchar(255) DEFAULT NULL,
  `status` enum('Aktif','Non-Aktif','Pensiun') NOT NULL DEFAULT 'Aktif',
  `tmt` date DEFAULT NULL,
  `tempat_lahir` varchar(255) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenjang_pendidikan` varchar(255) DEFAULT NULL,
  `jurusan` varchar(255) DEFAULT NULL,
  `status_pernikahan` enum('Menikah','Belum Menikah','Janda/Duda') DEFAULT NULL,
  `tugas_tambahan` varchar(255) DEFAULT NULL,
  `mapel_diampu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mapel_diampu`)),
  `jam_mengajar` int(11) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_telepon` varchar(255) DEFAULT NULL,
  `kontak_darurat` varchar(255) DEFAULT NULL,
  `telepon_darurat` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_profiles_nip_unique` (`nip`),
  KEY `user_profiles_user_id_foreign` (`user_id`),
  CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_roles_user_id_role_id_unique` (`user_id`,`role_id`),
  KEY `user_roles_role_id_foreign` (`role_id`),
  CONSTRAINT `user_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_connections`
--

DROP TABLE IF EXISTS `whatsapp_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_connections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` enum('disconnected','connecting','connected') NOT NULL DEFAULT 'disconnected',
  `qr_code` text DEFAULT NULL,
  `session_data` text DEFAULT NULL,
  `last_connected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `whatsapp_connections_status_index` (`status`),
  KEY `whatsapp_connections_phone_number_index` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_logs`
--

DROP TABLE IF EXISTS `whatsapp_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `whatsapp_logs_queue_id_index` (`queue_id`),
  KEY `whatsapp_logs_action_index` (`action`),
  KEY `whatsapp_logs_created_at_index` (`created_at`),
  CONSTRAINT `whatsapp_logs_queue_id_foreign` FOREIGN KEY (`queue_id`) REFERENCES `whatsapp_queues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_queues`
--

DROP TABLE IF EXISTS `whatsapp_queues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_queues` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` bigint(20) unsigned DEFAULT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `recipient_type` enum('siswa','orang_tua','guru') NOT NULL,
  `message_content` text NOT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  `scheduled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int(11) NOT NULL DEFAULT 0,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `whatsapp_queues_status_index` (`status`),
  KEY `whatsapp_queues_scheduled_at_index` (`scheduled_at`),
  KEY `whatsapp_queues_recipient_phone_index` (`recipient_phone`),
  KEY `whatsapp_queues_reference_type_reference_id_index` (`reference_type`,`reference_id`),
  KEY `whatsapp_queues_template_id_index` (`template_id`),
  CONSTRAINT `whatsapp_queues_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `whatsapp_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `whatsapp_templates`
--

DROP TABLE IF EXISTS `whatsapp_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('kwitansi','tagihan','pengumuman_siswa','konfirmasi_bayar','pengumuman_guru') NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `content` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `has_attachment` tinyint(1) NOT NULL DEFAULT 0,
  `attachment_type` enum('pdf','image','document') DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `whatsapp_templates_type_index` (`type`),
  KEY `whatsapp_templates_is_active_index` (`is_active`),
  KEY `whatsapp_templates_created_by_index` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'sql_nurverse_id'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23 19:33:04
