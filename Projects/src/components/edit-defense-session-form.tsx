"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import {
  defenseService,
  SessionType,
  Rubric,
} from "@/services/defense.service";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DefenseSession } from "@/lib/types";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import * as React from "react";

// Dynamic schema based on DB session types
const createFormSchema = (sessionTypes: string[]) => {
  const options =
    sessionTypes.length > 0
      ? (sessionTypes as [string, ...string[]])
      : ([""] as [string]);
  return z.object({
    name: z.string().min(1, { message: "Tên đợt là bắt buộc." }),
    sessionType: z.enum(options, {
      required_error: "Vui lòng chọn loại đợt báo cáo.",
    }),
    startDate: z.date({ required_error: "Ngày bắt đầu là bắt buộc." }),
    registrationDeadline: z.date({
      required_error: "Ngày hết hạn đăng ký là bắt buộc.",
    }),
    expectedReportDate: z.date({
      required_error: "Ngày báo cáo dự kiến là bắt buộc.",
    }),
    submissionDeadline: z.date().optional(),
    description: z.string().optional(),
    linhGroup: z.string().optional(),
    councilScoreRatio: z.number().min(0).max(100).optional(),
    supervisorScoreRatio: z.number().min(0).max(100).optional(),
    submissionFolderLink: z.string().url().optional().or(z.literal("")),
    submissionDescription: z.string().optional(),
    councilRubricId: z.string().optional(),
    supervisorRubricId: z.string().optional(),
  });
};

interface EditDefenseSessionFormProps {
  session: DefenseSession;
  onFinished: () => void;
}

export function EditDefenseSessionForm({
  session,
  onFinished,
}: EditDefenseSessionFormProps) {
  const { toast } = useToast();
  const [sessionTypes, setSessionTypes] = React.useState<SessionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = React.useState(true);
  const [councilRubrics, setCouncilRubrics] = React.useState<Rubric[]>([]);
  const [supervisorRubrics, setSupervisorRubrics] = React.useState<Rubric[]>(
    []
  );
  const [isLoadingRubrics, setIsLoadingRubrics] = React.useState(true);

  // Normalize incoming session to avoid undefined string operations (e.g. substring)
  const normalizedSession = React.useMemo(() => {
    const s: any = session || ({} as any);
    return {
      id: s.id,
      name: s.name ?? "",
      session_type: s.session_type ?? s.sessionType ?? "",
      start_date: s.start_date ?? s.startDate ?? null,
      registration_deadline:
        s.registration_deadline ?? s.registrationDeadline ?? null,
      submission_deadline:
        s.submission_deadline ?? s.submissionDeadline ?? null,
      expected_date: s.expected_date ?? s.expectedReportDate ?? null,
      description: s.description ?? "",
      linh_group: s.linh_group ?? "",
      council_score_ratio: s.council_score_ratio ?? s.councilScoreRatio ?? null,
      supervisor_score_ratio:
        s.supervisor_score_ratio ?? s.supervisorScoreRatio ?? null,
      submission_folder_link:
        s.submission_folder_link ?? s.submissionFolderLink ?? "",
      submission_description:
        s.submission_description ?? s.submissionDescription ?? "",
      council_rubric_id: s.council_rubric_id ?? s.councilRubricId ?? null,
      supervisor_rubric_id:
        s.supervisor_rubric_id ?? s.supervisorRubricId ?? null,
      status: s.status ?? "",
      created_at: s.created_at ?? s.createdAt ?? null,
      updated_at: s.updated_at ?? s.updatedAt ?? null,
    } as any;
  }, [session]);

  const toDate = (
    dateStr: string | Date | undefined | null
  ): Date | undefined => {
    if (!dateStr || dateStr === null) return undefined;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === "string") {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  };

  // Map DB session_type back to form value
  const getSessionType = (): string => {
    const type = normalizedSession.session_type;
    if (type === undefined || type === null) return "";
    return String(type);
  };

  const formSchema = React.useMemo(
    () => createFormSchema(sessionTypes.map((t) => String(t.session_type))),
    [sessionTypes]
  );

  const formMethods = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: normalizedSession.name || "",
      sessionType: getSessionType(),
      startDate: toDate(normalizedSession.start_date),
      registrationDeadline: toDate(normalizedSession.registration_deadline),
      submissionDeadline: toDate(normalizedSession.submission_deadline),
      expectedReportDate: toDate(normalizedSession.expected_date),
      description: normalizedSession.description || "",
      linhGroup: normalizedSession.linh_group || "",
      councilScoreRatio: normalizedSession.council_score_ratio ?? 80,
      supervisorScoreRatio: normalizedSession.supervisor_score_ratio ?? 20,
      submissionFolderLink: normalizedSession.submission_folder_link || "",
      submissionDescription: normalizedSession.submission_description || "",
      councilRubricId: String(normalizedSession.council_rubric_id ?? ""),
      supervisorRubricId: String(normalizedSession.supervisor_rubric_id ?? ""),
    },
  });

  // Ensure form values are reset when a new session is passed in
  React.useEffect(() => {
    try {
      formMethods.reset({
        name: normalizedSession.name || "",
        sessionType: getSessionType(),
        startDate: toDate(normalizedSession.start_date),
        registrationDeadline: toDate(normalizedSession.registration_deadline),
        submissionDeadline: toDate(normalizedSession.submission_deadline),
        expectedReportDate: toDate(normalizedSession.expected_date),
        description: normalizedSession.description || "",
        linhGroup: normalizedSession.linh_group || "",
        councilScoreRatio: normalizedSession.council_score_ratio ?? 80,
        supervisorScoreRatio: normalizedSession.supervisor_score_ratio ?? 20,
        submissionFolderLink: normalizedSession.submission_folder_link || "",
        submissionDescription: normalizedSession.submission_description || "",
        councilRubricId: String(normalizedSession.council_rubric_id ?? ""),
        supervisorRubricId: String(
          normalizedSession.supervisor_rubric_id ?? ""
        ),
      });
    } catch (err) {
      // Defensive: if reset fails, log for debugging
      console.error("Failed to reset EditDefenseSessionForm values:", err);
    }
  }, [normalizedSession]);

  // Debug: log incoming session shape to help diagnose substring errors
  React.useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug("EditDefenseSessionForm - incoming session:", session);
      // eslint-disable-next-line no-console
      console.debug(
        "EditDefenseSessionForm - normalized session:",
        normalizedSession
      );
    } catch (err) {
      /* ignore */
    }
  }, [session, normalizedSession]);

  // Load session types from database
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await defenseService.getSessionTypes();
        if (mounted) {
          setSessionTypes(types);
          // If no current selection and we have types, default to the first option
          if (!formMethods.getValues("sessionType") && types.length > 0) {
            formMethods.setValue("sessionType", String(types[0].session_type));
          }
        }
      } catch (error) {
        console.error("Failed to load session types:", error);
      } finally {
        if (mounted) setIsLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load rubrics from database
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [council, supervisor] = await Promise.all([
          defenseService.getRubrics("council"),
          defenseService.getRubrics("supervisor"),
        ]);
        if (mounted) {
          setCouncilRubrics(
            council.length > 0
              ? council
              : [
                  {
                    id: 1,
                    name: "Rubric Hội Đồng Mặc Định",
                    rubric_type: "council",
                    total_score: 100,
                    is_active: true,
                  },
                ]
          );
          setSupervisorRubrics(
            supervisor.length > 0
              ? supervisor
              : [
                  {
                    id: 2,
                    name: "Rubric Giáo Viên Mặc Định",
                    rubric_type: "supervisor",
                    total_score: 100,
                    is_active: true,
                  },
                ]
          );
        }
      } catch (error) {
        console.error("Failed to load rubrics:", error);
        if (mounted) {
          // Set default rubrics if API fails
          setCouncilRubrics([
            {
              id: 1,
              name: "Rubric Hội Đồng Mặc Định",
              rubric_type: "council",
              total_score: 100,
              is_active: true,
            },
          ]);
          setSupervisorRubrics([
            {
              id: 2,
              name: "Rubric Giáo Viên Mặc Định",
              rubric_type: "supervisor",
              total_score: 100,
              is_active: true,
            },
          ]);
          toast({
            variant: "destructive",
            title: "Lỗi",
            description:
              "Không thể tải danh sách rubric từ server. Sử dụng rubric mặc định.",
          });
        }
      } finally {
        if (mounted) setIsLoadingRubrics(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.sessionType) {
      toast({
        variant: "destructive",
        title: "Thiếu loại đợt báo cáo",
        description: "Vui lòng chọn loại đợt báo cáo trước khi lưu.",
      });
      return;
    }

    const payload: any = {
      name: values.name,
      session_type: values.sessionType ? Number(values.sessionType) : null,
      start_date: values.startDate
        ? values.startDate.toISOString().split("T")[0]
        : null,
      registration_deadline: values.registrationDeadline
        ? values.registrationDeadline.toISOString().split("T")[0]
        : null,
      submission_deadline: values.submissionDeadline
        ? values.submissionDeadline.toISOString().split("T")[0]
        : null,
      expected_date: values.expectedReportDate
        ? values.expectedReportDate.toISOString().split("T")[0]
        : null,
      description: values.description || null,
      linh_group: values.linhGroup || null,
      council_score_ratio: values.councilScoreRatio || null,
      supervisor_score_ratio: values.supervisorScoreRatio || null,
      submission_folder_link: values.submissionFolderLink || null,
      submission_description: values.submissionDescription || null,
      council_rubric_id: values.councilRubricId
        ? Number(values.councilRubricId)
        : null,
      supervisor_rubric_id: values.supervisorRubricId
        ? Number(values.supervisorRubricId)
        : null,
    };

    try {
      await defenseService.update(session.id as number, payload);
      toast({
        title: "Thành công",
        description: `Thông tin đợt báo cáo "${values.name}" đã được cập nhật.`,
      });
      onFinished();
    } catch (error: any) {
      console.error("Error updating defense session via API:", error);
      toast({
        variant: "destructive",
        title: "Ôi! Đã xảy ra lỗi.",
        description: error.message || "Không thể cập nhật đợt báo cáo.",
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Chỉnh sửa Đợt báo cáo</DialogTitle>
        <DialogDescription>
          Cập nhật thông tin cho đợt báo cáo. Nhấp vào "Lưu thay đổi" khi hoàn
          tất.
        </DialogDescription>
      </DialogHeader>

      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[65vh] pr-6">
            <div className="space-y-4 py-4">
              <FormField
                control={formMethods.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Loại đợt báo cáo</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isLoadingTypes}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại đợt báo cáo" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessionTypes.map((type) => (
                            <SelectItem
                              key={type.session_type}
                              value={type.session_type}
                            >
                              {type.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đợt báo cáo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên đợt báo cáo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && !isNaN(field.value.getTime()) ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Chọn một ngày</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value && !isNaN(field.value.getTime())
                                ? field.value
                                : undefined
                            }
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1990-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hạn đăng ký</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && !isNaN(field.value.getTime()) ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Chọn một ngày</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value && !isNaN(field.value.getTime())
                                ? field.value
                                : undefined
                            }
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1990-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formMethods.control}
                name="expectedReportDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày báo cáo dự kiến</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && !isNaN(field.value.getTime()) ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Chọn một ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value && !isNaN(field.value.getTime())
                              ? field.value
                              : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1990-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formMethods.control}
                name="linhGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linh Group (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập nhóm linh..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="councilScoreRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉ lệ điểm hội đồng (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="supervisorScoreRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉ lệ điểm GVHD (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formMethods.control}
                name="submissionFolderLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link thư mục nộp bài (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formMethods.control}
                name="submissionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả yêu cầu nộp (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả yêu cầu nộp bài..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={formMethods.control}
                  name="councilRubricId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rubric hội đồng (tùy chọn)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn rubric hội đồng" />
                          </SelectTrigger>
                          <SelectContent>
                            {councilRubrics
                              .filter((rubric) => rubric && rubric.id)
                              .map((rubric) => (
                                <SelectItem
                                  key={rubric.id}
                                  value={String(rubric.id)}
                                >
                                  {rubric.name || "Unnamed Rubric"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formMethods.control}
                  name="supervisorRubricId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rubric GVHD (tùy chọn)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn rubric GVHD" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisorRubrics
                              .filter((rubric) => rubric && rubric.id)
                              .map((rubric) => (
                                <SelectItem
                                  key={rubric.id}
                                  value={String(rubric.id)}
                                >
                                  {rubric.name || "Unnamed Rubric"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả ngắn về đợt báo cáo này..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onFinished}>
              Hủy
            </Button>
            <Button type="submit" disabled={formMethods.formState.isSubmitting}>
              {formMethods.formState.isSubmitting
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

// Also provide a default export for module resolution compatibility
export default EditDefenseSessionForm;
