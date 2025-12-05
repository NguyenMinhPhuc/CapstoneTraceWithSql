# Roadmap Tích Hợp Frontend với Backend Mới

## ✅ Đã hoàn thành
1. Backend API với SQL Server
2. Authentication endpoints (register, login, profile)
3. Swagger documentation
4. Test đăng ký user thành công

## 🎯 Các bước tiếp theo

### Bước 1: Tạo API Client cho Frontend (30 phút)
**Mục đích:** Thay thế Firebase SDK bằng HTTP client

**Cần làm:**
```bash
# Trong thư mục root (không phải backend)
npm install axios
```

**Tạo các file:**
- [ ] `src/lib/api-client.ts` - HTTP client với axios
- [ ] `src/services/auth.service.ts` - Auth service
- [ ] `src/contexts/auth-context.tsx` - Auth context provider

### Bước 2: Update Authentication Flow (1 giờ)
**Thay thế Firebase Auth bằng JWT**

**Cần sửa:**
- [ ] `src/app/login/page.tsx` - Đổi từ Firebase signIn sang API call
- [ ] `src/app/register/page.tsx` - Đổi từ Firebase signUp sang API call
- [ ] `src/app/layout.tsx` - Thêm AuthProvider
- [ ] Remove/comment Firebase provider imports

### Bước 3: Implement Controllers Backend (2-3 giờ)
**Các controller cần thiết cho app:**

**Priority HIGH:**
- [ ] Student Controller (CRUD students)
- [ ] Topic Controller (CRUD topics, approve/reject)
- [ ] Company Controller (CRUD companies)
- [ ] Supervisor Controller (CRUD supervisors, assign students)

**Priority MEDIUM:**
- [ ] Internship Controller (registrations, approvals)
- [ ] Progress Report Controller (submit, review reports)
- [ ] Defense Controller (sessions, assignments)
- [ ] Grading Controller (rubrics, grades)

**Priority LOW:**
- [ ] Resource Controller
- [ ] Conversation Controller
- [ ] Notification Controller

### Bước 4: Update Frontend Components (3-4 giờ)
**Chuyển đổi các component từ Firestore sang REST API**

**Ví dụ cần đổi:**

**TRƯỚC (Firestore):**
```typescript
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'students'));
```

**SAU (REST API):**
```typescript
import { studentService } from '@/services/student.service';
const response = await studentService.getAll();
```

**Components cần update:**
- [ ] Student management components
- [ ] Topic management components
- [ ] Company management components
- [ ] Supervisor components
- [ ] Dashboard components

### Bước 5: Test End-to-End (1 giờ)
- [ ] Test login flow
- [ ] Test student CRUD
- [ ] Test topic submission
- [ ] Test supervisor assignment
- [ ] Test grading flow

### Bước 6: Deploy (optional)
- [ ] Deploy backend lên server
- [ ] Deploy frontend lên Vercel/Netlify
- [ ] Update environment variables

---

## 🚀 BẮT ĐẦU NGAY: Bước 1 - Tạo API Client

### 1.1. Cài đặt dependencies
```bash
npm install axios
```

### 1.2. Tạo API Client
Tạo file `src/lib/api-client.ts`

### 1.3. Tạo Auth Service
Tạo file `src/services/auth.service.ts`

### 1.4. Tạo Auth Context
Tạo file `src/contexts/auth-context.tsx`

### 1.5. Update Layout
Sửa file `src/app/layout.tsx` để wrap với AuthProvider

### 1.6. Update Login Page
Sửa file `src/app/login/page.tsx`

---

## 📊 Timeline Ước Tính

| Bước                   | Thời gian   | Độ khó     |
| ---------------------- | ----------- | ---------- |
| 1. API Client Setup    | 30 phút     | Dễ         |
| 2. Auth Flow           | 1 giờ       | Trung bình |
| 3. Backend Controllers | 2-3 giờ     | Trung bình |
| 4. Frontend Components | 3-4 giờ     | Khó        |
| 5. Testing             | 1 giờ       | Dễ         |
| **TỔNG**               | **7-9 giờ** |            |

---

## 🔥 LỰA CHỌN TIẾP THEO

**Tôi có thể giúp bạn:**

**Option A: Tạo API Client và Auth Service ngay** (Recommended)
- Tôi sẽ tạo tất cả file cần thiết để frontend có thể gọi API
- Thời gian: ~15 phút
- Sau đó bạn có thể test login/register từ frontend

**Option B: Implement Student Controller trước**
- Backend có API đầy đủ để quản lý students
- Thời gian: ~30 phút
- Sau đó tôi tạo API client để frontend sử dụng

**Option C: Implement tất cả Controllers cần thiết**
- Làm xong toàn bộ backend API
- Thời gian: ~2 giờ
- Sau đó mới chuyển sang frontend

**Bạn muốn chọn option nào?**

Hoặc nếu bạn muốn tôi làm theo thứ tự khác, hãy cho tôi biết!
