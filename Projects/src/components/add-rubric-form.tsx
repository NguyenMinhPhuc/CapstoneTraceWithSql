"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "./ui/scroll-area";
import { rubricsService, type Rubric } from "@/services/rubrics.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "./markdown-editor";

const criterionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Tên tiêu chí là bắt buộc." }),
  description: z.string().optional(),
  maxScore: z.coerce.number().min(1, { message: "Điểm phải lớn hơn 0." }),
  weight: z.coerce.number().optional().nullable(),
  PLO: z.string().optional(),
  PI: z.string().optional(),
  CLO: z.string().optional(),
});

const rubricSchema = z.object({
  name: z.string().min(1, { message: "Tên rubric là bắt buộc." }),
  rubric_type: z.enum([
    "supervisor",
    "council",
    "reviewer",
    "early_internship",
  ]),
  description: z.string().optional(),
  criteria: z.array(criterionSchema).min(1, "Cần ít nhất một tiêu chí."),
});

type RubricFormData = z.infer<typeof rubricSchema>;

interface AddRubricFormProps {
  onFinished: () => void;
}

export function AddRubricForm({ onFinished }: AddRubricFormProps) {
  const { toast } = useToast();

  const form = useForm<RubricFormData>({
    resolver: zodResolver(rubricSchema),
    defaultValues: {
      name: "",
      rubric_type: "supervisor",
      description: "",
      criteria: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "criteria",
  });

  async function onSubmit(values: RubricFormData) {
    try {
      const total = values.criteria.reduce(
        (acc, c) => acc + (Number(c.maxScore) || 0),
        0
      );
      const createRes = await rubricsService.createRubric({
        name: values.name,
        rubric_type: values.rubric_type as Rubric["rubric_type"],
        description: values.description || null,
        total_score: total,
        is_active: true,
      });

      const rubricId = createRes.id;
      for (let i = 0; i < values.criteria.length; i++) {
        const c = values.criteria[i];
        await rubricsService.addCriterion(rubricId, {
          name: c.name,
          description: c.description || null,
          PLO: (c as any).PLO ?? null,
          PI: (c as any).PI ?? null,
          CLO: (c as any).CLO ?? null,
          max_score: Number(c.maxScore),
          weight:
            c.weight === "" || c.weight === undefined ? null : Number(c.weight),
          order_index: i + 1,
        });
      }

      toast({
        title: "Thành công",
        description: `Đã tạo rubric "${values.name}".`,
      });
      onFinished();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Không thể tạo rubric: ${
          error?.message || "Lỗi không xác định"
        }`,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Rubric</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: Rubric chấm báo cáo cuối kỳ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rubric_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại Rubric</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">
                        Giảng viên hướng dẫn
                      </SelectItem>
                      <SelectItem value="council">Hội đồng</SelectItem>
                      <SelectItem value="reviewer">Phản biện</SelectItem>
                      <SelectItem value="early_internship">
                        Thực tập sớm
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
              <FormLabel>Mô tả (Markdown)</FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  rows={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Các tiêu chí</h3>
          <ScrollArea className="h-[40vh] pr-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 border rounded-lg bg-white/50 shadow-sm"
                >
                  <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-12 md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`criteria.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormLabel className="text-sm">
                              Tên tiêu chí
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ví dụ: Nội dung báo cáo"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`criteria.${index}.maxScore`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormLabel className="text-sm">
                              Điểm tối đa
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`criteria.${index}.weight`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormLabel className="text-sm">Trọng số</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  field.onChange(
                                    v === "" ? undefined : Number(v)
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => remove(index)}
                        className="h-9 w-9"
                        aria-label={`Xóa tiêu chí ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">
                            Mô tả (Markdown)
                          </FormLabel>
                          <FormControl>
                            <MarkdownEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.PLO`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormLabel className="text-sm">PLO</FormLabel>
                          <FormControl>
                            <Input placeholder="PLO 1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`criteria.${index}.PI`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormLabel className="text-sm">PI</FormLabel>
                          <FormControl>
                            <Input placeholder="PI 1.1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`criteria.${index}.CLO`}
                      render={({ field }) => (
                        <FormItem className="mb-0">
                          <FormLabel className="text-sm">CLO</FormLabel>
                          <FormControl>
                            <Input placeholder="CLO 1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                id: uuidv4(),
                name: "",
                description: "",
                PLO: "",
                PI: "",
                CLO: "",
                maxScore: 10,
                weight: "",
              })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm tiêu chí
          </Button>

          {form.formState.errors.criteria && (
            <p className="text-sm font-medium text-destructive">
              {(form.formState.errors as any).criteria?.message ||
                (form.formState.errors as any).criteria?.root?.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Rubric"}
        </Button>
      </form>
    </Form>
  );
}
