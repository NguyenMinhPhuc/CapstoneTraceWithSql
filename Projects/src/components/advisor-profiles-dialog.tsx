"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  classAdvisorsService,
  type ClassAdvisor,
  type AdvisorProfile,
} from "@/services/classAdvisors.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AdvisorProfilesDialogProps {
  advisor: ClassAdvisor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // optional: initial tab to show when opening ("current" | "history")
  initialTab?: "current" | "history";
  // optional: if provided, only show profiles matching this profile_type
  filterProfileType?: string;
  // optional: only show profiles for a specific student id (stored inside profile_data)
  filterStudentId?: number;
}

const profileFormSchema = z.object({
  profile_type: z.enum(
    ["general", "student_list", "activities", "assessments"],
    {
      errorMap: () => ({ message: "Vui lòng chọn loại hồ sơ hợp lệ" }),
    }
  ),
  title: z.string().min(1, "Tiêu đề không được trống"),
  content: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const PROFILE_TYPE_LABELS: Record<string, string> = {
  general: "Thông tin chung",
  student_list: "Danh sách lớp",
  activities: "Hoạt động lớp",
  assessments: "Đánh giá học sinh",
};

export function AdvisorProfilesDialog({
  advisor,
  open,
  onOpenChange,
  initialTab,
  filterProfileType,
  filterStudentId,
}: AdvisorProfilesDialogProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AdvisorProfile[]>([]);
  const [allClassProfiles, setAllClassProfiles] = useState<AdvisorProfile[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profile_type: "general",
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (open && advisor?.id) {
      loadProfiles();
    }
  }, [open, advisor?.id]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Load current advisor's profiles
      const currentProfiles = await classAdvisorsService.getProfiles({
        advisor_id: advisor.id,
      });
      setProfiles(currentProfiles);

      // Load all profiles for this class (including from previous advisors)
      const classProfiles = await classAdvisorsService.getProfiles({
        class_id: advisor.class_id,
      });
      setAllClassProfiles(classProfiles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải hồ sơ cố vấn",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSubmitting(true);
    try {
      await classAdvisorsService.addProfile({
        advisor_id: advisor.id,
        profile_type: values.profile_type,
        title: values.title,
        content: values.content,
      });

      toast({
        title: "Thành công",
        description: "Đã thêm hồ sơ cố vấn",
      });

      form.reset();
      setShowAddForm(false);
      await loadProfiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể thêm hồ sơ",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const matchesStudentFilter = (profile: AdvisorProfile) => {
    if (!filterStudentId) return true;
    if (!profile.profile_data) return false;
    try {
      const parsed =
        typeof profile.profile_data === "string"
          ? JSON.parse(profile.profile_data)
          : profile.profile_data;
      if (!parsed) return false;
      const sid = parsed.student_id ?? parsed.studentId ?? parsed.student;
      return Number(sid) === Number(filterStudentId);
    } catch {
      return false;
    }
  };

  const matchesProfileType = (profile: AdvisorProfile) => {
    if (!filterProfileType) return true;
    if (profile.profile_type === filterProfileType) return true;
    // backward-compat: some older entries might use `student_evaluation`
    if (
      filterProfileType === "assessments" &&
      profile.profile_type === "student_evaluation"
    )
      return true;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen">
        <DialogHeader>
          <DialogTitle>👤 Hồ sơ cố vấn học tập</DialogTitle>
          <DialogDescription>
            {advisor.teacher_name} - {advisor.class_name} ({advisor.semester}{" "}
            {advisor.academic_year})
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={initialTab || "current"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              Hồ sơ hiện tại
              {profiles.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {profiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              Lịch sử lớp
              {allClassProfiles.length > profiles.length && (
                <Badge variant="secondary" className="ml-2">
                  {allClassProfiles.length - profiles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Current Advisor Profiles Tab */}
          <TabsContent value="current" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : (
              <>
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="w-full"
                  >
                    + Thêm hồ sơ mới
                  </Button>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold mb-4">Thêm hồ sơ mới</h3>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="profile_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loại hồ sơ *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">
                                    Thông tin chung
                                  </SelectItem>
                                  <SelectItem value="student_list">
                                    Danh sách lớp
                                  </SelectItem>
                                  <SelectItem value="activities">
                                    Hoạt động lớp
                                  </SelectItem>
                                  <SelectItem value="assessments">
                                    Đánh giá học sinh
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tiêu đề *</FormLabel>
                              <FormControl>
                                <Input placeholder="Tiêu đề hồ sơ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nội dung</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Nội dung chi tiết của hồ sơ"
                                  {...field}
                                  rows={4}
                                />
                              </FormControl>
                              <FormDescription>
                                Nội dung sẽ được hiển thị cho các giáo viên khác
                                xem lịch sử lớp
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1"
                          >
                            {submitting ? "Đang lưu..." : "Lưu hồ sơ"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddForm(false);
                              form.reset();
                            }}
                            className="flex-1"
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                {profiles.filter(
                  (p) => matchesProfileType(p) && matchesStudentFilter(p)
                ).length === 0 && !showAddForm ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có hồ sơ nào
                  </div>
                ) : (
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    <div className="space-y-4">
                      {profiles
                        .filter(
                          (p) =>
                            matchesProfileType(p) && matchesStudentFilter(p)
                        )
                        .map((profile) => (
                          <div
                            key={profile.id}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Badge className="mb-2">
                                  {PROFILE_TYPE_LABELS[profile.profile_type] ||
                                    profile.profile_type}
                                </Badge>
                                <h4 className="font-semibold">
                                  {profile.title}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-500">
                                {formatDate(profile.created_at)}
                              </p>
                            </div>
                            {profile.content && (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {profile.content}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </TabsContent>

          {/* Class History Profiles Tab */}
          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : allClassProfiles.filter(
                (p) => matchesProfileType(p) && matchesStudentFilter(p)
              ).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có hồ sơ nào trong lớp
              </div>
            ) : (
              <ScrollArea className="h-96 border rounded-lg p-4">
                <div className="space-y-4">
                  {allClassProfiles
                    .filter(
                      (p) => matchesProfileType(p) && matchesStudentFilter(p)
                    )
                    .map((profile) => {
                      const isCurrentAdvisor =
                        profile.advisor_id === advisor.id;
                      return (
                        <div
                          key={profile.id}
                          className={`border rounded-lg p-4 ${
                            isCurrentAdvisor ? "bg-blue-50" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex gap-2 mb-2">
                                <Badge>
                                  {PROFILE_TYPE_LABELS[profile.profile_type] ||
                                    profile.profile_type}
                                </Badge>
                                {isCurrentAdvisor && (
                                  <Badge variant="default">Hiện tại</Badge>
                                )}
                              </div>
                              <h4 className="font-semibold">{profile.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {profile.teacher_name} - {profile.semester}{" "}
                                {profile.academic_year}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatDate(profile.created_at)}
                            </p>
                          </div>
                          {profile.content && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {profile.content}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
