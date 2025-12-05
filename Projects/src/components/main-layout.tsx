"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeLoader } from "./theme-loader";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeLoader />
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
