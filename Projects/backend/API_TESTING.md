# API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Available Endpoints

### 1. Health Check
```bash
GET http://localhost:5000/health
```

### 2. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A",
  "role": "student",
  "studentCode": "SE123456"
}
```

### 3. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student1@example.com",
  "password": "Password123!"
}
```

Response will include:
- `token` - Access token (expires in 24h)
- `refreshToken` - Refresh token (expires in 7 days)

### 4. Get Profile (requires authentication)
```bash
GET /api/auth/profile
Authorization: Bearer <your_access_token>
```

### 5. Change Password (requires authentication)
```bash
PUT /api/auth/change-password
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

## Testing with PowerShell

### Register a user:
```powershell
$body = @{
    email = "student1@example.com"
    password = "Password123!"
    fullName = "Nguyễn Văn A"
    role = "student"
    studentCode = "SE123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login:
```powershell
$body = @{
    email = "student1@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Access Token: $token"
```

### Get Profile:
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Method Get -Headers $headers
```

## Testing with Postman

1. Import the endpoints above
2. For authenticated endpoints, add header:
   - Key: `Authorization`
   - Value: `Bearer <your_token>`

## Next Steps

1. ✅ Backend đã chạy thành công
2. ✅ Kết nối SQL Server thành công
3. ⏳ Test các API endpoints
4. ⏳ Implement các controllers còn lại
5. ⏳ Tích hợp với frontend Next.js
