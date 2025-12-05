"use client";

import { RubricManagement } from "@/components/rubric-management";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RubricsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && user.role !== "admin" && user.role !== "manager")
      router.push("/");
  }, [user, isLoading, router]);

  if (
    isLoading ||
    !user ||
    (user.role !== "admin" && user.role !== "manager")
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold">Quản lý Rubric</h1>
      <RubricManagement />
    </div>
  );
}
