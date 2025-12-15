"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { defenseService } from "@/services/defense.service";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  LinkIcon,
  Users,
  UserCheck,
  FileText,
  ShieldCheck,
  FileCheck2,
  Star,
  XCircle,
  ClipboardCheck,
  GraduationCap,
  Briefcase,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  type DefenseSession,
  type StudentWithRegistrationDetails,
  type Rubric,
} from "@/lib/types";
import { StudentRegistrationTable } from "@/components/student-registration-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { WithdrawnStudentsDialog } from "@/components/withdrawn-students-dialog";
import { ExemptedStudentsDialog } from "@/components/exempted-students-dialog";
import { ExportReportButton } from "@/components/export-report-button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function DefenseSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [isWithdrawnDialogOpen, setIsWithdrawnDialogOpen] = useState(false);
  const [isExemptedDialogOpen, setIsExemptedDialogOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const sessionId = params.id as string;

  const [session, setSession] = useState<DefenseSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [sessionTypes, setSessionTypes] = useState<any[] | null>(null);
  const [isSessionTypesLoading, setIsSessionTypesLoading] = useState(true);

  // Fetch all 4 rubrics
  // Rubric info (optional). For now, we'll just display rubric IDs; you can enhance by fetching rubric names via backend if needed.
  const councilGraduationRubric: Rubric | null = null;
  const councilInternshipRubric: Rubric | null = null;
  const supervisorGraduationRubric: Rubric | null = null;
  const companyInternshipRubric: Rubric | null = null;
  const isCouncilGradRubricLoading = false;
  const isCouncilInternRubricLoading = false;
  const isSupervisorGradRubricLoading = false;
  const isCompanyInternRubricLoading = false;

  const [registrations, setRegistrations] = useState<any[] | null>(null);
  const [areRegistrationsLoading, setAreRegistrationsLoading] = useState(true);

  const loadRegistrations = async () => {
    if (!sessionId) return;
    setAreRegistrationsLoading(true);
    try {
      const regs = await defenseService.getRegistrations(sessionId);
      setRegistrations(regs || []);
    } catch (err) {
      console.error("Error loading registrations from backend:", err);
      setRegistrations([]);
    } finally {
      setAreRegistrationsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [sessionId]);

  const resolvedSessionType = useMemo(() => {
    const raw = (session as any)?.session_type ?? (session as any)?.sessionType;
    if (raw == null) return raw;
    const rawStr = String(raw);
    if (/^\d+$/.test(rawStr) && sessionTypes && sessionTypes.length > 0) {
      const found = sessionTypes.find(
        (t: any) =>
          String(t.id) === rawStr ||
          String(t.session_type_id) === rawStr ||
          String(t.session_type) === rawStr
      );
      if (found)
        return (
          found.session_type ??
          found.session_type_name ??
          found.name ??
          String(found.id)
        );
    }
    return raw;
  }, [session, sessionTypes]);

  // Debug resolved session type
  try {
    // eslint-disable-next-line no-console
    console.debug("Resolved sessionType for page", {
      sessionId,
      raw: (session as any)?.session_type ?? (session as any)?.sessionType,
      resolved: resolvedSessionType,
    });
  } catch (e) {}

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;
      setIsSessionLoading(true);
      try {
        const data = await defenseService.getById(Number(sessionId));
        setSession(data as any);
      } catch (err) {
        console.error("Error loading session from backend:", err);
        setSession(null);
      } finally {
        setIsSessionLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  // Load session types (so we can resolve numeric IDs to string codes)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsSessionTypesLoading(true);
      try {
        const types = await defenseService.getSessionTypes();
        if (mounted) setSessionTypes(types || []);
      } catch (err) {
        console.error("Error loading session types:", err);
        if (mounted) setSessionTypes([]);
      } finally {
        if (mounted) setIsSessionTypesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const combinedRegistrationData = useMemo<
    StudentWithRegistrationDetails[] | null
  >(() => {
    if (!registrations) return null;

    return registrations.map((reg: any) => ({
      id: String(reg.id),
      sessionId: String(reg.session_id || reg.sessionId || ""),
      studentId: reg.student_code || String(reg.student_id || ""),
      studentName: reg.student_name || "",
      className: reg.class_code || reg.class_name || "",
      // Map unified report_status into the legacy fields so downstream UI
      // that still reads graduation/internship status continues to work.
      graduationStatus: reg.report_status || null,
      internshipStatus: reg.report_status || null,
      reportStatus: reg.report_status || null,
      reportStatusNote: reg.report_status_note || null,
      // include other fields pass-through
      ...reg,
    })) as StudentWithRegistrationDetails[];
  }, [registrations]);

  const stats = useMemo(() => {
    if (!combinedRegistrationData) {
      return {
        studentCount: 0,
        supervisorCount: 0,
        projectCount: 0,
        reportingGraduationCount: 0,
        reportingInternshipCount: 0,
        exemptedGraduationCount: 0,
        withdrawnGraduationCount: 0,
        withdrawnInternshipCount: 0,
        internshipCompanyCount: 0,
        supervisorDetails: [],
        withdrawnStudents: [], // This can be refined later if needed
        exemptedStudents: [], // This can be refined later if needed
      };
    }

    const studentCount = combinedRegistrationData.length;
    const reportingGraduationCount = combinedRegistrationData.filter(
      (r) => r.graduationStatus === "reporting"
    ).length;
    const exemptedGraduationCount = combinedRegistrationData.filter(
      (r) => r.graduationStatus === "exempted"
    ).length;
    const withdrawnGraduationCount = combinedRegistrationData.filter(
      (r) => r.graduationStatus === "withdrawn"
    ).length;

    const reportingInternshipCount = combinedRegistrationData.filter(
      (r) => r.internshipStatus === "reporting"
    ).length;
    const withdrawnInternshipCount = combinedRegistrationData.filter(
      (r) => r.internshipStatus === "withdrawn"
    ).length;

    // For dialogs: you might want to specify which list to show
    const withdrawnStudents = combinedRegistrationData.filter(
      (r) =>
        r.graduationStatus === "withdrawn" || r.internshipStatus === "withdrawn"
    );
    const exemptedStudents = combinedRegistrationData.filter(
      (r) => r.graduationStatus === "exempted"
    );

    const supervisorMap = new Map<
      string,
      { projects: Set<string>; studentCount: number }
    >();
    combinedRegistrationData.forEach((reg) => {
      if (reg.supervisorName) {
        if (!supervisorMap.has(reg.supervisorName)) {
          supervisorMap.set(reg.supervisorName, {
            projects: new Set(),
            studentCount: 0,
          });
        }
        const supervisorData = supervisorMap.get(reg.supervisorName)!;
        supervisorData.studentCount++;
        if (reg.projectTitle) {
          supervisorData.projects.add(reg.projectTitle);
        }
      }
    });

    const supervisorDetails = Array.from(supervisorMap.entries()).map(
      ([name, data]) => ({
        name,
        projectCount: data.projects.size,
        studentCount: data.studentCount,
      })
    );

    const projectCount = new Set(
      combinedRegistrationData
        .filter((r) => r.projectTitle)
        .map((r) => r.projectTitle)
    ).size;
    const internshipCompanyCount = new Set(
      combinedRegistrationData
        .filter((r) => r.internship_companyName)
        .map((r) => r.internship_companyName)
    ).size;

    return {
      studentCount,
      supervisorCount: supervisorMap.size,
      projectCount,
      reportingGraduationCount,
      reportingInternshipCount,
      exemptedGraduationCount,
      withdrawnGraduationCount,
      withdrawnInternshipCount,
      internshipCompanyCount,
      supervisorDetails,
      withdrawnStudents,
      exemptedStudents,
    };
  }, [combinedRegistrationData]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    } else if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const isLoading =
    authLoading ||
    isSessionLoading ||
    areRegistrationsLoading ||
    isCouncilGradRubricLoading ||
    isCouncilInternRubricLoading ||
    isSupervisorGradRubricLoading ||
    isCompanyInternRubricLoading;

  if (isLoading || !user || user.role !== "admin") {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="p-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-96 w-full mt-8" />
        </div>
      </main>
    );
  }

  if (!session) {
    return <div>Đợt báo cáo không tồn tại.</div>;
  }

  const toDate = (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    if (typeof timestamp === "string" || timestamp instanceof String) {
      const d = new Date(timestamp as string);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return timestamp;
  };

  const getRubricName = (rubric: Rubric | null | undefined) => {
    return rubric ? rubric.name : "Chưa gán";
  };

  const RubricInfo = ({
    icon,
    label,
    rubric,
    isLoading,
  }: {
    icon: React.ReactNode;
    label: string;
    rubric: Rubric | null | undefined;
    isLoading: boolean;
  }) => (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-primary hover:underline">
          {isLoading ? "Đang tải..." : getRubricName(rubric)}
        </p>
      </div>
    </div>
  );

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{session.name}</CardTitle>
              <CardDescription className="mt-1">
                {session.description || "Không có mô tả."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{session.status}</Badge>
              <Button asChild variant="outline">
                <Link href={`/admin/defense-sessions/${sessionId}/council`}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Quản lý Hội đồng
                </Link>
              </Button>
              <ExportReportButton
                sessionId={sessionId}
                session={session}
                rubricIds={{
                  councilGraduation: session.councilGraduationRubricId,
                  councilInternship: session.councilInternshipRubricId,
                  supervisorGraduation: session.supervisorGraduationRubricId,
                  companyInternship: session.companyInternshipRubricId,
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Ngày bắt đầu</p>
                <p>
                  {toDate(
                    (session as any).start_date ?? (session as any).startDate
                  )
                    ? format(
                        toDate(
                          (session as any).start_date ??
                            (session as any).startDate
                        )!,
                        "PPP"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Hạn đăng ký</p>
                <p>
                  {toDate(
                    (session as any).registration_deadline ??
                      (session as any).registrationDeadline
                  )
                    ? format(
                        toDate(
                          (session as any).registration_deadline ??
                            (session as any).registrationDeadline
                        )!,
                        "PPP"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Ngày báo cáo dự kiến</p>
                <p>
                  {toDate(
                    (session as any).expected_date ??
                      (session as any).expectedReportDate
                  )
                    ? format(
                        toDate(
                          (session as any).expected_date ??
                            (session as any).expectedReportDate
                        )!,
                        "PPP"
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            {(session as any).zaloGroupLink && (
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Nhóm Zalo</p>
                  <a
                    href={(session as any).zaloGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {(session as any).zaloGroupLink}
                  </a>
                </div>
              </div>
            )}
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <RubricInfo
              icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
              label="HĐ chấm Tốt nghiệp"
              rubric={councilGraduationRubric}
              isLoading={isCouncilGradRubricLoading}
            />
            <RubricInfo
              icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
              label="HĐ chấm Thực tập"
              rubric={councilInternshipRubric}
              isLoading={isCouncilInternRubricLoading}
            />
            <RubricInfo
              icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
              label="GVHD chấm Tốt nghiệp"
              rubric={supervisorGraduationRubric}
              isLoading={isSupervisorGradRubricLoading}
            />
            <RubricInfo
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              label="ĐV chấm Thực tập"
              rubric={companyInternshipRubric}
              isLoading={isCompanyInternRubricLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-xl font-semibold w-full">
            {isStatsOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            Thống kê tổng quan
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Số sinh viên
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng số sinh viên đã đăng ký
                </p>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4" /> Tốt nghiệp
                    </h4>
                    <div className="space-y-1 pl-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileCheck2 className="h-4 w-4" /> Báo cáo TN
                        </div>
                        <span className="font-semibold">
                          {stats.reportingGraduationCount}
                        </span>
                      </div>
                      <Dialog
                        open={isExemptedDialogOpen}
                        onOpenChange={setIsExemptedDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md -mx-2 px-2 py-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Star className="h-4 w-4" /> Đặc cách TN
                            </div>
                            <span className="font-semibold">
                              {stats.exemptedGraduationCount}
                            </span>
                          </div>
                        </DialogTrigger>
                        <ExemptedStudentsDialog
                          students={stats.exemptedStudents}
                          onFinished={() => setIsExemptedDialogOpen(false)}
                        />
                      </Dialog>
                      <Dialog
                        open={isWithdrawnDialogOpen}
                        onOpenChange={setIsWithdrawnDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md -mx-2 px-2 py-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" /> Bỏ báo cáo TN
                            </div>
                            <span className="font-semibold">
                              {stats.withdrawnGraduationCount}
                            </span>
                          </div>
                        </DialogTrigger>
                        <WithdrawnStudentsDialog
                          students={stats.withdrawnStudents}
                          onFinished={() => setIsWithdrawnDialogOpen(false)}
                        />
                      </Dialog>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4" /> Thực tập
                    </h4>
                    <div className="space-y-1 pl-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileCheck2 className="h-4 w-4" /> Báo cáo TT
                        </div>
                        <span className="font-semibold">
                          {stats.reportingInternshipCount}
                        </span>
                      </div>
                      <Dialog
                        open={isWithdrawnDialogOpen}
                        onOpenChange={setIsWithdrawnDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md -mx-2 px-2 py-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" /> Bỏ báo cáo TT
                            </div>
                            <span className="font-semibold">
                              {stats.withdrawnInternshipCount}
                            </span>
                          </div>
                        </DialogTrigger>
                        <WithdrawnStudentsDialog
                          students={stats.withdrawnStudents}
                          onFinished={() => setIsWithdrawnDialogOpen(false)}
                        />
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Số GVHD ({stats.supervisorCount})
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-4">
                    {stats.supervisorDetails.length > 0 ? (
                      stats.supervisorDetails.map((sv) => (
                        <div key={sv.name} className="text-sm">
                          <p className="font-semibold truncate">{sv.name}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{sv.projectCount} đề tài</span>
                            <span>{sv.studentCount} sinh viên</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Chưa có GVHD nào.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Thống kê Đề tài & Thực tập
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Số đề tài</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.projectCount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Số công ty thực tập</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.internshipCompanyCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Resolve sessionType: if session.session_type is numeric id, map it via sessionTypes */}
      <StudentRegistrationTable
        sessionId={sessionId}
        sessionType={(() => {
          const raw =
            (session as any)?.session_type ?? (session as any)?.sessionType;
          if (raw == null) return raw;
          // If numeric id, try to resolve
          const rawStr = String(raw);
          if (/^\d+$/.test(rawStr) && sessionTypes && sessionTypes.length > 0) {
            const found = sessionTypes.find(
              (t: any) =>
                String(t.id) === rawStr ||
                String(t.session_type_id) === rawStr ||
                String(t.session_type) === rawStr
            );
            if (found)
              return (
                found.session_type ??
                found.session_type_name ??
                found.name ??
                String(found.id)
              );
          }
          return raw;
        })()}
        initialData={combinedRegistrationData}
        isLoading={isLoading}
        onReload={loadRegistrations}
      />
    </main>
  );
}
