"use client";

import { StudentManagementTable } from "@/components/student-management-table-backend";

export default function StudentManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý Sinh viên</h1>
      <StudentManagementTable />
    </div>
  );
}
