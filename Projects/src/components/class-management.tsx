"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { classesService, type Class } from "@/services/classes.service";
import { AddClassForm } from "./add-class-form";
import { EditClassForm } from "./edit-class-form";
import { Skeleton } from "./ui/skeleton";

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { toast } = useToast();

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classesService.getAll();
      setClasses(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể tải danh sách lớp",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa lớp này?")) return;

    try {
      await classesService.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa lớp",
      });
      loadClasses();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa lớp",
      });
    }
  };

  const handleEdit = (classData: Class) => {
    setSelectedClass(classData);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Danh sách lớp</h2>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm lớp
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lớp</TableHead>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Ngành</TableHead>
                <TableHead>Khoa</TableHead>
                <TableHead>Niên khóa</TableHead>
                <TableHead>Số SV</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có lớp nào
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">
                      {classItem.code}
                    </TableCell>
                    <TableCell>{classItem.name}</TableCell>
                    <TableCell>{classItem.major_name || "-"}</TableCell>
                    <TableCell>{classItem.department_name || "-"}</TableCell>
                    <TableCell>{classItem.academic_year || "-"}</TableCell>
                    <TableCell>{classItem.student_count || 0}</TableCell>
                    <TableCell>
                      {classItem.is_active ? (
                        <Badge variant="default">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Không hoạt động</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(classItem)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(classItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm lớp mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin lớp cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <AddClassForm
            onFinished={() => {
              setShowAddDialog(false);
              loadClasses();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin lớp</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lớp trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <EditClassForm
              classData={selectedClass}
              onFinished={() => {
                setShowEditDialog(false);
                loadClasses();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
