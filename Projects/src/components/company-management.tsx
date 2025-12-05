"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companiesService, type Company } from "@/services/companies.service";
import { AddCompanyFormApi } from "./add-company-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function CompanyManagement() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Company[]>([]);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      const data = await companiesService.getAll({ q: q || undefined });
      setRows(data);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải công ty",
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm công ty..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={() => load()}>Tìm</Button>
        <div className="ml-auto">
          <Button onClick={() => setShowAdd(true)}>Thêm công ty</Button>
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Tên</th>
              <th className="p-2">Loại</th>
              <th className="p-2">Người quản lý</th>
              <th className="p-2">SĐT</th>
              <th className="p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.company_type}</td>
                <td className="p-2">{r.manager_name}</td>
                <td className="p-2">{r.manager_phone || r.phone}</td>
                <td className="p-2">{r.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm công ty</DialogTitle>
          </DialogHeader>
          <AddCompanyFormApi
            onSuccess={() => {
              setShowAdd(false);
              load();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
