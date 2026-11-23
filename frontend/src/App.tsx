
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/common/Layout/MainLayout';
import Login from './components/auth/Login';
import TestApi from './components/TestApi';
import Dashboard from './pages/Dashboard';
import DashboardTU from './pages/TU/DashboardTU';
import AbsensiKaryawan from './pages/TU/AbsensiKaryawan';
import Pemasukan from './pages/TU/Pemasukan';
import Pengeluaran from './pages/TU/Pengeluaran';
import ReportTU from './pages/TU/ReportTU';
import Payroll from './pages/Payroll';
import DataKaryawan from './pages/Payroll/DataKaryawan';
import DetailKaryawan from './pages/Payroll/DetailKaryawan';
import EditKaryawan from './pages/Payroll/EditKaryawan';
import AbsensiKaryawanPayroll from './pages/Payroll/AbsensiKaryawan';
import CutiKaryawan from './pages/Payroll/CutiKaryawan';
import DaftarPengajuanCuti from './pages/Payroll/DaftarPengajuanCuti';
import SlipGaji from './pages/Payroll/SlipGaji';
import RekapSlipGaji from './pages/Payroll/RekapSlipGaji';
import ReportSlipGaji from './pages/Payroll/ReportSlipGaji';
import THR from './pages/Payroll/THR';
import Koperasi from './pages/Payroll/Koperasi';
import LaporanGaji from './pages/Payroll/LaporanGaji';
import LaporanLembur from './pages/Payroll/LaporanLembur';
import LaporanPajak from './pages/Payroll/LaporanPajak';
import Sarpras from './pages/Sarpras';
import MaintenanceSchedule from './pages/Sarpras/MaintenanceSchedule';
import RepairRequest from './pages/Sarpras/RepairRequest';
import Depreciation from './pages/Sarpras/Depreciation';
import Audit from './pages/Sarpras/Audit';
import DanusPage from './pages/danus/DanusPage';
import RAPBSPage from './pages/RAPBSPage';
import RAPBSDashboardPage from './pages/RAPBS/DashboardPage';
import RAPBSRencanaPage from './pages/RAPBS/RencanaPage';
import RAPBSRealisasiPage from './pages/RAPBS/RealisasiPage';
import RAPBSLaporanPage from './pages/RAPBS/LaporanPage';
import RAPBSTahunAjaran from './pages/RAPBS/MasterData/TahunAjaran';
import RAPBSKategoriKegiatan from './pages/RAPBS/MasterData/KategoriKegiatan';
import RAPBSSumberDana from './pages/RAPBS/MasterData/SumberDana';
import LPJPage from './pages/LPJPage';
import Guru from './pages/Guru';
import User from './pages/User';
import Student from './pages/Student';
// Master Data imports
import UnitKerja from './pages/MasterData/UnitKerja';
import UnitSekolah from './pages/MasterData/UnitSekolah';
import UnitKelas from './pages/MasterData/UnitKelas';
import Jabatan from './pages/MasterData/Jabatan';
import Role from './pages/MasterData/Role';
import KategoriPemasukan from './pages/MasterData/KategoriPemasukan';
import KategoriPengeluaran from './pages/MasterData/KategoriPengeluaran';
import JenisTagihan from './pages/MasterData/JenisTagihan';
import JenisUnitUsaha from './pages/MasterData/JenisUnitUsaha';
import Bank from './pages/MasterData/Bank';
// Akuntansi imports
import AkuntansiDashboard from './pages/Akuntansi/DashboardNew';
import ChartOfAccounts from './pages/Akuntansi/ChartOfAccounts';
import JournalEntries from './pages/Akuntansi/JournalEntries';
import GeneralLedger from './pages/Akuntansi/GeneralLedger';
import BalanceSheet from './pages/Akuntansi/Reports/BalanceSheet';
import IncomeStatement from './pages/Akuntansi/Reports/IncomeStatement';
import CashFlow from './pages/Akuntansi/Reports/CashFlow';
// Tagihan Siswa imports
import TagihanSiswa from './pages/TagihanSiswa';
// CMS Parent imports
import CMSParentCalendar from './pages/CMS-Parent/Calendar';
import CMSParentAnnouncements from './pages/CMS-Parent/Announcements';
import CMSParentBanners from './pages/CMS-Parent/Banners';
// Divisi/Unit imports
import PemasukanRegulerPage from './pages/DivisiUnit/PemasukanRegulerPage';
import PemasukanUnitPage from './pages/DivisiUnit/PemasukanUnitPage';
import InputPayrollTUPage from './pages/DivisiUnit/InputPayrollTUPage';
import PemasukanLainnyaPage from './pages/DivisiUnit/PemasukanLainnyaPage';
import PengeluaranRegulerPage from './pages/DivisiUnit/PengeluaranRegulerPage';
import PengeluaranBOSPage from './pages/DivisiUnit/PengeluaranBOSPage';
import PengeluaranLainnyaPage from './pages/DivisiUnit/PengeluaranLainnyaPage';
import PresensiGuruPage from './pages/DivisiUnit/PresensiGuruPage';
import UploadPengeluaranPage from './pages/DivisiUnit/UploadPengeluaranPage';
// Landing Page
import UserLanding from './pages/UserLanding';
// Dashboard Guru imports
import GuruLogin from './pages/Dashboard-Guru/Login';
import GuruDashboard from './pages/Dashboard-Guru/Dashboard';
import GuruAbsensi from './pages/Dashboard-Guru/Absensi';
import GuruPayroll from './pages/Dashboard-Guru/Payroll';
import GuruKomunikasi from './pages/Dashboard-Guru/Komunikasi';
import GuruPengumuman from './pages/Dashboard-Guru/Pengumuman';
import GuruProfil from './pages/Dashboard-Guru/Profil';
import GuruCuti from './pages/Dashboard-Guru/Cuti';
import GuruLembur from './pages/Dashboard-Guru/Lembur';
import GuruQRScan from './pages/Dashboard-Guru/QRScan';
// Dashboard Parent imports
import ParentLogin from './pages/Dashboard-Parent/Login';
import ParentDashboard from './pages/Dashboard-Parent/Dashboard';
import ParentAbsensi from './pages/Dashboard-Parent/Absensi';
import ParentKomunikasi from './pages/Dashboard-Parent/Komunikasi';
import ParentNews from './pages/Dashboard-Parent/News';
import ParentKalender from './pages/Dashboard-Parent/Kalender Akademik';
import ParentTagihan from './pages/Dashboard-Parent/Tagihan';
import ParentNotifikasi from './pages/Dashboard-Parent/Notifikasi';
import ParentKeuangan from './pages/Dashboard-Parent/Keuangan';
import ParentBiodata from './pages/Dashboard-Parent/Biodata Anak';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import oneSignalService from './services/oneSignalService';
import './index.css';

function App() {
  // Initialize OneSignal saat aplikasi dimuat
  useEffect(() => {
    oneSignalService.init();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div data-theme="annur" className="min-h-screen">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/test-api" element={<TestApi />} />
            <Route path="/" element={<UserLanding />} />
            
            {/* Guru Routes - standalone without MainLayout */}
            <Route path="/guru/login" element={<GuruLogin />} />
            <Route path="/guru/dashboard" element={<GuruDashboard />} />
            <Route path="/guru/absensi" element={<GuruAbsensi />} />
            <Route path="/guru/payroll" element={<GuruPayroll />} />
            <Route path="/guru/komunikasi" element={<GuruKomunikasi />} />
            <Route path="/guru/pengumuman" element={<GuruPengumuman />} />
            <Route path="/guru/profil" element={<GuruProfil />} />
            <Route path="/guru/cuti" element={<GuruCuti />} />
            <Route path="/guru/lembur" element={<GuruLembur />} />
            <Route path="/guru/qr-scan" element={<GuruQRScan />} />
            
            {/* Parent Routes - standalone without MainLayout */}
            <Route path="/parent/login" element={<ParentLogin />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            <Route path="/parent/absensi" element={<ParentAbsensi />} />
            <Route path="/parent/komunikasi" element={<ParentKomunikasi />} />
            <Route path="/parent/news" element={<ParentNews />} />
            <Route path="/parent/kalender" element={<ParentKalender />} />
            <Route path="/parent/tagihan" element={<ParentTagihan />} />
            <Route path="/parent/notifikasi" element={<ParentNotifikasi />} />
            <Route path="/parent/keuangan" element={<ParentKeuangan />} />
            <Route path="/parent/biodata" element={<ParentBiodata />} />
            
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tata-usaha/dashboard" element={<DashboardTU />} />
                  <Route path="tata-usaha/absensi" element={<AbsensiKaryawan />} />
                  <Route path="tata-usaha/cashflow" element={<div className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Manajemen Cashflow</h2>
                    <p className="text-gray-600">Coming Soon...</p>
                  </div>} />
                  <Route path="tata-usaha/pemasukan" element={<Pemasukan />} />
                  <Route path="tata-usaha/pengeluaran" element={<Pengeluaran />} />
                  <Route path="tata-usaha/report" element={<ReportTU />} />
                  <Route path="payroll" element={<Payroll />} />
                  {/* <Route path="payroll/data-karyawan" element={<DataKaryawan />} /> */}
                  <Route path="payroll/detail-karyawan/:id" element={<DetailKaryawan />} />
                  <Route path="payroll/edit-karyawan/:id" element={<EditKaryawan />} />
                  <Route path="payroll/absensi-karyawan" element={<AbsensiKaryawanPayroll />} />
                  <Route path="payroll/cuti-karyawan" element={<CutiKaryawan />} />
                  <Route path="payroll/cuti-karyawan/pengajuan" element={<DaftarPengajuanCuti />} />
                  <Route path="payroll/gaji/slip-gaji" element={<SlipGaji />} />
                  <Route path="payroll/gaji/rekap-slip" element={<RekapSlipGaji />} />
                  <Route path="payroll/gaji/report-slip" element={<ReportSlipGaji />} />
                  <Route path="payroll/thr" element={<THR />} />
                  <Route path="payroll/koperasi" element={<Koperasi />} />
                  <Route path="payroll/rekapitulasi/laporan-gaji" element={<LaporanGaji />} />
                  <Route path="payroll/rekapitulasi/laporan-lembur" element={<LaporanLembur />} />
                  <Route path="payroll/rekapitulasi/laporan-pajak" element={<LaporanPajak />} />
                  <Route path="sarpras" element={<Sarpras />} />
                  <Route path="sarpras/inventory" element={<Sarpras />} />
                  <Route path="sarpras/maintenance" element={<MaintenanceSchedule />} />
                  <Route path="sarpras/repair-request" element={<RepairRequest />} />
                  <Route path="sarpras/depreciation" element={<Depreciation />} />
                  <Route path="sarpras/audit" element={<Audit />} />
                  <Route path="dana-usaha" element={<DanusPage />} />
                  <Route path="guru" element={<Guru />} />
                  {/* Divisi/Unit Routes */}
                  <Route path="divisi-unit/pemasukan-reguler" element={<PemasukanRegulerPage />} />
                  <Route path="divisi-unit/pemasukan-unit" element={<PemasukanUnitPage />} />
                  <Route path="divisi-unit/pemasukan-lainnya" element={<PemasukanLainnyaPage />} />
                  <Route path="divisi-unit/pengeluaran-reguler" element={<PengeluaranRegulerPage />} />
                  <Route path="divisi-unit/pengeluaran-bos" element={<PengeluaranBOSPage />} />
                  <Route path="divisi-unit/pengeluaran-lainnya" element={<PengeluaranLainnyaPage />} />
                  <Route path="divisi-unit/presensi-guru" element={<PresensiGuruPage />} />
                  <Route path="divisi-unit/upload-pengeluaran" element={<UploadPengeluaranPage />} />
                  <Route path="divisi-unit/input-payroll-tu" element={<InputPayrollTUPage />} />
                  {/* RAPBS Routes */}
                  <Route path="rapbs" element={<RAPBSPage />} />
                  <Route path="rapbs/dashboard" element={<RAPBSDashboardPage />} />
                  <Route path="rapbs/rencana" element={<RAPBSRencanaPage />} />
                  <Route path="rapbs/realisasi" element={<RAPBSRealisasiPage />} />
                  <Route path="rapbs/laporan" element={<RAPBSLaporanPage />} />
                  <Route path="rapbs/master-data/tahun-ajaran" element={<RAPBSTahunAjaran />} />
                  <Route path="rapbs/master-data/kategori-kegiatan" element={<RAPBSKategoriKegiatan />} />
                  <Route path="rapbs/master-data/sumber-dana" element={<RAPBSSumberDana />} />
                  {/* LPJ Routes */}
                  <Route path="lpj" element={<LPJPage />} />
                  {/* Akuntansi Routes */}
                  <Route path="akuntansi" element={<AkuntansiDashboard />} />
                  <Route path="akuntansi/dashboard" element={<AkuntansiDashboard />} />
                  <Route path="akuntansi/chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="akuntansi/journal-entries" element={<JournalEntries />} />
                  <Route path="akuntansi/general-ledger" element={<GeneralLedger />} />
                  <Route path="akuntansi/reports/balance-sheet" element={<BalanceSheet />} />
                  <Route path="akuntansi/reports/income-statement" element={<IncomeStatement />} />
                  <Route path="akuntansi/reports/cash-flow" element={<CashFlow />} />
                  {/* Tagihan Siswa Routes */}
                  <Route path="tagihan-siswa" element={<TagihanSiswa />} />
                  {/* CMS Parent Routes */}
                  <Route path="cms-parent/calendar" element={<CMSParentCalendar />} />
                  <Route path="cms-parent/announcements" element={<CMSParentAnnouncements />} />
                  <Route path="cms-parent/banners" element={<CMSParentBanners />} />
                  {/* Master Data Routes */}
                  <Route path="master-data/unit-kerja" element={<UnitKerja />} />
                  <Route path="master-data/unit-sekolah" element={<UnitSekolah />} />
                  <Route path="master-data/unit-kelas" element={<UnitKelas />} />
                  <Route path="master-data/jabatan" element={<Jabatan />} />
                  <Route path="master-data/bank" element={<Bank />} />
                  <Route path="master-data/role" element={<Role />} />
                  <Route path="master-data/kategori-pemasukan" element={<KategoriPemasukan />} />
                  <Route path="master-data/kategori-pengeluaran" element={<KategoriPengeluaran />} />
                  <Route path="master-data/jenis-tagihan" element={<JenisTagihan />} />
                  <Route path="master-data/jenis-unit-usaha" element={<JenisUnitUsaha />} />
                  <Route path="user" element={<User />} />
                  <Route path="student" element={<Student />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;