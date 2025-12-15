"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { CouncilGradingDashboard } from "@/components/council-grading-dashboard";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CouncilGradingPage() {
  const router = useRouter();
  const { user, loading: isUserLoading } = useAuth();
  const userData = user;
  const isUserDataLoading = false;

  useEffect(() => {
    const isLoading = isUserLoading || isUserDataLoading;
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    } else if (
      userData &&
      userData.role !== "supervisor" &&
      userData.role !== "admin"
    ) {
      router.push("/");
    }
  }, [user, userData, isUserLoading, isUserDataLoading, router]);

  const isLoading = isUserLoading || isUserDataLoading;

  if (isLoading || !user || !userData) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="p-8 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </main>
    );
  }

  const supervisorId =
    userData && (userData.role === "supervisor" || userData.role === "admin")
      ? userData.id
      : undefined;

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chấm điểm Hội đồng</CardTitle>
          <CardDescription>
            Chấm điểm với tư cách là thành viên hội đồng hoặc tiểu ban bạn được
            phân công.
          </CardDescription>
        </CardHeader>
      </Card>
      {supervisorId ? (
        <CouncilGradingDashboard
          supervisorId={supervisorId}
          userRole={userData.role}
        />
      ) : (
        <p>Bạn không có quyền truy cập chức năng này.</p>
      )}
    </main>
  );
}
