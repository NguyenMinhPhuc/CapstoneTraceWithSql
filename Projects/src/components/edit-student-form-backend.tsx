"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { studentsService, type Student } from "@/services/students.service";
import { classesService, type Class } from "@/services/classes.service";

const studentSchema = z.object({
  student_code: z.string().min(1, "Mã sinh viên là bắt buộc"),
  full_name: z.string().min(1, "Họ tên là bắt buộc"),
  email: z.string().optional(),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  class_id: z.number().optional(),
  avatar_url: z.string().optional(),
  status: z.string().default("Đang học"),
  change_notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface EditStudentFormProps {
  student: Student;
  onFinished: () => void;
}

export function EditStudentForm({ student, onFinished }: EditStudentFormProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student_code: student.student_code,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      address: student.address || "",
      class_id: student.class_id,
      avatar_url: student.avatar_url || "",
      status: student.status || "Đang học",
      change_notes: "",
    },
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classesService.getAll(undefined, undefined, true);
      setClasses(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách lớp",
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      await studentsService.update(student.id, data);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin sinh viên",
      });
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật sinh viên",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="student_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã sinh viên *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: 2021600001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="MSSV@lachong.edu.vn"
                    type="email"
                    disabled
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Email được tạo tự động từ mã sinh viên
                </p>
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
                  <Input placeholder="0912345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Input placeholder="Địa chỉ sinh viên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lớp</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? parseInt(value) : undefined)
                }
                value={field.value?.toString()}
                disabled={loadingClasses}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.name} ({cls.code})
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trạng thái</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Đang học">Đang học</SelectItem>
                  <SelectItem value="Bảo lưu">Bảo lưu</SelectItem>
                  <SelectItem value="Nghỉ học">Nghỉ học</SelectItem>
                  <SelectItem value="Nghỉ học khi tuyển sinh">
                    Nghỉ học khi tuyển sinh
                  </SelectItem>
                  <SelectItem value="Đã tốt nghiệp">Đã tốt nghiệp</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="change_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú thay đổi (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="VD: Sinh viên xin bảo lưu do vấn đề sức khỏe"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">
                Ghi chú sẽ được lưu vào lịch sử thay đổi trạng thái
              </p>
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
