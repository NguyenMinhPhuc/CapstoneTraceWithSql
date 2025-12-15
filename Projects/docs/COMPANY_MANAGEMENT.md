# 🎯 Quản Lý Doanh Nghiệp — Hệ Thống Admin

## ⚡ Quick Start

```bash
# 1. Chạy deployment script
.\deploy-company-management.ps1

# 2. Mở trang quản lý
http://localhost:3000/admin/companies
```

---

## 📌 Tính Năng

✅ Xem danh sách doanh nghiệp  
✅ Thêm doanh nghiệp mới  
✅ Sửa thông tin doanh nghiệp  
✅ Xóa doanh nghiệp  
✅ Lưu trữ SQL Server (không Firebase)  
✅ API REST (5 endpoints)  

---

## 📚 Tài Liệu

**Hãy bắt đầu với:**

1. 📌 **[START_HERE.md](./START_HERE.md)** — Điểm khởi đầu
2. 📖 **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** — Tóm tắt hoàn thành
3. 📖 **[COMPANY_MANAGEMENT_README.md](./COMPANY_MANAGEMENT_README.md)** — Hướng dẫn
4. 📖 **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** — Danh sách tài liệu

---

## 🚀 Deploy

### Cách 1: PowerShell Script (Dễ nhất)
```powershell
.\deploy-company-management.ps1
```

### Cách 2: Manual
```bash
# 1. Chạy SQL script
sqlcmd -S localhost -d CapstoneTrack -i "backend\database\stored-procedures\APPLY_ALL_COMPANY_PROCEDURES.sql"

# 2. Backend
cd backend && npm run dev

# 3. Frontend (terminal mới)
npm run dev

# 4. Mở
http://localhost:3000/admin/companies
```

---

## 📂 Cấu Trúc

```
src/app/admin/companies/          ← Trang quản lý
  └── page.tsx

src/components/
  ├── company-catalog.tsx         ← Danh sách + UI
  └── company-form.tsx            ← Form thêm/sửa

backend/database/stored-procedures/
  └── APPLY_ALL_COMPANY_PROCEDURES.sql  ← RUN THIS!
```

---

## 🔗 API

```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
DELETE /api/companies/:id
```

---

## ✅ Yêu Cầu

- Node.js 18+
- SQL Server
- npm

---

## 📞 Hỗ Trợ

Xem `START_HERE.md` hoặc các file tài liệu khác.

---

**Status: ✅ Ready to Deploy**
