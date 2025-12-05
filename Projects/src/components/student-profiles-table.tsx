"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Student, studentsService } from "@/services/students.service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function StudentProfilesTable({
  students,
  onOpenProfile,
}: {
  students: Student[];
  onOpenProfile: (studentId: string) => void;
}) {
  // Switch to server-side paging: local params
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("student_code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [rows, setRows] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    majors: Array<any>;
  } | null>(null);

  const colors = [
    { bg: "#EEF2FF", accent: "#4F46E5" }, // indigo
    { bg: "#ECFDF5", accent: "#059669" }, // emerald
    { bg: "#FFF7ED", accent: "#D97706" }, // amber
    { bg: "#FEF2F2", accent: "#DC2626" }, // red (rose)
    { bg: "#EFF6FF", accent: "#0369A1" }, // sky
    { bg: "#F5F3FF", accent: "#7C3AED" }, // violet
  ];

  // derive class list from provided students prop (used to populate filter options)
  const classes = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.class_name || "-"));
    return Array.from(set)
      .filter((c) => c !== "-")
      .sort();
  }, [students]);

  // Fetch page from server when params change
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          pageSize,
          q: query || undefined,
          class: classFilter !== "all" ? classFilter : undefined,
          profile: profileFilter !== "all" ? (profileFilter as any) : undefined,
          sortBy,
          sortDir,
        };
        const resp = await studentsService.getPaged(params as any);
        if (!mounted) return;
        setRows(resp.rows || []);
        setTotal(resp.total || 0);
      } catch (err) {
        console.error("Failed to load students page", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // load stats (independent)
    (async () => {
      try {
        const s = await studentsService.getStats({
          class: classFilter !== "all" ? classFilter : undefined,
        });
        if (mounted) setStats(s);
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, pageSize, query, classFilter, profileFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMajor, setDetailMajor] = useState<any | null>(null);
  const [detailRows, setDetailRows] = useState<Student[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const openMajorDetail = async (major: any) => {
    setDetailMajor(major);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const rows = await studentsService.getAll(undefined, major.major_id);
      setDetailRows(rows);
    } catch (e) {
      console.error("Failed to load major details", e);
      setDetailRows([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const exportDetailXlsx = async () => {
    if (!detailMajor) return;
    const rows = detailRows;
    // Prepare data as array of objects
    const data = rows.map((r) => ({
      id: r.id,
      student_code: r.student_code,
      full_name: r.full_name,
      class_name: r.class_name || "",
      status: r.status || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${detailMajor.major_name || "major"}_students.xlsx`);
  };

  return (
    <div>
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
          {/* Total card (first color) */}
          {(() => {
            const c = colors[0];
            return (
              <div
                className="p-4 rounded border flex flex-col justify-between"
                style={{
                  backgroundColor: c.bg,
                  borderLeft: `4px solid ${c.accent}`,
                }}
              >
                <div className="text-sm text-muted-foreground">
                  Tổng sinh viên
                </div>

                <div className="mt-1">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: c.accent }}
                  >
                    {stats.total}
                  </div>

                  {/* Per-major compact list (smaller font) */}
                  <div className="mt-3 text-sm">
                    <div className="grid grid-cols-1 gap-1">
                      {stats.majors.map((m: any, i: number) => {
                        const pct = stats.total
                          ? ((m.total / stats.total) * 100).toFixed(1)
                          : "0.0";
                        return (
                          <div
                            key={m.major_id || i}
                            className="flex items-center justify-between"
                          >
                            <div className="truncate">{m.major_name}</div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">{m.total}</span>
                              <span className="ml-2">· {pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* One card per-major (use palette cycling) */}
          {stats.majors.map((m: any, idx: number) => {
            const color = colors[(idx + 1) % colors.length];
            const totalPct = stats.total
              ? ((m.total / stats.total) * 100).toFixed(1)
              : "0.0";
            return (
              <div
                key={m.major_id || idx}
                className="p-4 rounded border flex flex-col"
                style={{
                  backgroundColor: color.bg,
                  borderLeft: `4px solid ${color.accent}`,
                }}
              >
                <div className="text-sm text-muted-foreground">
                  {m.major_name}
                </div>
                <div
                  className="text-xl font-semibold"
                  style={{ color: color.accent }}
                >
                  {m.total} ({totalPct}%)
                </div>

                <div className="mt-2 text-sm space-y-1">
                  {[
                    "Đang học",
                    "Bảo lưu",
                    "Nghỉ học",
                    "Nghỉ học khi tuyển sinh",
                    "Đã tốt nghiệp",
                  ].map((st) => {
                    const cnt = m.statuses?.[st] || 0;
                    const pct = stats.total
                      ? ((cnt / stats.total) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <div key={st} className="flex items-center gap-2">
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: 9999,
                            backgroundColor: color.accent,
                          }}
                        />
                        <div>
                          <strong>{st}:</strong> {cnt} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <Button size="sm" onClick={() => openMajorDetail(m)}>
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-3 mb-4 items-center">
        <div className="relative w-full max-w-md">
          <Input
            placeholder="Tìm mã sv, tên, hoặc lớp..."
            value={query}
            onChange={(e: any) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <select
          className="border rounded px-2 py-1"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả lớp</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-2 py-1"
          value={profileFilter}
          onChange={(e) => {
            setProfileFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả hồ sơ</option>
          <option value="has">Đã có hồ sơ</option>
          <option value="no">Chưa có hồ sơ</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Sắp xếp:</div>
          <select
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="student_code">Mã SV</option>
            <option value="full_name">Họ và tên</option>
            <option value="class_name">Lớp</option>
          </select>
          <Button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            {sortDir === "asc" ? "A→Z" : "Z→A"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              // Export all matching students to XLSX by paging through the API
              try {
                const allRows: Student[] = [];
                const pageSizeExport = 1000;
                let p = 1;
                while (true) {
                  const resp = await studentsService.getPaged({
                    page: p,
                    pageSize: pageSizeExport,
                    q: query || undefined,
                    class: classFilter !== "all" ? classFilter : undefined,
                    profile:
                      profileFilter !== "all" ? profileFilter : undefined,
                    sortBy,
                    sortDir,
                  });
                  allRows.push(...resp.rows);
                  const fetched = resp.rows.length;
                  const totalFetched = allRows.length;
                  if (
                    fetched < pageSizeExport ||
                    totalFetched >= (resp.total || 0)
                  )
                    break;
                  p += 1;
                }

                const data = allRows.map((r) => ({
                  id: r.id,
                  student_code: r.student_code,
                  full_name: r.full_name,
                  class_name: r.class_name || "",
                  status: r.status || "",
                }));

                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
                const wbout = XLSX.write(workbook, {
                  bookType: "xlsx",
                  type: "array",
                });
                const blob = new Blob([wbout], {
                  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(blob, `students_profiles.xlsx`);
              } catch (err) {
                console.error("Export failed", err);
              }
            }}
          >
            Xuất CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Mã SV</th>
              <th className="text-left p-2">Họ và tên</th>
              <th className="text-left p-2">Lớp</th>
              <th className="text-left p-2">Hồ sơ</th>
              <th className="text-left p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.student_code}</td>
                <td className="p-2">{s.full_name}</td>
                <td className="p-2">{s.class_name || "-"}</td>
                <td className="p-2">
                  {(s as any).has_profile ? "Có" : "Chưa"}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Button onClick={() => onOpenProfile(String(s.id))}>
                      Xem / Chỉnh sửa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          Trang {page} / {totalPages} — {total} bản ghi
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Trước
          </Button>
          <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Sau
          </Button>
        </div>
      </div>

      {/* Detail dialog for major */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogTitle>
            Danh sách sinh viên{" "}
            {detailMajor ? `- ${detailMajor.major_name}` : ""}
          </DialogTitle>
          <DialogDescription>
            {detailLoading ? (
              <div>Đang tải...</div>
            ) : (
              <div>
                <div className="mb-2 flex justify-end gap-2">
                  <Button onClick={exportDetailXlsx}>Xuất Excel</Button>
                </div>

                <div className="overflow-auto max-h-72">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Mã SV</th>
                        <th className="text-left p-2">Họ và tên</th>
                        <th className="text-left p-2">Lớp</th>
                        <th className="text-left p-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="p-2">{s.id}</td>
                          <td className="p-2">{s.student_code}</td>
                          <td className="p-2">{s.full_name}</td>
                          <td className="p-2">{s.class_name || "-"}</td>
                          <td className="p-2">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
