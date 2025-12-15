"use client";

import React, { useEffect, useState } from "react";
import { defenseService } from "@/services/defense.service";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Eye, Download, Edit } from "lucide-react";
import Link from "next/link";

interface Props {
  sessionId: string;
}

export default function StudentsList({ sessionId }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const regs = await defenseService.getRegistrations(sessionId);
      setItems(regs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [sessionId]);

  async function handleDelete(id: number) {
    if (!confirm("Xóa đăng ký này?")) return;
    try {
      await defenseService.deleteRegistration(id);
      setItems((s) => s.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại");
    }
  }

  async function handleUpdateStatus(id: number, payload: any) {
    try {
      await defenseService.updateRegistration(id, payload);
      await load();
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại");
    }
  }

  function exportCsv() {
    const rows = [
      ["Mã SV", "Tên", "Lớp", "Trạng thái báo cáo"],
      ...items.map((r) => [
        r.student_code || "",
        r.student_name || "",
        r.class_name || "",
        r.report_status || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session_${sessionId}_students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {items.length} sinh viên
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={load}>
            <Edit className="mr-2 h-4 w-4" /> Làm mới
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Lớp</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Đang tải...</TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>Không có sinh viên</TableCell>
            </TableRow>
          ) : (
            items.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.student_code}</TableCell>
                <TableCell>{r.student_name}</TableCell>
                <TableCell>{r.class_name}</TableCell>
                <TableCell>
                  <select
                    defaultValue={r.report_status || ""}
                    onChange={(e) =>
                      handleUpdateStatus(r.id, {
                        report_status: e.target.value,
                      })
                    }
                  >
                    <option value="">(Không)</option>
                    <option value="not_yet_reporting">Chưa báo cáo</option>
                    <option value="reporting">Đang báo cáo</option>
                    <option value="reported">Đã báo cáo</option>
                  </select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/students/${r.student_id}`} className="btn">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
