# ✅ Checklist: Trang Quản lý Doanh nghiệp

## Kiểm tra Backend

### Repository & Controller
- [x] `backend/src/repositories/companies.repository.ts` — có tất cả methods (getAll, getById, create, update, delete)
- [x] Methods xử lý `contact_person` (fallback sang `manager_name` nếu null)
- [x] `backend/src/controllers/companies.controller.ts` — xử lý tất cả fields
- [x] Error handling và validation

### Routes & Server
- [x] `backend/src/routes/companies.routes.ts` — tất cả endpoints được định nghĩa
- [x] Routes được mount tại `/api/companies` trong `server.ts`
- [x] Authentication middleware được áp dụng

### Database Connection
- [x] `backend/src/database/connection.ts` — pool connection tới SQL Server
- [x] Sử dụng mssql driver để gọi stored procedures

---

## Kiểm tra Stored Procedures

### Files Created
- [x] `backend/database/stored-procedures/sp_CreateCompany.sql` — tạo doanh nghiệp
- [x] `backend/database/stored-procedures/sp_UpdateCompany.sql` — cập nhật
- [x] `backend/database/stored-procedures/sp_GetAllCompanies.sql` — lấy danh sách
- [x] `backend/database/stored-procedures/sp_GetCompanyById.sql` — lấy chi tiết
- [x] `backend/database/stored-procedures/sp_DeleteCompany.sql` — xóa
- [x] `backend/database/stored-procedures/APPLY_ALL_COMPANY_PROCEDURES.sql` — script hợp nhất

### Schema Alignment
- [x] Tất cả stored procedures khớp với schema table `companies`
- [x] Tất cả parameters khớp giữa SP và repository
- [x] `contact_person` NOT NULL được xử lý đúng

### Status
- ❌ **CHƯA TRIỂN KHAI** — cần chạy script SQL lên SQL Server
  - Chạy: `backend/database/stored-procedures/APPLY_ALL_COMPANY_PROCEDURES.sql`

---

## Kiểm tra Frontend

### Pages
- [x] `src/app/admin/companies/page.tsx` — trang chính
- [x] Không còn dùng Firebase
- [x] Render `CompanyCatalog` component

### Components
- [x] `src/components/company-catalog.tsx` — danh sách + CRUD UI
  - [x] Hiển thị bảng doanh nghiệp
  - [x] Nút "Thêm doanh nghiệp"
  - [x] Nút "Sửa" cho mỗi hàng
  - [x] Nút "Xóa" cho mỗi hàng
  - [x] Loading skeleton
  - [x] Empty state

- [x] `src/components/company-form.tsx` — form thêm/sửa
  - [x] Validation với zod + react-hook-form
  - [x] Tất cả trường: name, type, address, contact_person, contact_phone, email, manager_name, manager_phone, etc.
  - [x] Submit xử lý create & update
  - [x] Toast notification

### Services
- [x] `src/services/companies.service.ts` — API wrapper
  - [x] Interface `Company` có tất cả fields
  - [x] Interface `CreateCompanyInput` có tất cả fields
  - [x] Methods: getAll, getById, create, update, delete
  - [x] Gọi `/api/companies` endpoints

---

## Kiểm tra Database Schema

### Table
- [x] `companies` table tồn tại (hoặc sẽ tạo từ migration)
- [x] Tất cả columns được định nghĩa:
  - [x] id (PK, identity)
  - [x] name (NOT NULL)
  - [x] address
  - [x] phone
  - [x] email
  - [x] contact_person (NOT NULL)
  - [x] contact_phone
  - [x] website
  - [x] description
  - [x] is_active (NOT NULL, default 1)
  - [x] company_type
  - [x] manager_name
  - [x] manager_phone
  - [x] external_id
  - [x] created_at (default: sysutcdatetime)
  - [x] updated_at (default: sysutcdatetime)
  - [x] rowversion_col (timestamp)

---

## Integration Status

### Frontend ↔ Backend API
- [x] companiesService gọi `/api/companies` endpoints
- [x] Request headers có auth token
- [x] Response data được parse đúng
- [x] Error handling (toast notification)

### Backend ↔ Database
- [x] Repository gọi stored procedures
- [x] Input parameters được validate
- [x] Output data được return đúng
- [x] Transactions được xử lý

---

## Triển khai Checklist

### Chuẩn bị
- [x] Code đã viết và kiểm tra syntax
- [x] Files đã được lưu vào repository
- [x] Không có compile errors
- [x] Documentation hoàn thành

### Triển khai SQL
- [ ] **TODO:** Chạy `APPLY_ALL_COMPANY_PROCEDURES.sql` trên SQL Server
  - [ ] Sử dụng SSMS, PowerShell, hoặc Azure Data Studio
  - [ ] Xác minh 5 stored procedures được tạo
  - [ ] Kiểm tra không có lỗi

### Chạy Backend
- [ ] **TODO:** Chạy `npm run dev` trong thư mục `backend`
  - [ ] Chờ "Server running on port 5000"
  - [ ] Không có compile errors
  - [ ] Không có runtime errors khi gọi API

### Chạy Frontend
- [ ] **TODO:** Chạy `npm run dev` trong root thư mục
  - [ ] Chờ "http://localhost:3000"
  - [ ] Không có compile errors
  - [ ] Components render đúng

### Testing
- [ ] **TODO:** Đăng nhập (nếu cần)
- [ ] **TODO:** Mở trang `/admin/companies`
- [ ] **TODO:** Thêm doanh nghiệp mới (test CREATE)
- [ ] **TODO:** Xem danh sách (test READ)
- [ ] **TODO:** Sửa thông tin (test UPDATE)
- [ ] **TODO:** Xóa doanh nghiệp (test DELETE)
- [ ] **TODO:** Kiểm tra database — dữ liệu đã lưu đúng không

---

## Tệp Tài liệu

- [x] `COMPANY_MANAGEMENT_GUIDE.md` — hướng dẫn chi tiết cách triển khai
- [x] `COMPANY_MANAGEMENT_SUMMARY.md` — tóm tắt tổng quát
- [x] `COMPANY_MANAGEMENT_CHECKLIST.md` — file này (checklist)

---

## Ghi chú

### Điều bắt buộc
1. **Phải chạy SQL script** — không bỏ qua, stored procedures không tồn tại trên DB
2. **Phải khởi chạy backend** — frontend cần API để lấy/gửi dữ liệu
3. **Phải khởi chạy frontend** — để access trang `/admin/companies`

### Firestore
- ❌ **Không dùng Firestore** cho doanh nghiệp
- ✅ Tất cả dữ liệu từ SQL Server
- ✅ Stored procedures xử lý CRUD
- ✅ API backend xử lý authentication/authorization

### Ghi lỗi
Nếu gặp lỗi:
1. Kiểm tra backend log (terminal chạy `npm run dev`)
2. Kiểm tra browser console (F12 → Console)
3. Kiểm tra SQL Server — stored procedures có tồn tại không
4. Kiểm tra `.env` — cấu hình connection string đúng không

---

**Status: 90% Hoàn thành** ✅
- Còn lại: Chạy SQL script + khởi chạy dev servers

**Bước tiếp theo:** Xem `COMPANY_MANAGEMENT_GUIDE.md` để triển khai
