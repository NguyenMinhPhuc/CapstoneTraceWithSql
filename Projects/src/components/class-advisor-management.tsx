"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, History, Eye, Trash2, Users } from "lucide-react";
import {
  classAdvisorsService,
  type ClassAdvisor,
} from "@/services/classAdvisors.service";
import { ClassAdvisorForm } from "./class-advisor-form";
import { ClassAdvisorHistoryDialog } from "./class-advisor-history-dialog";
import { AdvisorProfilesDialog } from "./advisor-profiles-dialog";

interface ClassAdvisorManagementProps {
  classId?: number; // If provided, show advisors for specific class
  teacherId?: string; // If provided, show classes for specific teacher
}

export function ClassAdvisorManagement({
  classId,
  teacherId,
}: ClassAdvisorManagementProps) {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const canAssign = !!user && user.role === "admin";
  const [advisors, setAdvisors] = useState<ClassAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  // UI state for search/filter/sort/pagination
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string | "">("");
  const [yearFilter, setYearFilter] = useState<string | "">("");
  const [activeOnly, setActiveOnly] = useState<boolean | null>(true);
  const [sortBy, setSortBy] = useState<string>("assigned_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showProfilesDialog, setShowProfilesDialog] = useState(false);
  const [profilesFilterType, setProfilesFilterType] = useState<
    string | undefined
  >(undefined);
  const [profilesInitialTab, setProfilesInitialTab] = useState<
    "current" | "history" | undefined
  >(undefined);
  const [profilesFilterStudentId, setProfilesFilterStudentId] = useState<
    number | undefined
  >(undefined);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<ClassAdvisor | null>(
    null
  );
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [studentsForClass, setStudentsForClass] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showStudentProfileDialog, setShowStudentProfileDialog] =
    useState(false);
  const [studentsSearch, setStudentsSearch] = useState("");
  const [showEvalDialog, setShowEvalDialog] = useState(false);
  const [evalComment, setEvalComment] = useState("");
  const [evalRating, setEvalRating] = useState<number | null>(null);

  const submitEvaluation = async () => {
    if (!selectedStudent) return;
    if (!selectedAdvisor) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không có cố vấn được chọn",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        advisor_id: selectedAdvisor.id,
        profile_type: "assessments",
        title: `Đánh giá ${selectedStudent.full_name}`,
        content: evalComment,
        profile_data: JSON.stringify({
          student_id: selectedStudent.id,
          rating: evalRating,
        }),
      };
      const svc = await import("@/services/classAdvisors.service");
      await svc.classAdvisorsService.addProfile(payload);
      toast({ title: "Đã gửi", description: "Đánh giá đã được lưu" });
      setShowEvalDialog(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi đánh giá",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisors();
  }, [classId, teacherId]);

  const loadAdvisors = async () => {
    setLoading(true);
    try {
      const data = await classAdvisorsService.getAll({
        class_id: classId,
        teacher_id: teacherId,
        // Request all and let client-side filters handle active state
        // default behavior: activeOnly=true
      });
      setAdvisors(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error?.message || "Không thể tải danh sách phân công cố vấn",
      });
    } finally {
      setLoading(false);
    }
  };

  // Derived filtered + sorted data
  const filtered = useMemo(() => {
    let list = advisors.slice();

    // Search across class name, class code, teacher name, teacher email
    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => {
        return (
          String(a.class_name || "")
            .toLowerCase()
            .includes(q) ||
          String(a.class_code || "")
            .toLowerCase()
            .includes(q) ||
          String(a.teacher_name || "")
            .toLowerCase()
            .includes(q) ||
          String(a.teacher_email || "")
            .toLowerCase()
            .includes(q)
        );
      });
    }

    // Semester filter
    if (semesterFilter) {
      list = list.filter((a) => a.semester === semesterFilter);
    }

    // Year filter
    if (yearFilter) {
      list = list.filter((a) => a.academic_year === yearFilter);
    }

    // Active filter
    if (activeOnly === true) list = list.filter((a) => a.is_active);
    if (activeOnly === false) list = list.filter((a) => !a.is_active);

    // Sorting
    list.sort((x, y) => {
      const a = (x as any)[sortBy];
      const b = (y as any)[sortBy];
      if (a == null && b == null) return 0;
      if (a == null) return sortDir === "asc" ? -1 : 1;
      if (b == null) return sortDir === "asc" ? 1 : -1;
      if (typeof a === "string" && typeof b === "string") {
        return sortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      }
      if (a > b) return sortDir === "asc" ? 1 : -1;
      if (a < b) return sortDir === "asc" ? -1 : 1;
      return 0;
    });

    return list;
  }, [
    advisors,
    search,
    semesterFilter,
    yearFilter,
    activeOnly,
    sortBy,
    sortDir,
  ]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa phân công này?")) return;

    try {
      await classAdvisorsService.delete(id);
      toast({
        title: "Thành công",
        description: "Đã xóa phân công cố vấn",
      });
      loadAdvisors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa phân công",
      });
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Bạn có chắc muốn kết thúc phân công này?")) return;

    try {
      await classAdvisorsService.update(id, { is_active: false });
      toast({
        title: "Thành công",
        description: "Đã kết thúc phân công cố vấn",
      });
      loadAdvisors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật phân công",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header (title removed — page provides the main title) */}
      <div className="flex items-center justify-between">
        <div />
        {canAssign ? (
          <Button onClick={() => setShowAssignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Phân công GV
          </Button>
        ) : null}
      </div>

      {/* Controls: search / filters / page size */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm lớp hoặc giáo viên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={semesterFilter}
          onChange={(e) => {
            setSemesterFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="">Tất cả học kỳ</option>
          <option value="HK1">HK1</option>
          <option value="HK2">HK2</option>
          <option value="HK3">HK3</option>
        </select>
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="">Tất cả năm học</option>
          {Array.from(new Set(advisors.map((a) => a.academic_year))).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value));
            setPage(1);
          }}
          className="border rounded px-2 py-1"
        >
          <option value={5}>5 / trang</option>
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Trạng thái:</label>
          <select
            value={
              activeOnly === null ? "all" : activeOnly ? "active" : "inactive"
            }
            onChange={(e) => {
              const v = e.target.value;
              setActiveOnly(v === "all" ? null : v === "active");
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : advisors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Chưa có phân công nào
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => {
                    setSortBy("class_name");
                    setSortDir(
                      sortBy === "class_name" && sortDir === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Lớp
                </TableHead>
                <TableHead
                  onClick={() => {
                    setSortBy("teacher_name");
                    setSortDir(
                      sortBy === "teacher_name" && sortDir === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Giáo viên
                </TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead
                  onClick={() => {
                    setSortBy("academic_year");
                    setSortDir(
                      sortBy === "academic_year" && sortDir === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Năm học
                </TableHead>
                <TableHead
                  onClick={() => {
                    setSortBy("assigned_date");
                    setSortDir(
                      sortBy === "assigned_date" && sortDir === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Ngày phân công
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>SV</TableHead>
                <TableHead>Hồ sơ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((advisor) => (
                <TableRow key={advisor.id}>
                  <TableCell>
                    <button
                      className="text-left w-full"
                      onClick={async () => {
                        // Load students for this class and open dialog
                        try {
                          setLoading(true);
                          const rows = await (
                            await import("@/services/students.service")
                          ).studentsService.getAll(advisor.class_id);
                          setStudentsForClass(rows || []);
                          setSelectedClassId(advisor.class_id);
                          setSelectedAdvisor(advisor);
                          setShowStudentsDialog(true);
                        } catch (e) {
                          toast({
                            variant: "destructive",
                            title: "Lỗi",
                            description: "Không thể tải danh sách sinh viên",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <div className="font-medium">{advisor.class_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {advisor.class_code}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{advisor.teacher_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {advisor.teacher_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{advisor.semester}</TableCell>
                  <TableCell>{advisor.academic_year}</TableCell>
                  <TableCell>
                    {new Date(advisor.assigned_date).toLocaleDateString(
                      "vi-VN"
                    )}
                  </TableCell>
                  <TableCell>
                    {advisor.is_active ? (
                      <Badge variant="default">Đang hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Đã kết thúc</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {advisor.student_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAdvisor(advisor);
                        setShowProfilesDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {advisor.profile_count || 0}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClassId(advisor.class_id);
                          setShowHistoryDialog(true);
                        }}
                        title="Xem lịch sử"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      {advisor.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(advisor.id)}
                          title="Kết thúc phân công"
                        >
                          Kết thúc
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(advisor.id)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination footer */}
          <div className="flex items-center justify-between p-3">
            <div>
              <span className="text-sm text-muted-foreground">
                Hiển thị {Math.min((page - 1) * pageSize + 1, total)} -{" "}
                {Math.min(page * pageSize, total)} của {total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Trước
              </Button>
              <div className="text-sm">
                {page} / {totalPages}
              </div>
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phân công Giáo viên Chủ nhiệm</DialogTitle>
            <DialogDescription>
              Gán giáo viên cố vấn học tập cho lớp theo học kỳ
            </DialogDescription>
          </DialogHeader>
          {canAssign ? (
            <ClassAdvisorForm
              onSuccess={() => {
                setShowAssignDialog(false);
                loadAdvisors();
              }}
              defaultClassId={classId}
            />
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Bạn không có quyền phân công giáo viên.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEvalDialog} onOpenChange={setShowEvalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Đánh giá sinh viên</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Sinh viên</div>
              <div className="font-medium">{selectedStudent?.full_name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedStudent?.student_code}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">
                Điểm / Xếp loại (tùy chọn)
              </div>
              <Input
                type="number"
                value={evalRating ?? ""}
                onChange={(e) =>
                  setEvalRating(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Ví dụ: 8.5"
              />
            </div>

            <div>
              <div className="text-sm text-muted-foreground">
                Ghi chú / Nhận xét
              </div>
              <Textarea
                value={evalComment}
                onChange={(e) => setEvalComment(e.target.value)}
                placeholder="Viết nhận xét..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEvalDialog(false)}
              >
                Hủy
              </Button>
              <Button onClick={submitEvaluation} disabled={loading}>
                Gửi đánh giá
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      {selectedClassId && (
        <ClassAdvisorHistoryDialog
          classId={selectedClassId}
          open={showHistoryDialog}
          onOpenChange={setShowHistoryDialog}
        />
      )}

      {/* Profiles Dialog */}
      {selectedAdvisor && (
        <AdvisorProfilesDialog
          advisor={selectedAdvisor}
          open={showProfilesDialog}
          onOpenChange={(open) => {
            setShowProfilesDialog(open);
            if (!open) {
              setProfilesFilterType(undefined);
              setProfilesInitialTab(undefined);
              setProfilesFilterStudentId(undefined);
            }
          }}
          initialTab={profilesInitialTab}
          filterProfileType={profilesFilterType}
          filterStudentId={profilesFilterStudentId}
        />
      )}

      {/* Students Dialog (for a class) */}
      <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Danh sách sinh viên</DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="Tìm sinh viên theo tên hoặc mã..."
                value={studentsSearch}
                onChange={(e) => setStudentsSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            {studentsForClass.length === 0 ? (
              <div className="p-4 text-muted-foreground">
                Không có sinh viên
              </div>
            ) : (
              <div className="space-y-2">
                {studentsForClass
                  .filter((s) => {
                    if (!studentsSearch) return true;
                    const q = studentsSearch.trim().toLowerCase();
                    return (
                      String(s.full_name || "")
                        .toLowerCase()
                        .includes(q) ||
                      String(s.student_code || "")
                        .toLowerCase()
                        .includes(q) ||
                      String(s.email || "")
                        .toLowerCase()
                        .includes(q)
                    );
                  })
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{s.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {s.student_code} • {s.class_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(s);
                            setShowStudentProfileDialog(true);
                          }}
                        >
                          Xem hồ sơ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(s);
                            setEvalComment("");
                            setEvalRating(null);
                            setShowEvalDialog(true);
                          }}
                        >
                          Đánh giá
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Open advisor profiles dialog filtered to assessments
                            if (selectedAdvisor) {
                              setProfilesFilterType("assessments");
                              setProfilesInitialTab("current");
                              setProfilesFilterStudentId(s.id);
                              setShowProfilesDialog(true);
                            } else {
                              toast({
                                variant: "destructive",
                                title: "Lỗi",
                                description: "Không có cố vấn được chọn",
                              });
                            }
                          }}
                        >
                          Xem đánh giá CVHT
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog
        open={showStudentProfileDialog}
        onOpenChange={setShowStudentProfileDialog}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Hồ sơ sinh viên</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            // Dynamically import StudentProfileView to avoid circular deps
            <React.Suspense>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* StudentProfileView expects studentId prop */}
              {React.createElement(
                (require as any)("@/components/student-profile-view").default,
                {
                  studentId: String(selectedStudent.id),
                  onClose: () => setShowStudentProfileDialog(false),
                  editable: false,
                }
              )}
            </React.Suspense>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
