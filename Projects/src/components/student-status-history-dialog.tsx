"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Clock, User, FileText, ArrowRight } from "lucide-react";
import {
  studentsService,
  ProfileStatusHistory,
} from "@/services/students.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface StudentStatusHistoryDialogProps {
  studentId: number;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentStatusHistoryDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: StudentStatusHistoryDialogProps) {
  const [history, setHistory] = useState<ProfileStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (open && studentId) {
      loadHistory();
    }
  }, [open, studentId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await studentsService.getStatusHistory(studentId, 100);
      setHistory(response.history);
      setTotal(response.total);
    } catch (error) {
      console.error("Error loading status history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Đang học": "bg-green-100 text-green-800 border-green-200",
      "Bảo lưu": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Nghỉ học": "bg-red-100 text-red-800 border-red-200",
      "Nghỉ học TS": "bg-gray-100 text-gray-800 border-gray-200",
      "Nghỉ học khi tuyển sinh": "bg-gray-100 text-gray-800 border-gray-200",
      "Đã tốt nghiệp": "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getChangeTypeLabel = (changeType?: string) => {
    const labels: Record<string, string> = {
      status_change: "Thay đổi trạng thái",
      data_entry: "Nhập dữ liệu",
      correction: "Điều chỉnh",
      manual_entry: "Nhập thủ công",
    };
    return labels[changeType || ""] || changeType || "Thay đổi";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Lịch sử thay đổi trạng thái
          </DialogTitle>
          <DialogDescription>
            Sinh viên: <span className="font-medium">{studentName}</span> (Tổng:{" "}
            {total} thay đổi)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Chưa có lịch sử thay đổi trạng thái
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline connector */}
                  {index < history.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.old_status && (
                              <>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(item.old_status)}
                                >
                                  {item.old_status}
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </>
                            )}
                            <Badge
                              variant="outline"
                              className={getStatusColor(item.new_status)}
                            >
                              {item.new_status}
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getChangeTypeLabel(item.change_type)}
                          </Badge>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(
                                new Date(item.changed_at),
                                "dd/MM/yyyy HH:mm:ss",
                                { locale: vi }
                              )}
                            </span>
                          </div>

                          {item.changed_by_name && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>
                                {item.changed_by_name}
                                {item.changed_by_email && (
                                  <span className="text-xs ml-2">
                                    ({item.changed_by_email})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-start gap-2 text-muted-foreground">
                                <FileText className="h-4 w-4 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1">
                                    Ghi chú:
                                  </p>
                                  <p className="text-sm">{item.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
