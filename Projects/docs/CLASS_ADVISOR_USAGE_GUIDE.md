# Hướng dẫn Gán Giáo viên Chủ nhiệm/Cố vấn Học tập

## 📋 Tổng quan
Tính năng này cho phép bạn gán giáo viên làm chủ nhiệm hoặc cố vấn học tập (cố vấn học tập) cho các lớp theo từng học kỳ. Hệ thống sẽ tự động quản lý lịch sử phân công và cho phép các giáo viên mới xem lại hồ sơ của những người đi trước.

---

## 🚀 Cách thêm giáo viên chủ nhiệm

### Bước 1: Truy cập trang quản lý
- Đi tới: **Admin** → **Quản lý cố vấn học tập**
- Hoặc URL: `/admin/class-advisors`

### Bước 2: Mở dialog gán giáo viên
- Nhấp nút **"+ Gán giáo viên chủ nhiệm"** ở trên cùng của bảng

### Bước 3: Điền thông tin
Trong form, điền các thông tin bắt buộc (*):

| Trường          | Mô tả                              | Ví dụ                          |
| --------------- | ---------------------------------- | ------------------------------ |
| **Lớp** *       | Chọn lớp cần gán                   | IT19A                          |
| **Giáo viên** * | Chọn giáo viên sẽ làm chủ nhiệm    | Nguyễn Văn A                   |
| **Học kỳ** *    | Chọn học kỳ                        | HK1, HK2 hoặc HK3 (Hè)         |
| **Năm học** *   | Nhập năm học theo format YYYY-YYYY | 2024-2025                      |
| **Ghi chú**     | Ghi chú bổ sung (tuỳ chọn)         | Giáo viên được điều động từ... |

### Bước 4: Xác nhận
- Nhấp **"Gán giáo viên chủ nhiệm"**
- Hệ thống sẽ tự động:
  - Ghi lại phân công mới
  - Kết thúc phân công cũ (nếu có)
  - Cập nhật thông tin lớp

---

## 👁️ Cách xem lịch sử phân công

### Xem timeline lịch sử
1. Trong bảng danh sách, tìm lớp cần xem
2. Nhấp nút **📜 Lịch sử** ở cột "Hành động"
3. Dialog sẽ hiển thị:
   - Danh sách các giáo viên từng làm chủ nhiệm
   - Ngày bắt đầu và kết thúc
   - Số ngày phục vụ
   - Học kỳ/năm học
   - Ghi chú

### Ý nghĩa các badge
- 🟢 **Đang chủ nhiệm**: Phân công hiện tại
- ⚪ **Đã kết thúc**: Phân công cũ

---

## 📄 Cách quản lý hồ sơ cố vấn

### Thêm hồ sơ mới
1. Nhấp **👤 Hồ sơ** ở cột "Hành động" để mở dialog
2. Tab **"Hồ sơ hiện tại"** sẽ hiển thị
3. Nhấp **"+ Thêm hồ sơ mới"**
4. Chọn loại hồ sơ:
   - **Thông tin chung**: Thông tin cơ bản về lớp
   - **Danh sách lớp**: Danh sách học sinh
   - **Hoạt động lớp**: Các sự kiện/hoạt động
   - **Đánh giá học sinh**: Nhận xét về học sinh

5. Điền tiêu đề và nội dung
6. Nhấp **"Lưu hồ sơ"**

### Xem hồ sơ lịch sử
- Nhấp tab **"Lịch sử lớp"** trong dialog hồ sơ
- Hiển thị tất cả hồ sơ từ các giáo viên chủ nhiệm trước đó
- Hồ sơ hiện tại được đánh dấu **"Hiện tại"**
- Các hồ sơ cũ có nền xám để phân biệt

---

## ⚙️ Các hành động khác

### Deactivate phân công
- Nhấp **❌** trong cột hành động
- Xác nhận khi được hỏi
- Phân công sẽ chuyển sang trạng thái "Đã kết thúc"
- Hồ sơ vẫn được lưu giữ

### Xóa phân công
- Nhấp **🗑️** trong cột hành động
- Cần quyền Admin
- **Lưu ý**: Xóa sẽ xóa luôn các hồ sơ liên quan

### Lọc danh sách
- Có thể lọc theo:
  - Lớp học
  - Giáo viên
  - Học kỳ/năm học
  - Trạng thái (Đang hoạt động/Đã kết thúc)

---

## 🎯 Các trường hợp sử dụng

### Trường hợp 1: Gán chủ nhiệm cho lớp mới
```
Lớp: IT19A
Giáo viên: Nguyễn Văn A
Học kỳ: HK1
Năm học: 2024-2025
Ghi chú: "Phân công đầu kỳ"
```

### Trường hợp 2: Thay đổi chủ nhiệm giữa kỳ
```
Lớp: IT19A (đã có Nguyễn Văn A)
Giáo viên: Nguyễn Thị B
Học kỳ: HK1
Năm học: 2024-2025
Ghi chú: "Thay thế do Nguyễn Văn A chuyển công tác"
```

**Kết quả:**
- Nguyễn Văn A: Kết thúc (end_date được ghi nhận)
- Nguyễn Thị B: Đang chủ nhiệm (is_active = true)
- Lịch sử vẫn được bảo lưu để xem lại

### Trường hợp 3: Xem hồ sơ từ giáo viên trước
```
1. Nhấp "👤 Hồ sơ" (với giáo viên hiện tại Nguyễn Thị B)
2. Chuyển sang tab "Lịch sử lớp"
3. Xem hồ sơ từ Nguyễn Văn A (giáo viên trước)
```

---

## ⚠️ Lưu ý quan trọng

| ⚠️                      | Chi tiết                                                |
| ---------------------- | ------------------------------------------------------- |
| **Học kỳ**             | HK1 (Tháng 9-12), HK2 (Tháng 1-5), HK3 (Tháng 6-8)      |
| **Năm học**            | Format: YYYY-YYYY (vd: 2024-2025)                       |
| **Chủ nhiệm duy nhất** | Mỗi lớp chỉ có 1 chủ nhiệm **hoạt động** trong 1 học kỳ |
| **Lịch sử**            | Tất cả thay đổi được ghi nhận với ngày tháng            |
| **Hồ sơ**              | Luôn được bảo lưu ngay cả khi thay chủ nhiệm            |

---

## 🔐 Quyền hạn

| Vai trò    | Gán | Xem | Sửa | Xóa | Quản lý hồ sơ |
| ---------- | --- | --- | --- | --- | ------------- |
| Admin      | ✅   | ✅   | ✅   | ✅   | ✅             |
| Manager    | ✅   | ✅   | ✅   | ❌   | ✅             |
| Supervisor | ❌   | ✅   | ❌   | ❌   | ✅             |
| Student    | ❌   | ❌   | ❌   | ❌   | ❌             |

---

## 🐛 Xử lý sự cố

### "Lỗi: Học sinh không được tìm thấy"
- Đảm bảo lớp được chọn có tồn tại trong hệ thống

### "Lỗi: Giáo viên không được tìm thấy"
- Giáo viên phải có tài khoản trong hệ thống
- Giáo viên phải có vai trò là Supervisor hoặc Manager

### "Lỗi: Học kỳ không hợp lệ"
- Chỉ chọn: HK1, HK2 hoặc HK3
- Không để trống

### "Dữ liệu không tải được"
- Refresh trang và thử lại
- Kiểm tra kết nối mạng
- Liên hệ Admin nếu vẫn lỗi

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra quyền hạn của tài khoản
2. Xem console (F12) để xem chi tiết lỗi
3. Liên hệ Admin hoặc team IT hỗ trợ

---

**Phiên bản**: v1.0  
**Cập nhật lần cuối**: 05/12/2025
