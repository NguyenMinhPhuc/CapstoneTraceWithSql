"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { DefenseSession } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { studentsService, type Student } from "@/services/students.service";
import { classesService, type Class } from "@/services/classes.service";
import { defenseService } from "@/services/defense.service";

interface AddStudentsByClassDialogProps {
  sessionId: string;
  sessionType: DefenseSession["sessionType"];
  existingRegistrations: Array<{ studentId?: string | null }>;
  onFinished: () => void;
}

const statusLabel: Record<Student["status"], string> = {
  studying: "Đang học",
  reserved: "Bảo lưu",
  dropped_out: "Đã nghỉ",
  graduated: "Đã tốt nghiệp",
};

const statusColorClass: Record<Student["status"], string> = {
  studying:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
  reserved:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700",
  dropped_out:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  graduated:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
};

export function AddStudentsByClassDialog({
  sessionId,
  sessionType,
  existingRegistrations,
  onFinished,
}: AddStudentsByClassDialogProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredCodes = useMemo(() => {
    return new Set(
      existingRegistrations
        .map((reg) => String(reg.studentId || "").toLowerCase())
        .filter((code) => code !== "")
    );
  }, [existingRegistrations]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const cls = await classesService.getAll(undefined, undefined, true);
        setClasses(cls || []);
      } catch (error) {
        console.error("Error loading classes", error);
        setClasses([]);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (selectedClassId == null) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        // Do not filter by status here; backend may use localized status strings.
        const list = await studentsService.getAll(selectedClassId);
        setStudents(list || []);
      } catch (error) {
        console.error("Error loading students by class", error);
        setStudents([]);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải danh sách sinh viên của lớp.",
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };
    loadStudents();
    setSelectedStudentIds([]);
  }, [selectedClassId, toast]);

  const studentsInSelectedClass = useMemo(() => {
    if (!selectedClassId || !students) return [];
    return students.filter(
      (student) =>
        !registeredCodes.has(student.student_code?.toLowerCase() || "")
    );
  }, [selectedClassId, students, registeredCodes]);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [selectedClassId]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(studentsInSelectedClass.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleStudentSelect = (studentId: number, checked: boolean) => {
    setSelectedStudentIds((prev) =>
      checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
    );
  };

  const handleSubmit = async () => {
    if (selectedStudentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Chưa chọn sinh viên",
        description: "Vui lòng chọn ít nhất một sinh viên để thêm vào đợt.",
      });
      return;
    }
    setIsSubmitting(true);

    const studentsToAdd = students.filter((s) =>
      selectedStudentIds.includes(s.id)
    );

    try {
      for (const student of studentsToAdd) {
        const payload: any = {
          student_id: student.id,
          student_code: student.student_code,
          student_name: student.full_name,
          class_name: student.class_name ?? student.class_code ?? "",
        };

        // Normalize sessionType and decide which status to set
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

        // Use unified report_status. Default to reporting for added students.
        payload.report_status = "reporting";

        // Debug log to help diagnose incorrect status writes
        try {
          // eslint-disable-next-line no-console
          console.debug("AddByClass payload", {
            sessionId,
            sessionType,
            resolvedSessionType: String(sessionType),
            payload,
          });
        } catch (e) {}

        await defenseService.createRegistration(sessionId, payload);
      }

      toast({
        title: "Thành công",
        description: `Đã thêm ${studentsToAdd.length} sinh viên vào đợt báo cáo.`,
      });
      onFinished();
    } catch (error: any) {
      console.error("Error adding students by class:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: `Không thể thêm sinh viên: ${
          error?.message || "Lỗi không xác định"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Thêm sinh viên theo lớp</DialogTitle>
        <DialogDescription>
          Chọn một lớp để xem danh sách sinh viên và thêm họ vào đợt báo cáo
          này.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <Select
          onValueChange={(val) => setSelectedClassId(Number(val))}
          disabled={isLoadingStudents || classes.length === 0}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                isLoadingStudents && selectedClassId
                  ? "Đang tải danh sách lớp..."
                  : "Chọn một lớp"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={String(cls.id)}>
                {cls.code} - {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoadingStudents && selectedClassId && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {selectedClassId &&
          !isLoadingStudents &&
          (studentsInSelectedClass.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedStudentIds.length > 0 &&
                    selectedStudentIds.length === studentsInSelectedClass.length
                  }
                  indeterminate={
                    selectedStudentIds.length > 0 &&
                    selectedStudentIds.length < studentsInSelectedClass.length
                  }
                />
                <Label htmlFor="select-all" className="font-medium">
                  Chọn tất cả ({selectedStudentIds.length}/
                  {studentsInSelectedClass.length})
                </Label>
              </div>
              <ScrollArea className="h-64 rounded-md border p-2">
                <div className="space-y-1">
                  {studentsInSelectedClass.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center space-x-3 p-1 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={student.id}
                        onCheckedChange={(checked) =>
                          handleStudentSelect(student.id, !!checked)
                        }
                        checked={selectedStudentIds.includes(student.id)}
                      />
                      <div className="flex items-center justify-between w-full">
                        <Label htmlFor={student.id} className="cursor-pointer">
                          {student.full_name} ({student.student_code})
                        </Label>
                        <Badge
                          className={cn(
                            "text-xs",
                            statusColorClass[
                              student.status as Student["status"]
                            ] || ""
                          )}
                          variant="outline"
                        >
                          {statusLabel[student.status as Student["status"]] ||
                            student.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Không có sinh viên nào</AlertTitle>
              <AlertDescription>
                Tất cả sinh viên trong lớp này đã được thêm vào đợt báo cáo.
              </AlertDescription>
            </Alert>
          ))}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onFinished} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedStudentIds.length === 0}
        >
          {isSubmitting
            ? "Đang thêm..."
            : `Thêm ${selectedStudentIds.length} sinh viên`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
