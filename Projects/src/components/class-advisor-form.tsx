"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  classAdvisorsService,
  type CreateClassAdvisorInput,
} from "@/services/classAdvisors.service";
import apiClient from "@/lib/api-client";

interface Class {
  id: number;
  code: string;
  name: string;
  major_id?: number;
  major_name?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
}

interface ClassAdvisorFormProps {
  onSuccess: () => void;
  defaultClassId?: number;
  defaultSemester?: string;
  defaultAcademicYear?: string;
}

const formSchema = z.object({
  class_id: z.coerce.number().positive("Vui lòng chọn lớp"),
  teacher_id: z.string().min(1, "Vui lòng chọn giáo viên"),
  semester: z.enum(["HK1", "HK2", "HK3"], {
    errorMap: () => ({ message: "Vui lòng chọn học kỳ hợp lệ" }),
  }),
  academic_year: z
    .string()
    .regex(
      /^\d{4}-\d{4}$/,
      "Năm học phải theo format YYYY-YYYY (vd: 2024-2025)"
    ),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ClassAdvisorForm({
  onSuccess,
  defaultClassId,
  defaultSemester = "HK1",
  defaultAcademicYear,
}: ClassAdvisorFormProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const defaultYear =
    defaultAcademicYear || `${currentYear}-${currentYear + 1}`;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      class_id: defaultClassId || 0,
      teacher_id: "",
      semester: defaultSemester as "HK1" | "HK2" | "HK3",
      academic_year: defaultYear,
      notes: "",
    },
  });

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await apiClient.get("/classes");
        // Support different backend response shapes:
        // - direct array: [ { ... }, ... ]
        // - wrapped: { data: [ ... ] }
        // - wrapped object: { success: true, data: [ ... ] }
        let list: any[] = [];
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (Array.isArray(response.data?.data)) {
          list = response.data.data;
        } else if (Array.isArray(response.data?.classes)) {
          list = response.data.classes;
        }
        setClasses(list || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách lớp",
        });
      } finally {
        setLoadingClasses(false);
      }
    };

    loadClasses();
  }, [toast]);

  // Load teachers
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await apiClient.get("/user-management", {
          params: {
            role: "supervisor",
          },
        });
        // Normalize response shapes. The users endpoint may return a
        // paginated object { success, data: { users: [], total, ... } }
        // or a simple array. Extract the users array safely.
        let usersList: any[] = [];
        if (Array.isArray(response.data)) {
          usersList = response.data;
        } else if (Array.isArray(response.data?.data)) {
          usersList = response.data.data;
        } else if (Array.isArray(response.data?.data?.users)) {
          usersList = response.data.data.users;
        } else if (Array.isArray(response.data?.users)) {
          usersList = response.data.users;
        }

        // Filter for supervisor/teacher/manager roles
        const filtered = usersList.filter(
          (u: User) =>
            u.role === "supervisor" ||
            u.role === "teacher" ||
            u.role === "manager"
        );
        setTeachers(filtered);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách giáo viên",
        });
      } finally {
        setLoadingTeachers(false);
      }
    };

    loadTeachers();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const data: CreateClassAdvisorInput = {
        class_id: values.class_id,
        teacher_id: values.teacher_id,
        semester: values.semester,
        academic_year: values.academic_year,
        notes: values.notes || undefined,
      };

      await classAdvisorsService.assign(data);

      toast({
        title: "Thành công",
        description: "Đã gán giáo viên chủ nhiệm cho lớp",
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể gán giáo viên chủ nhiệm",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Class Selection */}
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lớp *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={
                  defaultClassId ? defaultClassId.toString() : undefined
                }
                disabled={loadingClasses}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.code} - {cls.name}
                      {cls.major_name && ` (${cls.major_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Teacher Selection */}
        <FormField
          control={form.control}
          name="teacher_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giáo viên *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={loadingTeachers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giáo viên" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48">
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Chọn giáo viên sẽ làm chủ nhiệm cho lớp này
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Semester Selection */}
        <FormField
          control={form.control}
          name="semester"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Học kỳ *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học kỳ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HK1">Học kỳ I</SelectItem>
                  <SelectItem value="HK2">Học kỳ II</SelectItem>
                  <SelectItem value="HK3">Học kỳ III (Hè)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Academic Year */}
        <FormField
          control={form.control}
          name="academic_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Năm học *</FormLabel>
              <FormControl>
                <Input
                  placeholder="2024-2025"
                  {...field}
                  disabled={!!defaultAcademicYear}
                />
              </FormControl>
              <FormDescription>
                Format: YYYY-YYYY (vd: 2024-2025)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Thêm ghi chú về phân công này (tuỳ chọn)"
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Ghi chú sẽ được hiển thị trong lịch sử phân công
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Đang xử lý..." : "Gán giáo viên chủ nhiệm"}
        </Button>
      </form>
    </Form>
  );
}
