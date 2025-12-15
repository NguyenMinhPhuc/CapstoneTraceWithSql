"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { companiesService, Company } from "@/services/companies.service";
import { Skeleton } from "./ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanyForm } from "./company-form";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  Download,
  X,
  Briefcase,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  defenseService,
  type DefenseSession,
} from "@/services/defense.service";
import internshipsService from "@/services/internships.service";
import {
  supervisorsService,
  type Supervisor,
} from "@/services/supervisors.service";

export function CompanyCatalog() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Company | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // State for adding internship position
  const [sessions, setSessions] = useState<DefenseSession[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [positionCompany, setPositionCompany] = useState<Company | null>(null);
  const [positionSessionId, setPositionSessionId] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [positionDescription, setPositionDescription] = useState("");
  const [positionCapacity, setPositionCapacity] = useState(1);
  const [positionManagerId, setPositionManagerId] = useState("__none");
  const [isSubmittingPosition, setIsSubmittingPosition] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await companiesService.getAll();
      setCompanies(data || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể tải dữ liệu",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load defense sessions for position modal
  useEffect(() => {
    (async () => {
      try {
        const s = await defenseService.getAll({ status: "active" });
        setSessions(s || []);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const refreshSessions = async () => {
    try {
      const s = await defenseService.getAll();
      setSessions(s || []);
      toast({ title: "Đã tải lại đợt báo cáo" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể tải đợt",
      });
    }
  };

  // Load supervisors (teachers) for LHU company position manager
  useEffect(() => {
    (async () => {
      try {
        const list = await supervisorsService.getAll();
        setSupervisors(list || []);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let result = companies;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c as any).contact_person
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((c) => {
        const companyType = (c as any).company_type;
        if (typeFilter === "lhu") return companyType === "LHU";
        if (typeFilter === "external")
          return companyType !== "LHU" && companyType;
        return true;
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((c) => (c as any).is_active === isActive);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField as keyof Company];
      let bVal: any = b[sortField as keyof Company];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [companies, searchTerm, typeFilter, statusFilter, sortField, sortOrder]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa doanh nghiệp này không?")) return;
    try {
      await companiesService.delete(id);
      toast({ title: "Đã xóa" });
      await load();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể xóa",
      });
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      setUpdatingId(Number(company.id));
      const newStatus = !(company as any).is_active;
      await companiesService.update(Number(company.id), {
        ...company,
        is_active: newStatus,
      });
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...c, is_active: newStatus } : c
        )
      );
      toast({
        title: "Thành công",
        description: `Trạng thái cập nhật: ${
          newStatus ? "Hoạt động" : "Không hoạt động"
        }`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể cập nhật trạng thái",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const onSaved = async () => {
    setIsAddOpen(false);
    setEditing(null);
    await load();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetPositionForm = () => {
    setPositionSessionId("");
    setPositionTitle("");
    setPositionDescription("");
    setPositionCapacity(1);
    setPositionManagerId("");
  };

  const handleAddPositionClick = (company: Company) => {
    setPositionCompany(company);
    setIsAddPositionOpen(true);
    resetPositionForm();
  };

  // Check if selected company is LHU
  const isLhuCompany =
    (positionCompany as any)?.company_type?.toUpperCase() === "LHU";

  const handleSubmitPosition = async () => {
    if (!positionCompany) return;
    if (!positionSessionId) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn đợt báo cáo.",
      });
      return;
    }
    if (!positionTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề vị trí.",
      });
      return;
    }
    setIsSubmittingPosition(true);
    try {
      await internshipsService.create(Number(positionSessionId), {
        company_id: positionCompany.id,
        title: positionTitle.trim(),
        description: positionDescription.trim(),
        capacity: positionCapacity,
        manager_user_id:
          isLhuCompany && positionManagerId && positionManagerId !== "__none"
            ? positionManagerId
            : null,
        is_active: true,
      });
      toast({
        title: "Thành công",
        description: "Đã thêm vị trí thực tập.",
      });
      setIsAddPositionOpen(false);
      setPositionCompany(null);
      resetPositionForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể thêm vị trí thực tập.",
      });
    } finally {
      setIsSubmittingPosition(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  // Export current filteredCompanies to .xlsx using SheetJS (xlsx)
  const exportToExcel = async () => {
    if (!filteredCompanies || filteredCompanies.length === 0) {
      toast({ title: "Không có dữ liệu để xuất" });
      return;
    }

    // Dynamic import so app builds even if dependency isn't installed yet
    let XLSX: any;
    try {
      const mod = await import("xlsx");
      XLSX = mod && mod.default ? mod.default : mod;
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Thiếu phụ thuộc",
        description: "Vui lòng cài đặt package 'xlsx' (npm install xlsx)",
      });
      return;
    }

    const headers = [
      "STT",
      "ID",
      "Tên",
      "Loại",
      "Địa chỉ",
      "Email",
      "Người liên hệ",
      "Trạng thái",
    ];

    const rows = filteredCompanies.map((c, idx) => [
      idx + 1,
      c.id,
      c.name,
      (c as any).company_type || "Ngoài",
      c.address || "",
      c.email || "",
      (c as any).contact_person || "",
      (c as any).is_active !== false ? "Hoạt động" : "Không hoạt động",
    ]);

    const aoa = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const filename = `companies_export_${now
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "_")}.xlsx`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Bắt đầu tải xuống", description: filename });
  };

  return (
    <div className="space-y-4">
      {/* Header với nút Thêm */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm tên, email, liên hệ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {searchTerm ? (
            <Button
              variant="ghost"
              onClick={() => setSearchTerm("")}
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => exportToExcel()}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm doanh nghiệp
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CompanyForm onSaved={onSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="lhu">LHU</SelectItem>
            <SelectItem value="external">Doanh nghiệp ngoài</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500">
          {filteredCompanies.length} doanh nghiệp
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">STT</TableHead>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={() => handleSort("name")}
                >
                  Tên
                  {sortField === "name" && <ArrowUpDown className="h-4 w-4" />}
                </Button>
              </TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Người liên hệ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-32">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    {(c as any).company_type === "LHU" ? (
                      <Badge variant="default">LHU</Badge>
                    ) : (
                      <Badge variant="outline">
                        {(c as any).company_type || "Ngoài"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {c.address || "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {c.email || "—"}
                  </TableCell>
                  <TableCell>{(c as any).contact_person || "—"}</TableCell>
                  <TableCell>
                    <Switch
                      checked={(c as any).is_active !== false}
                      onCheckedChange={() => handleToggleStatus(c)}
                      disabled={updatingId === Number(c.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPositionClick(c)}
                        title="Thêm vị trí thực tập"
                        className="gap-1"
                      >
                        <Briefcase className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(c)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(Number(c.id))}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <p className="text-gray-500">
                    {companies.length === 0
                      ? "Không có doanh nghiệp nào"
                      : "Không tìm thấy doanh nghiệp phù hợp"}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogTitle>Chỉnh sửa doanh nghiệp</DialogTitle>
            <CompanyForm company={editing} onSaved={onSaved} />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Internship Position Dialog */}
      <Dialog
        open={isAddPositionOpen}
        onOpenChange={(open) => {
          setIsAddPositionOpen(open);
          if (!open) {
            setPositionCompany(null);
            resetPositionForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Thêm vị trí thực tập</DialogTitle>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Thêm vị trí thực tập</h3>
              <p className="text-sm text-gray-500">
                {positionCompany?.name || "Chọn doanh nghiệp"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Đợt báo cáo *</label>
              <div className="flex items-center gap-2">
                <Select
                  value={positionSessionId}
                  onValueChange={setPositionSessionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Chọn đợt --" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} ({s.session_type_name || s.session_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={refreshSessions}>
                  Tải lại
                </Button>
              </div>
              {sessions.length === 0 && (
                <p className="text-xs text-gray-500">
                  Chưa có đợt báo cáo. Nhấn "Tải lại" để thử lại.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiêu đề *</label>
              <Input
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="VD: Thực tập Frontend React"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <Textarea
                value={positionDescription}
                onChange={(e) => setPositionDescription(e.target.value)}
                rows={4}
                placeholder="Nhiệm vụ chính, yêu cầu kỹ năng..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng sinh viên</label>
              <Input
                type="number"
                min={1}
                className="w-32"
                value={positionCapacity}
                onChange={(e) =>
                  setPositionCapacity(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>

            {/* Show teacher/supervisor selector only for LHU companies */}
            {isLhuCompany && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Giảng viên quản lý
                </label>
                <Select
                  value={positionManagerId}
                  onValueChange={setPositionManagerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Chọn giảng viên --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Không chọn</SelectItem>
                    {supervisors.map((sv) => (
                      <SelectItem key={sv.id} value={sv.user_id}>
                        {sv.full_name || sv.email} ({sv.title || "GV"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Chọn giảng viên phụ trách vị trí thực tập này
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddPositionOpen(false)}
              >
                Hủy
              </Button>
              <Button
                disabled={isSubmittingPosition}
                onClick={handleSubmitPosition}
              >
                Thêm vị trí
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
