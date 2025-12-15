# Hướng dẫn Triển khai Trang Quản lý Doanh nghiệp

## Tóm tắt Công việc

Tôi đã hoàn thành các công việc sau:

### 1. **Cấu trúc Backend (Đã hoàn thành)**
- ✅ Cập nhật `backend/src/repositories/companies.repository.ts` với các phương thức:
  - `getAll()` — lấy danh sách doanh nghiệp (hỗ trợ filter theo loại)
  - `getById(id)` — lấy chi tiết doanh nghiệp
  - `create(data)` — tạo doanh nghiệp (đảm bảo `contact_person` không null)
  - `update(data)` — cập nhật doanh nghiệp
  - `delete(id)` — xóa doanh nghiệp

- ✅ Cập nhật `backend/src/controllers/companies.controller.ts` xử lý tất cả trường dữ liệu

### 2. **Cấu trúc Frontend (Đã hoàn thành)**
- ✅ Tạo `src/services/companies.service.ts` — API wrapper với các phương thức getAll, getById, create, update, delete
- ✅ Tạo `src/components/company-catalog.tsx` — trang quản lý doanh nghiệp với:
  - Danh sách doanh nghiệp (bảng)
  - Nút "Thêm doanh nghiệp"
  - Nút "Sửa" và "Xóa" cho mỗi doanh nghiệp
  - Dialog thêm/sửa với biểu mẫu
  
- ✅ Tạo `src/components/company-form.tsx` — biểu mẫu thêm/sửa doanh nghiệp với các trường:
  - Tên *
  - Loại doanh nghiệp
  - Địa chỉ
  - Người liên hệ
  - Điện thoại liên hệ
  - Email
  - Website
  - Mô tả
  - Quản lý (tên + điện thoại)
  - Trạng thái (hoạt động/không hoạt động)

- ✅ Cập nhật `src/app/admin/companies/page.tsx` để sử dụng `CompanyCatalog`

### 3. **Stored Procedures (Cần triển khai trên DB)**
Tất cả stored procedures đã được tạo trong repo tại `backend/database/stored-procedures/`:
- `sp_CreateCompany.sql` — tạo doanh nghiệp
- `sp_UpdateCompany.sql` — cập nhật doanh nghiệp
- `sp_GetAllCompanies.sql` — lấy danh sách (hỗ trợ filter)
- `sp_GetCompanyById.sql` — lấy chi tiết
- `sp_DeleteCompany.sql` — xóa doanh nghiệp

**⚠️ QUAN TRỌNG: Bạn cần chạy script này trên SQL Server:**

---

## Hướng dẫn Triển khai Stored Procedures

### **Cách 1: Sử dụng SSMS (SQL Server Management Studio)**

1. Mở SSMS
2. Connect đến server `CapstoneTrack`
3. **File** → **Open** → chọn file:
   ```
   backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql
   ```
4. Nhấn **F5** hoặc **Execute** (Ctrl+E)
5. Chờ tất cả stored procedures được tạo

### **Cách 2: Sử dụng PowerShell**

```powershell
# Cấu hình
$server = "localhost"  # hoặc tên server của bạn
$database = "CapstoneTrack"
$sqlFilePath = "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"

# Chạy script
sqlcmd -S $server -d $database -i $sqlFilePath

# Nếu dùng Windows Authentication (mặc định)
# sqlcmd -S $server -d $database -E -i $sqlFilePath

# Nếu dùng SQL Authentication (với user + password)
# sqlcmd -S $server -d $database -U "sa" -P "password" -i $sqlFilePath
```

### **Cách 3: Sử dụng Azure Data Studio**

1. Mở Azure Data Studio
2. Connect đến CapstoneTrack database
3. File → Open → chọn file `APPLY_ALL_COMPANY_PROCEDURES.sql`
4. Nhấn **Run**

### **Cách 4: Chạy từng Stored Procedure riêng lẻ**

Nếu bạn muốn chạy từng file riên:

```powershell
# Set location
cd "backend\database\stored-procedures"

# Chạy từng file
sqlcmd -S localhost -d CapstoneTrack -i "sp_CreateCompany.sql"
sqlcmd -S localhost -d CapstoneTrack -i "sp_UpdateCompany.sql"
sqlcmd -S localhost -d CapstoneTrack -i "sp_GetAllCompanies.sql"
sqlcmd -S localhost -d CapstoneTrack -i "sp_GetCompanyById.sql"
sqlcmd -S localhost -d CapstoneTrack -i "sp_DeleteCompany.sql"
```

---

## Xác minh Stored Procedures Đã Tạo

Sau khi chạy script, bạn có thể xác minh bằng cách chạy lệnh SQL này trong SSMS:

```sql
USE CapstoneTrack;

-- Liệt kê tất cả stored procedures liên quan đến Company
SELECT OBJECT_NAME(id) as ProcedureName, create_date
FROM sys.sysobjects
WHERE type = 'P'
AND OBJECT_NAME(id) LIKE 'sp_%Company%'
ORDER BY OBJECT_NAME(id);

-- Hoặc xem chi tiết một stored procedure
EXEC sp_helptext 'sp_CreateCompany';
```

---

## Khởi chạy Backend Dev Server

Sau khi stored procedures đã được tạo, khởi chạy backend:

```bash
cd backend
npm install  # nếu chưa install
npm run dev
```

Backend sẽ chạy trên `http://localhost:5000` (hoặc port được cấu hình trong `.env`)

---

## Khởi chạy Frontend Dev Server

Mở terminal mới (giữ backend chạy) và chạy:

```bash
# Từ thư mục root
npm install  # nếu chưa install
npm run dev
```

Frontend sẽ chạy trên `http://localhost:3000`

---

## Truy cập Trang Quản lý Doanh nghiệp

1. Đảm bảo backend + frontend đang chạy
2. Mở trình duyệt: `http://localhost:3000`
3. Điều hướng đến: `http://localhost:3000/admin/companies`

**Trang sẽ hiển thị:**
- ✅ Danh sách tất cả doanh nghiệp (từ database)
- ✅ Nút "Thêm doanh nghiệp" — mở dialog form
- ✅ Nút "Sửa" — mở dialog chỉnh sửa
- ✅ Nút "Xóa" — xóa doanh nghiệp

---

## Các Trường Dữ liệu Được Hỗ trợ

| Trường           | Loại        | Bắt buộc | Ghi chú                                       |
| ---------------- | ----------- | -------- | --------------------------------------------- |
| `name`           | Chuỗi (255) | ✅ Có     | Tên doanh nghiệp                              |
| `address`        | Chuỗi (500) | ❌ Không  | Địa chỉ                                       |
| `phone`          | Chuỗi (20)  | ❌ Không  | Số điện thoại chính                           |
| `email`          | Chuỗi (255) | ❌ Không  | Email                                         |
| `contact_person` | Chuỗi (255) | ✅ Có     | Người liên hệ (nếu null sẽ dùng manager_name) |
| `contact_phone`  | Chuỗi (20)  | ❌ Không  | Điện thoại liên hệ                            |
| `website`        | Chuỗi (255) | ❌ Không  | Website                                       |
| `description`    | Text        | ❌ Không  | Mô tả                                         |
| `company_type`   | Chuỗi (250) | ❌ Không  | Loại (internal/external)                      |
| `manager_name`   | Chuỗi (250) | ❌ Không  | Tên quản lý                                   |
| `manager_phone`  | Chuỗi (50)  | ❌ Không  | Điện thoại quản lý                            |
| `is_active`      | Boolean     | ❌ Không  | Trạng thái (mặc định: true)                   |
| `external_id`    | Chuỗi (100) | ❌ Không  | ID ngoài (nếu cần integrateion)               |

---

## Cấu trúc Thư mục Liên quan

```
Projects/
├── backend/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 2025_12_05_create_companies_table.sql  (schema table)
│   │   └── stored-procedures/
│   │       ├── sp_CreateCompany.sql
│   │       ├── sp_UpdateCompany.sql
│   │       ├── sp_GetAllCompanies.sql
│   │       ├── sp_GetCompanyById.sql
│   │       ├── sp_DeleteCompany.sql
│   │       └── APPLY_ALL_COMPANY_PROCEDURES.sql  (chạy tất cả)
│   └── src/
│       ├── repositories/
│       │   └── companies.repository.ts
│       └── controllers/
│           └── companies.controller.ts
├── src/
│   ├── app/
│   │   └── admin/
│   │       └── companies/
│   │           └── page.tsx  (trang quản lý)
│   ├── services/
│   │   └── companies.service.ts  (API wrapper)
│   └── components/
│       ├── company-catalog.tsx  (giao diện quản lý)
│       └── company-form.tsx  (form thêm/sửa)
```

---

## Troubleshooting

### ❌ Lỗi: "Cannot insert the value NULL into column 'contact_person'"
- **Nguyên nhân:** Không cung cấp `contact_person` khi tạo doanh nghiệp
- **Giải pháp:** Backend tự động dùng `manager_name` nếu `contact_person` là null. Kiểm tra xem form có gửi `contact_person` không.

### ❌ Lỗi: "Stored procedure not found"
- **Nguyên nhân:** Chưa chạy script SQL để tạo stored procedures
- **Giải pháp:** Chạy `APPLY_ALL_COMPANY_PROCEDURES.sql` trên SQL Server

### ❌ Lỗi: "Cannot connect to database"
- **Nguyên nhân:** Backend chưa chạy hoặc cấu hình connection sai
- **Giải pháp:** 
  1. Kiểm tra `.env` trong thư mục `backend`
  2. Kiểm tra SQL Server có chạy không
  3. Chạy `npm run dev` trong thư mục `backend`

### ❌ Lỗi: API trả về 404
- **Nguyên nhân:** Routes chưa được register hoặc backend chưa khởi động
- **Giải pháp:** Kiểm tra `backend/src/routes/companies.routes.ts` và `backend/src/server.ts`

---

## Tiếp Theo

Sau khi triển khai thành công:

1. ✅ **Kiểm tra các CRUD operations:**
   - Thêm doanh nghiệp mới
   - Xem danh sách
   - Sửa thông tin doanh nghiệp
   - Xóa doanh nghiệp

2. 📝 **Các cải tiến tương lai (tuỳ chọn):**
   - Thêm import/export Excel
   - Thêm tìm kiếm và lọc nâng cao
   - Thêm upload logo/hình ảnh
   - Thêm validation quy tắc kinh doanh
   - Thêm audit log (ai tạo/sửa/xóa và khi nào)

---

## Liên hệ / Hỗ trợ

Nếu có bất kỳ vấn đề, hãy:
1. Kiểm tra log backend: `npm run dev` sẽ in lỗi
2. Kiểm tra browser console (F12 → Console tab)
3. Xác minh stored procedures đã tạo bằng lệnh SQL ở trên
