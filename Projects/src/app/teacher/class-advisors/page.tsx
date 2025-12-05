"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";
import { ClassAdvisorManagement } from "@/components/class-advisor-management";

export default function TeacherClassAdvisorsPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cố vấn của tôi</h1>
        <p className="text-gray-600 mt-2">Quản lý các lớp bạn đang chủ nhiệm</p>
      </div>
      {/* Pass teacherId so the management component shows only their assignments */}
      <ClassAdvisorManagement teacherId={user?.id} />
    </div>
  );
}
