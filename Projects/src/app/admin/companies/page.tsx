"use client";

import { CompanyCatalog } from "@/components/company-catalog";

export default function CompanyManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý Doanh nghiệp</h1>
      <CompanyCatalog />
    </div>
  );
}
