# ✅ Hệ Thống Quản Lý Cố Vấn Học Tập - Hướng Dẫn Hoàn Chỉnh

## 📖 Nội Dung
- [Tổng Quan](#-tổng-quan)
- [Các Thành Phần](#-các-thành-phần)
- [Cách Sử Dụng](#-cách-sử-dụng)
- [Cài Đặt Database](#-cài-đặt-database)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng Quan

### Tính Năng Chính
Hệ thống cho phép:
- ✅ **Gán giáo viên** làm chủ nhiệm/cố vấn học tập cho lớp **theo từng học kỳ**
- ✅ **Quản lý hồ sơ** cố vấn (thông tin chung, danh sách lớp, hoạt động, đánh giá)
- ✅ **Xem lịch sử** phân công với timeline đầy đủ (ai, khi nào, bao lâu)
- ✅ **Truy cập lịch sử** - Giáo viên mới vẫn có thể xem hồ sơ của những người đi trước
- ✅ **Tự động quản lý** - Khi gán GV mới, GV cũ tự động chuyển sang "Đã kết thúc"

### Yêu Cầu Hệ Thống
```
✓ SQL Server 2016+
✓ Node.js 18+
✓ React 18+
✓ Next.js 14+
```

---

## 🏗️ Các Thành Phần

### 1️⃣ Database Layer
📁 **Thư mục**: `backend/database/`

#### Migrations
- **File**: `migrations/add_class_advisors.sql`
- **Tạo**: 2 bảng, 6 indexes, 2 triggers
- **Idempotent**: Có thể chạy lại nhiều lần an toàn

#### Stored Procedures
- **File**: `stored-procedures/class_advisors.sql`
- **Số lượng**: 7 procedures
- **Chức năng**:
  - `sp_AssignClassAdvisor` - Gán GV mới (auto-deactivate cũ)
  - `sp_GetClassAdvisors` - Lấy danh sách
  - `sp_GetClassAdvisorHistory` - Lấy lịch sử
  - `sp_UpdateClassAdvisor` - Cập nhật notes/status
  - `sp_DeleteClassAdvisor` - Xóa (cascade)
  - `sp_AddAdvisorProfile` - Thêm hồ sơ
  - `sp_GetAdvisorProfiles` - Lấy hồ sơ

### 2️⃣ Backend Layer
📁 **Thư mục**: `backend/src/`

#### Repository
- **File**: `repositories/classAdvisors.repository.ts`
- **Chức năng**: Data access layer
- **Methods**: 8 methods tương ứng với stored procedures

#### Controller
- **File**: `controllers/classAdvisors.controller.ts`
- **Chức năng**: HTTP request handling
- **Features**: JWT auth, role-based access, error handling

#### Routes
- **File**: `routes/classAdvisors.routes.ts`
- **Endpoints**:
  ```
  POST   /api/class-advisors                    - Gán GV
  GET    /api/class-advisors                    - Lấy danh sách
  GET    /api/class-advisors/history/:classId   - Lấy lịch sử
  GET    /api/class-advisors/profiles           - Lấy hồ sơ
  POST   /api/class-advisors/profiles           - Thêm hồ sơ
  PUT    /api/class-advisors/:id                - Cập nhật
  DELETE /api/class-advisors/:id                - Xóa
  ```

### 3️⃣ Frontend Layer
📁 **Thư mục**: `src/`

#### Service
- **File**: `services/classAdvisors.service.ts`
- **Chức năng**: API client
- **Methods**: 7 methods mirroring backend endpoints

#### Components
| Component    | Tệp                                | Chức Năng                     |
| ------------ | ---------------------------------- | ----------------------------- |
| 📋 Management | `class-advisor-management.tsx`     | Bảng danh sách chính, quản lý |
| 📝 Form       | `class-advisor-form.tsx`           | Form gán GV (dialog)          |
| 📜 History    | `class-advisor-history-dialog.tsx` | Timeline lịch sử              |
| 👤 Profiles   | `advisor-profiles-dialog.tsx`      | Quản lý hồ sơ + lịch sử       |

#### Page
- **File**: `app/admin/class-advisors/page.tsx`
- **Route**: `/admin/class-advisors`
- **Quyền**: Admin only

---

## 🚀 Cách Sử Dụng

### 1️⃣ Gán Giáo Viên Chủ Nhiệm

**Điều hướng:**
```
Admin Dashboard → Quản lý cố vấn học tập → "+ Gán giáo viên chủ nhiệm"
```

**Form Fields:**
```
Lớp*              [Chọn từ dropdown] (vd: IT19A)
Giáo viên*        [Chọn từ dropdown] (vd: Nguyễn Văn A)
Học kỳ*           [HK1 / HK2 / HK3]
Năm học*          [YYYY-YYYY] (vd: 2024-2025)
Ghi chú           [Tùy chọn]
```

**Hành động auto:**
- ✅ Ghi nhận ngày gán (assigned_date = hôm nay)
- ✅ Tìm GV cũ cho class này + semester/year này
- ✅ Nếu tìm thấy, set `is_active = 0` và `end_date = hôm nay`
- ✅ Thêm bản ghi mới với `is_active = 1`

### 2️⃣ Xem Lịch Sử Phân Công

**Bấm nút:** 📜 trong cột "Hành động"

**Hiển thị:**
```
Timeline với các "chấm" (dots):
├─ 🟢 Nguyễn Văn A (Hiện tại)
│  ├─ Ngày bắt đầu: 01/09/2024
│  ├─ Học kỳ: HK1 2024-2025
│  └─ Trạng thái: Đang chủ nhiệm
├─ ⚪ Trần Thị B (Cũ)
│  ├─ Ngày bắt đầu: 01/09/2023
│  ├─ Ngày kết thúc: 31/08/2024
│  ├─ Số ngày phục vụ: 365 ngày
│  └─ Trạng thái: Đã kết thúc
```

### 3️⃣ Quản Lý Hồ Sơ Cố Vấn

**Bấm nút:** 👤 trong cột "Hành động"

**Dialog mở với 2 tabs:**

#### Tab 1: Hồ sơ hiện tại
- Danh sách các hồ sơ của GV hiện tại
- Nút "+ Thêm hồ sơ mới"
- Form nhập:
  ```
  Loại hồ sơ: [Thông tin chung / Danh sách lớp / Hoạt động / Đánh giá]
  Tiêu đề: [...]
  Nội dung: [...]
  ```

#### Tab 2: Lịch sử lớp
- Tất cả hồ sơ từ GV hiện tại + những GV trước đó
- Hồ sơ hiện tại được đánh dấu badge "Hiện tại"
- Hiển thị: GV, học kỳ, năm, ngày tạo, nội dung

### 4️⃣ Các Hành Động Khác

| Hành động          | Nút | Kết quả                       |
| ------------------ | --- | ----------------------------- |
| Xem lịch sử        | 📜   | Mở timeline                   |
| Xem hồ sơ          | 👤   | Mở dialog hồ sơ               |
| Kết thúc phân công | ❌   | Set is_active=0, end_date=now |
| Xóa phân công      | 🗑️   | Xóa (cascade → hồ sơ)         |

---

## 🗄️ Cài Đặt Database

### Bước 1: Chuẩn Bị
- ✓ SQL Server đã cài
- ✓ Database đã tạo
- ✓ Có quyền truy cập

### Bước 2: Chạy Migration

**Phương án A - PowerShell (SQLCMD):**
```powershell
cd D:\Projects\CongTy\Done\CapstoneTraceWithSql\Projects

sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword -i ".\backend\database\migrations\add_class_advisors.sql"
sqlcmd -S localhost -d CapstoneDB -U sa -P YourPassword -i ".\backend\database\stored-procedures\class_advisors.sql"
```

**Phương án B - SQL Server Management Studio:**
1. Mở SSMS
2. Kết nối database
3. File → Open → Select file
4. Chọn database → F5 (Execute)
5. Lặp lại cho cả 2 file

**Phương án C - Node Script:**
```bash
cd backend
npm install
node scripts/run-migration.js
```

### Bước 3: Xác Minh

```sql
-- Kiểm tra bảng
SELECT * FROM information_schema.tables 
WHERE table_name IN ('class_advisors', 'advisor_profiles');

-- Kiểm tra procedures
SELECT * FROM information_schema.routines 
WHERE routine_name LIKE 'sp_%advisor%';

-- Test insert
EXEC sp_GetClassAdvisors;
```

---

## 📡 API Reference

### POST /api/class-advisors
**Gán giáo viên chủ nhiệm**

```http
POST /api/class-advisors
Content-Type: application/json
Authorization: Bearer <token>

{
  "class_id": 1,
  "teacher_id": "user-123",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "notes": "Phân công mới"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "class_id": 1,
    "class_name": "IT19A",
    "teacher_id": "user-123",
    "teacher_name": "Nguyễn Văn A",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "is_active": true,
    "assigned_date": "2025-12-05T10:30:00Z"
  }
}
```

### GET /api/class-advisors
**Lấy danh sách phân công**

```http
GET /api/class-advisors?class_id=1&semester=HK1&is_active=true
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "class_id": 1,
      "class_name": "IT19A",
      "teacher_name": "Nguyễn Văn A",
      "semester": "HK1",
      "academic_year": "2024-2025",
      "is_active": true,
      "student_count": 35,
      "profile_count": 3
    }
  ]
}
```

### GET /api/class-advisors/history/:classId
**Lấy lịch sử phân công**

```http
GET /api/class-advisors/history/1
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "teacher_name": "Nguyễn Văn A",
      "semester": "HK1",
      "academic_year": "2024-2025",
      "assigned_date": "2025-12-05T00:00:00Z",
      "end_date": null,
      "is_active": true,
      "days_served": 1,
      "notes": "Phân công hiện tại"
    }
  ]
}
```

### POST /api/class-advisors/profiles
**Thêm hồ sơ cố vấn**

```http
POST /api/class-advisors/profiles
Content-Type: application/json
Authorization: Bearer <token>

{
  "advisor_id": 1,
  "profile_type": "general",
  "title": "Thông tin chung về lớp IT19A",
  "content": "Lớp có 35 sinh viên...",
  "attachments": ["https://example.com/file1.pdf"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "advisor_id": 1,
    "profile_type": "general",
    "title": "Thông tin chung",
    "created_at": "2025-12-05T10:30:00Z"
  }
}
```

### GET /api/class-advisors/profiles
**Lấy hồ sơ**

```http
GET /api/class-advisors/profiles?advisor_id=1
GET /api/class-advisors/profiles?class_id=1

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "advisor_id": 1,
      "class_name": "IT19A",
      "teacher_name": "Nguyễn Văn A",
      "profile_type": "general",
      "title": "Thông tin chung",
      "content": "...",
      "created_at": "2025-12-05T10:30:00Z"
    }
  ]
}
```

### PUT /api/class-advisors/:id
**Cập nhật phân công**

```http
PUT /api/class-advisors/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "notes": "Ghi chú mới",
  "is_active": false
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### DELETE /api/class-advisors/:id
**Xóa phân công**

```http
DELETE /api/class-advisors/1
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Class advisor deleted successfully"
}
```

---

## 🔐 Quyền Truy Cập

```
| Role       | POST | GET | PUT | DELETE | Profiles |
| ---------- | ---- | --- | --- | ------ | -------- |
| Admin      | ✅    | ✅   | ✅   | ✅      | ✅        |
| Manager    | ✅    | ✅   | ✅   | ❌      | ✅        |
| Supervisor | ❌    | ✅   | ❌   | ❌      | ✅        |
| Student    | ❌    | ❌   | ❌   | ❌      | ❌        |
```

---

## 🐛 Troubleshooting

### Tình Huống 1: Database Migration Thất Bại
```
❌ Lỗi: "CREATE TABLE permission denied"

✅ Giải pháp:
1. Kiểm tra user có quyền db_owner
2. Hoặc Grant quyền: GRANT CREATE TABLE TO [user];
3. Thử lại migration
```

### Tình Huống 2: API Error 401 Unauthorized
```
❌ Lỗi: "Unauthorized"

✅ Giải pháp:
1. Kiểm tra token hợp lệ
2. Kiểm tra header: Authorization: Bearer <token>
3. Kiểm tra token chưa hết hạn
```

### Tình Huống 3: Form Không Tải Được Danh Sách Lớp
```
❌ Lỗi: "Không thể tải danh sách lớp"

✅ Giải pháp:
1. Kiểm tra GET /api/classes endpoint có hoạt động
2. Kiểm tra xem database có dữ liệu lớp
3. Kiểm tra CORS settings
4. Xem browser console (F12) để xem chi tiết lỗi
```

### Tình Huống 4: Gán GV Nhưng Không Có Kết Quả
```
❌ Lỗi: "Phân công không được tạo"

✅ Giải pháp:
1. Kiểm tra stored procedure sp_AssignClassAdvisor
2. Kiểm tra FK constraints:
   - class_id tồn tại trong bảng classes
   - teacher_id tồn tại trong bảng users
3. Kiểm tra constraint UNIQUE (class_id, semester, academic_year, is_active)
4. Xem SQL Server error logs
```

### Tình Huống 5: Port Bị Chiếm
```
❌ Lỗi: "EADDRINUSE: address already in use :::3001"

✅ Giải pháp:
1. Tìm process: netstat -ano | findstr :3001 (PowerShell)
2. Đóng process: taskkill /PID <PID> /F
3. Hoặc thay đổi port trong .env
```

---

## 📚 Tệp Hướng Dẫn

| Tệp                                 | Mô tả                          |
| ----------------------------------- | ------------------------------ |
| `docs/CLASS_ADVISOR_USAGE_GUIDE.md` | 📘 Hướng dẫn chi tiết sử dụng   |
| `docs/DATABASE_SETUP_GUIDE.md`      | 🗄️ Hướng dẫn cài đặt database   |
| `docs/CLASS_ADVISORS_GUIDE.md`      | 📖 Tài liệu kỹ thuật hoàn chỉnh |

---

## 🎯 Checklist Triển Khai

```
□ Chạy database migration
  □ migrations/add_class_advisors.sql
  □ stored-procedures/class_advisors.sql
□ Khởi động backend server
  □ npm run dev (backend folder)
  □ Kiểm tra port 3001
□ Khởi động frontend server
  □ npm run dev (root folder)
  □ Kiểm tra port 3000
□ Test tính năng cơ bản
  □ Gán GV mới
  □ Xem lịch sử
  □ Thêm hồ sơ
  □ Xem hồ sơ lịch sử
□ Test quyền truy cập
  □ Admin có thể xóa
  □ Manager không thể xóa
  □ Supervisor không thể gán
□ Load test (tuỳ chọn)
  □ Thêm 1000+ phân công
  □ Kiểm tra performance
```

---

## 📞 Support

### Vấn đề Thường Gặp
- **Database**: Xem `DATABASE_SETUP_GUIDE.md`
- **Sử dụng**: Xem `CLASS_ADVISOR_USAGE_GUIDE.md`
- **Kỹ thuật**: Xem `CLASS_ADVISORS_GUIDE.md`

### Liên Hệ
- Kiểm tra logs: `backend/logs/`
- Browser console: F12 → Console tab
- Database logs: SQL Server Management Studio

---

**Phiên bản**: v1.0  
**Cập nhật**: 05/12/2025  
**Trạng thái**: ✅ Sẵn sàng triển khai
