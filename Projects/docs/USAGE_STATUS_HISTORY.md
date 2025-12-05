# Hướng dẫn Sử dụng Tính năng Lịch sử Thay đổi Trạng thái

## ✅ Đã hoàn thành

### 1. Form Chỉnh sửa Sinh viên
- Thêm trường **"Ghi chú thay đổi"** (textarea, 3 dòng)
- Ghi chú được lưu tự động khi cập nhật sinh viên
- Hiển thị thông báo: "Ghi chú sẽ được lưu vào lịch sử thay đổi trạng thái"

### 2. Thay đổi trạng thái từ Dropdown trong bảng
- Khi thay đổi trạng thái, **dialog sẽ tự động hiển thị**
- Hiển thị: "Thay đổi từ **Đang học** → **Bảo lưu**"
- Cho phép nhập ghi chú (tùy chọn)
- Nút "Hủy" hoặc "Xác nhận"

### 3. Xem Lịch sử
- Nút 📜 "Lịch sử" ở cột "Thao tác"
- Click để xem timeline đầy đủ các thay đổi
- Hiển thị: thời gian, người thay đổi, ghi chú

## 🎯 Cách sử dụng

### A. Thay đổi trạng thái từ Form Edit:
1. Click nút ✏️ "Sửa" ở sinh viên
2. Thay đổi trạng thái trong dropdown
3. Nhập ghi chú vào ô "Ghi chú thay đổi"
4. Click "Cập nhật"
5. Ghi chú được lưu tự động

### B. Thay đổi trạng thái nhanh từ Bảng:
1. Click dropdown trạng thái ở cột "Trạng thái"
2. Chọn trạng thái mới
3. **Dialog tự động hiển thị** yêu cầu ghi chú
4. Nhập ghi chú (hoặc bỏ qua)
5. Click "Xác nhận"

### C. Xem lịch sử:
1. Click nút 📜 "Lịch sử" ở sinh viên
2. Xem timeline đầy đủ
3. Thấy tất cả thay đổi với ghi chú

## 📝 Ví dụ Ghi chú

**Tốt:**
- "Sinh viên xin bảo lưu do vấn đề sức khỏe - có đơn xin phép"
- "Chuyển sang nghỉ học theo quyết định của nhà trường"
- "Đã hoàn thành đủ tín chỉ và bảo vệ thành công"

**Không cần thiết:**
- "" (để trống - vẫn lưu được)
- "Update" (quá chung chung)

## 🔒 Bảo mật

- Chỉ admin/manager mới có quyền thay đổi trạng thái
- Tự động ghi lại user thay đổi (từ JWT token)
- Không thể xóa lịch sử (chỉ thêm mới)

## 🎨 UI/UX

- Dialog nhỏ gọn, không làm gián đoạn workflow
- Có thể bỏ qua ghi chú nếu không cần
- Textarea 4 dòng cho ghi chú dài
- Màu sắc timeline dễ phân biệt

## 📊 Báo cáo

Admin có thể:
- Xem lịch sử từng sinh viên
- Export lịch sử (tùy chọn tương lai)
- Thống kê theo loại thay đổi
