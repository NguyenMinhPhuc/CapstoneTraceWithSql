"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { studentsService, type Student } from "@/services/students.service";
import { type Class } from "@/services/classes.service";
import { AlertCircle } from "lucide-react";

const transferClassSchema = z.object({
  class_id: z.string().min(1, "Vui lòng chọn lớp mới"),
});

type TransferClassFormData = z.infer<typeof transferClassSchema>;

interface TransferClassFormProps {
  student: Student;
  classes: Class[];
  onFinished: () => void;
}

export function TransferClassForm({
  student,
  classes,
  onFinished,
}: TransferClassFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransferClassFormData>({
    resolver: zodResolver(transferClassSchema),
    defaultValues: {
      class_id: student.class_id?.toString() || "",
    },
  });

  const onSubmit = async (data: TransferClassFormData) => {
    try {
      // Check if selected class is the same as current
      if (parseInt(data.class_id) === student.class_id) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Lớp mới phải khác lớp hiện tại",
        });
        return;
      }

      setIsLoading(true);

      const selectedClass = classes.find(
        (c) => c.id === parseInt(data.class_id)
      );

      if (!selectedClass) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Lớp không tồn tại",
        });
        return;
      }

      // Call API to update student's class
      await studentsService.update(student.id, {
        student_code: student.student_code,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        address: student.address,
        class_id: parseInt(data.class_id),
        avatar_url: student.avatar_url,
        status: student.status,
      });

      toast({
        title: "Thành công",
        description: `Đã chuyển sinh viên từ lớp ${student.class_name} sang lớp ${selectedClass.name}`,
      });

      onFinished();
    } catch (error: any) {
      console.error("Transfer class error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể chuyển lớp";
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current class from the options
  const availableClasses = classes.filter((c) => c.id !== student.class_id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current student info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Sinh viên: {student.full_name}</p>
              <p className="text-sm">
                MSSV: {student.student_code} | Lớp hiện tại:{" "}
                {student.class_name || "Chưa có"}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Class selection */}
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chọn lớp mới *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={availableClasses.length === 0 || isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp mới..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableClasses.length > 0 ? (
                    availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        <div>
                          <div className="font-medium">{cls.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {cls.major_name || "Chưa có ngành"} |{" "}
                            {cls.department_name || "Chưa có khoa"}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Không có lớp khác để chuyển
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onFinished()}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading || availableClasses.length === 0}
          >
            {isLoading ? "Đang chuyển..." : "Xác nhận chuyển lớp"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
