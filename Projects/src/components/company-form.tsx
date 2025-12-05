"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { companiesService } from "@/services/companies.service";
import {
  supervisorsService,
  type Supervisor,
} from "@/services/supervisors.service";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  is_lhu: z.boolean().optional(), // true = LHU, false = Ngoài
  manager_name: z.string().optional(),
  manager_phone: z.string().optional(),
  external_id: z.string().optional(),
  is_active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CompanyForm({
  company,
  onSaved,
}: {
  company?: any;
  onSaved?: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!company?.id;
  const [lhuSupervisors, setLhuSupervisors] = useState<Supervisor[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company?.name || "",
      address: company?.address || "",
      phone: company?.phone || "",
      email: company?.email || "",
      contact_person: company?.contact_person || "",
      contact_phone: company?.contact_phone || "",
      website: company?.website || "",
      description: company?.description || "",
      is_lhu: company?.company_type === "LHU" || false,
      manager_name: company?.manager_name || "",
      manager_phone: company?.manager_phone || "",
      external_id: company?.external_id || "",
      is_active: company?.is_active ?? true,
    },
  });

  const isLHU = form.watch("is_lhu");
  const selectedManagerId = form.watch("manager_name");

  // Load LHU supervisors when is_lhu is true
  useEffect(() => {
    if (isLHU) {
      setLoadingSupervisors(true);
      supervisorsService
        .getAll()
        .then((supervisors) => {
          // Filter supervisors - assuming LHU supervisors have a specific characteristic
          // For now, get all supervisors
          setLhuSupervisors(supervisors || []);
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể tải danh sách giáo viên",
          });
        })
        .finally(() => setLoadingSupervisors(false));
    }
  }, [isLHU, toast]);

  // Auto-fill contact_person and contact_phone when manager is selected
  useEffect(() => {
    if (isLHU && selectedManagerId) {
      const supervisor = lhuSupervisors.find((s) => s.id === selectedManagerId);
      if (supervisor) {
        form.setValue("contact_person", supervisor.full_name || "");
        form.setValue("contact_phone", supervisor.phone || "");
      }
    }
  }, [selectedManagerId, isLHU, lhuSupervisors, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert is_lhu boolean to company_type string
      const submitData = {
        ...values,
        company_type: values.is_lhu ? "LHU" : "external",
      };

      if (isEditing) {
        await companiesService.update(Number(company.id), submitData as any);
        toast({ title: "Đã cập nhật doanh nghiệp" });
      } else {
        await companiesService.create(submitData as any);
        toast({ title: "Đã tạo doanh nghiệp" });
      }
      onSaved?.();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.message || "Không thể lưu",
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Sửa doanh nghiệp" : "Thêm doanh nghiệp"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Cập nhật thông tin doanh nghiệp"
            : "Nhập thông tin doanh nghiệp mới"}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Thông tin cơ bản</h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên doanh nghiệp <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên doanh nghiệp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_lhu"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="mb-0">
                    Loại doanh nghiệp
                    <div className="text-xs font-normal text-gray-500 mt-1">
                      {field.value ? "LHU" : "Doanh nghiệp ngoài"}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập địa chỉ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="external_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID bên ngoài</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID nếu cần" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Thông tin liên hệ</h3>

            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người liên hệ</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên người liên hệ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điện thoại liên hệ</FormLabel>
                  <FormControl>
                    <Input placeholder="Số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@company.com" {...field} />
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
                  <FormLabel>Điện thoại chính</FormLabel>
                  <FormControl>
                    <Input placeholder="Số điện thoại chính" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Thông tin quản lý */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Thông tin quản lý</h3>

            {isLHU ? (
              <>
                <FormField
                  control={form.control}
                  name="manager_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn giáo viên LHU</FormLabel>
                      <FormControl>
                        {loadingSupervisors ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giáo viên" />
                            </SelectTrigger>
                            <SelectContent>
                              {lhuSupervisors.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.full_name} ({supervisor.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người liên hệ (tự động)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tự động điền từ giáo viên"
                          {...field}
                          disabled
                          className="bg-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điện thoại liên hệ (tự động)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tự động điền từ giáo viên"
                          {...field}
                          disabled
                          className="bg-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="manager_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người quản lý</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên quản lý" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điện thoại quản lý</FormLabel>
                      <FormControl>
                        <Input placeholder="Số điện thoại quản lý" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người liên hệ</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên người liên hệ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điện thoại liên hệ</FormLabel>
                      <FormControl>
                        <Input placeholder="Số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {/* Thông tin bổ sung */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Thông tin bổ sung</h3>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về doanh nghiệp"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="mb-0">Trạng thái hoạt động</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" className="gap-2">
              {isEditing ? "Cập nhật" : "Tạo"} doanh nghiệp
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
