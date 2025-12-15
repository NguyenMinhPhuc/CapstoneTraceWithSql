# Company Management API - Documentation

## Base URL
```
http://localhost:5000/api/companies
```

## Authentication
All endpoints require:
- **Header**: `Authorization: Bearer {token}`
- **Role**: `admin` or `manager`

---

## Endpoints

### 1. Get All Companies

**Request:**
```http
GET /api/companies
Authorization: Bearer {token}
```

**Query Parameters:**
- `company_type` (optional) — filter by type (e.g., "internal", "external", "LHU")
- `is_active` (optional) — filter by status (true/false)

**Example:**
```bash
GET /api/companies?company_type=external&is_active=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "external_id": null,
      "name": "Tech Corp",
      "address": "123 Tech Street",
      "phone": "0123456789",
      "email": "contact@techcorp.com",
      "contact_person": "John Doe",
      "contact_phone": "0987654321",
      "website": "https://techcorp.com",
      "description": "A tech company",
      "company_type": "external",
      "manager_name": "Jane Smith",
      "manager_phone": "0912345678",
      "is_active": true,
      "created_at": "2025-12-05T10:30:00.000Z",
      "updated_at": "2025-12-05T10:30:00.000Z"
    }
  ]
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### 2. Get Company by ID

**Request:**
```http
GET /api/companies/:id
Authorization: Bearer {token}
```

**Example:**
```bash
GET /api/companies/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "external_id": null,
    "name": "Tech Corp",
    "address": "123 Tech Street",
    "phone": "0123456789",
    "email": "contact@techcorp.com",
    "contact_person": "John Doe",
    "contact_phone": "0987654321",
    "website": "https://techcorp.com",
    "description": "A tech company",
    "company_type": "external",
    "manager_name": "Jane Smith",
    "manager_phone": "0912345678",
    "is_active": true,
    "created_at": "2025-12-05T10:30:00.000Z",
    "updated_at": "2025-12-05T10:30:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

### 3. Create Company

**Request:**
```http
POST /api/companies
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Company",
  "address": "456 Business Ave",
  "phone": "0111111111",
  "email": "info@newcompany.com",
  "contact_person": "Alice Johnson",
  "contact_phone": "0811111111",
  "website": "https://newcompany.com",
  "description": "A new company",
  "company_type": "external",
  "manager_name": "Bob Wilson",
  "manager_phone": "0922222222",
  "is_active": true,
  "external_id": "EXT_001"
}
```

**Required Fields:**
- `name` — Company name (max 255 chars)

**Optional Fields:**
- `address` — Address (max 500 chars)
- `phone` — Phone (max 20 chars)
- `email` — Email (max 255 chars)
- `contact_person` — Contact person name (max 255 chars)
- `contact_phone` — Contact phone (max 20 chars)
- `website` — Website URL (max 255 chars)
- `description` — Description (max unlimited)
- `company_type` — Type (max 250 chars)
- `manager_name` — Manager name (max 250 chars)
- `manager_phone` — Manager phone (max 50 chars)
- `is_active` — Active status (true/false, default: true)
- `external_id` — External ID (max 100 chars)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "external_id": "EXT_001",
    "name": "New Company",
    "address": "456 Business Ave",
    "phone": "0111111111",
    "email": "info@newcompany.com",
    "contact_person": "Alice Johnson",
    "contact_phone": "0811111111",
    "website": "https://newcompany.com",
    "description": "A new company",
    "company_type": "external",
    "manager_name": "Bob Wilson",
    "manager_phone": "0922222222",
    "is_active": true,
    "created_at": "2025-12-05T11:00:00.000Z",
    "updated_at": "2025-12-05T11:00:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Name is required"
}
```

---

### 4. Update Company

**Request:**
```http
PUT /api/companies/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "address": "789 New Street",
  "email": "newemail@company.com",
  "is_active": false
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "external_id": null,
    "name": "Updated Company Name",
    "address": "789 New Street",
    "phone": "0123456789",
    "email": "newemail@company.com",
    "contact_person": "John Doe",
    "contact_phone": "0987654321",
    "website": "https://techcorp.com",
    "description": "A tech company",
    "company_type": "external",
    "manager_name": "Jane Smith",
    "manager_phone": "0912345678",
    "is_active": false,
    "created_at": "2025-12-05T10:30:00.000Z",
    "updated_at": "2025-12-05T11:30:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

### 5. Delete Company

**Request:**
```http
DELETE /api/companies/:id
Authorization: Bearer {token}
```

**Example:**
```bash
DELETE /api/companies/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Company deleted"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Company not found"
}
```

---

## Field Specifications

### contact_person
- **Type**: String
- **Max Length**: 255
- **Constraint**: NOT NULL
- **Note**: If not provided, system uses `manager_name`. If both are empty, error occurs.

### company_type
- **Type**: String
- **Max Length**: 250
- **Examples**: "internal", "external", "LHU", "outsourcing"

### is_active
- **Type**: Boolean
- **Default**: true
- **Values**: true (hoạt động), false (không hoạt động)

---

## HTTP Status Codes

| Code | Meaning               | When                                         |
| ---- | --------------------- | -------------------------------------------- |
| 200  | OK                    | GET, PUT, DELETE success                     |
| 201  | Created               | POST success                                 |
| 400  | Bad Request           | Missing required field or invalid data       |
| 401  | Unauthorized          | No token or invalid token                    |
| 403  | Forbidden             | Insufficient permissions (not admin/manager) |
| 404  | Not Found             | Company ID doesn't exist                     |
| 500  | Internal Server Error | Database error                               |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Example: Complete Workflow

### 1. Create a company
```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Corp",
    "contact_person": "John",
    "email": "john@abccorp.com"
  }'
```

### 2. Get all companies
```bash
curl -X GET http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get specific company
```bash
curl -X GET http://localhost:5000/api/companies/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update company
```bash
curl -X PUT http://localhost:5000/api/companies/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Corp - Updated",
    "is_active": false
  }'
```

### 5. Delete company
```bash
curl -X DELETE http://localhost:5000/api/companies/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Authentication**: All requests must include valid JWT token in Authorization header
2. **SQL Injection**: All parameters are parameterized via mssql driver
3. **Timestamps**: created_at and updated_at are in ISO 8601 format (UTC)
4. **Soft Delete**: No soft delete — DELETE removes the record permanently
5. **Concurrency**: Uses SQL Server's ROWVERSION for optimistic locking (optional)

---

## Stored Procedures Used

- `sp_CreateCompany` — CREATE operation
- `sp_GetAllCompanies` — READ all operation
- `sp_GetCompanyById` — READ single operation
- `sp_UpdateCompany` — UPDATE operation
- `sp_DeleteCompany` — DELETE operation

All procedures are located in: `backend/database/stored-procedures/`
