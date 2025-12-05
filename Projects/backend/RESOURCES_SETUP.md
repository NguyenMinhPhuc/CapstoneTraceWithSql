# Hướng dẫn thiết lập chức năng Quản lý Tài nguyên

## 1. Thực thi Stored Procedures

Mở SQL Server Management Studio hoặc Azure Data Studio và kết nối đến database **CapstoneTrack**, sau đó thực thi file:

```
backend/database/stored-procedures/resources.sql
```

File này sẽ tạo 9 stored procedures:
- `sp_GetResources` - Lấy danh sách tài nguyên (có phân trang, lọc, tìm kiếm)
- `sp_GetResourceById` - Lấy chi tiết tài nguyên kèm danh sách links
- `sp_CreateResource` - Tạo tài nguyên mới
- `sp_UpdateResource` - Cập nhật thông tin tài nguyên
- `sp_DeleteResource` - Xóa tài nguyên (soft delete)
- `sp_AddResourceLink` - Thêm liên kết cho tài nguyên
- `sp_UpdateResourceLink` - Cập nhật liên kết
- `sp_DeleteResourceLink` - Xóa liên kết
- `sp_GetResourceLinksByResourceId` - Lấy danh sách links của tài nguyên

## 2. Kiểm tra Backend

Backend đã được cấu hình sẵn với:
- ✅ Repository: `backend/src/repositories/resources.repository.ts`
- ✅ Controller: `backend/src/controllers/resources.controller.ts`
- ✅ Routes: `backend/src/routes/resources.routes.ts`
- ✅ Server: Routes đã được mount tại `/api/resources`

Backend đang chạy trên port **5001**. Sau khi thực thi stored procedures, bạn có thể test API:

```bash
# Lấy danh sách tài nguyên (yêu cầu đăng nhập)
GET http://localhost:5001/api/resources

# Tạo tài nguyên mới (chỉ admin/manager)
POST http://localhost:5001/api/resources
{
  "name": "Hướng dẫn viết báo cáo tốt nghiệp",
  "summary": "Tài liệu hướng dẫn cách viết báo cáo đồ án tốt nghiệp theo chuẩn của trường",
  "category": "graduation",
  "is_active": true
}
```

## 3. Kiểm tra Frontend

Frontend đã được cài đặt hoàn chỉnh:
- ✅ Service: `src/services/resources.service.ts`
- ✅ Admin Page: `src/app/admin/resources/page.tsx` (đã thay thế hoàn toàn)
- ✅ User Page: `src/app/resources/page.tsx` (cần kiểm tra và cập nhật)

### Truy cập trang quản lý:
1. Đăng nhập với tài khoản **Admin** hoặc **Manager**
2. Vào menu **Quản lý Tài nguyên** (hoặc truy cập `/admin/resources`)

### Chức năng có sẵn:
- ✅ Xem danh sách tài nguyên (phân trang)
- ✅ Thống kê theo danh mục (7 loại)
- ✅ Tìm kiếm và lọc
- ✅ Thêm/Sửa/Xóa tài nguyên
- ✅ Quản lý liên kết (links) cho từng tài nguyên
- ✅ Bật/tắt trạng thái active

## 4. Danh mục tài nguyên

Hệ thống hỗ trợ 2 danh mục chính:
- **graduation** (Tốt nghiệp) - màu xanh dương - Tài nguyên cho đồ án tốt nghiệp
- **internship** (Thực tập) - màu xanh lá - Tài nguyên cho thực tập doanh nghiệp

Mỗi tài nguyên bao gồm:
- Tên tài nguyên
- Mô tả chi tiết
- Danh mục (graduation/internship)
- Một hoặc nhiều link để tải xuống/xem

## 5. Quyền truy cập

- **Admin/Manager**: Có thể thêm, sửa, xóa tài nguyên
- **Tất cả user đã đăng nhập**: Có thể xem danh sách tài nguyên

## 6. Cấu trúc dữ liệu

### Bảng `resources`:
```sql
id (uniqueidentifier, PK)
name (nvarchar(255))              -- Tên tài nguyên
summary (nvarchar(max))           -- Mô tả chi tiết
category (nvarchar(50))           -- graduation hoặc internship
resource_type (nvarchar(50))      -- (Optional) PDF, MP4, ZIP, etc.
created_by (uniqueidentifier, FK -> users)
is_active (bit)
created_at (datetime2)
updated_at (datetime2)
```

### Bảng `resource_links`:
```sql
id (uniqueidentifier, PK)
resource_id (uniqueidentifier, FK -> resources)
label (nvarchar(255))             -- "Tải xuống", "Xem Google Drive", "Link Video"...
url (nvarchar(1000))              -- Đường dẫn đến file/tài liệu
order_index (int)                 -- Thứ tự hiển thị
created_at (datetime2)
```

## 7. Kiểm tra hoạt động

1. **Test stored procedures**:
```sql
-- Tạo tài nguyên test cho tốt nghiệp
EXEC sp_CreateResource 
  @name = N'Mẫu báo cáo tốt nghiệp',
  @summary = N'File mẫu báo cáo đồ án tốt nghiệp theo chuẩn',
  @category = 'graduation',
  @resource_type = 'DOCX',
  @created_by = '<user_id>',
  @is_active = 1;

-- Tạo tài nguyên test cho thực tập
EXEC sp_CreateResource 
  @name = N'Hướng dẫn thực tập doanh nghiệp',
  @summary = N'Tài liệu hướng dẫn quy trình thực tập',
  @category = 'internship',
  @resource_type = 'PDF',
  @created_by = '<user_id>',
  @is_active = 1;

-- Lấy danh sách
EXEC sp_GetResources @page = 1, @pageSize = 10;
```

2. **Test API endpoint**:
- Sử dụng Postman hoặc Thunder Client
- Thêm header: `Authorization: Bearer <token>`

3. **Test giao diện**:
- Đăng nhập admin
- Vào trang /admin/resources
- Thử thêm tài nguyên mới
- Thử thêm link cho tài nguyên
- Kiểm tra thống kê

## 8. Troubleshooting

### Lỗi "Procedure sp_GetResources not found"
- Chưa thực thi file stored-procedures/resources.sql
- Kiểm tra lại database connection

### Lỗi 403 Forbidden khi truy cập API
- User chưa đăng nhập hoặc token hết hạn
- User không có quyền admin/manager (đối với thao tác thêm/sửa/xóa)

### Giao diện không hiển thị dữ liệu
- Kiểm tra Console trong Developer Tools
- Kiểm tra Network tab để xem response từ API
- Đảm bảo backend đang chạy trên port 5001

## 9. Bước tiếp theo

Sau khi kiểm tra xong chức năng admin, bạn có thể:
1. Cập nhật trang user-facing (`src/app/resources/page.tsx`) để sinh viên xem tài nguyên
2. Thêm chức năng tải xuống file
3. Thêm chức năng đánh dấu tài nguyên yêu thích
4. Thêm thống kê lượt xem cho tài nguyên
