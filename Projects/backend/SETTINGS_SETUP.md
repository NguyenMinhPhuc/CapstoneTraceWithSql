# Hướng dẫn cài đặt Settings cho hệ thống

## Bước 1: Thêm dữ liệu mặc định vào bảng system_settings

Chạy script seed dữ liệu mặc định:

```bash
sqlcmd -S <SERVER_NAME> -d CapstoneTrack -U <USERNAME> -P <PASSWORD> -i "backend/database/migrations/002_seed_default_settings.sql"
```

**Ví dụ cụ thể:**
```bash
sqlcmd -S localhost -d CapstoneTrack -U sa -P YourPassword123 -i "backend/database/migrations/002_seed_default_settings.sql"
```

Hoặc trong **SSMS**:
1. Mở file `backend/database/migrations/002_seed_default_settings.sql`
2. Kết nối đến database `CapstoneTrack`
3. Nhấn F5 để thực thi

## Bước 2: Kiểm tra dữ liệu

Chạy query sau để xem các settings đã được thêm:

```sql
SELECT * FROM system_settings ORDER BY setting_key;
```

Bạn sẽ thấy các settings mặc định:

| setting_key                  | setting_value | description                                   |
| ---------------------------- | ------------- | --------------------------------------------- |
| allowStudentRegistration     | 1             | Cho phép sinh viên đăng ký tài khoản mới      |
| enableOverallGrading         | 0             | Bật chế độ chấm điểm tổng                     |
| allowEditingApprovedProposal | 0             | Cho phép sửa thuyết minh đã duyệt             |
| forceOpenReportSubmission    | 0             | Mở cổng nộp báo cáo bất cứ lúc nào            |
| enablePostDefenseSubmission  | 0             | Mở cổng nộp báo cáo sau Hội đồng              |
| requireReportApproval        | 1             | Yêu cầu GVHD duyệt báo cáo cuối kỳ            |
| earlyInternshipGoalHours     | 700           | Số giờ mục tiêu cho chương trình thực tập sớm |
| themePrimary                 | #dc2626       | Màu chính của giao diện                       |
| themePrimaryForeground       | #ffffff       | Màu chữ trên nền màu chính                    |
| themeBackground              | #f9fafb       | Màu nền chính của ứng dụng                    |
| themeForeground              | #0f172a       | Màu chữ trên nền chính                        |
| themeAccent                  | #facc15       | Màu nhấn                                      |
| themeAccentForeground        | #1e293b       | Màu chữ trên nền màu nhấn                     |

## Bước 3: Khởi động lại backend

```bash
cd backend
npm run dev
```

## Bước 4: Truy cập Admin Settings

1. Đăng nhập với tài khoản Admin
2. Truy cập: `http://localhost:3000/admin/settings`
3. Bạn sẽ thấy tất cả các cài đặt có thể chỉnh sửa

## Troubleshooting

### Lỗi: "Invalid object name 'system_settings'"
→ Bảng đã tồn tại trong schema.sql, hãy chắc chắn schema đã được chạy

### Lỗi: "No settings found"
→ Chạy lại Bước 1 để thêm dữ liệu mặc định

### API trả về hướng dẫn insert
→ Khi gọi `GET /api/settings` và chưa có dữ liệu, API sẽ trả về:
```json
{
  "success": true,
  "data": [],
  "message": "No settings found. Please run the seed script.",
  "instructions": {
    "step1": "Open SQL Server Management Studio or use sqlcmd",
    "step2": "Connect to your database",
    "step3": "Run the script: backend/database/migrations/002_seed_default_settings.sql",
    "sqlcmdExample": "sqlcmd -S <SERVER> -d <DATABASE> -U <USER> -P <PASSWORD> -i \"backend/database/migrations/002_seed_default_settings.sql\""
  }
}
```

## Thêm setting mới

Để thêm một setting mới vào hệ thống:

```sql
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('tenSetting', 'giaTri', N'Mô tả tiếng Việt');
```

Hoặc sử dụng API:
```bash
PUT /api/settings/tenSetting
Body: {
  "value": "giaTri",
  "description": "Mô tả tiếng Việt"
}
```
