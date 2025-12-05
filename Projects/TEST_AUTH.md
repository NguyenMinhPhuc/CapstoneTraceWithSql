# Hướng Dẫn Test Chức Năng Đăng Ký & Đăng Nhập

## ✅ Đã Hoàn Thành

### Backend
- ✅ API đăng ký user (`POST /api/auth/register`)
- ✅ API đăng nhập (`POST /api/auth/login`)
- ✅ API lấy thông tin user (`GET /api/auth/profile`)
- ✅ API đổi mật khẩu (`PUT /api/auth/change-password`)
- ✅ API làm mới token (`POST /api/auth/refresh`)
- ✅ API đăng xuất (`POST /api/auth/logout`)
- ✅ JWT Authentication middleware
- ✅ Swagger documentation tại http://localhost:5000/api-docs

### Frontend
- ✅ API Client với automatic token refresh
- ✅ Auth Service (register, login, logout, getProfile, changePassword)
- ✅ Auth Context (React Context cho auth state)
- ✅ Trang đăng nhập (`/login`)
- ✅ Trang đăng ký (`/register`)
- ✅ Header với user menu và logout
- ✅ Integration với backend API

## 🚀 Hướng Dẫn Test

### 1. Đảm bảo Backend đang chạy
```bash
cd backend
npm run dev
```
Backend sẽ chạy tại: http://localhost:5000

### 2. Đảm bảo Frontend đang chạy
```bash
npm run dev
```
Frontend sẽ chạy tại: http://localhost:3000

### 3. Test Đăng Ký Tài Khoản

1. Mở trình duyệt và truy cập: http://localhost:3000/register
2. Điền thông tin:
   - **Họ**: Nguyễn
   - **Tên**: Văn A
   - **Email**: test@example.com
   - **Mật khẩu**: Password123!
   - **Vai trò**: Sinh viên hoặc Giáo viên hướng dẫn
3. Click "Tạo tài khoản"
4. ✅ Nếu thành công, bạn sẽ được tự động đăng nhập và chuyển về trang chủ
5. ✅ Kiểm tra header - bạn sẽ thấy tên của mình ở góc phải

### 4. Test Đăng Xuất

1. Click vào avatar/tên ở góc phải header
2. Click "Logout"
3. ✅ Bạn sẽ được chuyển về trang login

### 5. Test Đăng Nhập

1. Truy cập: http://localhost:3000/login
2. Điền thông tin:
   - **Email**: test@example.com
   - **Mật khẩu**: Password123!
3. Click "Đăng nhập"
4. ✅ Bạn sẽ được chuyển về trang chủ
5. ✅ Kiểm tra header - bạn sẽ thấy tên của mình

### 6. Test Token Refresh (Tự động)

Token sẽ tự động được làm mới khi:
- Access token hết hạn (sau 24 giờ)
- API client sẽ tự động dùng refresh token để lấy access token mới
- Người dùng không cần làm gì cả

### 7. Test với Multiple Users

Bạn có thể tạo nhiều tài khoản với email khác nhau để test:
- `student1@example.com` (role: student)
- `supervisor1@example.com` (role: supervisor)
- `student2@example.com` (role: student)

## 🔍 Test với Swagger UI

1. Truy cập: http://localhost:5000/api-docs
2. Expand "Auth" endpoints
3. Test từng API:
   - **POST /auth/register** - Đăng ký user mới
   - **POST /auth/login** - Đăng nhập
   - **GET /auth/profile** - Lấy thông tin (cần token)
   - **PUT /auth/change-password** - Đổi mật khẩu (cần token)
   - **POST /auth/refresh** - Làm mới token
   - **POST /auth/logout** - Đăng xuất

### Test với Bearer Token trong Swagger:

1. Đăng nhập để lấy token
2. Copy `token` từ response
3. Click nút "Authorize" ở đầu trang Swagger
4. Paste token vào (format: `Bearer <your_token>`)
5. Click "Authorize"
6. Giờ có thể test các protected endpoints như `/auth/profile`

## 🗄️ Kiểm tra Database

Kết nối vào SQL Server để xem dữ liệu:
- Server: 118.69.126.49
- Database: CapstoneTrack
- User: sa

Query để xem users đã tạo:
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

Query để xem students:
```sql
SELECT * FROM students ORDER BY created_at DESC;
```

Query để xem supervisors:
```sql
SELECT * FROM supervisors ORDER BY created_at DESC;
```

## 🐛 Các Lỗi Thường Gặp

### 1. "Network Error" hoặc không connect được API
- ✅ Kiểm tra backend đang chạy tại port 5000
- ✅ Kiểm tra file `.env.local` có `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

### 2. "Invalid email or password"
- ✅ Kiểm tra email và mật khẩu đúng chưa
- ✅ Kiểm tra user đã được tạo trong database chưa

### 3. "401 Unauthorized" khi call protected endpoints
- ✅ Kiểm tra đã đăng nhập chưa
- ✅ Kiểm tra token còn hiệu lực không
- ✅ Clear localStorage và đăng nhập lại

### 4. Frontend không hiển thị user sau khi login
- ✅ Mở DevTools > Console để xem lỗi
- ✅ Mở DevTools > Application > Local Storage > Kiểm tra có `accessToken`, `refreshToken`, `user`
- ✅ Kiểm tra AuthContext đã wrap toàn bộ app chưa

## 📝 Test Scenarios Đầy Đủ

### Scenario 1: Đăng ký thành công
1. ✅ Vào /register
2. ✅ Điền thông tin hợp lệ
3. ✅ Submit form
4. ✅ Nhận toast "Thành công"
5. ✅ Được redirect về "/"
6. ✅ Header hiển thị tên user

### Scenario 2: Đăng ký với email đã tồn tại
1. ✅ Vào /register
2. ✅ Điền email đã dùng ở Scenario 1
3. ✅ Submit form
4. ✅ Nhận toast lỗi "Email already exists"

### Scenario 3: Đăng nhập thành công
1. ✅ Vào /login
2. ✅ Điền email và password đúng
3. ✅ Submit form
4. ✅ Nhận toast "Thành công"
5. ✅ Được redirect về "/"
6. ✅ Header hiển thị tên user

### Scenario 4: Đăng nhập sai mật khẩu
1. ✅ Vào /login
2. ✅ Điền email đúng nhưng password sai
3. ✅ Submit form
4. ✅ Nhận toast lỗi "Invalid email or password"

### Scenario 5: Đăng xuất
1. ✅ Đang ở trạng thái đã đăng nhập
2. ✅ Click avatar menu > Logout
3. ✅ Được redirect về /login
4. ✅ localStorage bị xóa (accessToken, refreshToken, user)

### Scenario 6: Truy cập protected page khi chưa login
(Sẽ implement sau khi có middleware)

## 🎯 Các Chức Năng Đã Hoàn Thành

| Chức năng                  | Backend | Frontend | Status           |
| -------------------------- | ------- | -------- | ---------------- |
| Đăng ký user               | ✅       | ✅        | ✅ Hoàn thành     |
| Đăng nhập                  | ✅       | ✅        | ✅ Hoàn thành     |
| Đăng xuất                  | ✅       | ✅        | ✅ Hoàn thành     |
| Lấy thông tin user         | ✅       | ✅        | ✅ Hoàn thành     |
| Đổi mật khẩu               | ✅       | ⏳        | ⏳ Chưa UI        |
| Làm mới token              | ✅       | ✅        | ✅ Auto refresh   |
| Hiển thị user trong header | -       | ✅        | ✅ Hoàn thành     |
| Protected routes           | ⏳       | ⏳        | ⏳ Chưa implement |

## 📋 Tiếp Theo Cần Làm

1. ⏳ Tạo trang Profile với form đổi mật khẩu
2. ⏳ Tạo Protected Route Component (require login)
3. ⏳ Implement role-based authorization
4. ⏳ Implement các chức năng quản lý khác (students, topics, companies, etc.)

## 🎉 Kết Luận

Chức năng đăng ký & đăng nhập đã hoàn thành đầy đủ và hoạt động tốt!

Bạn có thể:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ Đăng xuất
- ✅ Xem thông tin user trong header
- ✅ Token tự động refresh khi hết hạn

Next.js frontend đã được integrate thành công với Node.js/Express backend qua REST API!
