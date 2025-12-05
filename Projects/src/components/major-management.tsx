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
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { majorsService, type Major } from "@/services/majors.service";
import { AddMajorForm } from "./add-major-form";
import { EditMajorForm } from "./edit-major-form";
import { Skeleton } from "./ui/skeleton";

export function MajorManagement() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const { toast } = useToast();

  const loadMajors = async () => {
    try {
      setLoading(true);
      const data = await majorsService.getAll();
      setMajors(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể tải danh sách ngành",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMajors();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa ngành này?")) return;

    try {
      await majorsService.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa ngành",
      });
      loadMajors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa ngành",
      });
    }
  };

  const handleEdit = (major: Major) => {
    setSelectedMajor(major);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Danh sách ngành</h2>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm ngành
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
                <TableHead>Mã ngành</TableHead>
                <TableHead>Tên ngành</TableHead>
                <TableHead>Thuộc khoa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có ngành nào
                  </TableCell>
                </TableRow>
              ) : (
                majors.map((major) => (
                  <TableRow key={major.id}>
                    <TableCell className="font-medium">{major.code}</TableCell>
                    <TableCell>{major.name}</TableCell>
                    <TableCell>{major.department_name || "-"}</TableCell>
                    <TableCell>
                      {major.is_active ? (
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
                          onClick={() => handleEdit(major)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(major.id)}
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
            <DialogTitle>Thêm ngành mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin ngành cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <AddMajorForm
            onFinished={() => {
              setShowAddDialog(false);
              loadMajors();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin ngành</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin ngành trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {selectedMajor && (
            <EditMajorForm
              major={selectedMajor}
              onFinished={() => {
                setShowEditDialog(false);
                loadMajors();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
