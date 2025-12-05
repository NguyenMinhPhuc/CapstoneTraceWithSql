# 🎯 START HERE — Trang Quản lý Doanh nghiệp

## ⭐ Điểm Khởi Đầu

**Bạn muốn:**
- ✅ Xem danh sách doanh nghiệp
- ✅ Thêm, sửa, xóa doanh nghiệp
- ✅ Lưu dữ liệu vào SQL Server (không Firebase)
- ✅ Có trang admin quản lý

**Tôi đã làm xong!** 🎉

---

## 🚀 Khởi chạy (2 cách)

### **Cách 1: 1 Lệnh (Dễ nhất) ⭐ KHUYẾN NGHỊ**

```powershell
.\deploy-company-management.ps1
```

Script sẽ:
1. ✅ Áp dụng SQL procedures lên database
2. ✅ Khởi chạy backend
3. ✅ Khởi chạy frontend
4. ✅ Mở trang quản lý

### **Cách 2: Manual (Nếu script không chạy được)**

#### Step 1: Apply SQL (Chọn 1 cách)

**A) SSMS:**
- Mở SSMS
- File → Open → `backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql`
- Nhấn F5

**B) PowerShell:**
```powershell
sqlcmd -S localhost -d CapstoneTrack -i "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"
```

**C) Azure Data Studio:**
- File → Open → chọn file trên
- Nhấn Run

#### Step 2: Backend
```bash
cd backend
npm run dev
```

#### Step 3: Frontend (terminal mới)
```bash
npm run dev
```

#### Step 4: Open
```
http://localhost:3000/admin/companies
```

---

## 📂 Cấu trúc Dự Án

```
Projects/
│
├── src/app/admin/companies/
│   └── page.tsx                ← TRANG QUẢN LÝ (mở cái này!)
│
├── src/components/
│   ├── company-catalog.tsx    ← Danh sách + UI
│   └── company-form.tsx       ← Form thêm/sửa
│
├── src/services/
│   └── companies.service.ts   ← API wrapper
│
├── backend/
│   ├── src/
│   │   ├── repositories/companies.repository.ts
│   │   ├── controllers/companies.controller.ts
│   │   └── routes/companies.routes.ts
│   │
│   └── database/
│       ├── migrations/
│       │   └── 2025_12_05_create_companies_table.sql (schema)
│       │
│       └── stored-procedures/
│           ├── sp_CreateCompany.sql
│           ├── sp_UpdateCompany.sql
│           ├── sp_GetAllCompanies.sql
│           ├── sp_GetCompanyById.sql
│           ├── sp_DeleteCompany.sql
│           └── APPLY_ALL_COMPANY_PROCEDURES.sql (RUN THIS!)
│
└── Tài liệu (Đọc theo thứ tự):
    ├── 📌 START_HERE.md                    ← Bạn đang đọc file này
    ├── COMPANY_MANAGEMENT_README.md        ← Tóm tắt nhanh
    ├── COMPANY_MANAGEMENT_GUIDE.md         ← Chi tiết từng bước
    ├── COMPANY_MANAGEMENT_API.md           ← API documentation
    ├── COMPANY_MANAGEMENT_CHECKLIST.md     ← Kiểm tra chi tiết
    ├── COMPANY_MANAGEMENT_SUMMARY.md       ← Tóm tắt toàn bộ
    ├── COMPANY_MANAGEMENT_FINAL.md         ← Hoàn thành
    ├── CHANGES_SUMMARY.md                  ← Danh sách thay đổi
    └── deploy-company-management.ps1       ← Deploy script
```

---

## 🎨 Giao Diện Trang

Trang quản lý sẽ có:

```
┌─────────────────────────────────────────┐
│ 📋 Danh mục Doanh nghiệp  [+ Thêm]     │
├─────────────────────────────────────────┤
│ ID │ Tên       │ Loại    │ Địa chỉ │... │
├────┼───────────┼─────────┼─────────┼────┤
│  1 │ Tech Corp │ External│ 123 St  │... │
│  2 │ ABC Ltd   │ Internal│ 456 Ave │... │
├────┼───────────┼─────────┼─────────┼────┤
│    │           │         │ [Sửa] [Xóa] │
└─────────────────────────────────────────┘
```

---

## ✨ Tính Năng

### Xem Danh Sách ✅
- Tất cả doanh nghiệp từ database
- Hiển thị: ID, tên, loại, địa chỉ, liên hệ, quản lý, trạng thái

### Thêm Mới ✅
- Nút "Thêm doanh nghiệp"
- Dialog form với các trường:
  - Tên (bắt buộc)
  - Loại, Địa chỉ, Người liên hệ, Email, Website, Mô tả
  - Quản lý (tên + điện thoại)
  - Trạng thái

### Sửa ✅
- Nút "Sửa" trên mỗi dòng
- Mở dialog có sẵn dữ liệu cũ
- Chỉnh sửa các trường
- Lưu cập nhật

### Xóa ✅
- Nút "Xóa" trên mỗi dòng
- Xác nhận trước khi xóa
- Xóa khỏi database

---

## 📋 Kiểm tra (After Deploy)

Sau khi chạy các bước:

- [ ] Trang mở được: `http://localhost:3000/admin/companies`
- [ ] Thấy danh sách doanh nghiệp
- [ ] Nút "Thêm" hoạt động
- [ ] Có thể thêm doanh nghiệp mới
- [ ] Có thể sửa thông tin
- [ ] Có thể xóa doanh nghiệp

---

## ❓ FAQ

**Q: Chỉ sau 1 lệnh có hoạt động không?**  
A: Có, nếu SQL Server, Node.js, npm đã cài sẵn. Chỉ chạy: `.\deploy-company-management.ps1`

**Q: Nếu script không chạy được?**  
A: Làm manual theo Cách 2 ở trên (3 bước đơn giản)

**Q: Dữ liệu lưu ở đâu?**  
A: SQL Server database `CapstoneTrack`, bảng `companies`

**Q: Có cần Firebase không?**  
A: Không! Tất cả từ SQL Server + Stored Procedures

**Q: API endpoints là gì?**  
A: GET/POST/PUT/DELETE `/api/companies` — xem `COMPANY_MANAGEMENT_API.md`

**Q: Cần role gì để truy cập?**  
A: admin hoặc manager (authentication required)

---

## 🐛 Lỗi Thường Gặp

| Lỗi                          | Giải pháp                                          |
| ---------------------------- | -------------------------------------------------- |
| "Stored procedure not found" | Chạy SQL script `APPLY_ALL_COMPANY_PROCEDURES.sql` |
| "Cannot connect to database" | Kiểm tra `.env` trong `backend/`                   |
| "Port 3000 already in use"   | Đóng process khác hoặc dùng port khác              |
| "Cannot insert NULL"         | Điền "Người liên hệ" hoặc "Quản lý (tên)"          |
| "npm not found"              | Cài Node.js từ nodejs.org                          |

---

## 📚 Tài Liệu Tiếp Theo

**Nếu muốn biết chi tiết:**

1. 📖 `COMPANY_MANAGEMENT_README.md` — Hướng dẫn nhanh (5 phút)
2. 📖 `COMPANY_MANAGEMENT_GUIDE.md` — Chi tiết (15 phút)
3. 📖 `COMPANY_MANAGEMENT_API.md` — API documentation
4. 📖 `CHANGES_SUMMARY.md` — Danh sách tất cả thay đổi

---

## ✅ Checklist Triển khai

- [ ] Cài Node.js, SQL Server, npm
- [ ] Có database `CapstoneTrack`
- [ ] Chạy `deploy-company-management.ps1` HOẶC làm manual
- [ ] Xác minh trang mở được
- [ ] Test CRUD: Thêm, xem, sửa, xóa

---

## 🎉 Hoàn thành!

**Ngay sau khi deploy:**
- Trang quản lý doanh nghiệp đã sẵn sàng!
- Tất cả CRUD operations hoạt động
- Dữ liệu lưu trong SQL Server
- Không cần Firebase

---

## 🚀 Bước Tiếp Theo

1. **Chạy:** `.\deploy-company-management.ps1`
2. **Mở:** `http://localhost:3000/admin/companies`
3. **Test:** Thêm/sửa/xóa doanh nghiệp
4. **Cải tiến:** Thêm tìm kiếm, lọc, import/export (optional)

---

**Bắt đầu ngay! 🚀**

```bash
# Chạy 1 lệnh:
.\deploy-company-management.ps1

# Hoặc manual:
sqlcmd -S localhost -d CapstoneTrack -i "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"
cd backend && npm run dev
# (new terminal)
npm run dev
```

Happy coding! 💻✨
