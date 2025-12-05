# 📝 Hướng Dẫn Thêm Giáo Viên Chủ Nhiệm Một Lớp

**Câu hỏi của bạn:** "làm sao để tôi có thể thêm một gv chủ nhiệm một lớp"  
**Trả lời:** Đây là hướng dẫn chi tiết step-by-step.

---

## 🚀 Cách 1: Qua Giao Diện Web (Dễ Nhất)

### Bước 1: Đăng Nhập
1. Mở browser → `http://localhost:3000`
2. Đăng nhập với tài khoản **Admin**
   ```
   Email: admin@capstone.edu.vn
   Password: [password của bạn]
   ```

### Bước 2: Điều Hướng
```
Admin Dashboard
  ↓
Menu bên trái → "Quản lý cố vấn học tập"
  ↓
URL: http://localhost:3000/admin/class-advisors
```

### Bước 3: Mở Form Gán
- Nhìn bảng danh sách
- Tìm nút màu xanh: **"+ Gán giáo viên chủ nhiệm"**
- **Nhấp vào nút đó**

### Bước 4: Điền Thông Tin
**Form sẽ hiển thị các trường:**

| Trường          | Chọn/Nhập  | Ví Dụ                    |
| --------------- | ---------- | ------------------------ |
| **Lớp** *       | Dropdown   | IT19A, IT19B, v.v.       |
| **Giáo viên** * | Dropdown   | Nguyễn Văn A, Trần Thị B |
| **Học kỳ** *    | Dropdown   | HK1, HK2, hoặc HK3 (Hè)  |
| **Năm học** *   | Text field | 2024-2025                |
| **Ghi chú**     | Text area  | (Tuỳ chọn)               |

**Ví dụ điền:**
```
Lớp:           IT19A
Giáo viên:     Nguyễn Văn A
Học kỳ:        HK1
Năm học:       2024-2025
Ghi chú:       Phân công đầu kỳ
```

### Bước 5: Xác Nhận
- **Nhấp nút:** "Gán giáo viên chủ nhiệm"
- Chờ 1-2 giây
- Thấy **thông báo xanh:** "Đã gán giáo viên chủ nhiệm"
- **Xong!** ✅

### Bước 6: Kiểm Tra Kết Quả
- Dialog đóng tự động
- Bảng làm mới (reload)
- Thấy **hàng mới** với thông tin vừa nhập
- Trạng thái: **"Đang chủ nhiệm"** (xanh)

---

## 🔌 Cách 2: Qua API (Nâng Cao)

### Điều Kiện
- Có access token (JWT)
- Đã cài đặt Postman hoặc curl

### Bước 1: Chuẩn Bị Request

```http
POST /api/class-advisors HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Authorization: Bearer <YOUR_ACCESS_TOKEN>

{
  "class_id": 1,
  "teacher_id": "user-123",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "notes": "Phân công đầu kỳ"
}
```

### Bước 2: Gửi Request

**Với curl:**
```bash
curl -X POST http://localhost:3001/api/class-advisors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "class_id": 1,
    "teacher_id": "user-123",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "notes": "Phân công đầu kỳ"
  }'
```

**Với Postman:**
1. Mở Postman
2. URL: `http://localhost:3001/api/class-advisors`
3. Method: **POST**
4. Header:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>`
5. Body (raw JSON):
   ```json
   {
     "class_id": 1,
     "teacher_id": "user-123",
     "semester": "HK1",
     "academic_year": "2024-2025",
     "notes": "Phân công"
   }
   ```
6. **Nhấp Send**

### Bước 3: Kiểm Tra Kết Quả
- **Status 200/201**: Thành công ✅
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "class_id": 1,
      "teacher_id": "user-123",
      "semester": "HK1",
      "academic_year": "2024-2025",
      "is_active": true,
      "assigned_date": "2025-12-05T10:30:00Z"
    }
  }
  ```

---

## 🔧 Cách 3: Trực Tiếp Database (Cho DBA)

### Điều Kiện
- Có SQL Server Management Studio
- Có quyền Execute stored procedures

### Bước 1: Mở SSMS
```
Khởi động SQL Server Management Studio
  ↓
Kết nối database CapstoneDB
```

### Bước 2: Viết Query

```sql
-- Gán giáo viên Nguyễn Văn A (user-123) cho lớp IT19A (id=1)
-- Học kỳ HK1, năm học 2024-2025

EXEC sp_AssignClassAdvisor
    @class_id = 1,
    @teacher_id = N'user-123',
    @semester = N'HK1',
    @academic_year = N'2024-2025',
    @assigned_by = N'admin-123',
    @notes = N'Phân công đầu kỳ';
```

### Bước 3: Chạy
- **Bấm F5** hoặc **Ctrl+E**
- Chờ kết quả

### Bước 4: Kiểm Tra
```sql
-- Kiểm tra kết quả
SELECT * FROM class_advisors 
WHERE class_id = 1 AND semester = 'HK1' AND academic_year = '2024-2025';
```

**Kết quả expected:**
```
id  class_id  teacher_id  semester  academic_year  is_active  assigned_date
1   1         user-123    HK1       2024-2025      1          2025-12-05
```

---

## ⚡ Các Trường Bắt Buộc (*)

| Trường          | Loại   | Ghi Chú                                    |
| --------------- | ------ | ------------------------------------------ |
| `class_id`      | Number | ID của lớp học (bắt buộc)                  |
| `teacher_id`    | String | ID của giáo viên (bắt buộc)                |
| `semester`      | String | HK1, HK2, hoặc HK3 (bắt buộc)              |
| `academic_year` | String | Format YYYY-YYYY, vd: 2024-2025 (bắt buộc) |
| `notes`         | String | Ghi chú (tuỳ chọn)                         |

---

## 🎯 Ví Dụ Thực Tế

### Ví Dụ 1: Gán Chủ Nhiệm cho Lớp IT19A
```
Lớp: IT19A (id=1)
Giáo viên: Nguyễn Văn A (id: user-001)
Học kỳ: HK1
Năm học: 2024-2025
Ghi chú: Phân công đầu kỳ

Kết quả:
✅ Nguyễn Văn A là chủ nhiệm lớp IT19A cho HK1 2024-2025
```

### Ví Dụ 2: Thay Đổi Chủ Nhiệm (Giữa Kỳ)
```
Lớp: IT19A (id=1)
GV cũ: Nguyễn Văn A (đang hoạt động)
GV mới: Trần Thị B (id: user-002)
Học kỳ: HK1
Năm học: 2024-2025
Ghi chú: Thay thế do Nguyễn Văn A chuyển công tác

Kết quả:
✅ Nguyễn Văn A: is_active = 0 (kết thúc), end_date = 2025-12-05
✅ Trần Thị B: is_active = 1 (đang hoạt động), assigned_date = 2025-12-05
```

### Ví Dụ 3: Gán Cùng Lớp, Kỳ Khác
```
Lớp: IT19A
GV: Nguyễn Văn A
HK1 2024-2025: ✅ (đã gán)
HK2 2024-2025: ❌ (chưa gán)

Gán lại:
  Học kỳ: HK2
  Năm học: 2024-2025
  
Kết quả:
✅ Nguyễn Văn A vẫn là chủ nhiệm HK1
✅ Nguyễn Văn A cũng là chủ nhiệm HK2 (tạo bản ghi mới)
✅ Hay có thể gán GV khác cho HK2
```

---

## 📱 Workflow Đầy Đủ

```
1. Bạn → Truy Cập Web
   http://localhost:3000/admin/class-advisors

2. Web → Hiển Thị Bảng
   ├─ Cột 1: Lớp học
   ├─ Cột 2: Giáo viên
   ├─ Cột 3: Học kỳ
   ├─ Cột 4: Năm học
   ├─ Cột 5: Trạng thái
   └─ Cột 6: Hành động (nút)

3. Bạn → Click Nút "+ Gán giáo viên chủ nhiệm"

4. Web → Dialog Hiển Thị
   ├─ Lớp: [Dropdown ▼]
   ├─ Giáo viên: [Dropdown ▼]
   ├─ Học kỳ: [Dropdown ▼]
   ├─ Năm học: [Text input]
   ├─ Ghi chú: [Text area]
   └─ Nút: [Gán] [Hủy]

5. Bạn → Điền Thông Tin + Nhấp "Gán"

6. Frontend → Xác Nhận
   "Bạn có chắc muốn gán Nguyễn Văn A cho lớp IT19A?"
   [Có] [Không]

7. Bạn → Nhấp "Có"

8. Frontend → Gửi Request
   POST /api/class-advisors
   {
     "class_id": 1,
     "teacher_id": "user-123",
     "semester": "HK1",
     "academic_year": "2024-2025",
     ...
   }

9. Backend → Xử Lý
   ├─ Gọi Repository
   ├─ Repository gọi Stored Procedure
   ├─ Stored Procedure:
   │  ├─ Tìm GV cũ
   │  ├─ Nếu có: Set is_active=0, end_date=now
   │  ├─ Tạo bản ghi mới
   │  └─ Set is_active=1
   └─ Return kết quả

10. Database → Lưu Dữ Liệu
    INSERT class_advisors: ...
    UPDATE class_advisors: ...

11. Backend → Trả Response
    {
      "success": true,
      "data": {...}
    }

12. Frontend → Hiển Thị Kết Quả
    ├─ Toast: "✅ Đã gán giáo viên chủ nhiệm"
    ├─ Dialog đóng
    ├─ Bảng reload
    └─ Thấy dữ liệu mới

13. Bạn → Hoàn Thành ✅
```

---

## ❌ Xử Lý Lỗi

### Lỗi 1: "Lỗi: Lớp không được tìm thấy"
```
❌ Nguyên nhân: class_id không tồn tại

✅ Giải pháp:
1. Kiểm tra: SELECT * FROM classes WHERE id = 1;
2. Nếu không tìm thấy, tạo lớp trước
3. Rồi gán giáo viên
```

### Lỗi 2: "Lỗi: Giáo viên không được tìm thấy"
```
❌ Nguyên nhân: teacher_id không tồn tại trong users

✅ Giải pháp:
1. Kiểm tra: SELECT * FROM users WHERE id = 'user-123';
2. Đảm bảo user có role: supervisor hoặc manager
3. Nếu không tồn tại, tạo user trước
4. Rồi gán làm giáo viên chủ nhiệm
```

### Lỗi 3: "Lỗi: Học kỳ không hợp lệ"
```
❌ Nguyên nhân: semester không đúng format

✅ Giải pháp:
1. Chỉ chấp nhận: HK1, HK2, HK3
2. Kiểm tra viết đúng chữ hoa
3. Không dùng: học kỳ 1, kỳ 1, v.v.
```

### Lỗi 4: "Lỗi 401 Unauthorized"
```
❌ Nguyên nhân: Token không hợp lệ hoặc quyền không đủ

✅ Giải pháp:
1. Đăng nhập lại
2. Chắc bạn là Admin
3. Kiểm tra token hợp lệ
4. Nếu dùng API, thêm header: Authorization: Bearer <token>
```

### Lỗi 5: "Lỗi 500 Internal Server Error"
```
❌ Nguyên nhân: Backend có lỗi

✅ Giải pháp:
1. Kiểm tra backend console
2. Xem chi tiết lỗi
3. Kiểm tra database có kết nối
4. Kiểm tra stored procedures tồn tại
```

---

## 🔐 Kiểm Tra Quyền

**Bạn phải có role nào để gán chủ nhiệm?**

```
✅ Admin        → Có thể gán
✅ Manager      → Có thể gán
❌ Supervisor   → Không thể gán (chỉ xem + thêm hồ sơ)
❌ Student      → Không thể gán
```

**Kiểm tra role của bạn:**
1. Đăng nhập
2. Vào Profile
3. Tìm "Role" hoặc "Vai trò"
4. Phải là **Admin** hoặc **Manager**

---

## 📊 Kết Quả Mong Đợi

### Sau Khi Gán Thành Công:
```
Bảng danh sách:
┌──────┬─────────┬──────────┬──────────┬───────────┬─────────────┐
│ Lớp  │ Giáo Vụ │ Học Kỳ   │ Năm Học  │ Trạng Thái│ Hành Động   │
├──────┼─────────┼──────────┼──────────┼───────────┼─────────────┤
│IT19A │Nguyễn ĐA│HK1       │2024-2025 │🟢Đang     │📜👤❌🗑️   │
│      │        │          │          │chủ nhiệm  │             │
└──────┴─────────┴──────────┴──────────┴───────────┴─────────────┘

Dữ liệu trong database:
class_advisors:
- id: 1
- class_id: 1
- teacher_id: user-123
- semester: HK1
- academic_year: 2024-2025
- is_active: 1 (TRUE)
- assigned_date: 2025-12-05 10:30:00
```

---

## 🎓 Tiếp Theo

Sau khi gán thành công, bạn có thể:

1. **Xem Lịch Sử** 📜
   - Nhấp nút 📜
   - Thấy timeline ai từng làm chủ nhiệm

2. **Thêm Hồ Sơ** 👤
   - Nhấp nút 👤
   - Thêm thông tin về lớp
   - GV khác có thể xem

3. **Thay Đổi Chủ Nhiệm**
   - Gán GV khác cho cùng lớp
   - GV cũ tự động kết thúc
   - Lịch sử được bảo lưu

4. **Kết Thúc Phân Công**
   - Nhấp ❌ (nếu cần)
   - Không xóa dữ liệu, chỉ đánh dấu kết thúc

---

## 📞 Hỗ Trợ

**Nếu còn vấn đề:**
1. Kiểm tra console (F12 → Console)
2. Xem logs backend
3. Đọc: `docs/DATABASE_SETUP_GUIDE.md`
4. Đọc: `docs/CLASS_ADVISOR_USAGE_GUIDE.md`
5. Liên hệ IT support

---

**Phiên bản**: v1.0  
**Cập nhật**: 05/12/2025  
**Trạng thái**: ✅ Sẵn sàng sử dụng
