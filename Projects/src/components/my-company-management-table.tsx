"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { companiesService, Company } from "@/services/companies.service";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface MyCompanyManagementTableProps {
  supervisorId?: string;
}

export function MyCompanyManagementTable({ supervisorId }: MyCompanyManagementTableProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    return () => { mounted = false; };
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
                  <TableCell>{[(c as any).contact_person, c.email, (c as any).contact_phone].filter(Boolean).join(' / ') || '—'}</TableCell>
                  <TableCell>{[(c as any).manager_name, (c as any).manager_phone].filter(Boolean).join(' / ') || '—'}</TableCell>
                  <TableCell>{(c as any).is_active === false ? 'Không hoạt động' : 'Hoạt động'}</TableCell>
                  <TableCell>{c.created_at ? new Date(c.created_at).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Không có dữ liệu</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn{" "}
              {selectedRowIds.length > 0
                ? `${selectedRowIds.length} đơn vị đã chọn`
                : `đơn vị ${companyToDelete?.name}`}{" "}
              khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
