import React, { useEffect, useState } from "react";
import internshipsService, {
  InternshipPosition,
} from "../../services/internships.service";
import { useToast } from "@/hooks/use-toast";
import PositionForm from "./PositionForm";
import { companiesService, Company } from "@/services/companies.service";
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
import { ArrowUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Props {
  sessionId: number;
  initialCompanyId?: number | undefined;
}

export default function PositionsList({ sessionId, initialCompanyId }: Props) {
  const [positions, setPositions] = useState<InternshipPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InternshipPosition | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<number | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const data = await internshipsService.listBySession(sessionId);
      setPositions(data || []);
    } finally {
      setLoading(false);
    }
  };

  // load companies for name mapping
  const loadCompanies = async () => {
    try {
      const list = await companiesService.getAll();
      setCompanyMap(new Map(list.map((c: Company) => [c.id, c])));
    } catch (e) {
      setCompanyMap(new Map());
    }
  };

  const [companyMap, setCompanyMap] = useState<Map<number, Company>>(new Map());

  useEffect(() => {
    load();
    loadCompanies();
    // if opened from company page with companyId, open form prefilled
    if (initialCompanyId) {
      setEditing({
        defense_session_id: sessionId,
        company_id: initialCompanyId,
        title: "",
        description: "",
        capacity: 1,
        manager_user_id: null,
        is_active: true,
        created_by: null,
        created_at: undefined,
        updated_at: undefined,
      } as InternshipPosition);
      setShowForm(true);
    }
  }, [sessionId]);

  // reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, companyFilter, sortOrder]);

  const filtered = positions
    .filter((p) => {
      if (companyFilter !== "" && companyFilter !== undefined) {
        return p.company_id === Number(companyFilter);
      }
      return true;
    })
    .filter((p) => {
      if (!search) return true;
      return (
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
      );
    });

  const sorted = filtered.sort((a, b) => {
    const at = (a.title || "").toLowerCase();
    const bt = (b.title || "").toLowerCase();
    if (at < bt) return sortOrder === "asc" ? -1 : 1;
    if (at > bt) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const displayed = sorted.slice(startIndex, startIndex + pageSize);

  const handleCreate = async (payload: any) => {
    try {
      await internshipsService.create(sessionId, payload);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Không thể tạo vị trí");
    }
  };

  const handleUpdate = async (payload: any) => {
    if (!editing) return;
    try {
      // use id-based update
      await internshipsService.update(editing.id, payload);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Không thể cập nhật vị trí");
    }
  };

  const handleDelete = async (pos: InternshipPosition) => {
    if (!confirm("Xác nhận xóa vị trí này?")) return;
    try {
      await internshipsService.remove(pos.id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Không thể xóa vị trí");
    }
  };

  const handleToggleStatus = async (pos: InternshipPosition) => {
    try {
      setUpdatingId(pos.id);
      const newStatus = !(pos.is_active !== false);
      await internshipsService.update(pos.id, { is_active: newStatus });
      toast({
        title: "Thành công",
        description: `Trạng thái đã chuyển thành ${
          newStatus ? "Hoạt động" : "Đã ẩn"
        }`,
      });
      await load();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: e?.message || "Không thể cập nhật trạng thái",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vị trí thực tập</h2>
        <div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm vị trí
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="Tìm theo tiêu đề hoặc mô tả"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <select
          className="border rounded p-2"
          value={companyFilter}
          onChange={(e) =>
            setCompanyFilter(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        >
          <option value="">-- Lọc theo doanh nghiệp --</option>
          {Array.from(companyMap.values()).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Số dòng:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading && <p>Đang tải...</p>}

      {!loading && positions.length === 0 && (
        <p>Chưa có vị trí nào cho đợt này.</p>
      )}

      {!loading && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">STT</TableHead>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    Tiêu đề
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-24">Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-32">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length > 0 ? (
                displayed.map((p, idx) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {startIndex + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell className="font-medium">
                      {companyMap.get(p.company_id)?.name || p.company_id}
                    </TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.capacity}</TableCell>
                    <TableCell>
                      <Switch
                        checked={p.is_active !== false}
                        disabled={updatingId === p.id}
                        onCheckedChange={() => handleToggleStatus(p)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            // load latest data before editing
                            try {
                              setLoadingEdit(true);
                              const fresh = await internshipsService.getById(
                                p.id
                              );
                              setEditing(fresh || p);
                              setShowForm(true);
                            } catch (e: any) {
                              toast({
                                variant: "destructive",
                                title: "Lỗi",
                                description:
                                  e?.message || "Không thể tải vị trí",
                              });
                            } finally {
                              setLoadingEdit(false);
                            }
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Chưa có vị trí nào phù hợp.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, total)}{" "}
            trên {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <div className="px-2">
              {page} / {totalPages}
            </div>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <PositionForm
          initial={editing ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (data) => {
            if (editing) await handleUpdate(data);
            else await handleCreate(data);
          }}
        />
      )}
    </div>
  );
}
