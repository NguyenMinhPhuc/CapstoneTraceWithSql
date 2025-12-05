# 📊 Hướng dẫn Thiết lập Database Class Advisors

## ✅ Kiểm tra Điều kiện Tiên quyết

Trước khi chạy migration, đảm bảo:
- [ ] SQL Server đã được cài đặt
- [ ] Database đã được tạo
- [ ] Bạn có quyền truy cập vào SQL Server
- [ ] SQLCMD hoặc SQL Server Management Studio đã được cài đặt

---

## 🚀 Cách 1: Chạy qua SQLCMD (PowerShell)

### Bước 1: Mở PowerShell
```powershell
# Mở PowerShell với quyền Admin nếu cần
```

### Bước 2: Điều hướng đến project
```powershell
cd "D:\Projects\CongTy\Done\CapstoneTraceWithSql\Projects"
```

### Bước 3: Chạy migration database
```powershell
# Thay thế YOUR_SERVER, YOUR_DATABASE, YOUR_USER, YOUR_PASSWORD với thông tin của bạn

sqlcmd -S YOUR_SERVER -d YOUR_DATABASE -U YOUR_USER -P YOUR_PASSWORD -i ".\backend\database\migrations\add_class_advisors.sql"
```

**Ví dụ:**
```powershell
sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword123 -i ".\backend\database\migrations\add_class_advisors.sql"
```

### Bước 4: Chạy stored procedures
```powershell
sqlcmd -S YOUR_SERVER -d YOUR_DATABASE -U YOUR_USER -P YOUR_PASSWORD -i ".\backend\database\stored-procedures\class_advisors.sql"
```

**Ví dụ:**
```powershell
sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword123 -i ".\backend\database\stored-procedures\class_advisors.sql"
```

---

## 🚀 Cách 2: Chạy qua SQL Server Management Studio (SSMS)

### Bước 1: Mở SSMS
- Khởi động SQL Server Management Studio
- Kết nối với server của bạn

### Bước 2: Mở file migration
1. **File** → **Open** → **File...**
2. Chọn `backend\database\migrations\add_class_advisors.sql`
3. Nhấp **Open**

### Bước 3: Chạy script
1. Đảm bảo database đúng được chọn trong dropdown (trên cùng bên phải)
2. Nhấp **Execute** (hoặc nhấn F5)
3. Chờ script hoàn thành

### Bước 4: Lặp lại cho stored procedures
1. Mở file `backend\database\stored-procedures\class_advisors.sql`
2. Chọn database đúng
3. Nhấp Execute

---

## 🚀 Cách 3: Chạy qua Node.js Script

### Bước 1: Tạo script helper
Tạo file `backend/scripts/run-migration.js`:

```javascript
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'CapstoneDB',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function runMigration() {
  try {
    console.log('Connecting to database...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();

    // Run migration
    const migrationFile = path.join(__dirname, '../database/migrations/add_class_advisors.sql');
    const migrationScript = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration...');
    await pool.request().batch(migrationScript);
    console.log('✅ Migration completed successfully');

    // Run stored procedures
    const spFile = path.join(__dirname, '../database/stored-procedures/class_advisors.sql');
    const spScript = fs.readFileSync(spFile, 'utf8');
    
    console.log('Running stored procedures...');
    await pool.request().batch(spScript);
    console.log('✅ Stored procedures created successfully');

    await pool.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
```

### Bước 2: Chạy script
```bash
cd backend
node scripts/run-migration.js
```

---

## ✔️ Xác Minh Migration Thành Công

Sau khi chạy migration, kiểm tra xem các bảng đã được tạo:

### Phương pháp 1: SSMS
```sql
-- Kiểm tra bảng class_advisors
SELECT * FROM information_schema.tables WHERE table_name = 'class_advisors';

-- Kiểm tra bảng advisor_profiles
SELECT * FROM information_schema.tables WHERE table_name = 'advisor_profiles';

-- Xem cấu trúc class_advisors
EXEC sp_help 'class_advisors';

-- Xem cấu trúc advisor_profiles
EXEC sp_help 'advisor_profiles';

-- Kiểm tra stored procedures
SELECT * FROM information_schema.routines 
WHERE routine_schema = 'dbo' AND routine_type = 'PROCEDURE' 
AND routine_name LIKE 'sp_%advisor%';
```

### Phương pháp 2: PowerShell
```powershell
sqlcmd -S YOUR_SERVER -d YOUR_DATABASE -U YOUR_USER -P YOUR_PASSWORD -Q "
  SELECT 'class_advisors' as [Table], COUNT(*) as [Rows] FROM class_advisors
  UNION ALL
  SELECT 'advisor_profiles', COUNT(*) FROM advisor_profiles;
"
```

---

## 📋 Cấu Trúc Bảng

### Bảng: class_advisors
```
id                 INT PRIMARY KEY
class_id          INT (FK -> classes)
teacher_id        NVARCHAR(50) (FK -> users)
teacher_type      NVARCHAR(20) - 'supervisor', 'user'
semester          NVARCHAR(20) - 'HK1', 'HK2', 'HK3'
academic_year     NVARCHAR(20) - '2024-2025'
assigned_date     DATETIME2
assigned_by       NVARCHAR(50) (FK -> users) - Admin/Manager
is_active         BIT - 1=Active, 0=Ended
end_date          DATETIME2 - NULL nếu còn hoạt động
notes             NVARCHAR(MAX)
created_at        DATETIME2
updated_at        DATETIME2

UNIQUE CONSTRAINT: (class_id, semester, academic_year, is_active)
```

### Bảng: advisor_profiles
```
id               INT PRIMARY KEY
advisor_id       INT (FK -> class_advisors.id)
profile_type     NVARCHAR(50) - 'general', 'student_list', 'activities', 'assessments'
title            NVARCHAR(255)
content          NVARCHAR(MAX)
profile_data     NVARCHAR(MAX) JSON
attachments      NVARCHAR(MAX) JSON array
created_by       NVARCHAR(50) (FK -> users)
created_at       DATETIME2
updated_at       DATETIME2

FK CASCADE DELETE -> class_advisors (xóa advisor tự động xóa profiles)
```

---

## 📦 Stored Procedures Được Tạo

| Procedure                   | Mô tả                                                     |
| --------------------------- | --------------------------------------------------------- |
| `sp_AssignClassAdvisor`     | Gán giáo viên, tự động deactivate cái cũ                  |
| `sp_GetClassAdvisors`       | Lấy danh sách, có filter theo class/teacher/semester/year |
| `sp_GetClassAdvisorHistory` | Lấy lịch sử phân công của 1 lớp                           |
| `sp_UpdateClassAdvisor`     | Update notes hoặc is_active status                        |
| `sp_DeleteClassAdvisor`     | Xóa (cascade delete profiles)                             |
| `sp_AddAdvisorProfile`      | Thêm hồ sơ                                                |
| `sp_GetAdvisorProfiles`     | Lấy profiles với filter                                   |

---

## 🔧 Environment Variables (Backend)

Đảm bảo `.env` hoặc `.env.local` có:
```env
DB_SERVER=localhost
DB_NAME=CapstoneDB
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_PORT=1433
```

---

## ⚠️ Lỗi Thường Gặp

### "Login failed for user 'sa'"
```
✓ Giải pháp: Kiểm tra username/password
✓ Kiểm tra SQL Server Authentication đã enable
```

### "Could not find a part of the path"
```
✓ Giải pháp: Kiểm tra đường dẫn file SQL đúng
✓ Chạy từ đúng thư mục
```

### "The specified module could not be found"
```
✓ Giải pháp: Cài mssql package: npm install mssql
✓ Đảm bảo Node.js đã cài
```

### "CREATE PROCEDURE permission denied"
```
✓ Giải pháp: User cần có quyền db_owner hoặc CREATE PROCEDURE
✓ Liên hệ SQL Server Admin
```

---

## 🎯 Tiếp Theo

Sau khi migration thành công:

1. **Khởi động Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Kiểm tra API**
   ```bash
   curl http://localhost:3001/api/class-advisors
   ```

3. **Truy cập Frontend**
   - Mở browser: `http://localhost:3000`
   - Đi tới: Admin → Quản lý cố vấn học tập
   - Thử gán giáo viên

---

## 📞 Hỗ Trợ

Nếu gặp sự cố:
- Kiểm tra chi tiết lỗi từ SQLCMD output
- Xem logs trong backend console
- Kiểm tra quyền user database
- Liên hệ IT support

---

**Phiên bản**: v1.0  
**Cập nhật**: 05/12/2025
