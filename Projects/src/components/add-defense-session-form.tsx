"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { format, addMonths, startOfMonth, getDay, addDays } from "date-fns";
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

interface AddDefenseSessionFormProps {
  onFinished: () => void;
}

export function AddDefenseSessionForm({
  onFinished,
}: AddDefenseSessionFormProps) {
  const { toast } = useToast();
  const [sessionTypes, setSessionTypes] = React.useState<SessionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = React.useState(true);
  const [councilRubrics, setCouncilRubrics] = React.useState<Rubric[]>([]);
  const [supervisorRubrics, setSupervisorRubrics] = React.useState<Rubric[]>(
    []
  );
  const [isLoadingRubrics, setIsLoadingRubrics] = React.useState(true);

  const formSchema = React.useMemo(
    () => createFormSchema(sessionTypes.map((t) => String(t.session_type))),
    [sessionTypes]
  );

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sessionType: "",
      description: "",
      startDate: new Date(),
      registrationDeadline: undefined,
      submissionDeadline: undefined,
      expectedReportDate: undefined,
      linhGroup: "",
      councilScoreRatio: 80,
      supervisorScoreRatio: 20,
      submissionFolderLink: "",
      submissionDescription: "",
      councilRubricId: "",
      supervisorRubricId: "",
    },
  });

  // Load session types from database
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const types = await defenseService.getSessionTypes();
        if (mounted) {
          setSessionTypes(types);
          if (!form.getValues("sessionType") && types.length > 0) {
            form.setValue("sessionType", String(types[0].session_type));
          }
        }
      } catch (error) {
        console.error("Failed to load session types:", error);
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải danh sách loại đợt báo cáo.",
          });
        }
      } finally {
        if (mounted) setIsLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

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

  const sessionType = useWatch({
    control: form.control,
    name: "sessionType",
  });

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
  });

  React.useEffect(() => {
    if (startDate) {
      // Logic: Saturday of the second week of the month, 3 months from the start date.
      // 1. Add 3 months to start date
      const futureMonth = addMonths(startDate, 3);
      // 2. Get the first day of that month
      const firstDayOfFutureMonth = startOfMonth(futureMonth);
      // 3. Find the day of the week for the 1st (0=Sun, 1=Mon, ..., 6=Sat)
      const firstDayOfWeek = getDay(firstDayOfFutureMonth);
      // 4. Calculate days to add to get to the first Saturday
      // (6 - firstDayOfWeek + 7) % 7 ensures we always move forward to the next Saturday
      const daysUntilFirstSaturday = (6 - firstDayOfWeek + 7) % 7;
      // 5. First Saturday is found. Add 7 more days to get to the second Saturday.
      const secondSaturday = addDays(
        firstDayOfFutureMonth,
        daysUntilFirstSaturday + 7
      );

      form.setValue("expectedReportDate", secondSaturday);
    }
  }, [startDate, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.sessionType) {
      toast({
        variant: "destructive",
        title: "Thiếu loại đợt báo cáo",
        description: "Vui lòng chọn loại đợt báo cáo trước khi lưu.",
      });
      return;
    }

    const payload = {
      name: values.name,
      session_type: values.sessionType || null,
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
      // Use DB enum for status
      status: "scheduled",
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
      await defenseService.create(payload as any);
      toast({
        title: "Thành công",
        description: `Đợt báo cáo "${values.name}" đã được tạo.`,
      });
      onFinished();
    } catch (error) {
      console.error("Failed to create defense session via API:", error);
      toast({
        variant: "destructive",
        title: "Ôi! Đã xảy ra lỗi.",
        description: "Không thể tạo đợt báo cáo.",
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tạo Đợt báo cáo mới</DialogTitle>
        <DialogDescription>
          Điền thông tin chi tiết để tạo một đợt báo cáo mới.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[65vh] pr-6">
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đợt</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Đợt 1 - Học kỳ 2, 2023-2024"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                              value={String(type.session_type)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                              disabled={
                                form.formState.isSubmitting ||
                                isLoadingTypes ||
                                isLoadingRubrics ||
                                !form.getValues("sessionType")
                              }
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
                  control={form.control}
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
                <FormField
                  control={form.control}
                  name="submissionDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hạn nộp báo cáo</FormLabel>
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
                  control={form.control}
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
              </div>
              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onFinished}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                isLoadingTypes ||
                isLoadingRubrics ||
                !form.getValues("sessionType")
              }
            >
              {form.formState.isSubmitting ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

// Also provide a default export for compatibility with different import styles
export default AddDefenseSessionForm;
