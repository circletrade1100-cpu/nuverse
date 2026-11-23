# Modul GURU

## 📊 Dashboard

### Fitur Utama
- **Overview Kelas**: Ringkasan kelas yang diampu
- **Jadwal Mengajar**: Jadwal hari ini
- **Absensi Siswa**: Status kehadiran siswa
- **Pengumuman**: Berita dan pengumuman
- **Komunikasi**: Pesan dari orang tua

### Dashboard Metrics
```php
// Teacher Dashboard Data
{
    "teacher_info": {
        "name": "Nama Guru",
        "subject": "Matematika",
        "employee_number": "G2024001"
    },
    "today_schedule": [
        {
            "time": "07:30-09:00",
            "class": "10A",
            "subject": "Matematika",
            "room": "Ruang 101"
        }
    ],
    "attendance_summary": {
        "total_students": 30,
        "present": 28,
        "absent": 2,
        "late": 0
    },
    "unread_messages": 5
}
```

## 📅 Jadwal Mengajar

### Fitur Jadwal
- **Daily Schedule**: Jadwal harian
- **Weekly View**: Tampilan mingguan
- **Monthly Calendar**: Kalender bulanan
- **Schedule Conflicts**: Deteksi konflik jadwal

### Schedule Management
```sql
CREATE TABLE teaching_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teacher_id BIGINT,
    class_id BIGINT,
    subject_id BIGINT,
    room_id BIGINT,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'),
    start_time TIME,
    end_time TIME,
    academic_year VARCHAR(10),
    semester ENUM('odd', 'even'),
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### API Endpoints
```php
// Schedule Management
GET /api/teacher/schedule/today
GET /api/teacher/schedule/week
GET /api/teacher/schedule/month
GET /api/teacher/schedule/conflicts
```

## 📊 Absensi Siswa

### Fitur Absensi
- **Real-time Attendance**: Input absensi real-time
- **Bulk Input**: Input massal
- **Attendance History**: Riwayat kehadiran
- **Statistics**: Statistik kehadiran

### Attendance Tracking
```sql
CREATE TABLE student_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    class_id BIGINT,
    teacher_id BIGINT,
    attendance_date DATE,
    status ENUM('present', 'absent', 'late', 'sick', 'permit'),
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Attendance API
```php
// Attendance Management
POST /api/teacher/attendance/input
GET /api/teacher/attendance/class/{class_id}
GET /api/teacher/attendance/student/{student_id}
POST /api/teacher/attendance/bulk
```

## 💬 Komunikasi

### Communication Features
- **Parent Messages**: Pesan dari orang tua
- **Class Announcements**: Pengumuman kelas
- **Direct Messages**: Pesan langsung
- **Group Chats**: Grup diskusi

### Message Types
- **Academic**: Pesan akademik
- **Behavioral**: Pesan perilaku
- **Health**: Pesan kesehatan
- **General**: Pesan umum

### Database Schema
```sql
CREATE TABLE teacher_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT,
    receiver_id BIGINT,
    message_type ENUM('academic', 'behavioral', 'health', 'general'),
    subject VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📢 Pengumuman

### Announcement Features
- **Class Announcements**: Pengumuman kelas
- **School Announcements**: Pengumuman sekolah
- **Academic Updates**: Update akademik
- **Event Notifications**: Notifikasi acara

### Announcement Management
```sql
CREATE TABLE announcements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    announcement_type ENUM('class', 'school', 'academic', 'event'),
    target_audience ENUM('students', 'parents', 'teachers', 'all'),
    class_id BIGINT NULL,
    teacher_id BIGINT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 📚 Academic Management

### Lesson Planning
- **Lesson Plans**: Rencana pembelajaran
- **Learning Objectives**: Tujuan pembelajaran
- **Teaching Materials**: Materi ajar
- **Assessment Tools**: Alat penilaian

### Grade Management
- **Grade Input**: Input nilai
- **Grade History**: Riwayat nilai
- **Grade Analytics**: Analisis nilai
- **Progress Reports**: Laporan kemajuan

## 🔐 Security & Permissions

### Teacher Access
- View assigned classes
- Input attendance
- Send messages to parents
- Create announcements
- Input grades
- View student data

### Data Privacy
- **Class-specific data**: Hanya data kelas yang diampu
- **Student privacy**: Privasi data siswa
- **Secure communication**: Komunikasi aman
- **Grade confidentiality**: Kerahasiaan nilai

## 📱 Frontend Components

### Teacher Dashboard Components
```jsx
// Dashboard Components
<TeacherDashboard />
<ScheduleOverview />
<AttendanceOverview />
<MessageCenter />

// Schedule Components
<TeachingSchedule />
<ScheduleCalendar />
<ScheduleConflicts />

// Attendance Components
<AttendanceInput />
<AttendanceReport />
<AttendanceStatistics />

// Communication Components
<MessageCompose />
<MessageInbox />
<AnnouncementForm />

// Academic Components
<GradeInput />
<LessonPlan />
<StudentProgress />
```

## 🎯 Key Features

### Real-time Features
- **Live Attendance**: Input absensi real-time
- **Instant Messaging**: Pesan instan
- **Schedule Updates**: Update jadwal real-time
- **Grade Notifications**: Notifikasi nilai

### Mobile Responsive
- **Mobile App**: Aplikasi mobile
- **Offline Access**: Akses offline
- **Quick Actions**: Aksi cepat
- **Push Notifications**: Notifikasi push

## 📊 Analytics & Reports

### Teacher Analytics
- **Attendance Trends**: Trend kehadiran
- **Student Performance**: Performa siswa
- **Communication Frequency**: Frekuensi komunikasi
- **Schedule Efficiency**: Efisiensi jadwal

### Reports Available
1. **Class Attendance Report**
2. **Student Performance Report**
3. **Communication Log Report**
4. **Schedule Utilization Report**

## 🔔 Notifications

### Notification Types
- **Attendance Alerts**: Alert absensi
- **Message Notifications**: Notifikasi pesan
- **Schedule Reminders**: Pengingat jadwal
- **Grade Updates**: Update nilai

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push

## 📈 Performance Tracking

### Teacher Performance
- **Attendance Accuracy**: Akurasi input absensi
- **Communication Response**: Respons komunikasi
- **Grade Timeliness**: Ketepatan waktu input nilai
- **Student Engagement**: Keterlibatan siswa

### Student Performance
- **Attendance Rate**: Tingkat kehadiran
- **Academic Progress**: Kemajuan akademik
- **Behavioral Assessment**: Penilaian perilaku
- **Parent Communication**: Komunikasi dengan orang tua
