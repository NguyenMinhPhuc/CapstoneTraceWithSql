"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  GraduationCap,
  Briefcase,
  Shield,
  Calendar,
  UserSquare,
  ClipboardCheck,
  ChevronDown,
  FileUp,
  UserCheck,
  BookCheck,
  Package,
  BookUser,
  BookMarked,
  BookA,
  FileSignature,
  Activity,
  Building,
  ClipboardList,
  Clock,
  CheckSquare,
  LifeBuoy,
  MessageSquare,
  Library,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Temporarily disable post-defense submission (will be implemented later)
  const isPostDefenseSubmissionEnabled = false;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarGroup className="p-0">
            <SidebarMenuButton
              asChild
              size="lg"
              className="group-data-[collapsible=icon]:!p-2"
            >
              <Link href="/">
                <GraduationCap className="text-primary" />
                <span className="font-headline font-semibold text-lg">
                  CapstoneTrack
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarGroup>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarGroup className="p-0">
          <SidebarMenuButton
            asChild
            size="lg"
            className="group-data-[collapsible=icon]:!p-2"
          >
            <Link href="/">
              <GraduationCap className="text-primary" />
              <span className="font-headline font-semibold text-lg">
                CapstoneTrack
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/")}
              tooltip="Dashboard"
            >
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/qna")}
              tooltip="Hỏi & Đáp"
            >
              <Link href="/qna">
                <MessageSquare />
                <span>Hỏi & Đáp</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/resources")}
              tooltip="Tài nguyên"
            >
              <Link href="/resources">
                <Library />
                <span>Tài nguyên</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Quick access for supervisors/teachers to their advisor management */}
          {user &&
            (user.role === "supervisor" ||
              user.role === "admin" ||
              user.role === "manager") && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/teacher/class-advisors")}
                  tooltip="Cố vấn của tôi"
                >
                  <Link href="/teacher/class-advisors">
                    <UserCheck />
                    <span>Cố vấn của tôi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

          {user?.role === "student" && (
            <>
              <div className="px-2 py-2">
                <SidebarSeparator />
              </div>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        Tốt nghiệp
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/topic-registration")}
                          tooltip="Đăng ký Đề tài"
                        >
                          <Link href="/topic-registration">
                            <BookMarked />
                            <span>Đăng ký Đề tài</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/proposal-submission")}
                          tooltip="Nộp thuyết minh"
                        >
                          <Link href="/proposal-submission">
                            <FileSignature />
                            <span>Nộp Thuyết minh</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/progress-report")}
                          tooltip="Báo cáo Tiến độ"
                        >
                          <Link href="/progress-report">
                            <Activity />
                            <span>Báo cáo Tiến độ</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/report-submission")}
                          tooltip="Nộp báo cáo"
                        >
                          <Link href="/report-submission">
                            <FileUp />
                            <span>Nộp báo cáo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/post-defense-submission")}
                          tooltip="Nộp sau HĐ"
                        >
                          <Link href="/post-defense-submission">
                            <FileUp />
                            <span>Nộp sau Hội đồng</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>

              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        Thực tập
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/internship-registration")}
                          tooltip="Đăng ký Thực tập"
                        >
                          <Link href="/internship-registration">
                            <ClipboardList />
                            <span>Đăng ký Thực tập</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/early-internship-registration")}
                          tooltip="Đăng ký Thực tập sớm"
                        >
                          <Link href="/early-internship-registration">
                            <Clock />
                            <span>ĐK Thực tập sớm</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/early-internship-weekly-report")}
                          tooltip="Báo cáo TT sớm"
                        >
                          <Link href="/early-internship-weekly-report">
                            <Activity />
                            <span>Báo cáo TT sớm</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/internship-submission")}
                          tooltip="Nộp hồ sơ thực tập"
                        >
                          <Link href="/internship-submission">
                            <Briefcase />
                            <span>Nộp hồ sơ thực tập</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </>
          )}

          {(user?.role === "supervisor" || user?.role === "admin") && (
            <>
              <div className="px-2 py-2">
                <SidebarSeparator />
              </div>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        Hướng dẫn
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      {user?.role === "supervisor" || user?.role === "admin" ? (
                        <>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive("/my-topics")}
                              tooltip="Đề tài của tôi"
                            >
                              <Link href="/my-topics">
                                <BookUser />
                                <span>Đề tài của tôi</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive("/graduation-guidance")}
                              tooltip="Hướng dẫn Tốt nghiệp"
                            >
                              <Link href="/graduation-guidance">
                                <GraduationCap />
                                <span>Hướng dẫn Tốt nghiệp</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </>
                      ) : null}
                      {user?.role === "supervisor" || user?.role === "admin" ? (
                        <>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive("/internship-guidance")}
                              tooltip="Hướng dẫn Thực tập"
                            >
                              <Link href="/internship-guidance">
                                <Briefcase />
                                <span>Hướng dẫn Thực tập</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(
                                "/internship-company-management"
                              )}
                              tooltip="Đơn vị của tôi"
                            >
                              <Link href="/internship-company-management">
                                <Building />
                                <span>Đơn vị của tôi</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive("/early-internship-guidance")}
                              tooltip="Hướng dẫn TT sớm"
                            >
                              <Link href="/early-internship-guidance">
                                <Clock />
                                <span>Hướng dẫn TT sớm</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </>
                      ) : null}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        Chấm điểm
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/supervisor-grading")}
                          tooltip="Chấm điểm Hướng dẫn"
                        >
                          <Link href="/supervisor-grading">
                            <UserCheck />
                            <span>Chấm điểm Hướng dẫn</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/council-grading")}
                          tooltip="Chấm điểm Hội đồng"
                        >
                          <Link href="/council-grading">
                            <ClipboardCheck />
                            <span>Chấm điểm Hội đồng</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <div className="px-2 py-2">
                <SidebarSeparator />
              </div>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        QL Tốt nghiệp
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/defense-sessions")}
                          tooltip="Defense Sessions"
                        >
                          <Link href="/admin/defense-sessions">
                            <Calendar />
                            <span>Quản lý Đợt báo cáo</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/graduation-registrations")}
                          tooltip="Graduation Registrations"
                        >
                          <Link href="/admin/graduation-registrations">
                            <Users />
                            <span>Danh sách SV TN</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/topics")}
                          tooltip="Topic Management"
                        >
                          <Link href="/admin/topics">
                            <BookA />
                            <span>Quản lý Đề tài</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        QL Thực tập
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/companies")}
                          tooltip="Company Management"
                        >
                          <Link href="/admin/companies">
                            <Building />
                            <span>Quản lý Doanh nghiệp</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/internship-approvals")}
                          tooltip="Internship Approvals"
                        >
                          <Link href="/admin/internship-approvals">
                            <CheckSquare />
                            <span>Duyệt ĐK Thực tập</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/early-internships")}
                          tooltip="Early Internships"
                        >
                          <Link href="/admin/early-internships">
                            <Clock />
                            <span>Thực tập sớm</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        QL chung
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/students")}
                          tooltip="Student Management"
                        >
                          <Link href="/admin/students">
                            <Users />
                            <span>Quản lý Sinh viên</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/student-profiles")}
                          tooltip="Student Profiles"
                        >
                          <Link href="/admin/student-profiles">
                            <FileText />
                            <span>Hồ sơ Sinh viên</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/supervisors")}
                          tooltip="Supervisor Management"
                        >
                          <Link href="/admin/supervisors">
                            <UserSquare />
                            <span>Quản lý GVHD</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/class-advisors")}
                          tooltip="Quản lý cố vấn học tập"
                        >
                          <Link href="/admin/class-advisors">
                            <UserCheck />
                            <span>Quản lý cố vấn học tập</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/grade-reports")}
                          tooltip="Grade Reports"
                        >
                          <Link href="/admin/grade-reports">
                            <BookCheck />
                            <span>Bảng điểm</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/submission-reports")}
                          tooltip="Submission Reports"
                        >
                          <Link href="/admin/submission-reports">
                            <Package />
                            <span>Hồ sơ đã nộp</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
              <Collapsible asChild defaultOpen>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
                        QL Hệ thống
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 group-data-[collapsible=icon]:hidden"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/users")}
                          tooltip="User Management"
                        >
                          <Link href="/admin/users">
                            <Shield />
                            <span>Quản lý Tài khoản</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/resources")}
                          tooltip="Resource Management"
                        >
                          <Link href="/admin/resources">
                            <Library />
                            <span>Quản lý Tài nguyên</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/rubrics")}
                          tooltip="Rubric Management"
                        >
                          <Link href="/admin/rubrics">
                            <ClipboardCheck />
                            <span>Quản lý Rubric</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/admin/settings")}
                          tooltip="Settings"
                        >
                          <Link href="/admin/settings">
                            <Settings />
                            <span>Cài đặt hệ thống</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive("/help")}
                          tooltip="Help"
                        >
                          <Link href="/help">
                            <LifeBuoy />
                            <span>Hướng dẫn</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              tooltip="Settings"
            >
              <Link href="/profile">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
