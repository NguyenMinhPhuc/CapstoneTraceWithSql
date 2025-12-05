# Hướng dẫn tích hợp Lịch sử Thay đổi Trạng thái Hồ sơ Sinh viên

## 1. Cài đặt Database

### Bước 1: Chạy migration tạo bảng
```sql
-- Chạy file: backend/database/migrations/add_profile_status_history.sql
-- Tạo bảng profile_status_history với các index cần thiết
```

### Bước 2: Cài đặt stored procedures
```sql
-- Chạy file: backend/database/stored-procedures/profile_status_history.sql
-- Tạo 3 stored procedures:
-- - sp_AddProfileStatusHistory
-- - sp_GetProfileStatusHistory
-- - sp_GetAllProfileStatusHistory
```

### Bước 3: Cập nhật stored procedure sp_UpdateStudent
```sql
-- File backend/database/stored-procedures/students.sql đã được cập nhật
-- Thêm 2 parameters: @changed_by và @change_notes
-- Tự động ghi log khi status thay đổi
```

## 2. Backend đã được cập nhật

### Repository (students.repository.ts)
Đã thêm:
- Interface: `ProfileStatusHistory`, `AddStatusHistoryInput`
- Method: `addStatusHistory()` - Thêm record lịch sử
- Method: `getStatusHistory()` - Lấy lịch sử theo student_id
- Method: `getAllStatusHistory()` - Lấy tất cả lịch sử (admin)

### Controller (students.controller.ts)
Đã thêm:
- `getStatusHistory()` - GET /students/:id/status-history
- `addStatusHistory()` - POST /students/:id/status-history
- `getAllStatusHistory()` - GET /students/history/all

### Routes (students.routes.ts)
Đã thêm:
- `GET /api/students/:id/status-history` - Xem lịch sử
- `POST /api/students/:id/status-history` - Thêm lịch sử (admin/manager)
- `GET /api/students/history/all` - Xem tất cả lịch sử (admin/manager)

## 3. Frontend đã được cập nhật

### Service (students.service.ts)
Đã thêm:
- Interface: `ProfileStatusHistory`, `StatusHistoryResponse`
- Method: `getStatusHistory()` - Lấy lịch sử theo student_id
- Method: `addStatusHistory()` - Thêm record lịch sử
- Method: `getAllStatusHistory()` - Lấy tất cả lịch sử

### Component đã tạo
- `student-status-history-dialog.tsx` - Dialog hiển thị lịch sử timeline

## 4. Tích hợp vào UI

### Cách 1: Thêm nút "Lịch sử" vào bảng quản lý sinh viên

```tsx
import { StudentStatusHistoryDialog } from "@/components/student-status-history-dialog";
import { History } from "lucide-react";

// Trong component StudentManagementTable:
const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{
  id: number;
  name: string;
} | null>(null);

// Thêm nút trong bảng (TableCell actions):
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    setSelectedStudentForHistory({
      id: student.id,
      name: student.full_name,
    });
    setHistoryDialogOpen(true);
  }}
  title="Xem lịch sử"
>
  <History className="h-4 w-4" />
</Button>

// Thêm dialog ở cuối component:
{selectedStudentForHistory && (
  <StudentStatusHistoryDialog
    studentId={selectedStudentForHistory.id}
    studentName={selectedStudentForHistory.name}
    open={historyDialogOpen}
    onOpenChange={setHistoryDialogOpen}
  />
)}
```

### Cách 2: Thêm tab "Lịch sử" trong trang chi tiết sinh viên

```tsx
import { StudentStatusHistoryDialog } from "@/components/student-status-history-dialog";

// Trong trang profile/[id]:
<Tabs defaultValue="info">
  <TabsList>
    <TabsTrigger value="info">Thông tin</TabsTrigger>
    <TabsTrigger value="history">Lịch sử trạng thái</TabsTrigger>
  </TabsList>
  
  <TabsContent value="info">
    {/* Thông tin sinh viên */}
  </TabsContent>
  
  <TabsContent value="history">
    <StudentStatusHistoryDialog
      studentId={studentId}
      studentName={studentName}
      open={true}
      onOpenChange={() => {}}
    />
  </TabsContent>
</Tabs>
```

### Cách 3: Accordion trong form chỉnh sửa

```tsx
import { StudentStatusHistoryDialog } from "@/components/student-status-history-dialog";

<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="history">
    <AccordionTrigger>Lịch sử thay đổi trạng thái</AccordionTrigger>
    <AccordionContent>
      <StudentStatusHistoryDialog
        studentId={student.id}
        studentName={student.full_name}
        open={true}
        onOpenChange={() => {}}
      />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## 5. Cập nhật form Edit Student

Khi cập nhật status, cần truyền thêm `changed_by` để tự động ghi log:

```tsx
// Trong EditStudentForm hoặc nơi gọi studentsService.update():
import { useAuth } from "@/contexts/auth-context";

const { user } = useAuth();

// Khi submit form:
const updatedData = {
  ...formData,
  changed_by: user?.id, // ID của user đang đăng nhập
  change_notes: notes, // Optional: ghi chú thay đổi
};

await studentsService.update(student.id, updatedData);
```

**Lưu ý:** Backend repository cần cập nhật để truyền `changed_by` vào stored procedure:

```typescript
// Trong students.repository.ts - method update():
async update(data: UpdateStudentInput, changedBy?: string, notes?: string): Promise<Student> {
  const pool = getPool();
  const result = await pool
    .request()
    // ... các input khác ...
    .input("changed_by", sql.NVarChar(50), changedBy ?? null)
    .input("change_notes", sql.NVarChar(sql.MAX), notes ?? null)
    .execute("sp_UpdateStudent");
  return result.recordset[0];
}
```

## 6. Tính năng đã có

### Tự động ghi log
- Khi status thay đổi qua `sp_UpdateStudent`, lịch sử được ghi tự động
- Ghi lại: old_status, new_status, changed_by, changed_at, notes

### Xem lịch sử
- Timeline hiển thị đẹp mắt với icon, màu sắc
- Hiển thị thời gian, người thay đổi, ghi chú
- Phân biệt màu theo trạng thái (Đang học, Bảo lưu, Nghỉ học...)

### Báo cáo admin
- API endpoint: `GET /api/students/history/all`
- Lọc theo khoảng thời gian, loại thay đổi
- Phân trang với limit/offset

## 7. Các trường hợp sử dụng

### Use case 1: Ghi chú chuyển trạng thái
Admin thay đổi status sinh viên từ "Đang học" → "Bảo lưu" với ghi chú:
- "Sinh viên xin bảo lưu 1 năm học do vấn đề sức khỏe"

### Use case 2: Nhập dữ liệu lần đầu
Khi import sinh viên, có thể ghi log với change_type="data_entry":
```typescript
await studentsService.addStatusHistory(studentId, {
  new_status: "Đang học",
  change_type: "data_entry",
  notes: "Nhập dữ liệu từ file Excel tuyển sinh 2024",
});
```

### Use case 3: Điều chỉnh sai sót
Admin sửa lại status do nhập sai, ghi log với change_type="correction":
```typescript
await studentsService.addStatusHistory(studentId, {
  old_status: "Nghỉ học",
  new_status: "Đang học",
  change_type: "correction",
  notes: "Điều chỉnh lại do nhập sai trạng thái ban đầu",
});
```

## 8. Kiểm tra sau khi cài đặt

1. Chạy migration SQL
2. Test API endpoints:
   - `GET /api/students/123/status-history`
   - `POST /api/students/123/status-history`
3. Cập nhật 1 sinh viên và kiểm tra lịch sử tự động ghi
4. Thêm component vào UI và test hiển thị

## 9. Mở rộng trong tương lai

- Thêm filter theo loại thay đổi trong UI
- Export lịch sử thành Excel
- Dashboard thống kê số lượng thay đổi theo thời gian
- Thông báo cho sinh viên khi trạng thái thay đổi
- Approval workflow cho thay đổi trạng thái quan trọng
