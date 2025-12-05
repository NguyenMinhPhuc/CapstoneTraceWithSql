"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { studentsService } from "@/services/students.service";
import type { Class } from "@/services/classes.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ImportStudentData {
  student_code: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  class_code?: string;
  class_id?: number;
  status: string;
  rowIndex: number;
  errors?: string[];
}

interface ImportStudentsDialogBackendProps {
  onFinished: () => void;
  classes: Class[];
}

export function ImportStudentsDialogBackend({
  onFinished,
  classes,
}: ImportStudentsDialogBackendProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<ImportStudentData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
      });
      return;
    }

    setFile(selectedFile);
    parseExcelFile(selectedFile);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row (index 0)
        const rows = jsonData.slice(1) as any[][];

        const parsedData: ImportStudentData[] = rows
          .filter((row) => row.length > 0 && row[0]) // Filter out empty rows
          .map((row, index) => {
            const errors: string[] = [];

            // Map columns based on the image: StudentID, LopID, NganhID, NgayDem, HoSV, TenSV, Phai, NgaySinh, NoiSinh, DanToc, TonGiao, QuocTich, DiaChi, PhuongXa, QuanHuyen, TinhThanh, SoDienThi, CMND, Khoa, HeDao, TacTinh, TrangGhiChu, NgayNhapTenNganh
            const studentCode = row[0]?.toString().trim() || "";
            const classCode = row[1]?.toString().trim() || "";
            const lastName = row[4]?.toString().trim() || "";
            const firstName = row[5]?.toString().trim() || "";
            const gender = row[6]?.toString().trim() || "";
            const dateOfBirth = row[7] || "";
            const address = row[10]?.toString().trim() || "";
            const phone = row[16]?.toString().trim() || "";

            // Validation
            if (!studentCode) errors.push("Thiếu mã sinh viên");
            if (!lastName || !firstName) errors.push("Thiếu họ tên");

            // Email will be auto-generated on backend as: MSSV@lachong.edu.vn
            // No need to send it from frontend

            // Use selected class_id from dropdown instead of parsing from Excel
            let classId: number | undefined = selectedClassId || undefined;

            // Format date of birth
            let formattedDateOfBirth = "";
            if (dateOfBirth) {
              try {
                // Handle Excel date serial number
                if (typeof dateOfBirth === "number") {
                  const excelDate = new Date(
                    (dateOfBirth - 25569) * 86400 * 1000
                  );
                  formattedDateOfBirth = excelDate.toISOString().split("T")[0];
                } else {
                  // Try to parse string date
                  const parsed = new Date(dateOfBirth);
                  if (!isNaN(parsed.getTime())) {
                    formattedDateOfBirth = parsed.toISOString().split("T")[0];
                  }
                }
              } catch (e) {
                // Ignore date parsing errors
              }
            }

            return {
              student_code: studentCode,
              full_name: `${lastName} ${firstName}`.trim(),
              email: `${studentCode}@lachong.edu.vn`, // For display only
              phone: phone || undefined,
              date_of_birth: formattedDateOfBirth || undefined,
              gender: gender || undefined,
              address: address || undefined,
              class_code: classCode || undefined,
              class_id: classId,
              status: "Đang học",
              rowIndex: index + 2, // +2 because Excel is 1-indexed and we skipped header
              errors: errors.length > 0 ? errors : undefined,
            };
          });

        // Check for duplicate student codes within the Excel file
        const studentCodes = parsedData.map((s) => s.student_code);
        const duplicateCodes = studentCodes.filter(
          (code, index) => studentCodes.indexOf(code) !== index
        );

        // Add duplicate errors to affected records
        parsedData.forEach((student) => {
          if (duplicateCodes.includes(student.student_code)) {
            if (!student.errors) student.errors = [];
            if (!student.errors.includes("Mã sinh viên bị trùng trong file")) {
              student.errors.push("Mã sinh viên bị trùng trong file");
            }
          }
        });

        setPreviewData(parsedData);

        // Check for validation errors
        const allErrors = parsedData
          .filter((item) => item.errors && item.errors.length > 0)
          .map((item) => `Dòng ${item.rowIndex}: ${item.errors?.join(", ")}`);
        setValidationErrors(allErrors);

        if (allErrors.length === 0) {
          toast({
            title: "Thành công",
            description: `Đã đọc ${parsedData.length} sinh viên từ file Excel`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Cảnh báo",
            description: `Có ${allErrors.length} lỗi trong file. Vui lòng kiểm tra lại.`,
          });
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description:
            "Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!selectedClassId) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng chọn lớp trước",
      });
      return;
    }

    if (previewData.length === 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không có dữ liệu để import",
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng sửa các lỗi trước khi import",
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Import students one by one (only those without validation errors)
      const validStudents = previewData.filter(
        (s) => !s.errors || s.errors.length === 0
      );

      for (const student of validStudents) {
        try {
          // Don't send email - it will be auto-generated as MSSV@lachong.edu.vn on backend
          await studentsService.create({
            student_code: student.student_code,
            full_name: student.full_name,
            phone: student.phone || undefined,
            date_of_birth: student.date_of_birth || undefined,
            gender: student.gender || undefined,
            address: student.address || undefined,
            class_id: student.class_id,
            status: student.status,
          });
          successCount++;
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message;
          console.error(
            `Error importing student ${student.student_code} (${student.full_name}):`,
            errorMsg
          );

          // Show specific error for first failed student
          if (errorCount === 0) {
            toast({
              variant: "destructive",
              title: "Lỗi import sinh viên",
              description: `${student.student_code} - ${student.full_name}: ${errorMsg}`,
            });
          }
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast({
          title: "Thành công",
          description: `Đã import thành công ${successCount} sinh viên`,
        });
        onFinished();
      } else {
        toast({
          variant: "destructive",
          title: "Hoàn thành với lỗi",
          description: `Import thành công ${successCount} sinh viên, ${errorCount} sinh viên lỗi`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Có lỗi xảy ra khi import sinh viên",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const hasErrors = validationErrors.length > 0;
  const validStudents = previewData.filter(
    (s) => !s.errors || s.errors.length === 0
  );

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-4">
      {/* Class Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Chọn lớp cho danh sách sinh viên *
        </label>
        <select
          className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
          value={selectedClassId || ""}
          onChange={(e) =>
            setSelectedClassId(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">-- Chọn lớp --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.code} - {cls.name}
            </option>
          ))}
        </select>
        {selectedClass && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>
              Tất cả sinh viên sẽ được thêm vào lớp:{" "}
              <strong>{selectedClass.name}</strong>
              {selectedClass.major_name && ` (${selectedClass.major_name})`}
            </span>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Chọn file Excel</label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            disabled={!selectedClassId}
          >
            <Upload className="h-4 w-4 mr-2" />
            {file ? file.name : "Chọn file Excel"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          File Excel cần có các cột: StudentID, HoSV, TenSV (các cột khác là tùy
          chọn: Phai, NgaySinh, DiaChi, SoDienThi)
        </p>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              Có {validationErrors.length} lỗi trong file:
            </div>
            <ScrollArea className="h-32">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Summary */}
      {previewData.length > 0 && !hasErrors && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Sẵn sàng import {validStudents.length} sinh viên
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Data */}
      {previewData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Xem trước ({previewData.length} sinh viên)
            </h3>
            <div className="flex gap-2">
              <Badge variant="outline">{validStudents.length} hợp lệ</Badge>
              {hasErrors && (
                <Badge variant="destructive">
                  {validationErrors.length} lỗi
                </Badge>
              )}
            </div>
          </div>
          <ScrollArea className="h-[400px] border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dòng</TableHead>
                  <TableHead>MSSV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((student, index) => (
                  <TableRow
                    key={index}
                    className={
                      student.errors ? "bg-red-50 dark:bg-red-950/20" : ""
                    }
                  >
                    <TableCell>{student.rowIndex}</TableCell>
                    <TableCell className="font-medium">
                      {student.student_code}
                    </TableCell>
                    <TableCell>{student.full_name}</TableCell>
                    <TableCell className="text-xs">{student.email}</TableCell>
                    <TableCell>{student.gender || "-"}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>
                      {student.errors ? (
                        <Badge variant="destructive" className="text-xs">
                          {student.errors.join(", ")}
                        </Badge>
                      ) : (
                        <Badge variant="default">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleImport}
          disabled={previewData.length === 0 || hasErrors || isProcessing}
        >
          {isProcessing
            ? "Đang import..."
            : `Import ${validStudents.length} sinh viên`}
        </Button>
      </div>
    </div>
  );
}
