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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { classesService } from "@/services/classes.service";
import { majorsService, type Major } from "@/services/majors.service";

const classSchema = z.object({
  code: z.string().min(1, "Mã lớp là bắt buộc"),
  name: z.string().min(1, "Tên lớp là bắt buộc"),
  major_id: z.number().optional(),
  academic_year: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ClassFormData = z.infer<typeof classSchema>;

interface AddClassFormProps {
  onFinished: () => void;
}

export function AddClassForm({ onFinished }: AddClassFormProps) {
  const { toast } = useToast();
  const [majors, setMajors] = useState<Major[]>([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      code: "",
      name: "",
      major_id: undefined,
      academic_year: "",
      is_active: true,
    },
  });

  useEffect(() => {
    loadMajors();
  }, []);

  const loadMajors = async () => {
    try {
      const data = await majorsService.getAll(undefined, true);
      setMajors(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách ngành",
      });
    } finally {
      setLoadingMajors(false);
    }
  };

  const onSubmit = async (data: ClassFormData) => {
    try {
      await classesService.create(data);
      toast({
        title: "Thành công",
        description: "Đã thêm lớp mới",
      });
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể thêm lớp",
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
                <FormLabel>Mã lớp *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: DHKTPM16A" {...field} />
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
                <FormLabel>Tên lớp *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Kỹ thuật phần mềm 16A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="major_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngành</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value ? parseInt(value) : undefined)
                  }
                  value={field.value?.toString()}
                  disabled={loadingMajors}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngành" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major.id} value={major.id.toString()}>
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
            name="academic_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niên khóa</FormLabel>
                <FormControl>
                  <Input placeholder="VD: 2020-2024" {...field} />
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
            {form.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
