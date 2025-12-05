"use client";

import { useEffect, useState } from "react";
import { companiesService, Company } from "@/services/companies.service";
import { Button } from "./ui/button";

export default function CompanyManagementTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách doanh nghiệp</h2>
        <div>
          <Button onClick={loadData}>Làm mới</Button>
        </div>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Liên hệ</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.contact_person || c.email}</td>
                <td>{c.phone || c.contact_phone}</td>
                <td>{c.is_active ? "Hoạt động" : "Không hoạt động"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
