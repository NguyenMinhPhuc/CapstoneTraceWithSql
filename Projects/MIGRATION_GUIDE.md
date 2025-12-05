# Hướng dẫn tích hợp Backend mới vào Frontend Next.js

## 🎯 Tổng quan

Tài liệu này hướng dẫn cách thay thế Firebase/Firestore bằng REST API backend mới trong ứng dụng Next.js.

## 📋 Các bước thực hiện

### Bước 1: Cài đặt dependencies mới

```bash
# Cài đặt axios để gọi API
npm install axios

# Cài đặt react-query để quản lý API calls (optional nhưng recommend)
npm install @tanstack/react-query

# Gỡ bỏ Firebase (sau khi đã migration xong)
# npm uninstall firebase firebase-admin
```

### Bước 2: Tạo API Client

Tạo file `src/lib/api-client.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                { refreshToken }
              );

              const { token } = response.data.data;
              this.setAccessToken(token);

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

### Bước 3: Tạo API Service Layer

Tạo file `src/services/auth.service.ts`:

```typescript
import apiClient from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  studentCode?: string;
  classId?: number;
  majorId?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Save tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refresh_token') 
      : null;
    
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/change-password', { currentPassword, newPassword });
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  },
};
```

Tạo các service khác tương tự:

**`src/services/student.service.ts`:**
```typescript
import apiClient from '@/lib/api-client';

export const studentService = {
  async getAll(params?: any) {
    return apiClient.get('/students', { params });
  },

  async getById(id: string) {
    return apiClient.get(`/students/${id}`);
  },

  async create(data: any) {
    return apiClient.post('/students', data);
  },

  async update(id: string, data: any) {
    return apiClient.put(`/students/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/students/${id}`);
  },
};
```

**`src/services/topic.service.ts`:**
```typescript
import apiClient from '@/lib/api-client';

export const topicService = {
  async getAll(params?: any) {
    return apiClient.get('/topics', { params });
  },

  async getById(id: number) {
    return apiClient.get(`/topics/${id}`);
  },

  async create(data: any) {
    return apiClient.post('/topics', data);
  },

  async update(id: number, data: any) {
    return apiClient.put(`/topics/${id}`, data);
  },

  async approve(id: number) {
    return apiClient.post(`/topics/${id}/approve`);
  },
};
```

### Bước 4: Tạo Auth Context/Provider

Tạo file `src/contexts/auth-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage on mount
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.data.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Bước 5: Update Layout để sử dụng AuthProvider

Sửa file `src/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Bước 6: Update Login Page

Sửa file login page để sử dụng API mới:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Bước 7: Update Components để sử dụng API

Ví dụ với student management:

**TRƯỚC (với Firestore):**
```typescript
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export function StudentList() {
  const firestore = useFirestore();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(firestore, 'students'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    };
    fetchStudents();
  }, []);

  // ...
}
```

**SAU (với REST API):**
```typescript
import { useState, useEffect } from 'react';
import { studentService } from '@/services/student.service';

export function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentService.getAll();
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // ...
}
```

### Bước 8: Tạo Protected Route Component

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
```

### Bước 9: Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Production `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
```

## 📊 So sánh Migration

| Tính năng     | Firestore (Cũ)   | SQL Server + REST API (Mới) |
| ------------- | ---------------- | --------------------------- |
| Auth          | Firebase Auth    | JWT tokens                  |
| Data fetching | Firestore SDK    | axios/fetch                 |
| Real-time     | onSnapshot()     | WebSocket/Polling (nếu cần) |
| File upload   | Firebase Storage | Backend API + local storage |
| Security      | Firestore rules  | Backend middleware          |

## ⚠️ Lưu ý quan trọng

1. **Real-time updates**: Nếu bạn đang dùng `onSnapshot()` để theo dõi real-time, cần implement:
   - WebSocket server cho real-time
   - Hoặc polling định kỳ
   - Hoặc dùng Server-Sent Events (SSE)

2. **File uploads**: Firebase Storage cần được thay bằng:
   - Multer middleware trong backend
   - Local file system hoặc cloud storage (S3, Azure Blob)

3. **Testing**: Test kỹ từng chức năng sau khi migrate

4. **Performance**: Thêm caching nếu cần (Redis)

## 🔄 Checklist Migration

- [ ] Cài đặt backend dependencies
- [ ] Tạo SQL Server database
- [ ] Chạy migration script
- [ ] Cài đặt frontend dependencies mới
- [ ] Tạo API client
- [ ] Tạo service layer
- [ ] Update auth context
- [ ] Update tất cả components
- [ ] Update environment variables
- [ ] Testing đầy đủ
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Monitor errors

## 🚀 Next Steps

1. Implement các endpoints còn lại trong backend
2. Add validation và error handling đầy đủ
3. Setup CI/CD
4. Add logging và monitoring
5. Performance optimization
6. Security hardening
