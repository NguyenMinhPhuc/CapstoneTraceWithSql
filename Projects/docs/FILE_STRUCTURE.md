# 🗂️ Cấu Trúc Project - Hệ Thống Cố Vấn Học Tập

## 📍 Vị Trí Các Tệp Chính

### 🗄️ Database Layer
```
backend/database/
├── migrations/
│   └── add_class_advisors.sql          ← 🔥 Chạy cái này trước
│       ├── CREATE TABLE class_advisors
│       ├── CREATE TABLE advisor_profiles
│       └── Indexes + Triggers
│
└── stored-procedures/
    └── class_advisors.sql              ← 🔥 Chạy cái này thứ 2
        ├── sp_AssignClassAdvisor
        ├── sp_GetClassAdvisors
        ├── sp_GetClassAdvisorHistory
        ├── sp_UpdateClassAdvisor
        ├── sp_DeleteClassAdvisor
        ├── sp_AddAdvisorProfile
        └── sp_GetAdvisorProfiles
```

### 🔌 Backend API Layer
```
backend/src/
├── repositories/
│   └── classAdvisors.repository.ts     ← Data access layer
│       └── 8 methods: assign, getAll, getHistory, update, delete, addProfile, getProfiles
│
├── controllers/
│   └── classAdvisors.controller.ts     ← HTTP request handlers
│       └── 7 endpoints with JWT auth
│
├── routes/
│   └── classAdvisors.routes.ts         ← Route definitions
│       └── POST, GET, PUT, DELETE routes
│
└── server.ts                           ← ✏️ Updated to include routes
    └── app.use("/api/class-advisors", classAdvisorsRoutes)
```

### 🎨 Frontend Layer
```
src/
├── services/
│   └── classAdvisors.service.ts        ← API client service
│       └── 7 methods calling backend
│
├── components/
│   ├── class-advisor-management.tsx    ← 📋 Main table component
│   │   ├── Table of advisors
│   │   ├── Action buttons
│   │   └── Dialog management
│   │
│   ├── class-advisor-form.tsx          ← 📝 Assignment form
│   │   ├── Class select
│   │   ├── Teacher select
│   │   ├── Semester select
│   │   └── Academic year input
│   │
│   ├── class-advisor-history-dialog.tsx ← 📜 History timeline
│   │   ├── Timeline visualization
│   │   ├── Teacher info
│   │   └── Duration calculation
│   │
│   └── advisor-profiles-dialog.tsx     ← 👤 Profile management
│       ├── Current advisor profiles (tab 1)
│       ├── Class history profiles (tab 2)
│       └── Add new profile form
│
└── app/
    └── admin/
        └── class-advisors/
            └── page.tsx                 ← 📄 Admin page
                └── Wraps ClassAdvisorManagement
```

---

## 🚀 Quick Start

### 1️⃣ Thiết Lập Database
```bash
# PowerShell - chạy 2 lệnh này lần lượt
sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword -i ".\backend\database\migrations\add_class_advisors.sql"
sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword -i ".\backend\database\stored-procedures\class_advisors.sql"
```

### 2️⃣ Khởi Động Backend
```bash
cd backend
npm install
npm run dev
# ✓ Server chạy tại http://localhost:3001
```

### 3️⃣ Khởi Động Frontend
```bash
# Terminal khác
npm install
npm run dev
# ✓ App chạy tại http://localhost:3000
```

### 4️⃣ Truy Cập Tính Năng
```
Đăng nhập → Admin Dashboard → Quản lý cố vấn học tập
URL: http://localhost:3000/admin/class-advisors
```

---

## 📋 Bảng Dữ Liệu Được Tạo

### Bảng: class_advisors
```sql
CREATE TABLE class_advisors (
    id                INT PRIMARY KEY,
    class_id          INT FK,              -- Lớp học
    teacher_id        NVARCHAR(50) FK,     -- Giáo viên
    semester          NVARCHAR(20),        -- HK1, HK2, HK3
    academic_year     NVARCHAR(20),        -- 2024-2025
    assigned_date     DATETIME2,           -- Ngày gán
    assigned_by       NVARCHAR(50) FK,     -- Ai gán
    is_active         BIT,                 -- 1=Active, 0=Ended
    end_date          DATETIME2,           -- Ngày kết thúc
    notes             NVARCHAR(MAX),       -- Ghi chú
    created_at        DATETIME2,           -- Ngày tạo
    updated_at        DATETIME2            -- Lần cập nhật cuối
);

-- UNIQUE Constraint: chỉ 1 GV hoạt động per semester/year
```

### Bảng: advisor_profiles
```sql
CREATE TABLE advisor_profiles (
    id               INT PRIMARY KEY,
    advisor_id       INT FK,              -- FK to class_advisors
    profile_type     NVARCHAR(50),        -- general, student_list, activities, assessments
    title            NVARCHAR(255),       -- Tiêu đề
    content          NVARCHAR(MAX),       -- Nội dung
    profile_data     NVARCHAR(MAX),       -- JSON
    attachments      NVARCHAR(MAX),       -- JSON array
    created_by       NVARCHAR(50) FK,     -- Người tạo
    created_at       DATETIME2,
    updated_at       DATETIME2
);

-- CASCADE DELETE: xóa advisor tự động xóa profiles
```

---

## 🔌 API Endpoints

| Method     | Endpoint                               | Quyền                      | Chức năng     |
| ---------- | -------------------------------------- | -------------------------- | ------------- |
| **POST**   | `/api/class-advisors`                  | Admin, Manager             | Gán GV        |
| **GET**    | `/api/class-advisors`                  | Authenticated              | Lấy danh sách |
| **GET**    | `/api/class-advisors/history/:classId` | Authenticated              | Lấy lịch sử   |
| **GET**    | `/api/class-advisors/profiles`         | Authenticated              | Lấy hồ sơ     |
| **POST**   | `/api/class-advisors/profiles`         | Admin, Manager, Supervisor | Thêm hồ sơ    |
| **PUT**    | `/api/class-advisors/:id`              | Admin, Manager             | Cập nhật      |
| **DELETE** | `/api/class-advisors/:id`              | Admin                      | Xóa           |

---

## 📚 Tài Liệu

| Tệp                                 | Nội dung                              |
| ----------------------------------- | ------------------------------------- |
| `docs/QUICK_START_GUIDE.md`         | ⚡ Bắt đầu nhanh (bạn đang đọc)        |
| `docs/DATABASE_SETUP_GUIDE.md`      | 🗄️ Hướng dẫn cài đặt database chi tiết |
| `docs/CLASS_ADVISOR_USAGE_GUIDE.md` | 📘 Hướng dẫn sử dụng cho người dùng    |
| `docs/CLASS_ADVISORS_GUIDE.md`      | 📖 Tài liệu kỹ thuật toàn bộ           |

---

## ✅ Danh Sách Kiểm Tra Triển Khai

```
[1] Database Setup
    [ ] Chạy migrations/add_class_advisors.sql
    [ ] Chạy stored-procedures/class_advisors.sql
    [ ] Xác minh: SELECT * FROM class_advisors; (không lỗi)

[2] Backend
    [ ] npm install (backend folder)
    [ ] npm run dev
    [ ] Kiểm tra: GET http://localhost:3001/api/class-advisors (200 OK)

[3] Frontend
    [ ] npm install (root folder)
    [ ] npm run dev
    [ ] Kiểm tra: http://localhost:3000 (load thành công)

[4] Tính Năng
    [ ] Đăng nhập Admin
    [ ] Điều hướng tới /admin/class-advisors
    [ ] Thấy bảng danh sách
    [ ] Thấy nút "+ Gán giáo viên chủ nhiệm"
    [ ] Click nút, form mở
    [ ] Điền form, submit thành công
    [ ] Dữ liệu hiển thị trong bảng

[5] Quy trình Hoàn Chỉnh
    [ ] Gán GV lần 1 cho lớp
    [ ] Gán GV khác cho cùng lớp (kỳ khác)
    [ ] Gán GV khác cho cùng lớp + kỳ (kiểm tra auto-deactivate)
    [ ] Xem lịch sử (📜 button)
    [ ] Xem hồ sơ (👤 button)
    [ ] Thêm hồ sơ mới
    [ ] Xem hồ sơ lịch sử
    [ ] Deactivate phân công (❌ button)
    [ ] Xóa phân công (🗑️ button)
```

---

## 🎯 Workflow Điển Hình

### Kịch Bản: Gán Chủ Nhiệm cho Lớp IT19A năm 2024-2025

```
1. Admin Đăng Nhập
   └─ Quyền: Admin role

2. Điều Hướng
   └─ Admin Menu → Quản lý cố vấn học tập

3. Mở Dialog Gán
   └─ Click "+ Gán giáo viên chủ nhiệm"

4. Điền Form
   ├─ Lớp: [IT19A]
   ├─ Giáo viên: [Nguyễn Văn A]
   ├─ Học kỳ: [HK1]
   ├─ Năm học: [2024-2025]
   └─ Ghi chú: [Phân công đầu kỳ]

5. Submit
   └─ POST /api/class-advisors
       ├─ Gọi sp_AssignClassAdvisor
       ├─ Tạo bản ghi mới
       └─ Auto: kết thúc GV cũ (nếu có)

6. Thành Công
   ├─ Toast: "Đã gán giáo viên chủ nhiệm"
   ├─ Bảng reload tự động
   └─ Dữ liệu mới hiển thị

7. Xem Lịch Sử
   ├─ Click 📜 button
   ├─ Dialog hiển thị timeline
   └─ Thấy Nguyễn Văn A là GV hiện tại

8. Thêm Hồ Sơ
   ├─ Click 👤 button
   ├─ Tab "Hồ sơ hiện tại"
   ├─ Click "+ Thêm hồ sơ mới"
   ├─ Điền: Loại=Thông tin chung, Tiêu đề, Nội dung
   └─ Save

9. Xem Hồ Sơ Lịch Sử
   ├─ Click 👤 button → Tab "Lịch sử lớp"
   └─ Hiển thị tất cả hồ sơ (hiện tại + cũ)

10. Thay Đổi Chủ Nhiệm (sau)
    ├─ Click "+ Gán giáo viên chủ nhiệm" lại
    ├─ Lớp: [IT19A]
    ├─ Giáo viên: [Trần Thị B] ← khác
    ├─ Học kỳ: [HK1]
    ├─ Năm học: [2024-2025]
    └─ Nguyễn Văn A tự động: is_active=0, end_date=now
```

---

## 🔍 Kiểm Tra Health Status

### Database
```sql
-- Kiểm tra bảng tồn tại
SELECT * FROM information_schema.tables 
WHERE table_name IN ('class_advisors', 'advisor_profiles');

-- Kiểm tra stored procedures
SELECT * FROM information_schema.routines 
WHERE routine_name LIKE 'sp_%advisor%';

-- Test 1 stored procedure
EXEC sp_GetClassAdvisors;
```

### Backend
```bash
# Terminal 1 - Backend folder
npm run dev
# ✓ Xem "listening on port 3001"

# Terminal 2
curl http://localhost:3001/api/class-advisors
# ✓ Phải return JSON, không error
```

### Frontend
```bash
# Terminal - Root folder
npm run dev
# ✓ Xem "localhost:3000"

# Browser
http://localhost:3000/admin/class-advisors
# ✓ Trang load, thấy bảng danh sách
```

---

## 🐛 Debug Tips

### 1. Check Database Connection
```bash
cd backend
node -e "
const sql = require('mssql');
const pool = new sql.ConnectionPool({...});
pool.connect().then(() => console.log('✓ Connected')).catch(err => console.error(err));
"
```

### 2. Monitor API Calls
```javascript
// Browser console (F12)
// Network tab → Filter by "class-advisors"
// Xem request/response
```

### 3. Check Component Rendering
```javascript
// React DevTools (F12 → Components)
// Tìm ClassAdvisorManagement
// Check props, state
```

### 4. Check Role-Based Access
```javascript
// Dùng account khác role
// Admin: có thể xóa
// Manager: không thể xóa
// Supervisor: chỉ có thể xem + thêm hồ sơ
```

---

## 🎓 Learning Path

1. **Hiểu Database** (15 phút)
   - Đọc: `DATABASE_SETUP_GUIDE.md`
   - Chạy: 2 SQL files

2. **Hiểu API** (15 phút)
   - Đọc: API Reference trong `QUICK_START_GUIDE.md`
   - Test: Mỗi endpoint với Postman/curl

3. **Hiểu UI** (15 phút)
   - Truy cập: /admin/class-advisors
   - Click các button
   - Thêm dữ liệu test

4. **Tìm Hiểu Code** (30 phút)
   - Đọc: `src/components/class-advisor-management.tsx`
   - Đọc: `src/services/classAdvisors.service.ts`
   - Đọc: `backend/src/controllers/classAdvisors.controller.ts`

5. **Mở Rộng Tính Năng** (khi cần)
   - Thêm field: backend → frontend
   - Thêm dialog: tạo component mới
   - Thêm stored procedure: cập nhật repository

---

## 📞 Liên Hệ

### Logs
```bash
# Frontend console
http://localhost:3000 → F12 → Console

# Backend console
npm run dev output

# Database logs
SQL Server Management Studio → View Errors
```

### Commonly Asked Questions

**Q: Làm cách nào để xóa hết dữ liệu test?**
```sql
DELETE FROM advisor_profiles;
DELETE FROM class_advisors;
DBCC CHECKIDENT ('class_advisors', RESEED, 0);
```

**Q: Làm cách nào để đặt lại thứ tự ID?**
```sql
DBCC CHECKIDENT ('class_advisors', RESEED, 0);
DBCC CHECKIDENT ('advisor_profiles', RESEED, 0);
```

**Q: Làm cách nào để rollback migration?**
```sql
DROP TABLE advisor_profiles;
DROP TABLE class_advisors;
```

---

**Phiên bản**: v1.0  
**Cập nhật**: 05/12/2025  
**Status**: ✅ Sẵn sàng sử dụng
