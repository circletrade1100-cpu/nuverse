# Modul PARENT (Wali Murid)

## 📊 Dashboard

### Fitur Utama
- **Overview Anak**: Ringkasan data anak
- **Keuangan**: Status pembayaran SPP
- **Absensi**: Kehadiran hari ini
- **Pengumuman**: Berita terbaru
- **Kalender**: Jadwal akademik

### Dashboard Metrics
```php
// Parent Dashboard Data
{
    "student_info": {
        "name": "Nama Siswa",
        "class": "Kelas 10A",
        "student_number": "2024001"
    },
    "financial_status": {
        "spp_balance": 500000,
        "last_payment": "2024-01-15",
        "next_due": "2024-02-15"
    },
    "attendance_today": {
        "status": "present",
        "check_in": "07:30",
        "check_out": "14:00"
    },
    "upcoming_events": [
        {
            "title": "Ujian Tengah Semester",
            "date": "2024-02-20",
            "type": "academic"
        }
    ]
}
```

## 👨‍👩‍👧‍👦 Biodata Anak

### Data Pribadi
- **Informasi Dasar**: Nama, NIS, tanggal lahir
- **Kontak**: Alamat, telepon, email
- **Keluarga**: Data orang tua, wali
- **Kesehatan**: Riwayat medis, alergi
- **Akademik**: Riwayat pendidikan

### Database Schema
```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_number VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    birth_date DATE,
    gender ENUM('male', 'female'),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    class_id BIGINT,
    enrollment_date DATE,
    status ENUM('active', 'inactive', 'graduated'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE parents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    name VARCHAR(100),
    relationship ENUM('father', 'mother', 'guardian'),
    phone VARCHAR(20),
    email VARCHAR(100),
    occupation VARCHAR(100),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📅 Absensi

### Fitur Absensi
- **Real-time Tracking**: Status kehadiran real-time
- **History**: Riwayat kehadiran
- **Statistics**: Statistik kehadiran
- **Notifications**: Notifikasi keterlambatan

### API Endpoints
```php
// Student Attendance
GET /api/parent/attendance/{student_id}
GET /api/parent/attendance/history/{student_id}
GET /api/parent/attendance/statistics/{student_id}
```

## 💰 Keuangan

### Informasi Keuangan
- **SPP Status**: Status pembayaran SPP
- **Payment History**: Riwayat pembayaran
- **Due Dates**: Tanggal jatuh tempo
- **Payment Methods**: Metode pembayaran

### Payment Tracking
```php
// Payment Information
{
    "spp_details": {
        "monthly_amount": 500000,
        "total_balance": 1500000,
        "last_payment": "2024-01-15",
        "next_due": "2024-02-15",
        "payment_method": "transfer"
    },
    "payment_history": [
        {
            "date": "2024-01-15",
            "amount": 500000,
            "method": "transfer",
            "status": "completed"
        }
    ]
}
```

## 📰 News (Berita)

### Fitur Berita
- **School News**: Berita sekolah
- **Academic Updates**: Update akademik
- **Event Announcements**: Pengumuman acara
- **Important Notices**: Pemberitahuan penting

### News Categories
- **Academic**: Berita akademik
- **Events**: Acara sekolah
- **Announcements**: Pengumuman
- **Achievements**: Prestasi siswa

## 💬 Komunikasi

### Communication Channels
- **Direct Messages**: Pesan langsung dengan guru
- **Class Group**: Grup kelas
- **School Notifications**: Notifikasi sekolah
- **Emergency Contacts**: Kontak darurat

### Message Types
- **Academic**: Pesan akademik
- **Behavioral**: Pesan perilaku
- **Health**: Pesan kesehatan
- **General**: Pesan umum

## 📅 Kalender Akademik

### Academic Calendar
- **Semester Dates**: Tanggal semester
- **Exam Schedule**: Jadwal ujian
- **Holidays**: Hari libur
- **Events**: Acara sekolah

### Calendar Features
- **Monthly View**: Tampilan bulanan
- **Weekly View**: Tampilan mingguan
- **Event Details**: Detail acara
- **Reminders**: Pengingat acara

## 🔐 Security & Permissions

### Parent Access
- View own child's data
- View attendance records
- View financial information
- Send messages to teachers
- View academic calendar

### Data Privacy
- **Child-specific data**: Hanya data anak sendiri
- **Secure communication**: Komunikasi aman
- **Payment security**: Keamanan pembayaran
- **Data encryption**: Enkripsi data

## 📱 Frontend Components

### Parent Dashboard Components
```jsx
// Dashboard Components
<ParentDashboard />
<StudentOverview />
<FinancialStatus />
<AttendanceStatus />

// Student Information
<StudentProfile />
<StudentHistory />
<StudentDocuments />

// Communication Components
<MessageCenter />
<TeacherChat />
<SchoolNotifications />

// Calendar Components
<AcademicCalendar />
<EventDetails />
<CalendarReminders />
```

## 🎯 Key Features

### Real-time Updates
- **Live Attendance**: Status kehadiran real-time
- **Payment Notifications**: Notifikasi pembayaran
- **Message Alerts**: Alert pesan baru
- **Event Reminders**: Pengingat acara

### Mobile Responsive
- **Mobile App**: Aplikasi mobile
- **Push Notifications**: Notifikasi push
- **Offline Access**: Akses offline
- **Quick Actions**: Aksi cepat

## 📊 Analytics & Reports

### Parent Analytics
- **Attendance Trends**: Trend kehadiran
- **Academic Progress**: Kemajuan akademik
- **Payment Patterns**: Pola pembayaran
- **Communication Frequency**: Frekuensi komunikasi

### Reports Available
1. **Monthly Attendance Report**
2. **Academic Progress Report**
3. **Payment History Report**
4. **Communication Log Report**

## 🔔 Notifications

### Notification Types
- **Attendance Alerts**: Alert kehadiran
- **Payment Reminders**: Pengingat pembayaran
- **Academic Updates**: Update akademik
- **Event Notifications**: Notifikasi acara

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push
