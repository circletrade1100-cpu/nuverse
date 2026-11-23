# Modul PENGGUNA / USER

## 👥 Manajemen Akun Pengguna Sistem

### Fitur Utama
- **User Registration**: Pendaftaran pengguna
- **Role Management**: Manajemen peran
- **Permission Control**: Kontrol hak akses
- **Profile Management**: Manajemen profil
- **Activity Logging**: Log aktivitas pengguna

## 🔐 Authentication & Authorization

### User Authentication
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Role Management
```sql
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    module VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    permission_id BIGINT,
    created_at TIMESTAMP
);

CREATE TABLE user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    role_id BIGINT,
    created_at TIMESTAMP
);
```

## 👤 User Profiles

### Profile Management
```sql
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    employee_number VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Profile API Endpoints
```php
// User Management
GET /api/users
POST /api/users
PUT /api/users/{id}
DELETE /api/users/{id}

// Profile Management
GET /api/users/{id}/profile
PUT /api/users/{id}/profile
POST /api/users/{id}/avatar

// Role Management
GET /api/roles
POST /api/roles
PUT /api/roles/{id}
DELETE /api/roles/{id}

// Permission Management
GET /api/permissions
POST /api/permissions
PUT /api/permissions/{id}
DELETE /api/permissions/{id}
```

## 🔑 Role-based Access Control (RBAC)

### Predefined Roles
1. **Super Admin**
   - Full system access
   - User management
   - System configuration

2. **School Principal**
   - All school modules
   - Financial reports
   - Staff management

3. **TU Staff**
   - TU module access
   - Basic reporting
   - Transaction management

4. **HR Manager**
   - Payroll module
   - Employee management
   - HR reports

5. **SARPRAS Staff**
   - Inventory management
   - Maintenance tracking
   - Asset reports

6. **DANUS Manager**
   - Business unit management
   - Financial tracking
   - Performance reports

7. **Teacher**
   - Class management
   - Student attendance
   - Communication tools

8. **Parent**
   - Child information
   - Payment tracking
   - Communication access

### Permission Categories
```php
// Module-based Permissions
$permissions = [
    'tu' => [
        'tu.view',
        'tu.create',
        'tu.edit',
        'tu.delete',
        'tu.approve',
        'tu.report'
    ],
    'payroll' => [
        'payroll.view',
        'payroll.create',
        'payroll.edit',
        'payroll.delete',
        'payroll.approve',
        'payroll.report'
    ],
    'sarpras' => [
        'sarpras.view',
        'sarpras.create',
        'sarpras.edit',
        'sarpras.delete',
        'sarpras.maintenance',
        'sarpras.report'
    ],
    // ... other modules
];
```

## 📊 User Activity Monitoring

### Activity Logging
```sql
CREATE TABLE user_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    activity_type VARCHAR(50),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    module VARCHAR(50),
    action VARCHAR(50),
    resource_id BIGINT,
    created_at TIMESTAMP
);
```

### Login History
```sql
CREATE TABLE login_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    login_at TIMESTAMP,
    logout_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN,
    failure_reason TEXT,
    created_at TIMESTAMP
);
```

## 🔒 Security Features

### Password Management
- **Password Policy**: Kebijakan password
- **Password History**: Riwayat password
- **Password Expiry**: Kadaluarsa password
- **Two-Factor Authentication**: 2FA

### Session Management
```sql
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);
```

## 📱 Frontend Components

### User Management Components
```jsx
// User Management
<UserList />
<UserForm />
<UserDetail />
<UserProfile />

// Role Management
<RoleList />
<RoleForm />
<RoleDetail />
<PermissionMatrix />

// Security Components
<LoginHistory />
<ActivityLog />
<SecuritySettings />
<TwoFactorAuth />
```

## 🎯 Key Features

### User Registration
- **Email Verification**: Verifikasi email
- **Phone Verification**: Verifikasi telepon
- **Document Upload**: Upload dokumen
- **Approval Workflow**: Workflow persetujuan

### Profile Management
- **Personal Information**: Informasi pribadi
- **Contact Details**: Detail kontak
- **Emergency Contacts**: Kontak darurat
- **Document Management**: Manajemen dokumen

### Role Assignment
- **Multiple Roles**: Multi peran
- **Role Hierarchy**: Hierarki peran
- **Temporary Roles**: Peran sementara
- **Role Expiry**: Kadaluarsa peran

## 📊 Analytics & Reporting

### User Analytics
- **User Activity**: Aktivitas pengguna
- **Login Patterns**: Pola login
- **Module Usage**: Penggunaan modul
- **Performance Metrics**: Metrik performa

### Security Reports
1. **Login Attempts Report**
2. **Failed Login Report**
3. **User Activity Report**
4. **Permission Usage Report**

## 🔔 Notifications

### User Notifications
- **Account Activation**: Aktivasi akun
- **Password Reset**: Reset password
- **Role Changes**: Perubahan peran
- **Security Alerts**: Alert keamanan

### Notification Channels
- **In-app**: Notifikasi dalam aplikasi
- **Email**: Notifikasi email
- **SMS**: Notifikasi SMS
- **Push**: Notifikasi push

## 🔍 Audit & Compliance

### Audit Features
- **User Activity Audit**: Audit aktivitas pengguna
- **Permission Changes**: Perubahan hak akses
- **Login Attempts**: Percobaan login
- **Data Access Log**: Log akses data

### Compliance Requirements
- **Data Privacy**: Privasi data
- **Access Control**: Kontrol akses
- **Audit Trail**: Jejak audit
- **Security Standards**: Standar keamanan

## 📈 Performance Monitoring

### User Performance
- **Login Success Rate**: Tingkat keberhasilan login
- **Session Duration**: Durasi sesi
- **Module Usage**: Penggunaan modul
- **Error Rate**: Tingkat error

### System Performance
- **User Load**: Beban pengguna
- **Response Time**: Waktu respons
- **System Uptime**: Waktu aktif sistem
- **Resource Usage**: Penggunaan sumber daya

## 🔧 Configuration Management

### System Settings
```sql
CREATE TABLE system_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json'),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### User Preferences
```sql
CREATE TABLE user_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    preference_key VARCHAR(100),
    preference_value TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚀 API Documentation

### Authentication API
```php
// Authentication
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password

// User Management
GET /api/users
POST /api/users
GET /api/users/{id}
PUT /api/users/{id}
DELETE /api/users/{id}

// Role Management
GET /api/roles
POST /api/roles
GET /api/roles/{id}
PUT /api/roles/{id}
DELETE /api/roles/{id}

// Permission Management
GET /api/permissions
POST /api/permissions
GET /api/permissions/{id}
PUT /api/permissions/{id}
DELETE /api/permissions/{id}
```
