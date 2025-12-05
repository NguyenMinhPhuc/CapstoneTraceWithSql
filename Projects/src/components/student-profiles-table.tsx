"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Student } from "@/services/students.service";
import studentProfilesService from "@/services/studentProfiles.service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function StudentProfilesTable({
  students,
  onOpenProfile,
}: {
  students: Student[];
  onOpenProfile: (studentId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("student_code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [hasProfileMap, setHasProfileMap] = useState<Record<number, boolean>>({});

  // derive class list
  const classes = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.class_name || "-"));
    return Array.from(set).filter((c) => c !== "-").sort();
  }, [students]);

  // filtered & searched
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = students.slice();
    if (classFilter !== "all") {
      arr = arr.filter((s) => (s.class_name || "") === classFilter);
    }
    if (profileFilter !== "all") {
      arr = arr.filter((s) => {
        const has = hasProfileMap[s.id];
        if (profileFilter === "has") return !!has;
        if (profileFilter === "no") return !has;
        return true;
      });
    }
    if (q) {
      arr = arr.filter(
        (s) =>
          (s.student_code || "").toLowerCase().includes(q) ||
          (s.full_name || "").toLowerCase().includes(q) ||
          (s.class_name || "").toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      let va: any = (a as any)[sortBy];
      let vb: any = (b as any)[sortBy];
      if (va === undefined || va === null) va = "";
      if (vb === undefined || vb === null) vb = "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [students, query, classFilter, profileFilter, sortBy, sortDir, hasProfileMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, classFilter, profileFilter, sortBy, sortDir]);

  // Prefetch profiles for current page so we can show profile existence quickly
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);
    let mounted = true;
    (async () => {
      const m: Record<number, boolean> = {};
      await Promise.all(
        pageRows.map(async (s) => {
          try {
            const p = await studentProfilesService.getByStudentId(s.id);
            m[s.id] = !!p;
          } catch (e) {
            m[s.id] = false;
          }
        })
      );
      if (mounted) setHasProfileMap((prev) => ({ ...prev, ...m }));
    })();
    return () => {
      mounted = false;
    };
  }, [filtered, page]);

  return (
    <div>
      <div className="flex gap-3 mb-4 items-center">
        <Input
          placeholder="Tìm mã sv, tên, hoặc lớp..."
          value={query}
          onChange={(e: any) => setQuery(e.target.value)}
        />

        <select
          className="border rounded px-2 py-1"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
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
          onChange={(e) => setProfileFilter(e.target.value)}
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
            {filtered.slice((page - 1) * pageSize, page * pageSize).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.student_code}</td>
                <td className="p-2">{s.full_name}</td>
                <td className="p-2">{s.class_name || "-"}</td>
                <td className="p-2">{hasProfileMap[s.id] ? "Có" : "Chưa"}</td>
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
          Trang {page} / {totalPages} — {filtered.length} bản ghi
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>Trước</Button>
          <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
