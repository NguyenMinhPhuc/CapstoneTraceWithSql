# CapstoneTrack Backend API

Backend API cho hệ thống quản lý capstone/internship - Migration từ Firestore sang SQL Server

## 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- SQL Server >= 2019
- npm hoặc yarn

## 🚀 Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình SQL Server

Tạo database mới:

```sql
CREATE DATABASE CapstoneTrack;
```

Chạy script tạo schema:

```bash
# Sử dụng SQL Server Management Studio hoặc sqlcmd
sqlcmd -S localhost -U sa -P YourPassword -i database/schema.sql
```

### 3. Cấu hình môi trường

Copy file `.env.example` thành `.env` và cập nhật thông tin:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
DB_SERVER=localhost
DB_NAME=CapstoneTrack
DB_USER=sa
DB_PASSWORD=YourStrongPassword123!
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 4. Chạy server

Development mode:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Đăng ký user mới

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "studentCode": "SE123456",
  "classId": 1,
  "majorId": 1
}
```

#### POST `/api/auth/login`
Đăng nhập

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "student"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

#### GET `/api/auth/profile`
Lấy thông tin profile (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PUT `/api/auth/change-password`
Đổi mật khẩu (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Other Endpoints

- `/api/users` - User management
- `/api/students` - Student management
- `/api/supervisors` - Supervisor management
- `/api/topics` - Topic management
- `/api/companies` - Company management
- `/api/internships` - Internship registration
- `/api/progress-reports` - Progress reports
- `/api/defense` - Defense sessions
- `/api/grading` - Grading and rubrics
- `/api/resources` - Resources management
- `/api/conversations` - Q&A conversations
- `/api/notifications` - Notifications
- `/api/admin` - Admin dashboard

## 🗄️ Database Schema

Database schema được định nghĩa trong `database/schema.sql` bao gồm:

### Core Tables
- `users` - User accounts
- `students` - Student information
- `supervisors` - Supervisor information
- `companies` - Company information
- `topics` - Capstone/thesis topics
- `internship_registrations` - Internship registrations
- `progress_reports` - Student progress reports

### Academic Structure
- `majors` - Academic majors
- `classes` - Student classes

### Defense & Grading
- `defense_sessions` - Defense sessions
- `councils` - Defense councils
- `subcommittees` - Defense subcommittees
- `rubrics` - Grading rubrics
- `rubric_criteria` - Rubric criteria
- `grades` - Student grades
- `grade_details` - Detailed grades per criterion

### Communication
- `conversations` - Q&A conversations
- `messages` - Conversation messages
- `notifications` - User notifications

### System
- `resources` - Educational resources
- `system_settings` - System configuration
- `audit_logs` - Audit trail

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) để xác thực:

1. Login để nhận `access_token` và `refresh_token`
2. Sử dụng `access_token` trong header `Authorization: Bearer <token>`
3. Khi `access_token` hết hạn, dùng `refresh_token` để lấy token mới

## 👥 User Roles

- `admin` - Quản trị hệ thống
- `supervisor` - Giảng viên hướng dẫn
- `student` - Sinh viên
- `council_member` - Thành viên hội đồng

## 🔧 Development

### Scripts

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run format` - Format code với Prettier
- `npm test` - Chạy tests

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── database/        # Database connection
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── database/
│   └── schema.sql       # Database schema
├── logs/                # Log files
├── uploads/             # File uploads
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 📊 Migration từ Firestore

Script migration từ Firestore sang SQL Server sẽ được cung cấp trong `database/migrate-firestore.ts`

## 🔄 Tích hợp với Frontend

### Thay đổi cần thiết trong Next.js frontend:

1. **Xóa Firebase SDK**
```bash
npm uninstall firebase
```

2. **Cài đặt HTTP client**
```bash
npm install axios
```

3. **Tạo API client** (`src/lib/api.ts`):
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

4. **Update authentication logic**
```typescript
// Login
const response = await api.post('/auth/login', { email, password });
localStorage.setItem('access_token', response.data.data.token);
localStorage.setItem('refresh_token', response.data.data.refreshToken);

// Fetch data
const students = await api.get('/students');
```

## 📝 License

MIT

## 👨‍💻 Author

- Nguyễn Minh phúc
