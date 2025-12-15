"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { companiesService, Company } from "@/services/companies.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { defenseService, DefenseSession } from "@/services/defense.service";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import internshipsService from "@/services/internships.service";

interface MyCompanyManagementTableProps {
  supervisorId?: string;
}

export function MyCompanyManagementTable({
  supervisorId,
}: MyCompanyManagementTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<DefenseSession[] | null>(null);
  const [assigningCompany, setAssigningCompany] = useState<Company | null>(
    null
  );
  const [creatingCompany, setCreatingCompany] = useState<Company | null>(null);
  const [formSessionId, setFormSessionId] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formCapacity, setFormCapacity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await companiesService.getAll();
        if (!mounted) return;
        setCompanies(data || []);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err?.message || "Không thể tải danh sách đơn vị.",
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    // load sessions for assign dialog
    (async () => {
      try {
        const s = await defenseService.getAll({ status: "active" });
        if (mounted) setSessions(s || []);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supervisorId]);

  if (isLoading) {
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
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Danh sách Doanh nghiệp</h3>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Người quản lý</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies && companies.length > 0 ? (
              companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{(c as any).company_type || "—"}</TableCell>
                  <TableCell>{c.address || "—"}</TableCell>
                  <TableCell>
                    {[
                      (c as any).contact_person,
                      c.email,
                      (c as any).contact_phone,
                    ]
                      .filter(Boolean)
                      .join(" / ") || "—"}
                  </TableCell>
                  <TableCell>
                    {[(c as any).manager_name, (c as any).manager_phone]
                      .filter(Boolean)
                      .join(" / ") || "—"}
                  </TableCell>
                  <TableCell>
                    {(c as any).is_active === false
                      ? "Không hoạt động"
                      : "Hoạt động"}
                  </TableCell>
                  <TableCell>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-blue-600 text-white rounded"
                        onClick={() => setAssigningCompany(c)}
                      >
                        Mở trang đợt
                      </button>
                      <button
                        className="px-2 py-1 bg-primary text-white rounded"
                        onClick={() => {
                          setCreatingCompany(c);
                          setFormSessionId("");
                          setFormTitle("");
                          setFormDescription("");
                          setFormCapacity(1);
                        }}
                      >
                        Thêm vị trí
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {/* Assign dialog (simple) */}
      {assigningCompany && (
        <Dialog open={true} onOpenChange={() => setAssigningCompany(null)}>
          <DialogContent>
            <h3 className="text-lg font-semibold mb-3">
              Gán {assigningCompany.name} vào đợt
            </h3>
            <div className="mb-4">
              <label className="block mb-2">Chọn đợt</label>
              <select
                className="w-full border rounded p-2"
                id="assign-session-select"
              >
                <option value="">-- Chọn đợt --</option>
                {(sessions || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.session_type_name || s.session_type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssigningCompany(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const sel = (
                    document.getElementById(
                      "assign-session-select"
                    ) as HTMLSelectElement
                  )?.value;
                  if (!sel) return alert("Vui lòng chọn đợt");
                  // navigate to positions page with company preselected
                  const url = `/defense-sessions/${sel}/positions?companyId=${assigningCompany.id}`;
                  setAssigningCompany(null);
                  (window as any).location.href = url;
                }}
                className="px-3 py-1 bg-primary text-white rounded"
              >
                Mở quản lý vị trí
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Inline create position modal */}
      {creatingCompany && (
        <Dialog open={true} onOpenChange={() => setCreatingCompany(null)}>
          <DialogContent>
            <h3 className="text-lg font-semibold mb-3">
              Thêm vị trí cho {creatingCompany.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Đợt báo cáo
                </label>
                <select
                  className="w-full border rounded p-2"
                  value={formSessionId}
                  onChange={(e) => setFormSessionId(e.target.value)}
                >
                  <option value="">-- Chọn đợt --</option>
                  {(sessions || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.session_type_name || s.session_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Tiêu đề
                </label>
                <input
                  className="w-full border rounded p-2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Mô tả</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Số lượng
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-32 border rounded p-2"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setCreatingCompany(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  if (!formSessionId) return alert("Vui lòng chọn đợt");
                  if (!formTitle.trim()) return alert("Vui lòng nhập tiêu đề");
                  setIsSubmitting(true);
                  try {
                    await internshipsService.create(Number(formSessionId), {
                      company_id: creatingCompany.id,
                      title: formTitle,
                      description: formDescription,
                      capacity: formCapacity,
                      is_active: true,
                    });
                    toast({
                      title: "Thành công",
                      description: "Đã thêm vị trí",
                    });
                    setCreatingCompany(null);
                  } catch (err: any) {
                    toast({
                      variant: "destructive",
                      title: "Lỗi",
                      description: err?.message || "Không thể thêm vị trí",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="px-3 py-1 bg-primary text-white rounded"
              >
                Thêm
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
