# Quản lý Doanh nghiệp — Trang Admin

## 📌 Giới thiệu

Trang quản lý doanh nghiệp cho phép bạn:
- ✅ **Xem** danh sách tất cả doanh nghiệp
- ✅ **Thêm** doanh nghiệp mới
- ✅ **Sửa** thông tin doanh nghiệp
- ✅ **Xóa** doanh nghiệp

Tất cả dữ liệu được lưu trữ trong **SQL Server** (không dùng Firebase).

---

## 🚀 Khởi chạy nhanh

### Yêu cầu
- Node.js 18+
- SQL Server (với database `CapstoneTrack`)
- `sqlcmd` (có sẵn khi cài SQL Server)

### Cách 1: Chạy PowerShell Script (Khuyến nghị)

```powershell
# Từ root directory của project
.\deploy-company-management.ps1
```

Script sẽ:
1. Apply stored procedures lên SQL Server
2. Khởi chạy backend dev server
3. Khởi chạy frontend dev server
4. Mở trang quản lý tại `http://localhost:3000/admin/companies`

### Cách 2: Manual Setup

#### Bước 1: Apply Stored Procedures

```bash
# Option A: SSMS
# Mở SSMS → File → Open → backend/database/stored-procedures/APPLY_ALL_COMPANY_PROCEDURES.sql → F5

# Option B: PowerShell
sqlcmd -S localhost -d CapstoneTrack -i "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"

# Option C: Azure Data Studio
# File → Open → chọn APPLY_ALL_COMPANY_PROCEDURES.sql → Run
```

#### Bước 2: Khởi chạy Backend

```bash
cd backend
npm install
npm run dev
```

Chờ tới khi thấy: `Server running on port 5000`

#### Bước 3: Khởi chạy Frontend (terminal mới)

```bash
npm install
npm run dev
```

Chờ tới khi thấy: `http://localhost:3000`

#### Bước 4: Mở trang

```
http://localhost:3000/admin/companies
```

---

## 📊 Các trường dữ liệu

| Trường        | Bắt buộc | Kiểu  | Ghi chú                        |
| ------------- | -------- | ----- | ------------------------------ |
| Tên           | ✅        | Text  | Tên công ty                    |
| Loại          | ❌        | Text  | VD: internal, external, LHU... |
| Địa chỉ       | ❌        | Text  | Địa chỉ công ty                |
| Người liên hệ | ❌        | Text  | Tên người liên hệ              |
| Điện thoại    | ❌        | Text  | SĐT liên hệ                    |
| Email         | ❌        | Email | Email liên hệ                  |
| Website       | ❌        | URL   | Website công ty                |
| Mô tả         | ❌        | Text  | Thông tin thêm                 |
| Quản lý - Tên | ❌        | Text  | Người quản lý                  |
| Quản lý - ĐT  | ❌        | Text  | SĐT quản lý                    |

---

## 🔗 API Endpoints

```
GET    /api/companies              # Lấy danh sách
POST   /api/companies              # Tạo mới
GET    /api/companies/:id          # Lấy chi tiết
PUT    /api/companies/:id          # Cập nhật
DELETE /api/companies/:id          # Xóa
```

---

## 📁 Cấu trúc thư mục

```
Projects/
├── backend/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 2025_12_05_create_companies_table.sql
│   │   └── stored-procedures/
│   │       ├── sp_CreateCompany.sql
│   │       ├── sp_UpdateCompany.sql
│   │       ├── sp_GetAllCompanies.sql
│   │       ├── sp_GetCompanyById.sql
│   │       ├── sp_DeleteCompany.sql
│   │       └── APPLY_ALL_COMPANY_PROCEDURES.sql
│   └── src/
│       ├── repositories/companies.repository.ts
│       ├── controllers/companies.controller.ts
│       └── routes/companies.routes.ts
├── src/
│   ├── app/admin/companies/page.tsx
│   ├── services/companies.service.ts
│   └── components/
│       ├── company-catalog.tsx
│       └── company-form.tsx
└── Tài liệu:
    ├── COMPANY_MANAGEMENT_GUIDE.md
    ├── COMPANY_MANAGEMENT_SUMMARY.md
    ├── COMPANY_MANAGEMENT_CHECKLIST.md
    └── deploy-company-management.ps1
```

---

## 🛠️ Troubleshooting

### ❌ "Stored procedure not found"
→ Chạy script `APPLY_ALL_COMPANY_PROCEDURES.sql` trên SQL Server

### ❌ "Cannot insert NULL into contact_person"
→ Điền ít nhất một trong: "Người liên hệ" hoặc "Quản lý (tên)"

### ❌ "Cannot connect to database"
→ Kiểm tra `backend/.env` — cấu hình connection string

### ❌ "Port 3000 already in use"
→ Có process khác dùng port này. Chạy: `netstat -ano | findstr :3000`

### ❌ "npm command not found"
→ Cài Node.js từ https://nodejs.org

---

## 📖 Tài liệu

Xem các file sau để hiểu rõ hơn:

- **COMPANY_MANAGEMENT_GUIDE.md** — Hướng dẫn chi tiết từng bước
- **COMPANY_MANAGEMENT_SUMMARY.md** — Tóm tắt tính năng và công việc
- **COMPANY_MANAGEMENT_CHECKLIST.md** — Danh sách kiểm tra chi tiết

---

## 🎯 Tiếp theo

Sau khi trang hoạt động:

1. ✅ Kiểm tra CRUD: Thêm, xem, sửa, xóa doanh nghiệp
2. 📝 Thêm tính năng: Import/export Excel, upload logo, v.v.
3. 🔍 Cải thiện: Tìm kiếm, lọc nâng cao, phân trang, v.v.

---

## 💬 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra backend log: `cd backend && npm run dev`
2. Kiểm tra browser console: F12 → Console
3. Xem lại các file tài liệu ở trên

---

**Happy coding! 🚀**
