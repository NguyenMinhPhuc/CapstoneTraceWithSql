# Hướng dẫn sử dụng Markdown trong mô tả tài nguyên

## Tính năng mới

Phần **Mô tả** trong quản lý tài nguyên giờ đây hỗ trợ định dạng Markdown, cho phép bạn tạo nội dung đẹp mắt và dễ đọc hơn.

## Cách sử dụng

Khi tạo hoặc chỉnh sửa tài nguyên, bạn sẽ thấy:
- **Tab "Soạn thảo"**: Nhập nội dung với cú pháp Markdown
- **Tab "Xem trước"**: Xem kết quả định dạng thực tế

## Cú pháp Markdown cơ bản

### 1. Tiêu đề (Headings)

```markdown
# Tiêu đề cấp 1
## Tiêu đề cấp 2
### Tiêu đề cấp 3
#### Tiêu đề cấp 4
```

### 2. Định dạng văn bản

```markdown
**Chữ in đậm**
*Chữ in nghiêng*
***Chữ vừa đậm vừa nghiêng***
~~Chữ gạch ngang~~
`code inline`
```

Kết quả:
- **Chữ in đậm**
- *Chữ in nghiêng*
- ***Chữ vừa đậm vừa nghiêng***
- ~~Chữ gạch ngang~~
- `code inline`

### 3. Danh sách

**Danh sách không thứ tự:**
```markdown
- Mục 1
- Mục 2
  - Mục con 2.1
  - Mục con 2.2
- Mục 3
```

**Danh sách có thứ tự:**
```markdown
1. Bước 1
2. Bước 2
3. Bước 3
```

### 4. Liên kết (Links)

```markdown
[Tên liên kết](https://example.com)
[Tài liệu hướng dẫn](https://docs.example.com)
```

### 5. Trích dẫn (Blockquote)

```markdown
> Đây là một đoạn trích dẫn
> Có thể nhiều dòng
```

### 6. Code block

**Inline code:**
```markdown
Sử dụng hàm `console.log()` để debug
```

**Code block:**
```markdown
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`
```

### 7. Bảng (Tables)

```markdown
| Cột 1 | Cột 2 | Cột 3 |
| ----- | ----- | ----- |
| A1    | B1    | C1    |
| A2    | B2    | C2    |
```

Kết quả:
| Cột 1 | Cột 2 | Cột 3 |
| ----- | ----- | ----- |
| A1    | B1    | C1    |
| A2    | B2    | C2    |

### 8. Đường kẻ ngang

```markdown
---
```

## Ví dụ thực tế

### Ví dụ 1: Mô tả tài liệu tốt nghiệp

```markdown
# Hướng dẫn viết báo cáo tốt nghiệp

## Nội dung chính

Tài liệu này bao gồm:
- **Cấu trúc báo cáo** theo chuẩn của trường
- **Ví dụ minh họa** cho từng phần
- **Checklist** kiểm tra trước khi nộp

## Các bước thực hiện

1. Tải file mẫu từ link bên dưới
2. Đọc kỹ hướng dẫn trong file
3. Áp dụng cho báo cáo của bạn
4. Kiểm tra lại theo checklist

> **Lưu ý**: Đảm bảo định dạng đúng chuẩn trước khi nộp!

## Hỗ trợ

Nếu có thắc mắc, liên hệ:
- Email: support@example.com
- Hotline: 0123456789
```

### Ví dụ 2: Hướng dẫn thực tập

```markdown
# Quy trình thực tập doanh nghiệp

## Chuẩn bị trước khi thực tập

### Hồ sơ cần thiết
- [ ] Giấy giới thiệu từ trường
- [ ] Hợp đồng thực tập
- [ ] Sổ theo dõi thực tập

### Trang phục
- **Nam**: Áo sơ mi, quần tây
- **Nữ**: Áo sơ mi, váy/quần tây

## Lịch trình

| Tuần  | Nội dung            | Ghi chú          |
| ----- | ------------------- | ---------------- |
| 1-2   | Làm quen môi trường | Quan sát         |
| 3-10  | Tham gia công việc  | Ghi chép nhật ký |
| 11-12 | Hoàn thiện báo cáo  | Nộp deadline     |

## Lưu ý quan trọng

> Đi đúng giờ, trang phục lịch sự, thái độ nhiệt tình!

Mọi thông tin chi tiết xem tại các file đính kèm bên dưới.
```

## Tips & Tricks

1. **Preview thường xuyên**: Chuyển qua tab "Xem trước" để kiểm tra kết quả
2. **Sử dụng tiêu đề**: Giúp cấu trúc nội dung rõ ràng
3. **Danh sách bullet**: Dễ đọc hơn đoạn văn dài
4. **Highlight quan trọng**: Dùng **in đậm** cho thông tin quan trọng
5. **Links trong mô tả**: Có thể thêm links tham khảo thêm (ngoài links tải về chính)

## Hiển thị cho người dùng

- **Trang Admin**: Hiển thị bản rút gọn (plain text) trong table
- **Trang Tài nguyên**: Hiển thị đầy đủ định dạng Markdown
- **Responsive**: Tự động điều chỉnh trên mobile/tablet

## Bảo mật

- HTML tags sẽ được sanitize tự động
- Chỉ cho phép Markdown an toàn
- Không thể chèn scripts độc hại

---

**Chúc bạn tạo được những tài liệu đẹp mắt và hữu ích!** 🎉
