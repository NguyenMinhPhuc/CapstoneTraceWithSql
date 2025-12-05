"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  supervisorsService,
  type Supervisor,
} from "@/services/supervisors.service";
import { majorsService } from "@/services/majors.service";

const supervisorSchema = z.object({
  full_name: z.string().min(2, "Tên giảng viên phải có ít nhất 2 ký tự"),
  phone: z.string().optional().default(""),
  department: z.string().min(1, "Vui lòng chọn ngành"),
  title: z.string().min(1, "Vui lòng chọn chức danh"),
  lecturer_type: z.string().optional(),
  max_students: z.coerce
    .number()
    .int("Số sinh viên phải là số nguyên")
    .min(1, "Phải ít nhất 1 sinh viên")
    .max(100, "Tối đa 100 sinh viên"),
  specializations: z.string().optional().default(""),
  is_active: z.boolean().default(true),
});

type SupervisorFormData = z.infer<typeof supervisorSchema>;

interface EditSupervisorFormProps {
  supervisor: Supervisor;
  onFinished: () => void;
}

const TITLES = [
  "Giáo sư",
  "Phó Giáo sư",
  "Tiến sĩ",
  "Thạc sĩ",
  "Cử nhân",
  "Giảng viên",
];

const LECTURER_TYPES = ["Giảng viên LHU", "Giảng viên thỉnh giảng"];

export function EditSupervisorForm({
  supervisor,
  onFinished,
}: EditSupervisorFormProps) {
  const [loading, setLoading] = useState(false);
  const [majors, setMajors] = useState<any[]>([]);
  const [majorsLoading, setMajorsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMajors();
  }, []);

  const loadMajors = async () => {
    try {
      setMajorsLoading(true);
      const data = await majorsService.getAll();
      setMajors(data);
    } catch (error: any) {
      console.error("Error loading majors:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách ngành",
      });
    } finally {
      setMajorsLoading(false);
    }
  };

  const specializations = Array.isArray(supervisor.specializations)
    ? supervisor.specializations.join(", ")
    : supervisor.specializations || "";

  const form = useForm<SupervisorFormData>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: {
      full_name: supervisor.full_name || "",
      phone: supervisor.phone || "",
      department: String((supervisor as any).department ?? ""),
      title: supervisor.title || "",
      lecturer_type: (supervisor as any).lecturer_type || "Giảng viên LHU",
      max_students: supervisor.max_students || 10,
      specializations: specializations,
      is_active: supervisor.is_active !== false,
    },
  });

  const onSubmit = async (data: SupervisorFormData) => {
    try {
      setLoading(true);

      await supervisorsService.update(supervisor.id, {
        full_name: data.full_name,
        phone: data.phone || "",
        department: Number(data.department),
        lecturer_type: (data as any).lecturer_type,
        title: data.title,
        max_students: data.max_students,
        specializations: data.specializations || "",
        is_active: data.is_active,
      });

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin giảng viên",
      });

      onFinished();
    } catch (error: any) {
      console.error("Update supervisor error:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật giảng viên",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên giảng viên *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên giảng viên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngành *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={majorsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          majorsLoading ? "Đang tải..." : "Chọn ngành"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major.id} value={String(major.id)}>
                        {major.name} ({major.code})
                      </SelectItem>
                    ))}
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
                <FormLabel>Chức danh *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TITLES.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lecturer_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giảng viên</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giảng viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LECTURER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="max_students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số sinh viên tối đa *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                <FormLabel className="mb-0">Trạng thái hoạt động</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specializations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chuyên môn</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập các chuyên môn, cách nhau bằng dấu phẩy"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onFinished}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật giảng viên"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
