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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
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
  History,
} from "lucide-react";
import { studentsService, type Student } from "@/services/students.service";
import { AddStudentForm } from "./add-student-form-backend";
import { EditStudentForm } from "./edit-student-form-backend";
import { ImportStudentsDialogBackend } from "./import-students-dialog-backend";
import { TransferClassForm } from "./transfer-class-form";
import { SearchableSelect } from "./searchable-select";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { StudentStatusHistoryDialog } from "./student-status-history-dialog";
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
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

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
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    studentId: number;
    newStatus: string;
    oldStatus: string;
  } | null>(null);
  const [statusChangeNotes, setStatusChangeNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("student_code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const colors = [
    { bg: "#EEF2FF", accent: "#4F46E5" },
    { bg: "#ECFDF5", accent: "#059669" },
    { bg: "#FFF7ED", accent: "#D97706" },
    { bg: "#FEF2F2", accent: "#DC2626" },
    { bg: "#EFF6FF", accent: "#0369A1" },
    { bg: "#F5F3FF", accent: "#7C3AED" },
  ];

  const [majorDetailOpen, setMajorDetailOpen] = useState(false);
  const [majorDetailName, setMajorDetailName] = useState<string | null>(null);
  const [majorDetailRows, setMajorDetailRows] = useState<Student[]>([]);
  const [majorDetailLoading, setMajorDetailLoading] = useState(false);

  const openMajorDetail = (majorName: string) => {
    setMajorDetailName(majorName);
    setMajorDetailOpen(true);
    setMajorDetailLoading(true);
    try {
      const rows = students.filter(
        (s) => s.major_name === majorName || s.major_name === (majorName as any)
      );
      setMajorDetailRows(rows);
    } catch (e) {
      console.error("Failed to load major detail", e);
      setMajorDetailRows([]);
    } finally {
      setMajorDetailLoading(false);
    }
  };

  const exportMajorDetailXlsx = () => {
    if (!majorDetailName) return;
    const data = majorDetailRows.map((r) => ({
      id: r.id,
      student_code: (r as any).student_code || (r as any).studentId || "",
      full_name: (r as any).full_name || (r as any).firstName || "",
      class_name: (r as any).class_name || (r as any).class || "",
      status: r.status || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    const fileName = `${majorDetailName}_students.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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

    // Mở dialog nhập ghi chú
    setPendingStatusChange({
      studentId,
      newStatus,
      oldStatus: student.status,
    });
    setStatusChangeNotes("");
    setNotesDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const { studentId, newStatus } = pendingStatusChange;

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

      setIsUpdating(true);
      setNotesDialogOpen(false);

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
        change_notes: statusChangeNotes || undefined,
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

      <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-lg font-semibold w-full">
            {isStatsOpen ? (
              <ArrowUp className="h-5 w-5" />
            ) : (
              <ArrowDown className="h-5 w-5" />
            )}
            Thống kê
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {isStatsOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
              {/* Total card */}
              {(() => {
                const c = colors[0];
                const total = students.length;
                return (
                  <div
                    className="p-4 rounded border flex flex-col"
                    style={{
                      backgroundColor: c.bg,
                      borderLeft: `4px solid ${c.accent}`,
                    }}
                  >
                    <div className="text-sm text-muted-foreground">
                      Tổng sinh viên
                    </div>
                    <div
                      className="text-3xl font-extrabold mt-1"
                      style={{ color: c.accent }}
                    >
                      {total}
                    </div>
                    <div className="mt-3 text-sm max-h-36 overflow-auto">
                      <ul className="space-y-1">
                        {majors.map((mj) => {
                          const majCount = students.filter(
                            (s) => s.major_id === mj.id
                          ).length;
                          const pct = total
                            ? ((majCount / total) * 100).toFixed(1)
                            : "0.0";
                          return (
                            <li
                              key={mj.id}
                              className="flex items-center justify-between"
                            >
                              <span className="truncate">{mj.name}</span>
                              <span className="text-muted-foreground">
                                <span className="font-medium">{majCount}</span>{" "}
                                <span className="ml-2 text-xs">· {pct}%</span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {/* overall status breakdown for total card */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const statuses = [
                          "Đang học",
                          "Bảo lưu",
                          "Nghỉ học",
                          "Nghỉ học TS",
                          "Đã tốt nghiệp",
                        ];
                        return statuses.map((st) => {
                          const cnt = students.filter(
                            (s) => (s.status || "") === st
                          ).length;
                          const variant =
                            st === "Đang học"
                              ? "default"
                              : st === "Bảo lưu"
                              ? "secondary"
                              : st === "Nghỉ học"
                              ? "destructive"
                              : st === "Đã tốt nghiệp"
                              ? ""
                              : "outline";
                          return (
                            <div
                              key={st}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Badge variant={variant as any}>{st}</Badge>
                              <span className="font-medium">{cnt}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Per-major cards */}
              {majors.map((mj, idx) => {
                const color = colors[(idx + 1) % colors.length];
                const majCount = students.filter(
                  (s) => s.major_id === mj.id
                ).length;
                const total = students.length;
                const pct = total
                  ? ((majCount / total) * 100).toFixed(1)
                  : "0.0";
                const statusColors: Record<string, string> = {
                  "Đang học": "#059669",
                  "Bảo lưu": "#f59e0b",
                  "Nghỉ học": "#dc2626",
                  "Nghỉ học TS": "#6b7280",
                  "Đã tốt nghiệp": "#2563eb",
                };

                return (
                  <div
                    key={mj.id}
                    className="p-4 rounded border flex flex-col justify-between"
                    style={{
                      backgroundColor: color.bg,
                      borderLeft: `4px solid ${color.accent}`,
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {mj.name}
                      </div>

                      <div className="mt-1 flex items-baseline gap-3">
                        <div
                          className="text-3xl font-extrabold"
                          style={{ color: color.accent }}
                        >
                          {majCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ({pct}%)
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {(() => {
                          const statuses = [
                            "Đang học",
                            "Bảo lưu",
                            "Nghỉ học",
                            "Nghỉ học TS",
                            "Đã tốt nghiệp",
                          ];
                          return statuses.map((st) => {
                            const cnt = students.filter(
                              (s) =>
                                s.major_id === mj.id && (s.status || "") === st
                            ).length;
                            const pctLocal = majCount
                              ? ((cnt / majCount) * 100).toFixed(1)
                              : "0.0";
                            const dotColor = statusColors[st] || "#10b981";
                            return (
                              <div
                                key={st}
                                className="flex items-center gap-2 text-sm whitespace-nowrap"
                              >
                                <span
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                                <span className="font-medium">{st}:</span>
                                <span className="font-semibold">{cnt}</span>
                                <span className="text-muted-foreground text-xs">
                                  ({pctLocal}%)
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        className="bg-violet-700 text-white hover:bg-violet-600"
                        size="sm"
                        onClick={() => openMajorDetail(mj.name)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

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
                              <Badge variant="outline">Nghỉ học TS</Badge>
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
                          variant="ghost"
                          size="sm"
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

      {/* Major detail dialog */}
      <Dialog open={majorDetailOpen} onOpenChange={setMajorDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Danh sách sinh viên{" "}
              {majorDetailName ? `- ${majorDetailName}` : ""}
            </DialogTitle>
            <DialogDescription>
              {majorDetailLoading
                ? "Đang tải..."
                : `${majorDetailRows.length} sinh viên`}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-2 flex justify-end gap-2">
            <Button onClick={exportMajorDetailXlsx}>Xuất Excel (.xlsx)</Button>
          </div>

          <div className="overflow-auto max-h-72">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">MSSV</th>
                  <th className="text-left p-2">Họ và tên</th>
                  <th className="text-left p-2">Lớp</th>
                  <th className="text-left p-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {majorDetailRows.map((s, idx) => (
                  <tr key={s.id || idx} className="border-t">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{s.student_code}</td>
                    <td className="p-2">{s.full_name}</td>
                    <td className="p-2">{s.class_name || "-"}</td>
                    <td className="p-2">{s.status || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Status Change Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ghi chú thay đổi trạng thái</DialogTitle>
            <DialogDescription>
              {pendingStatusChange && (
                <span>
                  Thay đổi từ <strong>{pendingStatusChange.oldStatus}</strong> →{" "}
                  <strong>{pendingStatusChange.newStatus}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
              <Textarea
                value={statusChangeNotes}
                onChange={(e) => setStatusChangeNotes(e.target.value)}
                placeholder="VD: Sinh viên xin bảo lưu do vấn đề sức khỏe"
                rows={4}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Ghi chú sẽ được lưu vào lịch sử thay đổi trạng thái
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNotesDialogOpen(false);
                  setPendingStatusChange(null);
                  setStatusChangeNotes("");
                }}
              >
                Hủy
              </Button>
              <Button onClick={confirmStatusChange}>Xác nhận</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status History Dialog */}
      {selectedStudentForHistory && (
        <StudentStatusHistoryDialog
          studentId={selectedStudentForHistory.id}
          studentName={selectedStudentForHistory.name}
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
        />
      )}
    </div>
  );
}
