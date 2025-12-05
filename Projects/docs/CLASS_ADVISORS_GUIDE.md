# Hệ thống Quản lý Cố vấn Học tập / Chủ nhiệm

## ✅ Đã hoàn thành

### 1. Database
- ✅ **Bảng `class_advisors`**: Lưu phân công GV chủ nhiệm theo học kỳ
  - Theo dõi: lớp, GV, học kỳ, năm học, trạng thái active
  - Constraint đảm bảo chỉ 1 GV active per class/semester/year
  - Tự động deactivate phân công cũ khi assign mới
  
- ✅ **Bảng `advisor_profiles`**: Lưu hồ sơ cố vấn học tập
  - JSON flexible cho nhiều loại hồ sơ
  - Link đến advisor_id (không phải class_id)
  - GV mới vẫn xem được hồ sơ cũ thông qua class_id

### 2. Backend API
- ✅ Repository: `classAdvisors.repository.ts`
- ✅ Controller: `classAdvisors.controller.ts`
- ✅ Routes: `/api/class-advisors`
- ✅ Stored Procedures: 7 SPs đầy đủ

### 3. Frontend
- ✅ Service: `classAdvisors.service.ts`
- ✅ Component chính: `class-advisor-management.tsx`

## 📋 API Endpoints

### Class Advisors
```
GET    /api/class-advisors?class_id=1&teacher_id=xxx&semester=HK1&academic_year=2024-2025&is_active=true
POST   /api/class-advisors
PUT    /api/class-advisors/:id
DELETE /api/class-advisors/:id
GET    /api/class-advisors/history/:classId
```

### Advisor Profiles
```
GET    /api/class-advisors/profiles?advisor_id=1&class_id=1&profile_type=general
POST   /api/class-advisors/profiles
```

## 🎯 Tính năng chính

### 1. Phân công GV theo học kỳ
- Chọn lớp, GV, học kỳ, năm học
- Tự động deactivate phân công cũ khi assign mới
- Ghi lại người phân công (admin/manager)
- Theo dõi ngày bắt đầu / kết thúc

### 2. Lịch sử phân công
- Xem tất cả GV đã chủ nhiệm lớp
- Thời gian phục vụ
- Lọc theo học kỳ, năm học

### 3. Hồ sơ cố vấn học tập
- GV hiện tại thêm/sửa hồ sơ
- GV mới vẫn xem được hồ sơ cũ
- Nhiều loại hồ sơ: general, student_list, activities, assessments
- JSON flexible cho dữ liệu tùy chỉnh

## 🔧 Cài đặt

### Bước 1: Chạy migration
```sql
-- File: backend/database/migrations/add_class_advisors.sql
-- Tạo bảng class_advisors và advisor_profiles
```

### Bước 2: Chạy stored procedures
```sql
-- File: backend/database/stored-procedures/class_advisors.sql
-- 7 stored procedures
```

### Bước 3: Backend đã sẵn sàng
- Repository, controller, routes đã được tạo
- Đã thêm vào server.ts

### Bước 4: Frontend components cần tạo

#### a. `class-advisor-form.tsx` - Form phân công
```tsx
interface ClassAdvisorFormProps {
  onSuccess: () => void;
  defaultClassId?: number;
}

// Form fields:
// - Select lớp (nếu không có defaultClassId)
// - Select GV (dropdown users với role supervisor)
// - Select học kỳ (HK1, HK2, HK3)
// - Input năm học (2024-2025)
// - Textarea ghi chú
```

#### b. `class-advisor-history-dialog.tsx` - Xem lịch sử
```tsx
interface ClassAdvisorHistoryDialogProps {
  classId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Hiển thị:
// - Timeline các GV đã chủ nhiệm
// - Thời gian phục vụ
// - Trạng thái active/ended
```

#### c. `advisor-profiles-dialog.tsx` - Quản lý hồ sơ
```tsx
interface AdvisorProfilesDialogProps {
  advisor: ClassAdvisor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Features:
// - List profiles của advisor
// - Add new profile entry
// - View all profiles của class (include old advisors)
// - Profile types: general, student_list, activities, assessments
```

## 📝 Use Cases

### Use Case 1: Admin phân công GV chủ nhiệm
```typescript
// 1. Admin chọn lớp: "CNTT1-K18"
// 2. Chọn GV: "Nguyễn Văn A"
// 3. Chọn học kỳ: "HK1"
// 4. Nhập năm học: "2024-2025"
// 5. Submit -> API tự động:
//    - Deactivate phân công cũ (nếu có)
//    - Create phân công mới với is_active=true
```

### Use Case 2: GV xem hồ sơ lớp
```typescript
// 1. GV login, vào trang "Lớp chủ nhiệm"
// 2. Thấy danh sách lớp đang chủ nhiệm
// 3. Click vào lớp -> Xem hồ sơ cố vấn
// 4. Có thể xem cả hồ sơ của GV trước (thông qua class_id)
```

### Use Case 3: Chuyển GV chủ nhiệm
```typescript
// Lớp "CNTT1-K18" HK1/2024-2025:
// - GV cũ: "Nguyễn Văn A" (is_active=true)
// - Admin assign GV mới: "Trần Thị B"
// 
// Kết quả:
// - Record cũ: is_active=false, end_date=now
// - Record mới: is_active=true, assigned_date=now
// 
// GV mới "Trần Thị B" vẫn xem được hồ sơ của GV "Nguyễn Văn A"
// thông qua query: WHERE class_id = X
```

## 🎨 UI Design

### Trang quản lý (cho Admin/Manager)
```
┌─────────────────────────────────────────────────┐
│ Quản lý Cố vấn Học tập          [+ Phân công GV]│
├─────────────────────────────────────────────────┤
│ Lớp      │ GV        │ HK  │ Năm   │ Trạng thái │
│ CNTT1-K18│ Nguyễn V.A│ HK1 │2024-25│ 🟢 Active  │
│ CNTT2-K18│ Trần T. B │ HK1 │2024-25│ 🟢 Active  │
│ CNTT3-K18│ Lê V. C   │ HK2 │2023-24│ ⚪ Ended   │
└─────────────────────────────────────────────────┘
```

### Trang GV (cho Supervisor)
```
┌─────────────────────────────────────────────────┐
│ Lớp chủ nhiệm của tôi                           │
├─────────────────────────────────────────────────┤
│ 📚 CNTT1-K18 (35 SV)          [Xem hồ sơ] [📊] │
│    HK1 2024-2025 - Đang hoạt động              │
│                                                 │
│ 📚 CNTT2-K17 (32 SV)          [Xem hồ sơ] [📊] │
│    HK2 2023-2024 - Đã kết thúc                 │
└─────────────────────────────────────────────────┘
```

## 🔒 Phân quyền

- **Admin/Manager**: 
  - Phân công GV
  - Xem tất cả phân công
  - Kết thúc / Xóa phân công
  
- **Supervisor**:
  - Xem lớp mình chủ nhiệm
  - Thêm/sửa hồ sơ cố vấn
  - Xem hồ sơ của GV trước

- **Student**:
  - Xem GV chủ nhiệm hiện tại
  - Xem thông tin liên hệ GV

## 🚀 Mở rộng tương lai

1. **Báo cáo tổng hợp**
   - Số lượng lớp/GV theo học kỳ
   - Thống kê hoạt động cố vấn
   
2. **Thông báo tự động**
   - Notify GV khi được phân công
   - Notify student khi đổi GV chủ nhiệm

3. **Template hồ sơ**
   - Mẫu hồ sơ chuẩn theo loại
   - Import/export Excel

4. **Đánh giá**
   - SV đánh giá GV chủ nhiệm
   - Feedback cuối học kỳ

## 📊 Database Schema

### class_advisors
```sql
id                INT IDENTITY(1,1) PRIMARY KEY
class_id          INT NOT NULL
teacher_id        NVARCHAR(50) NOT NULL
teacher_type      NVARCHAR(20) DEFAULT 'supervisor'
semester          NVARCHAR(20) NOT NULL  -- 'HK1', 'HK2', 'HK3'
academic_year     NVARCHAR(20) NOT NULL  -- '2024-2025'
assigned_date     DATETIME2 DEFAULT NOW
assigned_by       NVARCHAR(50) NULL
is_active         BIT DEFAULT 1
end_date          DATETIME2 NULL
notes             NVARCHAR(MAX) NULL
created_at        DATETIME2
updated_at        DATETIME2
```

### advisor_profiles
```sql
id                INT IDENTITY(1,1) PRIMARY KEY
advisor_id        INT NOT NULL  -- FK to class_advisors
profile_type      NVARCHAR(50) DEFAULT 'general'
title             NVARCHAR(255) NULL
content           NVARCHAR(MAX) NULL
profile_data      NVARCHAR(MAX) NULL  -- JSON
attachments       NVARCHAR(MAX) NULL  -- JSON array
created_by        NVARCHAR(50) NULL
created_at        DATETIME2
updated_at        DATETIME2
```

## 🧪 Test Cases

1. ✅ Assign GV cho lớp lần đầu
2. ✅ Assign GV mới (deactivate GV cũ)
3. ✅ Xem lịch sử phân công lớp
4. ✅ GV thêm hồ sơ cố vấn
5. ✅ GV mới xem hồ sơ của GV cũ
6. ✅ Filter theo học kỳ, năm học
7. ✅ Kết thúc phân công giữa chừng
8. ✅ Xóa phân công (cascade delete profiles)

## 📖 Hướng dẫn sử dụng

### Cho Admin
1. Vào "Quản lý > Cố vấn học tập"
2. Click "Phân công GV"
3. Chọn lớp, GV, học kỳ, năm học
4. Click "Phân công" -> Done!

### Cho GV
1. Vào "Lớp chủ nhiệm"
2. Click vào lớp đang chủ nhiệm
3. Tab "Hồ sơ cố vấn" -> Thêm entry mới
4. Chọn loại: Danh sách SV / Hoạt động / Đánh giá
5. Nhập nội dung, attach files (optional)
6. Lưu -> Hồ sơ được ghi lại

### Xem lịch sử
1. Click icon 📜 "Lịch sử" ở bất kỳ lớp nào
2. Xem timeline tất cả GV đã chủ nhiệm
3. Có thể xem chi tiết hồ sơ của từng giai đoạn
