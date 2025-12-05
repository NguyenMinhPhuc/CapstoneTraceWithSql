"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  departmentsService,
  type Department,
} from "@/services/departments.service";

const departmentSchema = z.object({
  code: z.string().min(1, "Mã khoa là bắt buộc"),
  name: z.string().min(1, "Tên khoa là bắt buộc"),
  description: z.string().optional(),
  head_name: z.string().optional(),
  head_email: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  head_phone: z.string().optional(),
  is_active: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentFormProps {
  department: Department;
  onFinished: () => void;
}

export function EditDepartmentForm({
  department,
  onFinished,
}: EditDepartmentFormProps) {
  const { toast } = useToast();

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: department.code,
      name: department.name,
      description: department.description || "",
      head_name: department.head_name || "",
      head_email: department.head_email || "",
      head_phone: department.head_phone || "",
      is_active: department.is_active,
    },
  });

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      await departmentsService.update(department.id, data);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin khoa",
      });
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật khoa",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã khoa *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: CNTT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khoa *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Công nghệ thông tin" {...field} />
                </FormControl>
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
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Mô tả về khoa..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="head_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trưởng khoa</FormLabel>
                <FormControl>
                  <Input placeholder="Họ và tên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="head_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email trưởng khoa</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="head_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Kích hoạt</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
