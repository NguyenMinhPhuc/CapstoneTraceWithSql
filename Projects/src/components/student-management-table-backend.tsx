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
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  Upload,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from "lucide-react";
import { studentsService, type Student } from "@/services/students.service";
import { AddStudentForm } from "./add-student-form-backend";
import { EditStudentForm } from "./edit-student-form-backend";
import { ImportStudentsDialogBackend } from "./import-students-dialog-backend";
import { TransferClassForm } from "./transfer-class-form";
import { SearchableSelect } from "./searchable-select";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classesService, type Class } from "@/services/classes.service";
import { majorsService, type Major } from "@/services/majors.service";
import {
  departmentsService,
  type Department,
} from "@/services/departments.service";

export function StudentManagementTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showTransferClassDialog, setShowTransferClassDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentForTransfer, setSelectedStudentForTransfer] =
    useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("student_code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, classFilter, majorFilter, departmentFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData, majorsData, departmentsData] =
        await Promise.all([
          studentsService.getAll(),
          classesService.getAll(),
          majorsService.getAll(),
          departmentsService.getAll(),
        ]);
      setStudents(studentsData);
      setClasses(classesData);
      setMajors(majorsData);
      setDepartments(departmentsData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể tải danh sách sinh viên",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(term) ||
          s.student_code.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
      );
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter((s) => s.class_id?.toString() === classFilter);
    }

    // Major filter
    if (majorFilter !== "all") {
      filtered = filtered.filter((s) => s.major_id?.toString() === majorFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (s) => s.department_id?.toString() === departmentFilter
      );
    }

    // Sorting
    filtered = filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Student];
      let bValue: any = b[sortBy as keyof Student];

      // Handle null/undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Convert to lowercase for string comparison
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredStudents(filtered);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleStatusChange = async (studentId: number, newStatus: string) => {
    if (isUpdating) {
      console.log("Already updating, skipping...");
      return;
    }

    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không tìm thấy sinh viên",
        });
        return;
      }

      // Nếu trạng thái không thay đổi, bỏ qua
      if (student.status === newStatus) {
        console.log("Status unchanged, skipping...");
        return;
      }

      setIsUpdating(true);

      const updateData = {
        student_code: student.student_code,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        address: student.address,
        class_id: student.class_id,
        avatar_url: student.avatar_url,
        status: newStatus,
      };

      console.log("Updating student:", studentId, updateData);

      await studentsService.update(studentId, updateData);

      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái thành "${newStatus}"`,
      });

      await loadData();
    } catch (error: any) {
      console.error("Update error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật trạng thái";
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sinh viên này?")) return;

    try {
      await studentsService.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa sinh viên",
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa sinh viên",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowEditDialog(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setMajorFilter("all");
    setDepartmentFilter("all");
    setCurrentPage(1);
  };

  // Phân trang
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    try {
      if (filteredStudents.length === 0) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không có sinh viên để xuất",
        });
        return;
      }

      // Chuẩn bị dữ liệu
      const exportData = filteredStudents.map((student, index) => ({
        STT: index + 1,
        MSSV: student.student_code,
        "Họ và tên": student.full_name,
        Email: student.email,
        "Số điện thoại": student.phone || "",
        Lớp: student.class_name || "",
        Ngành: student.major_name || "",
        Khoa: student.department_name || "",
        "Trạng thái": student.status,
      }));

      // Tạo workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sinh viên");

      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 12 }, // MSSV
        { wch: 20 }, // Họ và tên
        { wch: 25 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 15 }, // Lớp
        { wch: 15 }, // Ngành
        { wch: 15 }, // Khoa
        { wch: 15 }, // Trạng thái
      ];
      ws["!cols"] = colWidths;

      // Thiết lập style cho header
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      // Tải file
      const fileName = `danh-sach-sinh-vien-${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Thành công",
        description: `Đã xuất ${filteredStudents.length} sinh viên ra file Excel`,
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xuất file Excel",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            Danh sách sinh viên ({filteredStudents.length})
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sinh viên
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <SearchableSelect
          items={[
            ...departments.map((dept) => ({
              value: dept.id.toString(),
              label: dept.name,
            })),
          ]}
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
          placeholder="Chọn khoa"
          searchPlaceholder="Tìm khoa..."
        />

        <SearchableSelect
          items={[
            ...majors.map((major) => ({
              value: major.id.toString(),
              label: major.name,
              group: major.department_name || "Chưa có khoa",
            })),
          ]}
          value={majorFilter}
          onValueChange={setMajorFilter}
          placeholder="Chọn ngành"
          searchPlaceholder="Tìm ngành..."
          showGroups={true}
        />

        <SearchableSelect
          items={[
            ...classes.map((cls) => ({
              value: cls.id.toString(),
              label: `${cls.name} (${cls.major_name || "Chưa có ngành"})`,
              group: cls.major_name || "Chưa có ngành",
            })),
          ]}
          value={classFilter}
          onValueChange={setClassFilter}
          placeholder="Chọn lớp"
          searchPlaceholder="Tìm lớp..."
          showGroups={true}
        />
      </div>

      {(searchTerm ||
        classFilter !== "all" ||
        majorFilter !== "all" ||
        departmentFilter !== "all") && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Đang lọc: {filteredStudents.length} / {students.length} sinh viên
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Table */}
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
                <TableHead className="w-12">STT</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("student_code")}
                >
                  <div className="flex items-center gap-2">
                    MSSV
                    {sortBy === "student_code" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "student_code" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("full_name")}
                >
                  <div className="flex items-center gap-2">
                    Họ và tên
                    {sortBy === "full_name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "full_name" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {sortBy === "email" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "email" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center gap-2">
                    Số điện thoại
                    {sortBy === "phone" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "phone" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("class_name")}
                >
                  <div className="flex items-center gap-2">
                    Lớp
                    {sortBy === "class_name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "class_name" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("major_name")}
                >
                  <div className="flex items-center gap-2">
                    Ngành
                    {sortBy === "major_name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "major_name" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleSort("department_name")}
                >
                  <div className="flex items-center gap-2">
                    Khoa
                    {sortBy === "department_name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "department_name" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có sinh viên nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.student_code}
                    </TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>{student.class_name || "-"}</TableCell>
                    <TableCell>{student.major_name || "-"}</TableCell>
                    <TableCell>{student.department_name || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={student.status || "Đang học"}
                        onValueChange={(value) =>
                          handleStatusChange(student.id, value)
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Đang học">
                            <div className="flex items-center gap-2">
                              <Badge variant="default">Đang học</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Bảo lưu">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Bảo lưu</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Nghỉ học">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">Nghỉ học</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Nghỉ học khi tuyển sinh">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                Nghỉ học khi tuyển sinh
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="Đã tốt nghiệp">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-600">
                                Đã tốt nghiệp
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudentForTransfer(student);
                            setShowTransferClassDialog(true);
                          }}
                          title="Chuyển lớp"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Hiển thị {pageSize} sinh viên / trang
            </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages} ({filteredStudents.length} sinh
              viên)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Trước
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Transfer Class Dialog */}
      <Dialog
        open={showTransferClassDialog}
        onOpenChange={setShowTransferClassDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chuyển lớp cho sinh viên</DialogTitle>
            <DialogDescription>
              Chọn lớp mới để chuyển sinh viên sang
            </DialogDescription>
          </DialogHeader>
          {selectedStudentForTransfer && (
            <TransferClassForm
              student={selectedStudentForTransfer}
              classes={classes}
              onFinished={() => {
                setShowTransferClassDialog(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm sinh viên mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin sinh viên cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <AddStudentForm
            onFinished={() => {
              setShowAddDialog(false);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin sinh viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sinh viên trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <EditStudentForm
              student={selectedStudent}
              onFinished={() => {
                setShowEditDialog(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import danh sách sinh viên từ Excel</DialogTitle>
            <DialogDescription>
              Tải lên file Excel chứa danh sách sinh viên cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <ImportStudentsDialogBackend
            onFinished={() => {
              setShowImportDialog(false);
              loadData();
            }}
            classes={classes}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
