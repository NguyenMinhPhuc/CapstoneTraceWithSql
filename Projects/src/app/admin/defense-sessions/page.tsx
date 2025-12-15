"use client";

import { Suspense } from "react";
import { DefenseSessionsTable } from "@/components/defense-sessions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

// DEBUG MODE: temporarily bypass firebase auth checks so the table can render
// for troubleshooting. Remove this bypass after debugging.
export default function DefenseSessionsPage() {
  useEffect(() => {
    /* no-op */
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý Đợt báo cáo (Debug view)</h1>
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
        <DefenseSessionsTable />
      </Suspense>
    </div>
  );
}
