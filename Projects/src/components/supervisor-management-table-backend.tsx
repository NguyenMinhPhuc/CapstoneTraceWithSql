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
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  supervisorsService,
  type Supervisor,
} from "@/services/supervisors.service";
import { majorsService } from "@/services/majors.service";
import { SearchableSelect } from "./searchable-select";
import { AddSupervisorForm } from "./add-supervisor-form";
import { EditSupervisorForm } from "./edit-supervisor-form";
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

export function SupervisorManagementTable() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState<Supervisor[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [majors, setMajors] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] =
    useState<Supervisor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");
  const [filterLecturerType, setFilterLecturerType] = useState<string>("");
  const [filterTitle, setFilterTitle] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("full_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadMajors();
  }, []);

  useEffect(() => {
    filterAndSortSupervisors();
  }, [supervisors, searchTerm]);

  const loadMajors = async () => {
    try {
      const data = await majorsService.getAll();
      setMajors(data);
    } catch (error: any) {
      console.error("Error loading majors:", error);
    }
  };

  const loadData = async (filters?: {
    department?: number;
    lecturer_type?: string;
    title?: string;
  }) => {
    try {
      setLoading(true);
      const data = await supervisorsService.getAll(filters);
      setSupervisors(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể tải danh sách giáo vụ",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filters: {
      department?: number;
      lecturer_type?: string;
      title?: string;
    } = {};
    if (
      filterDepartment !== "" &&
      filterDepartment !== undefined &&
      filterDepartment !== null
    ) {
      filters.department = filterDepartment as number;
    }
    if (filterLecturerType) filters.lecturer_type = filterLecturerType;
    if (filterTitle) filters.title = filterTitle;
    setCurrentPage(1);
    loadData(filters);
  };

  const clearFilters = () => {
    setFilterDepartment("");
    setFilterLecturerType("");
    setFilterTitle("");
    setCurrentPage(1);
    loadData();
  };

  // Get major name by ID or code
  const getMajorName = (deptValue: number | string | undefined) => {
    if (deptValue === undefined || deptValue === null || deptValue === "")
      return "-";
    const major = majors.find((m) => {
      if (typeof deptValue === "number") return m.id === deptValue;
      return (
        (m.id !== undefined && m.id.toString() === deptValue) ||
        m.code === deptValue
      );
    });
    return major?.name || String(deptValue);
  };

  const filterAndSortSupervisors = () => {
    let filtered = supervisors;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((s) => {
        const deptStr = String(s.department ?? "").toLowerCase();
        return (
          s.full_name?.toLowerCase().includes(term) ||
          false ||
          s.email?.toLowerCase().includes(term) ||
          false ||
          deptStr.includes(term) ||
          false
        );
      });
    }

    // Sorting
    filtered = filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Supervisor];
      let bValue: any = b[sortBy as keyof Supervisor];

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

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

    setFilteredSupervisors(filtered);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa giảng viên này?")) return;

    try {
      await supervisorsService.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa giảng viên",
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa giảng viên",
      });
    }
  };

  const handleEdit = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowEditDialog(true);
  };

  const handleExportExcel = () => {
    try {
      if (filteredSupervisors.length === 0) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không có giảng viên để xuất",
        });
        return;
      }

      const exportData = filteredSupervisors.map((supervisor, index) => ({
        STT: index + 1,
        Tên: supervisor.full_name,
        Email: supervisor.email,
        "Số điện thoại": supervisor.phone || "",
        Ngành: getMajorName(supervisor.department),
        Loại: supervisor.lecturer_type || "-",
        "Chức danh": supervisor.title,
        "Số SV tối đa": supervisor.max_students,
        "Số SV hiện tại": supervisor.current_students,
        "Trạng thái": supervisor.is_active ? "Hoạt động" : "Không hoạt động",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Giảng viên");

      const colWidths = [
        { wch: 5 }, // STT
        { wch: 20 }, // Tên
        { wch: 25 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 20 }, // Bộ môn
        { wch: 15 }, // Chức danh
        { wch: 12 }, // Số SV tối đa
        { wch: 12 }, // Số SV hiện tại
        { wch: 15 }, // Trạng thái
      ];
      ws["!cols"] = colWidths;

      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      const fileName = `danh-sach-giang-vien-${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Thành công",
        description: `Đã xuất ${filteredSupervisors.length} giảng viên ra file Excel`,
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

  // Phân trang
  const totalPages = Math.ceil(filteredSupervisors.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSupervisors = filteredSupervisors.slice(
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-xl font-semibold">
            Danh sách giảng viên ({filteredSupervisors.length})
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm giảng viên
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, bộ môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={filterDepartment === "" ? "__all" : String(filterDepartment)}
            onValueChange={(value) =>
              setFilterDepartment(value === "__all" ? "" : parseInt(value))
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Tất cả bộ môn</SelectItem>
              {majors.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Loại giảng viên"
            value={filterLecturerType}
            onChange={(e) => setFilterLecturerType(e.target.value)}
            className="w-44"
          />

          <Input
            placeholder="Chức danh"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            className="w-44"
          />

          <Button onClick={applyFilters}>Lọc</Button>
          <Button variant="outline" onClick={clearFilters}>
            Xóa
          </Button>
        </div>
      </div>

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
                  onClick={() => handleSort("full_name")}
                >
                  <div className="flex items-center gap-2">
                    Tên
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
                  onClick={() => handleSort("department")}
                >
                  <div className="flex items-center gap-2">
                    Bộ môn
                    {sortBy === "department" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      ))}
                    {sortBy !== "department" && (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Chức danh</TableHead>
                <TableHead>Số SV</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSupervisors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có giảng viên nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSupervisors.map((supervisor, index) => (
                  <TableRow key={supervisor.id}>
                    <TableCell className="font-medium text-center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {supervisor.full_name}
                    </TableCell>
                    <TableCell>{supervisor.email}</TableCell>
                    <TableCell>{getMajorName(supervisor.department)}</TableCell>
                    <TableCell>{supervisor.lecturer_type || "-"}</TableCell>
                    <TableCell>{supervisor.title}</TableCell>
                    <TableCell>
                      {supervisor.current_students}/{supervisor.max_students}
                    </TableCell>
                    <TableCell>
                      {supervisor.is_active ? (
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
                          onClick={() => handleEdit(supervisor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supervisor.id)}
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
      {filteredSupervisors.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Hiển thị {pageSize} giảng viên / trang
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
              Trang {currentPage} / {totalPages} ({filteredSupervisors.length}{" "}
              giảng viên)
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm giáo vụ mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin giảng viên cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <AddSupervisorForm
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
            <DialogTitle>Chỉnh sửa thông tin giáo vụ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giảng viên trong hệ thống
            </DialogDescription>
          </DialogHeader>
          {selectedSupervisor && (
            <EditSupervisorForm
              supervisor={selectedSupervisor}
              onFinished={() => {
                setShowEditDialog(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
