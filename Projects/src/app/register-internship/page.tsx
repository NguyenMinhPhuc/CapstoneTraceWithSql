"use client";

import React, { useEffect, useState } from "react";
import { defenseService } from "@/services/defense.service";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function RegisterInternshipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [existingRegistration, setExistingRegistration] = useState<any | null>(
    null
  );
  const [isLoadingExisting, setIsLoadingExisting] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingExisting(true);
        const reg = await defenseService.getMyRegistration();
        setExistingRegistration(reg || null);
      } catch (err) {
        console.error("Failed to load existing registration", err);
        setExistingRegistration(null);
      } finally {
        setIsLoadingExisting(false);
      }

      try {
        const all = await defenseService.getAll({ session_type: "internship" });
        setSessions(all || []);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      toast({
        variant: "destructive",
        title: "Chưa chọn đợt",
        description: "Vui lòng chọn đợt thực tập.",
      });
      return;
    }
    if (!user) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để đăng ký.",
      });
      router.push("/login");
      return;
    }

    if (existingRegistration) {
      toast({
        title: "Đã được phân công",
        description: "Bạn đã được phân công vào một đợt đang diễn ra.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await defenseService.createRegistrationForCurrentUser(selectedSession, {
        student_code: user.studentCode || undefined,
        student_name: user.fullName,
        class_name: user.className,
        report_status: "reporting",
      } as any);

      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã được đăng ký vào đợt thực tập.",
      });
      router.push("/profile");
    } catch (err) {
      console.error("Registration failed", err);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đăng ký thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký Thực tập</h1>

      {isLoadingExisting ? (
        <div>Đang kiểm tra trạng thái đăng ký...</div>
      ) : existingRegistration ? (
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h2 className="font-medium">Bạn đã được phân công vào đợt:</h2>
            <p className="text-lg font-semibold">
              {existingRegistration.session_name}
            </p>
            <p>Trạng thái đợt: {existingRegistration.session_status}</p>
            <p>
              Trạng thái đăng ký:{" "}
              {existingRegistration.report_status || "(Không)"}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Chọn đợt thực tập
            </label>
            <Select
              value={selectedSession || ""}
              onValueChange={(v) => setSelectedSession(v || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn đợt thực tập" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}{" "}
                    {s.start_date
                      ? `(${new Date(s.start_date).toLocaleDateString()})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đề tài (tuỳ chọn)
            </label>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Tên đề tài của bạn"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Đăng ký
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Hủy
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
