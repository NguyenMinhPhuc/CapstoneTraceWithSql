"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AddRubricForm } from "./add-rubric-form";
import { EditRubricForm } from "./edit-rubric-form";
import { rubricsService, type Rubric } from "@/services/rubrics.service";

export function RubricManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRubrics() {
    setLoading(true);
    try {
      const res = await rubricsService.listRubrics({ page: 1, pageSize: 100 });
      setRubrics(res.rubrics);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không tải được danh sách rubric",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRubrics();
  }, []);

  const handleEditClick = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRubric) return;
    try {
      await rubricsService.deleteRubric(selectedRubric.id);
      toast({
        title: "Thành công",
        description: `Rubric "${selectedRubric.name}" đã được xóa.`,
      });
      await loadRubrics();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Không thể xóa rubric: ${error.message}`,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRubric(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách Rubric</CardTitle>
              <CardDescription>
                Tạo và quản lý các bộ tiêu chí chấm điểm.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo Rubric mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo Rubric mới</DialogTitle>
                  <DialogDescription>
                    Thiết lập tên, mô tả và các tiêu chí cho bộ rubric của bạn.
                  </DialogDescription>
                </DialogHeader>
                <AddRubricForm
                  onFinished={async () => {
                    setIsAddDialogOpen(false);
                    await loadRubrics();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Rubric</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiêu chí</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rubrics?.map((rubric) => (
                <TableRow key={rubric.id}>
                  <TableCell className="font-medium">{rubric.name}</TableCell>
                  <TableCell className="capitalize">
                    {rubric.rubric_type.replace("_", " ")}
                  </TableCell>
                  <TableCell>{rubric.criteria_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(rubric)}
                        >
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(rubric)}
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Rubric</DialogTitle>
            <DialogDescription>
              Cập nhật tên, mô tả và các tiêu chí cho rubric.
            </DialogDescription>
          </DialogHeader>
          {selectedRubric && (
            <EditRubricForm
              rubricId={selectedRubric.id}
              onFinished={async () => {
                setIsEditDialogOpen(false);
                await loadRubrics();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Rubric và các dữ liệu liên quan
              sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
