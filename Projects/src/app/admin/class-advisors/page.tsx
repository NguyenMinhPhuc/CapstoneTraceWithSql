import React from "react";
import { ClassAdvisorManagement } from "@/components/class-advisor-management";

export default function ClassAdvisorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý cố vấn học tập
        </h1>
        <p className="text-gray-600 mt-2">
          Gán giáo viên chủ nhiệm/cố vấn học tập cho các lớp theo học kỳ
        </p>
      </div>
      <ClassAdvisorManagement />
    </div>
  );
}
