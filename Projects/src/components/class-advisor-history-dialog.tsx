"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  classAdvisorsService,
  type ClassAdvisor,
} from "@/services/classAdvisors.service";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ClassAdvisorHistoryDialogProps {
  classId: number;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassAdvisorHistoryDialog({
  classId,
  className,
  open,
  onOpenChange,
}: ClassAdvisorHistoryDialogProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<ClassAdvisor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && classId) {
      loadHistory();
    }
  }, [open, classId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await classAdvisorsService.getHistory(classId);
      setHistory(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải lịch sử phân công",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const calculateDaysServed = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days + 1; // Include the start day
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96">
        <DialogHeader>
          <DialogTitle>📜 Lịch sử chủ nhiệm lớp</DialogTitle>
          <DialogDescription>
            {className && `Lớp: ${className}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-72 w-full rounded-md border p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Đang tải...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Chưa có phân công chủ nhiệm</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((advisor, index) => (
                <div key={advisor.id} className="relative pb-6">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-300" />
                  )}

                  {/* Timeline dot */}
                  <div className="flex gap-4">
                    <div
                      className={`relative w-3 h-3 rounded-full mt-2 ${
                        advisor.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">
                            {advisor.teacher_name || "N/A"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {advisor.teacher_email}
                          </p>
                        </div>
                        <Badge
                          variant={advisor.is_active ? "default" : "secondary"}
                        >
                          {advisor.is_active ? "Đang chủ nhiệm" : "Đã kết thúc"}
                        </Badge>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-600">Ngày bắt đầu:</span>
                          <p className="font-mono">
                            {formatDate(advisor.assigned_date)}
                          </p>
                        </div>
                        {advisor.end_date && (
                          <div>
                            <span className="text-gray-600">
                              Ngày kết thúc:
                            </span>
                            <p className="font-mono">
                              {formatDate(advisor.end_date)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Semester and Duration */}
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {advisor.semester} {advisor.academic_year}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {calculateDaysServed(
                            advisor.assigned_date,
                            advisor.end_date
                          )}{" "}
                          ngày
                        </Badge>
                      </div>

                      {/* Notes */}
                      {advisor.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Ghi chú:</strong>
                          </p>
                          <p className="text-xs whitespace-pre-wrap">
                            {advisor.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
