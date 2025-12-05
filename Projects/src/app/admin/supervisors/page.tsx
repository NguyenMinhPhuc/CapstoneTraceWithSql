"use client";

import { SupervisorManagementTable } from "@/components/supervisor-management-table-backend";

export default function SupervisorManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý Giáo viên Hướng dẫn</h1>
      <SupervisorManagementTable />
    </div>
  );
}
