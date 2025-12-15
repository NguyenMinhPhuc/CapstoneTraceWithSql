"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import type { DefenseSession } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { defenseService } from "@/services/defense.service";
import { studentsService, type Student } from "@/services/students.service";
import { debounce } from "lodash";

const formSchema = z.object({
  studentId: z.number({ required_error: "Vui lòng chọn một sinh viên." }).int(),
});

interface AddStudentRegistrationFormProps {
  sessionId: string;
  sessionType: DefenseSession["sessionType"];
  existingRegistrations: Array<{
    studentId?: string | null;
    student_code?: string | null;
  }>;
  onFinished: () => void;
}

export function AddStudentRegistrationForm({
  sessionId,
  sessionType,
  existingRegistrations,
  onFinished,
}: AddStudentRegistrationFormProps) {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const registeredCodes = useMemo(() => {
    return new Set(
      existingRegistrations
        .map((reg) =>
          String(reg.studentId || reg.student_code || "").toLowerCase()
        )
        .filter((code) => code !== "")
    );
  }, [existingRegistrations]);

  useEffect(() => {
    const load = async (term: string) => {
      setIsLoadingStudents(true);
      try {
        const resp = await studentsService.getPaged({
          q: term || undefined,
          page: 1,
          pageSize: 50,
        });

        // Backend may return either an array or an object with rows
        const candidates = Array.isArray(resp) ? resp : resp?.rows || [];

        let filtered = candidates.filter(
          (s) =>
            !registeredCodes.has(String(s.student_code || "").toLowerCase())
        );

        // Fallback: if no results on empty search, fetch first 100 via getAll
        if (filtered.length === 0 && !term) {
          const all = await studentsService.getAll(
            undefined,
            undefined,
            undefined,
            undefined
          );
          filtered = (all || [])
            .slice(0, 100)
            .filter(
              (s) =>
                !registeredCodes.has(String(s.student_code || "").toLowerCase())
            );
        }

        setStudents(filtered);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách sinh viên.",
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    const debouncedLoad = debounce(load, 250);
    debouncedLoad(searchTerm);
    return () => {
      debouncedLoad.cancel();
    };
  }, [searchTerm, toast, registeredCodes]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Call backend API to create registration
    const selectedStudent = students.find((s) => s.id === values.studentId);
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không tìm thấy thông tin sinh viên đã chọn.",
      });
      return;
    }

    if (!selectedStudent.student_code) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: `Sinh viên ${selectedStudent.full_name} chưa có Mã số sinh viên. Vui lòng cập nhật hồ sơ sinh viên trước.`,
      });
      return;
    }

    const newRegistrationPayload: any = {
      student_id: selectedStudent.id,
      student_code: selectedStudent.student_code,
      student_name: selectedStudent.full_name,
      class_name:
        selectedStudent.class_name ?? selectedStudent.class_code ?? null,
    };

    const st = String(sessionType || "").toLowerCase();
    const isGraduation =
      st === "graduation" ||
      st.includes("grad") ||
      st.includes("tốt") ||
      st.includes("tot");
    const isInternship =
      st === "internship" ||
      st.includes("intern") ||
      st.includes("thực") ||
      st.includes("thuc");

    // Set unified report status. If the session clearly maps to one type
    // we mark the registration as `reporting`. Otherwise default to `reporting`.
    newRegistrationPayload.report_status = "reporting";

    try {
      // Debug log to inspect payload and resolved sessionType
      try {
        // eslint-disable-next-line no-console
        console.debug("AddStudent payload", {
          sessionId,
          sessionType,
          resolvedSessionType: String(sessionType),
          newRegistrationPayload,
        });
      } catch (e) {}

      await defenseService.createRegistration(
        sessionId,
        newRegistrationPayload as any
      );
      toast({
        title: "Thành công",
        description: `Đã thêm sinh viên ${newRegistrationPayload.student_name} vào đợt báo cáo.`,
      });
      onFinished();
    } catch (error: any) {
      console.error("Error creating registration:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể thêm đăng ký.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Sinh viên</FormLabel>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {isLoadingStudents
                        ? "Đang tải..."
                        : field.value
                        ? students.find((student) => student.id === field.value)
                            ?.student_code
                        : "Tìm sinh viên theo MSSV hoặc tên"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Tìm sinh viên..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy sinh viên.</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            value={`${student.student_code} ${student.full_name}`}
                            key={student.id}
                            onSelect={() => {
                              form.setValue("studentId", student.id);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                student.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.student_code}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Đang thêm..." : "Thêm sinh viên"}
        </Button>
      </form>
    </Form>
  );
}
