# Tóm tắt: Trang Quản lý Doanh nghiệp

## ✅ Công việc đã hoàn thành

### Frontend
- ✅ Tạo trang quản lý doanh nghiệp: `/admin/companies`
- ✅ Tạo component catalog (`CompanyCatalog`) hiển thị danh sách doanh nghiệp
- ✅ Tạo form thêm/sửa (`CompanyForm`) 
- ✅ Cập nhật service (`companiesService`) để gọi API backend
- ✅ Tích hợp CRUD (Create, Read, Update, Delete)

### Backend  
- ✅ Cập nhật repository (`companies.repository.ts`) với tất cả phương thức CRUD
- ✅ Cập nhật controller (`companies.controller.ts`) xử lý request/response
- ✅ Routes đã được mount: `/api/companies`
- ✅ Đảm bảo `contact_person` không NULL (fallback sang `manager_name`)

### Database
- ✅ Table schema đã tạo: `companies` với tất cả trường
- ✅ Stored procedures đã tạo trong files:
  - `sp_CreateCompany.sql`
  - `sp_UpdateCompany.sql`
  - `sp_GetAllCompanies.sql`
  - `sp_GetCompanyById.sql`
  - `sp_DeleteCompany.sql`
- ✅ Script hợp nhất: `APPLY_ALL_COMPANY_PROCEDURES.sql` — chạy tất cả cùng lúc

---

## 🎯 Các bước triển khai tiếp theo

### Step 1: Áp dụng Stored Procedures lên SQL Server (⚠️ BẮT BUỘC)

Chọn một trong các cách:

**Cách A: SSMS**
```
File → Open → backend/database/stored-procedures/APPLY_ALL_COMPANY_PROCEDURES.sql
Nhấn F5 để Execute
```

**Cách B: PowerShell**
```powershell
cd "D:\Projects\CongTy\Done\CapstoneTraceWithSql\Projects"
sqlcmd -S localhost -d CapstoneTrack -i "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"
```

**Cách C: Azure Data Studio**
```
File → Open → chọn APPLY_ALL_COMPANY_PROCEDURES.sql
Nhấn Run
```

### Step 2: Khởi chạy Backend Dev Server

```bash
cd backend
npm run dev
```

Chờ tới khi thấy: `Server running on port 5000` (hoặc port khác được cấu hình)

### Step 3: Khởi chạy Frontend Dev Server (terminal mới)

```bash
npm run dev
```

Chờ tới khi thấy: `http://localhost:3000`

### Step 4: Mở trang quản lý doanh nghiệp

Truy cập: **http://localhost:3000/admin/companies**

---

## 📋 Kiểm tra các tính năng

Trên trang quản lý, bạn có thể:

✅ **Xem danh sách:** Bảng hiển thị tất cả doanh nghiệp từ database  
✅ **Thêm:** Nút "Thêm doanh nghiệp" → Dialog form → Click "Lưu"  
✅ **Sửa:** Nút "Sửa" trên mỗi hàng → Chỉnh sửa thông tin → Click "Lưu"  
✅ **Xóa:** Nút "Xóa" → Xác nhận → Doanh nghiệp bị xóa khỏi danh sách  

---

## 🔍 Các trường form

| Trường               | Bắt buộc | Kiểu dữ liệu                  |
| -------------------- | -------- | ----------------------------- |
| Tên                  | ✅        | Chuỗi                         |
| Loại                 | ❌        | Chuỗi (internal/external/...) |
| Địa chỉ              | ❌        | Chuỗi                         |
| Người liên hệ        | ❌        | Chuỗi                         |
| Điện thoại           | ❌        | Chuỗi                         |
| Email                | ❌        | Email                         |
| Quản lý (tên)        | ❌        | Chuỗi                         |
| Quản lý (điện thoại) | ❌        | Chuỗi                         |

---

## 📂 File chính được tạo/cập nhật

**Frontend:**
- `src/app/admin/companies/page.tsx` — trang quản lý
- `src/components/company-catalog.tsx` — component danh sách + CRUD UI
- `src/components/company-form.tsx` — form thêm/sửa
- `src/services/companies.service.ts` — API wrapper (cập nhật contact_person/phone)

**Backend:**
- `backend/src/repositories/companies.repository.ts` — cập nhật CRUD methods
- `backend/src/controllers/companies.controller.ts` — xử lý tất cả fields

**Database:**
- `backend/database/stored-procedures/sp_*.sql` — 5 stored procedures
- `backend/database/stored-procedures/APPLY_ALL_COMPANY_PROCEDURES.sql` — script hợp nhất

**Tài liệu:**
- `COMPANY_MANAGEMENT_GUIDE.md` — hướng dẫn chi tiết (trong root)

---

## 🐛 Ghi chú kỹ thuật

### Xử lý contact_person NOT NULL
- Nếu form không gửi `contact_person`, backend sẽ dùng `manager_name`
- Nếu cả hai đều null, sẽ lỗi "Cannot insert NULL"
- Form phải có trường "Người liên hệ" hoặc "Quản lý (tên)" được điền

### Schema khớp 100%
- Tất cả trường trong form → fields trong `companies.repository.ts` → parameters trong stored procedures
- Không có mismatch giữa frontend/backend/database

### API Endpoints
```
GET    /api/companies              — lấy danh sách (filter: company_type, is_active)
POST   /api/companies              — tạo mới
GET    /api/companies/:id          — lấy chi tiết
PUT    /api/companies/:id          — cập nhật
DELETE /api/companies/:id          — xóa
```

---

## 💡 Các điểm cần chú ý

1. **Cần chạy stored procedures trên SQL Server** — không thể bỏ qua bước này
2. **Backend phải khởi chạy trước** hoặc cùng lúc với frontend
3. **Cần auth token** — API routes yêu cầu authenticate (role: admin/manager)
4. **Nếu chưa đăng nhập**, frontend sẽ tự động redirect tới login
5. **Firestore không được dùng** — tất cả dữ liệu từ SQL Server

---

## ✨ Hoàn tất

**Bạn có thể:**
1. Chạy SQL script `APPLY_ALL_COMPANY_PROCEDURES.sql`
2. Khởi chạy backend: `cd backend && npm run dev`
3. Khởi chạy frontend: `npm run dev`
4. Truy cập `http://localhost:3000/admin/companies`

**Trang quản lý doanh nghiệp sẽ hoạt động với đầy đủ chức năng CRUD!** 🎉
